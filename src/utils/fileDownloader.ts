import { Recipe, MealPlanDay, GroceryItem } from "../types";

/**
 * Triggers a browser download of a text/blob file
 */
export function triggerDownload(filename: string, content: string, mimeType: string = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Formats a single recipe into clean, rich Markdown (.md)
 */
export function recipeToMarkdown(recipe: Recipe): string {
  const totalMinutes = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
  
  let md = `# ${recipe.title}\n\n`;
  md += `> ${recipe.description || "A master culinary creation from Chefbook."}\n\n`;
  
  md += `**Cuisine:** ${recipe.cuisine} | **Category:** ${recipe.category} | **Difficulty:** ${recipe.difficulty}\n`;
  md += `**Prep Time:** ${recipe.prepTimeMinutes} min | **Cook Time:** ${recipe.cookTimeMinutes} min | **Total Time:** ${totalMinutes} min\n`;
  md += `**Servings:** ${recipe.servings} | **Rating:** ★ ${recipe.rating}/5\n\n`;

  if (recipe.nutrition) {
    md += `### Nutritional Profile (per serving)\n`;
    md += `- **Calories:** ${recipe.nutrition.calories} kcal\n`;
    md += `- **Protein:** ${recipe.nutrition.protein}g\n`;
    md += `- **Carbohydrates:** ${recipe.nutrition.carbs}g\n`;
    md += `- **Fat:** ${recipe.nutrition.fat}g\n`;
    if (recipe.nutrition.fiber) md += `- **Fiber:** ${recipe.nutrition.fiber}g\n`;
    md += `\n`;
  }

  if (recipe.hackTip) {
    md += `### 💡 Secret Kitchen Hack & Viral Technique\n`;
    md += `> ${recipe.hackTip}\n\n`;
  }

  md += `### Ingredients\n`;
  recipe.ingredients.forEach((ing) => {
    const amountStr = ing.amount ? `${ing.amount} ` : "";
    const unitStr = ing.unit ? `${ing.unit} ` : "";
    const notesStr = ing.notes ? ` (${ing.notes})` : "";
    md += `- ${amountStr}${unitStr}${ing.name}${notesStr}\n`;
  });
  md += `\n`;

  md += `### Instructions\n`;
  recipe.steps.forEach((step, idx) => {
    const num = step.stepNumber || idx + 1;
    const timerStr = step.timerMinutes ? ` *(⏱️ ${step.timerMinutes} min)*` : "";
    md += `${num}. ${step.instruction}${timerStr}\n`;
    if (step.tip) {
      md += `   *Chef's Tip: ${step.tip}*\n`;
    }
  });
  md += `\n`;

  if (recipe.chefNotes) {
    md += `### Chef's Editorial Notes\n`;
    md += `${recipe.chefNotes}\n\n`;
  }

  if (recipe.tags && recipe.tags.length > 0) {
    md += `**Tags:** ${recipe.tags.map((t) => `#${t.replace(/\s+/g, "")}`).join(" ")}\n\n`;
  }

  md += `---\n*Exported from Chefbook: The Essential Culinary Collection*\n`;
  return md;
}

/**
 * Formats a single recipe into plain text (.txt)
 */
export function recipeToPlainText(recipe: Recipe): string {
  const totalMinutes = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
  const border = "=".repeat(60);
  const subBorder = "-".repeat(60);

  let txt = `${border}\n`;
  txt += `${recipe.title.toUpperCase()}\n`;
  txt += `${border}\n\n`;
  txt += `${recipe.description}\n\n`;
  txt += `Cuisine: ${recipe.cuisine} | Category: ${recipe.category} | Difficulty: ${recipe.difficulty}\n`;
  txt += `Servings: ${recipe.servings} | Prep: ${recipe.prepTimeMinutes}m | Cook: ${recipe.cookTimeMinutes}m | Total: ${totalMinutes}m\n`;
  txt += `Calories: ${recipe.nutrition?.calories || "N/A"} kcal | Protein: ${recipe.nutrition?.protein || "N/A"}g | Carbs: ${recipe.nutrition?.carbs || "N/A"}g\n\n`;

  if (recipe.hackTip) {
    txt += `[ KITCHEN HACK / SECRET TECHNIQUE ]\n${recipe.hackTip}\n\n`;
  }

  txt += `INGREDIENTS:\n${subBorder}\n`;
  recipe.ingredients.forEach((ing) => {
    const amt = ing.amount ? `${ing.amount} ` : "";
    const unt = ing.unit ? `${ing.unit} ` : "";
    const note = ing.notes ? ` (${ing.notes})` : "";
    txt += `  • ${amt}${unt}${ing.name}${note}\n`;
  });
  txt += `\n`;

  txt += `METHOD & INSTRUCTIONS:\n${subBorder}\n`;
  recipe.steps.forEach((step, idx) => {
    const num = step.stepNumber || idx + 1;
    const timer = step.timerMinutes ? ` [Timer: ${step.timerMinutes} min]` : "";
    txt += `${num}. ${step.instruction}${timer}\n`;
    if (step.tip) {
      txt += `   Tip: ${step.tip}\n`;
    }
  });
  txt += `\n`;

  if (recipe.chefNotes) {
    txt += `CHEF'S NOTES:\n${recipe.chefNotes}\n\n`;
  }

  txt += `${border}\nChefbook Culinary Archive\n`;
  return txt;
}

/**
 * Exports single recipe as JSON
 */
export function downloadRecipeJSON(recipe: Recipe) {
  const jsonStr = JSON.stringify(recipe, null, 2);
  const safeTitle = recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  triggerDownload(`${safeTitle}.json`, jsonStr, "application/json");
}

/**
 * Exports single recipe as Markdown
 */
export function downloadRecipeMarkdown(recipe: Recipe) {
  const mdStr = recipeToMarkdown(recipe);
  const safeTitle = recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  triggerDownload(`${safeTitle}.md`, mdStr, "text/markdown");
}

/**
 * Exports single recipe as Text
 */
export function downloadRecipeText(recipe: Recipe) {
  const txtStr = recipeToPlainText(recipe);
  const safeTitle = recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  triggerDownload(`${safeTitle}.txt`, txtStr, "text/plain");
}

/**
 * Exports entire cookbook & user data as structured JSON backup
 */
export function downloadFullCookbookJSON(
  recipes: Recipe[],
  mealPlan?: MealPlanDay[],
  groceryItems?: GroceryItem[]
) {
  const backupData = {
    appName: "Chefbook",
    version: "2.4.0",
    exportDate: new Date().toISOString(),
    recipeCount: recipes.length,
    recipes,
    mealPlan: mealPlan || [],
    groceryItems: groceryItems || []
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(`chefbook-complete-backup-${dateStr}.json`, jsonStr, "application/json");
}

/**
 * Exports full recipes anthology as a consolidated Markdown document
 */
export function downloadFullCookbookMarkdown(recipes: Recipe[]) {
  let fullMd = `# Chefbook Master Culinary Anthology\n\n`;
  fullMd += `*Complete exported collection containing ${recipes.length} recipes.*\n`;
  fullMd += `*Generated on ${new Date().toLocaleDateString(undefined, { dateStyle: "full" })}*\n\n`;
  fullMd += `## Table of Contents\n\n`;

  recipes.forEach((r, idx) => {
    const slug = r.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    fullMd += `${idx + 1}. [${r.title}](#${slug}) — *${r.cuisine} (${r.category})*\n`;
  });

  fullMd += `\n---\n\n`;

  recipes.forEach((r) => {
    fullMd += recipeToMarkdown(r);
    fullMd += `\n\n---\n\n`;
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(`chefbook-anthology-${dateStr}.md`, fullMd, "text/markdown");
}

/**
 * Exports full recipes anthology as an elegant standalone HTML document
 * Ready for offline viewing, printing, or PDF saving via browser!
 */
export function downloadFullCookbookHTML(recipes: Recipe[]) {
  const dateStr = new Date().toLocaleDateString(undefined, { dateStyle: "full" });
  
  const recipesHtml = recipes.map((r) => {
    const totalTime = (r.prepTimeMinutes || 0) + (r.cookTimeMinutes || 0);
    const ingHtml = r.ingredients
      .map(
        (i) =>
          `<li><strong>${i.amount ? i.amount + " " : ""}${i.unit ? i.unit + " " : ""}</strong>${i.name}${
            i.notes ? ` <span class="note">(${i.notes})</span>` : ""
          }</li>`
      )
      .join("");

    const stepsHtml = r.steps
      .map(
        (s, idx) =>
          `<li>
            <div class="step-inst">${s.instruction}</div>
            ${s.timerMinutes ? `<span class="timer">⏱️ ${s.timerMinutes} min timer</span>` : ""}
            ${s.tip ? `<div class="step-tip">💡 <em>Tip: ${s.tip}</em></div>` : ""}
          </li>`
      )
      .join("");

    return `
      <article class="recipe-card">
        <header class="recipe-header">
          <div class="badge-row">
            <span class="badge badge-dark">${r.cuisine}</span>
            <span class="badge">${r.category}</span>
            <span class="badge badge-subtle">${r.difficulty}</span>
            ${r.isTrending ? '<span class="badge badge-accent">🔥 TikTok Viral</span>' : ''}
            ${r.hackTip ? '<span class="badge badge-amber">💡 Food Hack</span>' : ''}
          </div>
          <h2>${r.title}</h2>
          <p class="recipe-desc">${r.description || ""}</p>
          <div class="meta-strip">
            <span>⏱️ Prep: ${r.prepTimeMinutes}m | Cook: ${r.cookTimeMinutes}m (${totalTime}m total)</span>
            <span>🍽️ Servings: ${r.servings}</span>
            <span>🔥 ${r.nutrition?.calories || "—"} kcal | 🥩 ${r.nutrition?.protein || "—"}g protein</span>
          </div>
        </header>

        ${r.hackTip ? `
          <div class="hack-callout">
            <strong>💡 Secret Food Hack:</strong> ${r.hackTip}
          </div>
        ` : ""}

        <div class="recipe-body">
          <div class="ingredients-col">
            <h3>Ingredients</h3>
            <ul>${ingHtml}</ul>
          </div>
          <div class="instructions-col">
            <h3>Instructions</h3>
            <ol>${stepsHtml}</ol>
          </div>
        </div>

        ${r.chefNotes ? `<div class="chef-notes"><strong>Chef's Note:</strong> ${r.chefNotes}</div>` : ""}
      </article>
    `;
  }).join("\n");

  const htmlDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Chefbook — Complete Culinary Anthology</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Playfair+Display:ital,wght@0,600;0,800;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #FDFCFB;
      color: #1A1A1A;
      line-height: 1.6;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    .masthead {
      text-align: center;
      padding-bottom: 40px;
      border-bottom: 3px double #1A1A1A;
      margin-bottom: 40px;
    }
    .masthead h1 {
      font-family: 'Cinzel', serif;
      font-size: 42px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .masthead p {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      color: #666;
      font-size: 16px;
    }
    .recipe-card {
      background: #FFFFFF;
      border: 1px solid #E5E2DC;
      padding: 32px;
      margin-bottom: 40px;
      page-break-inside: avoid;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
    }
    .badge-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 12px;
    }
    .badge {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      padding: 3px 8px;
      border: 1px solid #1A1A1A;
      background: #FFF;
    }
    .badge-dark { background: #1A1A1A; color: #FFF; }
    .badge-accent { background: #C2410C; color: #FFF; border-color: #C2410C; }
    .badge-amber { background: #D97706; color: #FFF; border-color: #D97706; }
    .badge-subtle { border-color: #CCC; color: #666; }
    
    h2 {
      font-family: 'Playfair Display', serif;
      font-size: 26px;
      font-weight: 800;
      color: #1A1A1A;
      margin-bottom: 8px;
    }
    .recipe-desc {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      color: #555;
      font-size: 14px;
      margin-bottom: 16px;
    }
    .meta-strip {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      font-size: 12px;
      font-weight: 600;
      padding: 8px 12px;
      background: #F9F8F6;
      border-left: 3px solid #C2410C;
      margin-bottom: 20px;
    }
    .hack-callout {
      background: #FEF3C7;
      border: 1px solid #F59E0B;
      padding: 12px 16px;
      font-size: 13px;
      color: #78350F;
      margin-bottom: 20px;
    }
    .recipe-body {
      display: grid;
      grid-template-columns: 1fr 1.6fr;
      gap: 28px;
    }
    @media (max-width: 650px) {
      .recipe-body { grid-template-columns: 1fr; }
    }
    h3 {
      font-family: 'Cinzel', serif;
      font-size: 14px;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      border-bottom: 1px solid #1A1A1A;
      padding-bottom: 4px;
      margin-bottom: 12px;
    }
    ul, ol {
      padding-left: 20px;
      font-size: 13.5px;
    }
    li { margin-bottom: 8px; }
    .step-inst { margin-bottom: 4px; }
    .timer {
      font-size: 11px;
      color: #C2410C;
      font-weight: 700;
    }
    .step-tip {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }
    .chef-notes {
      margin-top: 20px;
      padding-top: 12px;
      border-top: 1px dashed #CCC;
      font-size: 12px;
      color: #666;
      font-style: italic;
    }
    @media print {
      body { background: #FFF; padding: 0; }
      .recipe-card { border: none; box-shadow: none; page-break-after: always; padding: 20px 0; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="masthead">
      <h1>Chefbook</h1>
      <p>The Essential Culinary Collection • Master Archive of ${recipes.length} Recipes</p>
      <p style="font-size: 11px; margin-top: 6px; color: #888;">Exported on ${dateStr}</p>
    </header>
    ${recipesHtml}
  </div>
</body>
</html>`;

  const dateFile = new Date().toISOString().slice(0, 10);
  triggerDownload(`chefbook-printable-anthology-${dateFile}.html`, htmlDoc, "text/html");
}

/**
 * Exports Grocery List as Text
 */
export function downloadGroceryListText(items: GroceryItem[]) {
  const dateStr = new Date().toLocaleDateString();
  let txt = `CHEFBOOK GROCERY SHOPPING LIST\n`;
  txt += `Date: ${dateStr} | Total Items: ${items.length}\n`;
  txt += "=".repeat(50) + "\n\n";

  // Group by category
  const categories = Array.from(new Set(items.map((i) => i.category || "General")));
  categories.sort();

  categories.forEach((cat) => {
    const catItems = items.filter((i) => (i.category || "General") === cat);
    txt += `[ ${cat.toUpperCase()} ]\n`;
    catItems.forEach((item) => {
      const box = item.checked ? "[x]" : "[ ]";
      const amt = item.amount ? `${item.amount} ` : "";
      const unt = item.unit ? `${item.unit} ` : "";
      const rTitle = item.recipeTitle ? ` (for: ${item.recipeTitle})` : "";
      txt += `  ${box} ${amt}${unt}${item.name}${rTitle}\n`;
    });
    txt += "\n";
  });

  const dateFile = new Date().toISOString().slice(0, 10);
  triggerDownload(`chefbook-grocery-list-${dateFile}.txt`, txt, "text/plain");
}

/**
 * Exports Grocery List as CSV
 */
export function downloadGroceryListCSV(items: GroceryItem[]) {
  let csv = "Category,Item,Quantity,Unit,Checked,Recipe\n";
  items.forEach((item) => {
    const cat = `"${(item.category || "General").replace(/"/g, '""')}"`;
    const name = `"${item.name.replace(/"/g, '""')}"`;
    const amt = item.amount !== undefined ? item.amount : "";
    const unit = `"${(item.unit || "").replace(/"/g, '""')}"`;
    const checked = item.checked ? "Yes" : "No";
    const recipe = `"${(item.recipeTitle || "").replace(/"/g, '""')}"`;
    csv += `${cat},${name},${amt},${unit},${checked},${recipe}\n`;
  });

  const dateFile = new Date().toISOString().slice(0, 10);
  triggerDownload(`chefbook-grocery-list-${dateFile}.csv`, csv, "text/csv");
}
