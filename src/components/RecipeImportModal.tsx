import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  Loader2,
  Check,
  ArrowRight,
  AlertCircle,
  Camera,
  Globe,
  FileText,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  Link2,
} from "lucide-react";
import { Recipe } from "../types";

interface RecipeImportModalProps {
  onClose: () => void;
  onRecipeImported: (recipe: Recipe) => void;
}

type ImportMode = "url" | "image" | "text";

const SAMPLE_TEXT_RECIPES = [
  {
    title: "Pan-Seared Ribeye with Herb Garlic Butter",
    sample: `Pan-Seared Ribeye with Herb Garlic Butter
Prep: 10 mins, Cook: 8 mins, Serves 2
Ingredients:
1.5 lb bone-in ribeye steak (1.5 inch thick)
2 tbsp avocado oil
3 tbsp unsalted butter
4 smashed garlic cloves
3 fresh rosemary sprigs
4 fresh thyme sprigs
Flaky sea salt and freshly cracked black pepper

Instructions:
1. Pat steak dry with paper towels and season aggressively with salt and pepper.
2. Heat a cast iron skillet with avocado oil on high until smoking.
3. Sear steak undisturbed for 3 minutes until deep crust forms, flip and sear 2 mins.
4. Add butter, garlic, rosemary and thyme to pan. Tilt skillet and continuously baste foaming butter over steak for 2 minutes until internal temp reaches 125°F for medium-rare.
5. Rest on cutting board for 8 minutes before slicing across the grain.`
  },
  {
    title: "Golden Turmeric Lentil Soup",
    sample: `Creamy Golden Turmeric & Red Lentil Soup (Vegan, High Protein)
Servings: 4, Prep: 10m, Cook: 25m
Ingredients:
1 cup red split lentils rinsed
1 yellow onion diced
3 cloves minced garlic
1 tbsp freshly grated ginger
1 tbsp ground turmeric
1 tsp ground cumin
1 can (14 oz) light coconut milk
4 cups vegetable broth
1 lime juiced
Fresh cilantro

Directions:
1. Sauté onion in 1 tbsp olive oil for 5 mins until soft.
2. Stir in garlic, ginger, turmeric, and cumin for 1 min until fragrant.
3. Add rinsed red lentils, coconut milk, and vegetable broth.
4. Bring to a boil, then reduce to simmer for 20 minutes until lentils are meltingly tender.
5. Squeeze fresh lime juice, stir, and garnish with fresh cilantro.`
  }
];

const SAMPLE_WEB_URLS = [
  {
    label: "Easy Classic Lasagne (BBC Good Food)",
    url: "https://www.bbcgoodfood.com/recipes/classic-lasagne",
  },
  {
    label: "Chewy Chocolate Chip Cookies (Sally's Baking Addiction)",
    url: "https://sallysbakingaddiction.com/chocolate-chip-cookies/",
  },
  {
    label: "Hearty Golden Lentil Soup (Cookie and Kate)",
    url: "https://cookieandkate.com/best-lentil-soup-recipe/",
  }
];

// Sample culinary imagery for testing vision analysis
const SAMPLE_IMAGE_TESTS = [
  {
    label: "Handwritten Family Sourdough Card",
    url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1000&q=80",
    notes: "Vintage handwritten sourdough loaf and levain schedule from family kitchen notebook"
  },
  {
    label: "Cookbook Dish: Pan-Seared Scallops",
    url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=1000&q=80",
    notes: "Photo of restaurant seared sea scallops with brown butter cauliflower purée"
  }
];

export const RecipeImportModal: React.FC<RecipeImportModalProps> = ({
  onClose,
  onRecipeImported,
}) => {
  const [activeMode, setActiveMode] = useState<ImportMode>("url");
  const [inputText, setInputText] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [imageNotes, setImageNotes] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Deconstructing Recipe...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Allow pasting an image from clipboard anywhere on the modal
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelected(file);
            setActiveMode("image");
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload an image file (PNG, JPG, WEBP, HEIC).");
      return;
    }
    setErrorMsg(null);
    setImageMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSamplePhoto = async (sample: typeof SAMPLE_IMAGE_TESTS[0]) => {
    setIsLoading(true);
    setLoadingStatus("Fetching sample photo for vision analysis...");
    setErrorMsg(null);
    try {
      // Fetch image and convert to base64 for Gemini vision model
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImagePreview(reader.result);
          setImageMimeType(blob.type || "image/jpeg");
          setImageNotes(sample.notes);
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      setIsLoading(false);
      setImagePreview(sample.url);
      setImageNotes(sample.notes);
    }
  };

  const handleParse = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    let bodyPayload: any = {};

    if (activeMode === "url") {
      if (!urlInput.trim()) {
        setErrorMsg("Please enter an online recipe or food blog URL.");
        setIsLoading(false);
        return;
      }
      setLoadingStatus("Scraping webpage & extracting structured recipe schema...");
      bodyPayload = {
        mode: "url",
        url: urlInput.trim(),
      };
    } else if (activeMode === "image") {
      if (!imagePreview) {
        setErrorMsg("Please upload or take a photo of a recipe card, cookbook page, or dish.");
        setIsLoading(false);
        return;
      }
      setLoadingStatus("Scanning recipe photo with Vision AI...");
      bodyPayload = {
        mode: "image",
        image: {
          data: imagePreview,
          mimeType: imageMimeType,
        },
        notes: imageNotes.trim(),
      };
    } else {
      // Text manuscript mode
      if (!inputText.trim()) {
        setErrorMsg("Please paste recipe text, manuscript, or cooking notes.");
        setIsLoading(false);
        return;
      }
      setLoadingStatus("Deconstructing text manuscript...");
      bodyPayload = {
        mode: "text",
        input: inputText.trim(),
      };
    }

    try {
      const response = await fetch("/api/gemini/parse-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not extract recipe with AI.");
      }

      setParsedPreview(data.recipe);
      if (data.extractedImage) {
        setCoverPhoto(data.extractedImage);
      } else if (activeMode === "image" && imagePreview) {
        setCoverPhoto(imagePreview);
      }
    } catch (err: any) {
      console.error("Extraction error:", err);
      setErrorMsg(err.message || "Failed to process recipe. Please verify the URL or photo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToChefbook = () => {
    if (!parsedPreview) return;

    // Pick fitting culinary image if none was extracted
    const fallbackImages = [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80"
    ];
    const finalImage = coverPhoto || parsedPreview.image || fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

    const fullRecipe: Recipe = {
      id: "rec-" + Date.now(),
      title: parsedPreview.title || "Imported Recipe",
      description: parsedPreview.description || "Synthesized with Chefbook AI",
      image: finalImage,
      prepTimeMinutes: parsedPreview.prepTimeMinutes || 10,
      cookTimeMinutes: parsedPreview.cookTimeMinutes || 20,
      servings: parsedPreview.servings || 4,
      difficulty: parsedPreview.difficulty || "Medium",
      cuisine: parsedPreview.cuisine || "Global",
      category: parsedPreview.category || "Dinner",
      tags: parsedPreview.tags || ["Imported", "AI Extracted"],
      ingredients: (parsedPreview.ingredients || []).map((ing: any, idx: number) => ({
        id: "ing-" + Date.now() + "-" + idx,
        amount: ing.amount,
        unit: ing.unit || "",
        name: ing.name,
        notes: ing.notes || "",
        category: ing.category || "Produce",
      })),
      steps: (parsedPreview.steps || []).map((st: any, idx: number) => ({
        stepNumber: st.stepNumber || idx + 1,
        instruction: st.instruction,
        timerMinutes: st.timerMinutes || 0,
        tip: st.tip || "",
      })),
      nutrition: parsedPreview.nutrition || {
        calories: 350,
        protein: 20,
        carbs: 30,
        fat: 15,
      },
      cookbooks: ["All Recipes", "Favorites"],
      isFavorite: false,
      rating: 4.8,
      chefNotes: parsedPreview.chefNotes || "",
      createdAt: new Date().toISOString(),
    };

    onRecipeImported(fullRecipe);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FDFCFB] border border-[#1A1A1A] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl p-6 sm:p-8 animate-in fade-in duration-150 my-auto text-[#1A1A1A]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#1A1A1A]/20 bg-[#F9F8F6] text-[#C2410C] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#C2410C]">
                  Omni-Source Recipe Transcriber
                </span>
              </div>
              <h2 className="font-serif font-black italic text-2xl text-[#1A1A1A]">
                Smart Recipe Ingestion
              </h2>
              <p className="font-serif italic text-xs text-[#1A1A1A]/60">
                Transform Instagram Reels, food blog links, cookbook photos, or raw notes into structured recipes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F9F8F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        {!parsedPreview && (
          <div className="pt-4 pb-2 border-b border-[#1A1A1A]/10">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F9F8F6] border border-[#1A1A1A]/15">
              <button
                type="button"
                onClick={() => { setActiveMode("url"); setErrorMsg(null); }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                  activeMode === "url"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white"
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Web URL</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMode("image"); setErrorMsg(null); }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                  activeMode === "image"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Photo & Vision</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveMode("text"); setErrorMsg(null); }}
                className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-sans font-bold uppercase tracking-wider transition-colors ${
                  activeMode === "text"
                    ? "bg-[#1A1A1A] text-white shadow-xs"
                    : "text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Raw Manuscript</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-5">
          {!parsedPreview ? (
            <>
              {/* MODE 1: Web Recipe URL */}
              {activeMode === "url" && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#F9F8F6] border border-[#1A1A1A]/15 text-[#1A1A1A] text-xs font-sans space-y-1">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-[#C2410C]">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Universal Webpage Recipe Extraction</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-[#1A1A1A]/70 font-serif italic">
                      Paste any URL from food blogs, cooking sites, or digital publications. Chefbook extracts ingredients, directions, timers, and nutrition automatically.
                    </p>
                  </div>

                  <div>
                    <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
                      Web Recipe or Food Blog Article URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#1A1A1A]/40">
                        <Globe className="w-4 h-4" />
                      </div>
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://www.seriouseats.com/recipe... or https://cooking.nytimes.com/..."
                        className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 pl-10 pr-4 py-2.5 font-mono text-xs sm:text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A]"
                      />
                    </div>
                    <p className="font-serif italic text-xs text-[#1A1A1A]/50 mt-1.5">
                      Chefbook automatically filters ads, life stories, and blog commentary, extracting only the pristine recipe schema and culinary timings.
                    </p>
                  </div>

                  {/* Sample URLs */}
                  <div>
                    <span className="font-sans text-[9px] font-black uppercase tracking-[0.25em] text-[#C2410C] block mb-2">
                      Test with Curated Food Articles:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_WEB_URLS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setUrlInput(sample.url);
                            setErrorMsg(null);
                          }}
                          className="px-3 py-1.5 border border-[#1A1A1A]/15 hover:border-[#1A1A1A] bg-[#F9F8F6] hover:bg-white text-xs font-serif italic text-[#1A1A1A] transition-colors text-left"
                        >
                          <span className="font-sans font-bold not-italic mr-1 text-[#C2410C]">↗</span>
                          {sample.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: Photo / Vision Scan */}
              {activeMode === "image" && (
                <div className="space-y-4">
                  {/* Drag and drop upload zone */}
                  {!imagePreview ? (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed p-6 sm:p-8 text-center transition-all bg-[#F9F8F6] ${
                        isDragOver ? "border-[#C2410C] bg-[#C2410C]/5" : "border-[#1A1A1A]/20 hover:border-[#1A1A1A]"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                        className="hidden"
                      />
                      <input
                        type="file"
                        ref={cameraInputRef}
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => e.target.files?.[0] && handleFileSelected(e.target.files[0])}
                        className="hidden"
                      />

                      <div className="w-12 h-12 mx-auto border border-[#1A1A1A]/20 bg-white flex items-center justify-center text-[#1A1A1A] mb-3">
                        <UploadCloud className="w-6 h-6 text-[#C2410C]" />
                      </div>

                      <h3 className="font-serif font-bold text-base text-[#1A1A1A] mb-1">
                        Upload Recipe Card, Cookbook Page, or Meal Photo
                      </h3>
                      <p className="font-serif italic text-xs text-[#1A1A1A]/60 max-w-md mx-auto mb-4">
                        Drag & drop any image file, paste directly from your clipboard (<kbd className="font-mono px-1 py-0.5 bg-white border border-[#1A1A1A]/20 text-[10px]">Ctrl+V</kbd>), or take a live photo.
                      </p>

                      <div className="flex items-center justify-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 border border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-[#C2410C] font-sans text-[11px] font-black uppercase tracking-wider transition-colors"
                        >
                          Browse Files
                        </button>
                        <button
                          type="button"
                          onClick={() => cameraInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-4 py-2 border border-[#1A1A1A]/30 bg-white hover:border-[#1A1A1A] text-[#1A1A1A] font-sans text-[11px] font-black uppercase tracking-wider transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Take Photo</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Image preview banner */
                    <div className="relative border border-[#1A1A1A]/20 bg-[#F9F8F6] p-3 flex flex-col sm:flex-row items-center gap-4">
                      <img
                        src={imagePreview}
                        alt="Recipe Scan Preview"
                        className="w-full sm:w-44 h-36 object-cover border border-[#1A1A1A]/15 bg-white"
                      />
                      <div className="flex-1 space-y-2 text-left w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-sans text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                            Photo Staged for Vision Analysis
                          </span>
                          <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="p-1 text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-serif italic text-xs text-[#1A1A1A]/70">
                          Gemini 3.8 Flash Vision will transcribe handwriting, cookbook print, or extrapolate ingredients from the dish.
                        </p>
                        <input
                          type="text"
                          value={imageNotes}
                          onChange={(e) => setImageNotes(e.target.value)}
                          placeholder="Optional notes: e.g. 'Aunt Marie's handwriting' or 'Make it for 2 servings'..."
                          className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-1.5 font-serif italic text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Sample Photos for Testing */}
                  <div>
                    <span className="font-sans text-[9px] font-black uppercase tracking-[0.25em] text-[#C2410C] block mb-2">
                      Test Vision AI with Sample Culinary Photos:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_IMAGE_TESTS.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleLoadSamplePhoto(sample)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-[#1A1A1A]/15 hover:border-[#1A1A1A] bg-[#F9F8F6] hover:bg-white text-xs font-serif italic text-[#1A1A1A] transition-colors"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>{sample.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 4: Raw Text Manuscript */}
              {activeMode === "text" && (
                <div className="space-y-4">
                  <div>
                    <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-2">
                      Paste Raw Recipe Manuscript or Prose
                    </label>
                    <textarea
                      rows={7}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste unstructured ingredients and culinary directions here... (e.g. from an article, food review, newsletter, or family ledger)"
                      className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none p-4 font-serif italic text-xs sm:text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A] leading-relaxed resize-none"
                    />
                  </div>

                  <div>
                    <span className="font-sans text-[9px] font-black uppercase tracking-[0.25em] text-[#C2410C] block mb-2">
                      Curated Transcriptive Samples:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SAMPLE_TEXT_RECIPES.map((sample, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setInputText(sample.sample)}
                          className="px-3 py-1.5 border border-[#1A1A1A]/15 hover:border-[#1A1A1A] bg-[#F9F8F6] hover:bg-white text-xs font-serif italic text-[#1A1A1A] transition-colors"
                        >
                          {sample.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-sans space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/80">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("image");
                        setErrorMsg(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 hover:border-rose-500 text-rose-900 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors shadow-2xs"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#C2410C]" />
                      <span>Try Photo & Vision Scan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMode("text");
                        setErrorMsg(null);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-300 hover:border-rose-500 text-rose-900 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#C2410C]" />
                      <span>Paste Raw Manuscript</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Parsed Structured Preview */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-900/10 border border-emerald-800/20 text-emerald-900 flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Recipe Schema Successfully Extracted and Structured</span>
              </div>

              <div className="p-5 border border-[#1A1A1A]/15 bg-[#F9F8F6] space-y-3">
                {coverPhoto && (
                  <div className="w-full h-48 sm:h-56 overflow-hidden border border-[#1A1A1A]/15 mb-3">
                    <img
                      src={coverPhoto}
                      alt={parsedPreview.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-sans text-[10px] font-black uppercase tracking-widest text-[#C2410C]">
                      {parsedPreview.cuisine || "Culinary"} · {parsedPreview.category || "Dinner"} · {parsedPreview.difficulty || "Medium"}
                    </span>
                    <h3 className="font-serif font-black italic text-2xl text-[#1A1A1A]">
                      {parsedPreview.title}
                    </h3>
                  </div>
                </div>

                <p className="font-serif italic text-xs text-[#1A1A1A]/70 leading-relaxed">
                  {parsedPreview.description}
                </p>

                <div className="flex flex-wrap gap-2 text-xs font-mono text-[#1A1A1A]">
                  <span className="px-2.5 py-1 bg-white border border-[#1A1A1A]/15">
                    ⏱️ Prep: {parsedPreview.prepTimeMinutes}m | Cook: {parsedPreview.cookTimeMinutes}m
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#1A1A1A]/15">
                    👥 {parsedPreview.servings} Servings
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#1A1A1A]/15">
                    🔥 {parsedPreview.nutrition?.calories || 0} kcal
                  </span>
                  <span className="px-2.5 py-1 bg-white border border-[#1A1A1A]/15">
                    💪 {parsedPreview.nutrition?.protein || 0}g protein
                  </span>
                </div>

                <div className="pt-3 border-t border-[#1A1A1A]/10">
                  <div className="font-sans text-[10px] font-black uppercase tracking-wider text-[#C2410C] mb-1">
                    Ingredients ({parsedPreview.ingredients?.length}):
                  </div>
                  <div className="font-serif italic text-xs text-[#1A1A1A]/80 line-clamp-3 leading-relaxed">
                    {parsedPreview.ingredients?.map((i: any) => `${i.amount || ""} ${i.unit || ""} ${i.name}`).join(", ")}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#1A1A1A]/10">
                  <div className="font-sans text-[10px] font-black uppercase tracking-wider text-[#C2410C] mb-1">
                    Method & Timers ({parsedPreview.steps?.length}):
                  </div>
                  <div className="font-serif italic text-xs text-[#1A1A1A]/80 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {parsedPreview.steps?.map((s: any) => (
                      <div key={s.stepNumber} className="flex items-start gap-1.5">
                        <strong className="font-sans not-italic font-bold text-[#1A1A1A] shrink-0">
                          Step {s.stepNumber}:
                        </strong>
                        <span>{s.instruction}</span>
                        {s.timerMinutes > 0 && (
                          <span className="ml-auto shrink-0 px-1.5 py-0.5 bg-white border border-[#1A1A1A]/20 font-mono text-[10px] text-[#C2410C]">
                            ⏱️ {s.timerMinutes}m
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-between gap-3">
          {parsedPreview ? (
            <>
              <button
                onClick={() => setParsedPreview(null)}
                className="px-5 py-2.5 border border-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:bg-white text-[#1A1A1A] font-sans text-[11px] font-black uppercase tracking-widest transition-colors"
              >
                Revise Input
              </button>
              <button
                onClick={handleSaveToChefbook}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-black uppercase tracking-widest transition-colors"
              >
                <span>Commit to Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-5 py-2.5 border border-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:bg-white text-[#1A1A1A] font-sans text-[11px] font-black uppercase tracking-widest transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={handleParse}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{loadingStatus}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {activeMode === "instagram" && "Extract from Reel"}
                      {activeMode === "url" && "Deconstruct Webpage"}
                      {activeMode === "image" && "Scan Photo with Vision AI"}
                      {activeMode === "text" && "Extract Recipe"}
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

