import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Helper: Resilient Gemini caller with automatic retry and model fallback (gemini-3.8-flash -> gemini-3.6-flash -> gemini-3.1-flash-lite)
const CANDIDATE_MODELS = ["gemini-3.8-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite"];

async function generateContentWithRetryAndFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });

        if (response.text) {
          return response;
        }
      } catch (err: any) {
        lastError = err;
        const msg = String(err?.message || "");
        const isTransient =
          msg.includes("503") ||
          msg.includes("429") ||
          msg.includes("UNAVAILABLE") ||
          msg.includes("high demand") ||
          msg.includes("RESOURCE_EXHAUSTED") ||
          msg.includes("temporarily") ||
          msg.includes("rate-limits");

        console.warn(`[Gemini API] ${model} attempt ${attempt} error:`, msg.slice(0, 160));

        // If not transient, try next model or throw
        if (!isTransient) {
          break;
        }

        if (attempt === 1) {
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }
    }
  }

  throw lastError || new Error("The AI service is experiencing high demand. Please try again shortly.");
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Chefbook Free" });
});

// Helper: Extract webpage content & metadata (including Instagram Reels and food blogs)
async function extractWebpageContent(urlStr: string): Promise<{
  text: string;
  ogImage?: string;
  title?: string;
  isBlockedByLogin?: boolean;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);

    const isInstagram = /instagram\.com\/(reel|p|tv|share)\//i.test(urlStr);
    let oembedData: any = null;

    if (isInstagram) {
      try {
        const oembedRes = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(urlStr)}`, {
          signal: controller.signal,
          headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
        });
        if (oembedRes.ok) {
          oembedData = await oembedRes.json();
        }
      } catch (e) {
        // oEmbed fallback if Instagram blocks unauthenticated request
      }
    }

    const response = await fetch(urlStr, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
      },
    });
    clearTimeout(timeout);

    let html = "";
    if (response.ok) {
      html = await response.text();
    }

    // Check if site served a login wall or bot block (e.g. Instagram login barrier)
    const isBlockedByLogin =
      isInstagram ||
      html.includes("accounts/login") ||
      html.includes("The link to this photo or video may be broken") ||
      html.includes("login-wall") ||
      response.status === 403 ||
      response.status === 401;

    // Extract OpenGraph / meta tags
    let ogImage: string | undefined;
    const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (ogImageMatch && !ogImageMatch[1].includes("facebook_logo") && !ogImageMatch[1].includes("instagram_logo")) {
      ogImage = ogImageMatch[1];
    }

    let ogTitle: string | undefined;
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (ogTitleMatch && !ogTitleMatch[1].toLowerCase().includes("log in • instagram")) {
      ogTitle = ogTitleMatch[1];
    }

    let ogDesc: string | undefined;
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDescMatch) ogDesc = ogDescMatch[1];

    // Extract JSON-LD Recipe if present
    let jsonLdRecipe: string = "";
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    if (jsonLdMatches) {
      for (const block of jsonLdMatches) {
        const inner = block.replace(/<script[^>]*>|<\/script>/gi, "").trim();
        if (inner.includes('"Recipe"') || inner.includes("'Recipe'") || inner.includes('"recipeIngredient"')) {
          jsonLdRecipe += "\nStructured Recipe JSON-LD:\n" + inner.slice(0, 8000);
          break;
        }
      }
    }

    // Clean body text
    const cleanBody = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, " ")
      .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, " ")
      .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 10000);

    const compiledText = [
      `Source URL: ${urlStr}`,
      ogTitle ? `Page/Post Title: ${ogTitle}` : "",
      ogDesc ? `Description / Caption Excerpt: ${ogDesc}` : "",
      oembedData?.author_name ? `Creator: ${oembedData.author_name}` : "",
      oembedData?.title ? `Post Title: ${oembedData.title}` : "",
      jsonLdRecipe ? jsonLdRecipe : "",
      cleanBody ? `Page Content Excerpt:\n${cleanBody}` : "",
    ].filter(Boolean).join("\n\n");

    return { text: compiledText, ogImage, title: ogTitle || oembedData?.title, isBlockedByLogin };
  } catch (err: any) {
    console.warn("Failed to fetch webpage directly:", err.message);
    return {
      text: `Target URL: ${urlStr}. (Could not fetch HTML directly: ${err.message})`,
      isBlockedByLogin: true
    };
  }
}

// 1. AI Recipe Importer / Parser (Handles Text, Instagram Reels, Web URLs, and Photos)
app.post("/api/gemini/parse-recipe", async (req, res) => {
  try {
    const { input, source, mode, url, caption, image, notes } = req.body;
    const ai = getGeminiClient();

    let contentsPayload: any;
    let extractedImage: string | undefined;

    const recipeSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        prepTimeMinutes: { type: Type.INTEGER },
        cookTimeMinutes: { type: Type.INTEGER },
        servings: { type: Type.INTEGER },
        difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
        cuisine: { type: Type.STRING },
        category: {
          type: Type.STRING,
          enum: ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Beverage", "Side"]
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        ingredients: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              name: { type: Type.STRING },
              notes: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: ["Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery", "Pantry & Spices", "Oils & Condiments", "Other"]
              }
            },
            required: ["name"]
          }
        },
        steps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              instruction: { type: Type.STRING },
              timerMinutes: { type: Type.INTEGER, description: "Cooking or resting timer in minutes if this step has an active duration, else 0" },
              tip: { type: Type.STRING, description: "Professional chef tip or doneness cue" }
            },
            required: ["stepNumber", "instruction"]
          }
        },
        nutrition: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.INTEGER },
            protein: { type: Type.INTEGER },
            carbs: { type: Type.INTEGER },
            fat: { type: Type.INTEGER },
            fiber: { type: Type.INTEGER }
          },
          required: ["calories", "protein", "carbs", "fat"]
        },
        chefNotes: { type: Type.STRING }
      },
      required: ["title", "description", "prepTimeMinutes", "cookTimeMinutes", "servings", "ingredients", "steps", "nutrition"]
    };

    if (mode === "image") {
      // Multimodal image processing: cookbook, handwritten recipe, photo of dish, or reel screenshot
      if (!image || !image.data) {
        return res.status(400).json({ error: "Image data is required for photo analysis." });
      }

      // Clean base64 data if it contains the data:image/...;base64, header
      const rawBase64 = image.data.replace(/^data:[^;]+;base64,/, "");
      const mimeType = image.mimeType || "image/jpeg";

      const imagePart = {
        inlineData: {
          mimeType,
          data: rawBase64,
        },
      };

      const promptText = `You are Chefbook's master culinary vision AI.
Analyze this photo carefully. It may be:
1. A handwritten recipe card, journal, or family ledger
2. A printed page from a cookbook, culinary magazine, or recipe card
3. A screenshot of an Instagram reel, TikTok video, YouTube short, or social post with ingredients/directions
4. A photograph of an actual culinary dish or prepared meal (deduce the complete, restaurant-quality recipe, ingredients, seasonings, and technique)

Transcribe or formulate a complete, realistic, delicious recipe.
If handwriting is faded, cursive, or partially obscured, use expert culinary knowledge to infer the most accurate ingredients, units, and quantities.
If it is a picture of food/dish, identify the dish precisely and provide an authentic, foolproof recipe to recreate it.
${notes ? `Additional user notes/context: "${notes}"` : ""}`;

      contentsPayload = { parts: [imagePart, { text: promptText }] };
      extractedImage = image.data.startsWith("data:") ? image.data : `data:${mimeType};base64,${rawBase64}`;
    } else if (mode === "url" || mode === "web") {
      // Universal Web recipe or food blog URL
      const targetUrl = url || input;
      if (!targetUrl || typeof targetUrl !== "string" || !targetUrl.trim()) {
        return res.status(400).json({ error: "A valid recipe URL is required." });
      }

      const trimmedUrl = targetUrl.trim();
      const scraped = await extractWebpageContent(trimmedUrl);

      if (scraped.ogImage) {
        extractedImage = scraped.ogImage;
      }

      const hasUserContext = Boolean(notes?.trim());
      const hasMeaningfulScrapedText = scraped.text.length > 200 && !scraped.isBlockedByLogin;

      if (!hasUserContext && !hasMeaningfulScrapedText) {
        return res.status(400).json({
          error: "This webpage is protected by a login wall or anti-bot shield, and no recipe text could be retrieved. Please copy & paste the recipe text into the Raw Manuscript tab, or take a screenshot and use Photo & Vision Scan.",
        });
      }

      const prompt = `You are Chefbook's master culinary web extractor.
The user wants to import a recipe from an online article or food blog:
Target URL: ${trimmedUrl}
${notes ? `Additional User Notes: "${notes}"` : ""}

Extracted Webpage Content & Metadata:
"""
${scraped.text}
"""

EXTRACTION GUIDELINES:
1. Extract the actual recipe (title, yield/servings, prep/cook times, ingredients with exact amounts/units, and clear numbered steps with timer minutes).
2. Skip extraneous blog backstory, ads, author anecdotes, or life updates; isolate purely the culinary recipe instructions.
3. If nutrition information is present or inferrable, provide accurate estimations.
4. Format according to the required JSON schema.`;

      contentsPayload = prompt;
    } else {
      // Standard text or manuscript import
      if (!input || typeof input !== "string" || !input.trim()) {
        return res.status(400).json({ error: "Recipe text or description is required." });
      }

      const prompt = `You are Chefbook's culinary parser assistant.
Extract or synthesize a complete, highly structured recipe from this content (which might be an imported webpage text, handwritten recipe note, blog post, or food description).
If any values are missing, estimate them sensibly like a seasoned chef.

Recipe source/context: ${source || "User Import"}
Content:
"""
${input.slice(0, 12000)}
"""`;

      contentsPayload = prompt;
    }

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: contentsPayload,
      config: {
        systemInstruction: "You are an expert executive chef, food scientist, and culinary archivist. Always return valid, realistic recipe data with accurate ingredient amounts, categorical tags, step instructions with cooking timers in minutes when applicable, and accurate nutritional estimations. Never fabricate unrelated dishes.",
        responseMimeType: "application/json",
        responseSchema: recipeSchema,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response returned by AI model.");
    }
    const recipeData = JSON.parse(text);
    return res.json({ success: true, recipe: recipeData, extractedImage });
  } catch (error: any) {
    console.error("Recipe parse error:", error);
    return res.status(500).json({
      error: error.message || "Failed to parse recipe with AI."
    });
  }
});

// 2. AI "What Can I Cook?" Fridge Wizard
app.post("/api/gemini/fridge-wizard", async (req, res) => {
  try {
    const { ingredients, preferences, maxTimeMinutes } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: "Please provide at least 1 or 2 ingredients." });
    }

    const ai = getGeminiClient();

    const prompt = `You are Chefbook's zero-waste kitchen wizard.
The user has the following available ingredients in their pantry/fridge:
${ingredients.join(", ")}
${preferences ? `Dietary preferences / notes: ${preferences}` : ""}
${maxTimeMinutes ? `Maximum cooking time: ${maxTimeMinutes} minutes` : ""}

Generate 3 diverse, mouth-watering, realistic recipes that primarily use these ingredients (plus common pantry staples like salt, pepper, cooking oil, water).
Provide complete structured recipes that can be saved straight into Chefbook.`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are an executive chef. Create practical, delicious recipes utilizing available ingredients to minimize food waste.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              prepTimeMinutes: { type: Type.INTEGER },
              cookTimeMinutes: { type: Type.INTEGER },
              servings: { type: Type.INTEGER },
              difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] },
              cuisine: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack", "Beverage", "Side"]
              },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    amount: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    name: { type: Type.STRING },
                    notes: { type: Type.STRING },
                    category: {
                      type: Type.STRING,
                      enum: ["Produce", "Meat & Seafood", "Dairy & Eggs", "Bakery", "Pantry & Spices", "Oils & Condiments", "Other"]
                    }
                  },
                  required: ["name"]
                }
              },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    instruction: { type: Type.STRING },
                    timerMinutes: { type: Type.INTEGER },
                    tip: { type: Type.STRING }
                  },
                  required: ["stepNumber", "instruction"]
                }
              },
              nutrition: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.INTEGER },
                  protein: { type: Type.INTEGER },
                  carbs: { type: Type.INTEGER },
                  fat: { type: Type.INTEGER },
                  fiber: { type: Type.INTEGER }
                },
                required: ["calories", "protein", "carbs", "fat"]
              },
              whyItWorks: { type: Type.STRING, description: "Why this recipe is great for the given ingredients" }
            },
            required: ["title", "description", "prepTimeMinutes", "cookTimeMinutes", "servings", "ingredients", "steps", "nutrition"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response generated.");
    }
    const recipes = JSON.parse(text);
    return res.json({ success: true, recipes });
  } catch (error: any) {
    console.error("Fridge wizard error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate recipes." });
  }
});

// 3. AI Ingredient Substitutions
app.post("/api/gemini/substitute", async (req, res) => {
  try {
    const { ingredient, recipeTitle, reason } = req.body;
    if (!ingredient) {
      return res.status(400).json({ error: "Ingredient name is required." });
    }

    const ai = getGeminiClient();

    const prompt = `The cook is making "${recipeTitle || "a dish"}" and needs a substitute for "${ingredient}".
${reason ? `Reason / Dietary requirement: ${reason}` : "General pantry or dietary substitution"}

Provide 3 practical, culinary-sound substitutions with exact substitution ratios, how the texture/flavor changes, and tips for best results.`;

    const response = await generateContentWithRetryAndFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction: "You are an expert culinary science advisor. Provide precise culinary substitutions with exact ratios.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              substituteName: { type: Type.STRING },
              ratio: { type: Type.STRING, description: "e.g. 1:1 or 1 tbsp per cup" },
              flavorTextureImpact: { type: Type.STRING },
              bestFor: { type: Type.STRING },
              proTip: { type: Type.STRING }
            },
            required: ["substituteName", "ratio", "flavorTextureImpact", "bestFor", "proTip"]
          }
        }
      }
    });

    const text = response.text;
    const substitutes = text ? JSON.parse(text) : [];
    return res.json({ success: true, substitutes });
  } catch (error: any) {
    console.error("Substitute error:", error);
    return res.status(500).json({ error: error.message || "Failed to get substitutions." });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Chefbook Free server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
