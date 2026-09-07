import React, { useState } from "react";
import {
  X,
  Download,
  FileCode,
  FileText,
  Database,
  Printer,
  ShoppingBag,
  CheckCircle2,
  Copy,
  Upload,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Archive,
  Search
} from "lucide-react";
import { Recipe, MealPlanDay, GroceryItem } from "../types";
import {
  downloadFullCookbookJSON,
  downloadFullCookbookMarkdown,
  downloadFullCookbookHTML,
  downloadGroceryListText,
  downloadGroceryListCSV,
  downloadRecipeJSON,
  downloadRecipeMarkdown,
  downloadRecipeText
} from "../utils/fileDownloader";

interface ExportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: Recipe[];
  mealPlan: MealPlanDay[];
  groceryItems: GroceryItem[];
  onImportBackup?: (data: { recipes: Recipe[]; mealPlan?: MealPlanDay[]; groceryItems?: GroceryItem[] }) => void;
  showToast?: (msg: string) => void;
}

export const ExportDownloadModal: React.FC<ExportDownloadModalProps> = ({
  isOpen,
  onClose,
  recipes,
  mealPlan,
  groceryItems,
  onImportBackup,
  showToast
}) => {
  const [activeSection, setActiveSection] = useState<"all" | "recipes" | "project" | "import">("all");
  const [recipeSearch, setRecipeSearch] = useState("");
  const [copiedZipGuide, setCopiedZipGuide] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyZipGuide = () => {
    const guideText = `To download the full app source code as a ZIP archive:\n1. Look at the top-right header in Google AI Studio.\n2. Click the gear/settings icon (⚙️ Settings).\n3. Select "Export to ZIP" (or "Export to GitHub").\n4. Unpack the ZIP on your computer and run 'npm install && npm run dev'.`;
    navigator.clipboard.writeText(guideText);
    setCopiedZipGuide(true);
    setTimeout(() => setCopiedZipGuide(false), 2500);
    if (showToast) showToast("Copied ZIP download instructions to clipboard!");
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          // Array of recipes directly
          if (onImportBackup) {
            onImportBackup({ recipes: parsed });
            setImportSuccess(`Successfully restored ${parsed.length} recipes!`);
          }
        } else if (parsed.recipes && Array.isArray(parsed.recipes)) {
          // Structured backup
          if (onImportBackup) {
            onImportBackup({
              recipes: parsed.recipes,
              mealPlan: parsed.mealPlan,
              groceryItems: parsed.groceryItems
            });
            setImportSuccess(`Restored ${parsed.recipes.length} recipes, meal plan & grocery list!`);
          }
        } else {
          setImportError("Invalid backup file structure. Expected a JSON with recipes array.");
        }
      } catch (err: any) {
        setImportError("Failed to parse JSON: " + (err?.message || "Invalid syntax"));
      }
    };
    reader.readAsText(file);
  };

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(recipeSearch.toLowerCase()) ||
    r.cuisine.toLowerCase().includes(recipeSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#FDFCFB] border border-[#1A1A1A]/20 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-[#1A1A1A]/10 bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-[#C2410C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-[#C2410C]">
                  Chefbook File Hub & Export
                </span>
                <span className="px-2 py-0.5 bg-[#F9F8F6] border border-[#1A1A1A]/15 text-[#1A1A1A] font-mono text-[10px] font-bold">
                  {recipes.length} Recipes Ready
                </span>
              </div>
              <h2 className="font-serif font-black italic text-xl sm:text-2xl text-[#1A1A1A]">
                Download Files & Source Code
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#F9F8F6] transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Subtabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 pb-2 border-b border-[#1A1A1A]/10 bg-[#F9F8F6] overflow-x-auto text-xs font-sans font-bold uppercase tracking-wider shrink-0">
          <button
            onClick={() => setActiveSection("all")}
            className={`px-3 py-1.5 transition-colors ${
              activeSection === "all"
                ? "bg-[#1A1A1A] text-white"
                : "text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white"
            }`}
          >
            Complete Collections
          </button>
          <button
            onClick={() => setActiveSection("recipes")}
            className={`px-3 py-1.5 transition-colors ${
              activeSection === "recipes"
                ? "bg-[#1A1A1A] text-white"
                : "text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white"
            }`}
          >
            Individual Recipes ({recipes.length})
          </button>
          <button
            onClick={() => setActiveSection("project")}
            className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
              activeSection === "project"
                ? "bg-[#C2410C] text-white"
                : "text-[#C2410C] hover:bg-[#C2410C]/10"
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Project Source Code (ZIP)
          </button>
          <button
            onClick={() => setActiveSection("import")}
            className={`px-3 py-1.5 transition-colors ${
              activeSection === "import"
                ? "bg-[#1A1A1A] text-white"
                : "text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white"
            }`}
          >
            Restore / Import JSON
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* SECTION 1: COMPLETE COLLECTIONS */}
          {activeSection === "all" && (
            <div className="space-y-6">
              {/* Highlight Banner: Full App ZIP */}
              <div className="p-4 sm:p-5 bg-stone-900 text-white border border-[#1A1A1A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileCode className="w-4 h-4 text-[#C2410C]" />
                    <span className="font-sans text-[10px] font-black uppercase tracking-widest text-[#C2410C]">
                      Full Source Code Download
                    </span>
                  </div>
                  <h3 className="font-serif italic font-bold text-lg text-white">
                    Need the entire application codebase as a ZIP?
                  </h3>
                  <p className="font-sans text-xs text-stone-300 max-w-xl mt-1">
                    Download all React, TypeScript, Vite, styling, and data files directly via Google AI Studio's top-right <strong>Settings menu (⚙️) &rarr; Export to ZIP</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection("project")}
                  className="px-4 py-2 bg-[#C2410C] hover:bg-[#C2410C]/90 text-white font-sans text-xs font-black uppercase tracking-wider transition-colors shrink-0 flex items-center gap-2"
                >
                  <span>View ZIP Steps</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Full JSON Backup */}
                <div className="p-5 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] transition-all flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-[#F9F8F6] border border-[#1A1A1A]/10 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                        <Database className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                        JSON BACKUP
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-lg text-[#1A1A1A]">
                      Full Cookbook & Data Backup
                    </h4>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Download all {recipes.length} recipes, detailed nutrition breakdown, ingredients, meal plans, and grocery items in structured JSON format. Can be restored anytime.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      downloadFullCookbookJSON(recipes, mealPlan, groceryItems);
                      if (showToast) showToast("Downloaded full cookbook backup JSON!");
                    }}
                    className="mt-4 w-full py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .json ({recipes.length} recipes)</span>
                  </button>
                </div>

                {/* 2. Standalone HTML Printable Anthology */}
                <div className="p-5 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] transition-all flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-[#F9F8F6] border border-[#1A1A1A]/10 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                        <Printer className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200">
                        HTML / PRINT / PDF
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-lg text-[#1A1A1A]">
                      Printable HTML Cookbook
                    </h4>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Generates a self-contained, beautifully styled HTML cookbook document. Opens offline in any browser, with print-ready styling for instant "Save as PDF" (Ctrl+P).
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      downloadFullCookbookHTML(recipes);
                      if (showToast) showToast("Downloaded printable HTML cookbook!");
                    }}
                    className="mt-4 w-full py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Download .html Anthology</span>
                  </button>
                </div>

                {/* 3. Markdown Anthology */}
                <div className="p-5 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] transition-all flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-[#F9F8F6] border border-[#1A1A1A]/10 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                        <FileText className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200">
                        MARKDOWN (.MD)
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-lg text-[#1A1A1A]">
                      Markdown Culinary Anthology
                    </h4>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Consolidates every recipe with tables of contents, nutritional profiles, secret hack tips, and preparation steps into a clean `.md` document ready for Obsidian or Notion.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      downloadFullCookbookMarkdown(recipes);
                      if (showToast) showToast("Downloaded cookbook Markdown file!");
                    }}
                    className="mt-4 w-full py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .md Document</span>
                  </button>
                </div>

                {/* 4. Grocery Shopping List */}
                <div className="p-5 bg-white border border-[#1A1A1A]/15 hover:border-[#1A1A1A] transition-all flex flex-col justify-between group">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-[#F9F8F6] border border-[#1A1A1A]/10 text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-stone-100 text-stone-800 border border-stone-200">
                        {groceryItems.length} ITEMS
                      </span>
                    </div>
                    <h4 className="font-serif font-bold text-lg text-[#1A1A1A]">
                      Grocery Shopping List
                    </h4>
                    <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                      Export your active pantry & grocery checklist organized by aisle department. Available in plain text or spreadsheet-compatible CSV.
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        downloadGroceryListText(groceryItems);
                        if (showToast) showToast("Downloaded grocery list as TXT!");
                      }}
                      className="py-2 bg-[#F9F8F6] border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] font-sans text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3 h-3" />
                      <span>Text (.txt)</span>
                    </button>
                    <button
                      onClick={() => {
                        downloadGroceryListCSV(groceryItems);
                        if (showToast) showToast("Downloaded grocery list as CSV!");
                      }}
                      className="py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3 h-3" />
                      <span>CSV (.csv)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: INDIVIDUAL RECIPES */}
          {activeSection === "recipes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    placeholder="Search specific recipe to download..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#1A1A1A]/15 font-sans text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A]"
                  />
                </div>
                <span className="font-mono text-xs text-[#1A1A1A]/60 shrink-0">
                  {filteredRecipes.length} recipes
                </span>
              </div>

              <div className="divide-y divide-[#1A1A1A]/10 border border-[#1A1A1A]/15 bg-white max-h-96 overflow-y-auto">
                {filteredRecipes.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F9F8F6] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={r.image}
                        alt={r.title}
                        className="w-11 h-11 object-cover border border-[#1A1A1A]/10 shrink-0"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-sans text-[9px] font-black uppercase text-[#C2410C]">
                            {r.cuisine}
                          </span>
                          <span className="text-[#1A1A1A]/30">·</span>
                          <span className="font-sans text-[9px] uppercase text-[#1A1A1A]/60">
                            {r.category}
                          </span>
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#1A1A1A] truncate">
                          {r.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => {
                          downloadRecipeMarkdown(r);
                          if (showToast) showToast(`Downloaded "${r.title}" as Markdown!`);
                        }}
                        className="px-2.5 py-1.5 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/20 text-[#1A1A1A] font-mono text-[10px] font-bold uppercase transition-colors"
                        title="Download Markdown (.md)"
                      >
                        .MD
                      </button>
                      <button
                        onClick={() => {
                          downloadRecipeText(r);
                          if (showToast) showToast(`Downloaded "${r.title}" as TXT!`);
                        }}
                        className="px-2.5 py-1.5 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/20 text-[#1A1A1A] font-mono text-[10px] font-bold uppercase transition-colors"
                        title="Download Plain Text (.txt)"
                      >
                        .TXT
                      </button>
                      <button
                        onClick={() => {
                          downloadRecipeJSON(r);
                          if (showToast) showToast(`Downloaded "${r.title}" as JSON!`);
                        }}
                        className="px-2.5 py-1.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-mono text-[10px] font-bold uppercase transition-colors"
                        title="Download JSON (.json)"
                      >
                        .JSON
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 3: FULL APP PROJECT CODE (ZIP) */}
          {activeSection === "project" && (
            <div className="space-y-6">
              <div className="p-6 bg-white border border-[#1A1A1A]/15 space-y-4">
                <div className="flex items-center gap-2 text-[#C2410C]">
                  <FileCode className="w-5 h-5" />
                  <span className="font-sans text-xs font-black uppercase tracking-widest">
                    Google AI Studio Project Export Guide
                  </span>
                </div>

                <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A]">
                  How to Download the Complete Source Code as a ZIP
                </h3>

                <p className="font-sans text-xs sm:text-sm text-[#1A1A1A]/80 leading-relaxed">
                  The AI Studio platform provides native one-click export for the complete project codebase (all React components, TypeScript files, Vite configuration, and styling):
                </p>

                <div className="p-4 bg-[#F9F8F6] border-l-4 border-[#C2410C] space-y-3 font-sans text-xs">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-[#1A1A1A]">
                      Locate the top-right toolbar of the <strong>Google AI Studio Build</strong> interface (above the live preview).
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-[#1A1A1A]">
                      Click the <strong>Settings (⚙️)</strong> icon or project options menu.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-[#1A1A1A]">
                      Select <strong>"Export to ZIP"</strong> to instantly download the complete repository archive to your local drive, or choose <strong>"Export to GitHub"</strong> to push directly into a new repository.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 bg-[#1A1A1A] text-white rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      4
                    </span>
                    <p className="text-[#1A1A1A]">
                      Extract the downloaded ZIP and run <code className="bg-white px-1.5 py-0.5 border border-[#1A1A1A]/20 font-mono text-[11px]">npm install && npm run dev</code> to run it locally on your computer!
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    onClick={handleCopyZipGuide}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
                  >
                    {copiedZipGuide ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedZipGuide ? "Instructions Copied!" : "Copy Step-by-Step Instructions"}</span>
                  </button>

                  <button
                    onClick={() => downloadFullCookbookJSON(recipes, mealPlan, groceryItems)}
                    className="px-4 py-2 bg-[#F9F8F6] border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] font-sans text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2"
                  >
                    <Database className="w-4 h-4 text-[#C2410C]" />
                    <span>Download App Data (JSON)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: RESTORE / IMPORT JSON */}
          {activeSection === "import" && (
            <div className="space-y-4">
              <div className="p-6 bg-white border border-[#1A1A1A]/15 space-y-4">
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-[#C2410C]" />
                  <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
                    Restore Recipes from a JSON Backup File
                  </h3>
                </div>
                <p className="font-sans text-xs text-[#1A1A1A]/70 leading-relaxed">
                  Upload any previously exported <code className="font-mono bg-[#F9F8F6] px-1 py-0.5 border border-[#1A1A1A]/10">.json</code> file to restore recipes, custom edits, meal plans, or grocery items.
                </p>

                <div className="border-2 border-dashed border-[#1A1A1A]/20 p-8 text-center hover:border-[#1A1A1A] transition-colors bg-[#F9F8F6]/50">
                  <Upload className="w-8 h-8 mx-auto text-[#1A1A1A]/40 mb-3" />
                  <label className="cursor-pointer">
                    <span className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-xs font-black uppercase tracking-wider transition-colors inline-block">
                      Select JSON Backup File
                    </span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[11px] font-sans text-[#1A1A1A]/50 mt-2">
                    Supports Chefbook backups (.json) and standard recipe collections.
                  </p>
                </div>

                {importError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{importError}</span>
                  </div>
                )}

                {importSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{importSuccess}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#1A1A1A]/10 bg-white flex items-center justify-between shrink-0 font-sans text-xs">
          <span className="text-[#1A1A1A]/60">
            Export format: Standard UTF-8 • Universal compatibility
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-black uppercase tracking-wider transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
