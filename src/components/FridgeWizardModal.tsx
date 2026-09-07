import React, { useState } from "react";
import { X, Wand2, Plus, Loader2, Sparkles, Clock, Flame, ArrowRight, Check, AlertCircle } from "lucide-react";
import { Recipe } from "../types";

interface FridgeWizardModalProps {
  onClose: () => void;
  onRecipeSaved: (recipe: Recipe) => void;
}

const COMMON_PANTRY = [
  "Chicken Breast",
  "Eggs",
  "Pasta",
  "Rice",
  "Garlic",
  "Onion",
  "Canned Tomatoes",
  "Spinach",
  "Cheese",
  "Bell Pepper",
  "Potatoes",
  "Ground Beef",
  "Greek Yogurt",
  "Salmon",
  "Mushrooms"
];

export const FridgeWizardModal: React.FC<FridgeWizardModalProps> = ({
  onClose,
  onRecipeSaved,
}) => {
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    "Eggs",
    "Garlic",
    "Spinach"
  ]);
  const [customInput, setCustomInput] = useState("");
  const [preference, setPreference] = useState("Quick <30 mins, Comfort Food");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedRecipes, setGeneratedRecipes] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<number[]>([]);

  const toggleIngredient = (ing: string) => {
    if (selectedIngredients.includes(ing)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== ing));
    } else {
      setSelectedIngredients([...selectedIngredients, ing]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    if (!selectedIngredients.includes(customInput.trim())) {
      setSelectedIngredients([...selectedIngredients, customInput.trim()]);
    }
    setCustomInput("");
  };

  const handleGenerate = async () => {
    if (selectedIngredients.length === 0) {
      setErrorMsg("Please select or add at least one ingredient.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setGeneratedRecipes([]);

    try {
      const response = await fetch("/api/gemini/fridge-wizard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          preferences: preference,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate recipes.");
      }

      setGeneratedRecipes(data.recipes || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate recipes.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = (recipeItem: any, index: number) => {
    const foodImgs = [
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1000&q=80"
    ];

    const fullRecipe: Recipe = {
      id: "fridge-" + Date.now() + "-" + index,
      title: recipeItem.title,
      description: recipeItem.description,
      image: foodImgs[index % foodImgs.length],
      prepTimeMinutes: recipeItem.prepTimeMinutes || 10,
      cookTimeMinutes: recipeItem.cookTimeMinutes || 15,
      servings: recipeItem.servings || 2,
      difficulty: recipeItem.difficulty || "Easy",
      cuisine: recipeItem.cuisine || "Pantry Fusion",
      category: recipeItem.category || "Dinner",
      tags: recipeItem.tags || ["Zero-Waste", "Fridge Wizard"],
      ingredients: (recipeItem.ingredients || []).map((ing: any, i: number) => ({
        id: "ing-" + Date.now() + "-" + i,
        amount: ing.amount,
        unit: ing.unit || "",
        name: ing.name,
        notes: ing.notes || "",
        category: ing.category || "Produce",
      })),
      steps: (recipeItem.steps || []).map((s: any, idx: number) => ({
        stepNumber: s.stepNumber || idx + 1,
        instruction: s.instruction,
        timerMinutes: s.timerMinutes || 0,
        tip: s.tip || "",
      })),
      nutrition: recipeItem.nutrition || {
        calories: 380,
        protein: 22,
        carbs: 35,
        fat: 16,
      },
      cookbooks: ["All Recipes", "Weeknight Dinners"],
      isFavorite: false,
      rating: 4.9,
      chefNotes: recipeItem.whyItWorks || "Created from your available pantry ingredients.",
      createdAt: new Date().toISOString(),
    };

    onRecipeSaved(fullRecipe);
    setSavedIds([...savedIds, index]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FDFCFB] border border-[#1A1A1A] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl p-6 sm:p-8 animate-in fade-in duration-150 my-auto text-[#1A1A1A]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#1A1A1A]/20 bg-[#F9F8F6] text-[#C2410C] flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#C2410C]">
                  Zero-Waste AI Engine
                </span>
              </div>
              <h2 className="font-serif font-black italic text-2xl text-[#1A1A1A]">
                Pantry Alchemy & Composition
              </h2>
              <p className="font-serif italic text-xs text-[#1A1A1A]/60">
                Design artisanal recipes formulated from the ingredients currently in your possession.
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Quick Ingredient Tags Selection */}
          <div>
            <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-2">
              Mark Available Provisions:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMON_PANTRY.map((item) => {
                const isSelected = selectedIngredients.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleIngredient(item)}
                    className={`px-3 py-1.5 rounded-none text-xs font-sans font-bold border transition-all ${
                      isSelected
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-[#F9F8F6] text-[#1A1A1A]/80 border-[#1A1A1A]/15 hover:border-[#1A1A1A]"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {item}
                  </button>
                );
              })}
            </div>

            {/* Custom Input */}
            <form onSubmit={handleAddCustom} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Or type an unlisted ingredient (e.g. chanterelles, pecorino)..."
                className="flex-1 bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2 font-sans text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A]"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-none bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                Add
              </button>
            </form>

            {/* Selected Ingredients Counter */}
            <div className="mt-2 text-[11px] font-serif italic text-[#1A1A1A]/60">
              Active Selection:{" "}
              <strong className="text-[#1A1A1A] font-sans not-italic font-bold">
                {selectedIngredients.join(", ") || "None"}
              </strong>
            </div>
          </div>

          {/* Preferences Input */}
          <div>
            <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1.5">
              Gastronomic Intent / Dietary Constraints:
            </label>
            <input
              type="text"
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              placeholder="e.g. Under 30 mins, high protein, no dairy, one-skillet..."
              className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2 font-serif italic text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-none bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Results */}
          {generatedRecipes.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#1A1A1A]/10">
              <div className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-[#C2410C]">
                Formulated Compositions for Your Provisions:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {generatedRecipes.map((recipeItem, idx) => {
                  const isSaved = savedIds.includes(idx);

                  return (
                    <div
                      key={idx}
                      className="p-4 border border-[#1A1A1A]/15 bg-[#F9F8F6] hover:border-[#1A1A1A] flex flex-col justify-between transition-all"
                    >
                      <div>
                        <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                          {recipeItem.cuisine || "Heritage"}
                        </span>
                        <h4 className="font-serif italic font-bold text-[#1A1A1A] text-base mt-1 line-clamp-2">
                          {recipeItem.title}
                        </h4>
                        <p className="text-[#1A1A1A]/70 font-serif italic text-xs mt-1.5 line-clamp-3 leading-relaxed">
                          {recipeItem.description}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] font-mono text-[#1A1A1A]/60 mt-3 pt-2 border-t border-[#1A1A1A]/10">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#C2410C]" />
                            {recipeItem.prepTimeMinutes + recipeItem.cookTimeMinutes}m
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-[#C2410C]" />
                            {recipeItem.nutrition?.calories || 0} kcal
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#1A1A1A]/10">
                        {isSaved ? (
                          <div className="flex items-center justify-center gap-1 py-2 bg-emerald-900/10 text-emerald-800 text-xs font-bold font-sans uppercase tracking-wider border border-emerald-800/20">
                            <Check className="w-3.5 h-3.5" />
                            <span>Preserved in Library</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleSaveRecipe(recipeItem, idx)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[10px] font-black uppercase tracking-widest transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Save Formulation</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:bg-white text-[#1A1A1A] font-sans text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            Dismiss
          </button>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Formulating Recipes...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Synthesize Recipes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
