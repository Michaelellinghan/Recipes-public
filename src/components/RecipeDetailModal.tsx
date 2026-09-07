import React, { useState } from "react";
import {
  X,
  Play,
  Heart,
  Clock,
  Flame,
  Users,
  ShoppingCart,
  CalendarPlus,
  Edit,
  Trash2,
  Share2,
  Sparkles,
  Check,
  Timer,
  ChevronRight,
  Info,
  Layers,
  ChefHat,
  Download
} from "lucide-react";
import { Recipe, Ingredient } from "../types";
import { scaleAmount, formatAmount } from "../utils/scaler";
import {
  downloadRecipeJSON,
  downloadRecipeMarkdown,
  downloadRecipeText
} from "../utils/fileDownloader";

interface RecipeDetailModalProps {
  recipe: Recipe;
  onClose: () => void;
  onCookMode: (recipe: Recipe, targetServings: number) => void;
  onToggleFavorite: (id: string) => void;
  onAddToPlanner: (recipe: Recipe) => void;
  onAddToGrocery: (recipe: Recipe, selectedIngredients: Ingredient[]) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onOpenSubstitute: (recipe: Recipe, ingredientName: string) => void;
  onStartTimer: (label: string, minutes: number, recipeTitle: string, stepNumber?: number) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  onClose,
  onCookMode,
  onToggleFavorite,
  onAddToPlanner,
  onAddToGrocery,
  onEditRecipe,
  onDeleteRecipe,
  onOpenSubstitute,
  onStartTimer,
}) => {
  const [servings, setServings] = useState(recipe.servings || 4);
  const [checkedIngredients, setCheckedIngredients] = useState<string[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const toggleIngredientCheck = (id: string) => {
    if (checkedIngredients.includes(id)) {
      setCheckedIngredients(checkedIngredients.filter((i) => i !== id));
    } else {
      setCheckedIngredients([...checkedIngredients, id]);
    }
  };

  const handleShare = () => {
    const text = `🍳 ${recipe.title} (${recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins)
${recipe.description}

Servings: ${servings}
Ingredients:
${recipe.ingredients
  .map(
    (i) =>
      `• ${formatAmount(scaleAmount(i.amount, recipe.servings, servings))} ${i.unit || ""} ${i.name}`
  )
  .join("\n")}

Saved with Chefbook Free`;

    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#FDFCFB] border border-[#1A1A1A] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150 my-auto text-[#1A1A1A]">
        {/* Header Hero Image */}
        <div className="relative h-64 sm:h-80 w-full shrink-0 bg-[#E5E7EB] border-b border-[#1A1A1A]/10">
          <img
            src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80"}
            alt={recipe.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

          {/* Top Floating Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {recipe.isTrending || recipe.tags?.includes("TikTok Trend") ? (
                <span className="bg-[#C2410C] text-white font-sans text-[9px] uppercase tracking-[0.2em] px-3 py-1 font-black flex items-center gap-1 shadow-sm">
                  <Flame className="w-3 h-3 fill-current" /> Viral TikTok Trend
                </span>
              ) : null}
              {recipe.hackTip || recipe.tags?.includes("Food Hack") ? (
                <span className="bg-amber-600 text-white font-sans text-[9px] uppercase tracking-[0.2em] px-3 py-1 font-black flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" /> Food Hack
                </span>
              ) : null}
              <span className="bg-[#1A1A1A] text-white font-sans text-[9px] uppercase tracking-[0.2em] px-3 py-1 font-bold">
                {recipe.cuisine || "Culinary"}
              </span>
              <span className="bg-white/90 text-[#1A1A1A] font-sans text-[9px] uppercase tracking-[0.2em] px-3 py-1 font-bold">
                {recipe.category}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onToggleFavorite(recipe.id)}
                className={`p-2 backdrop-blur-sm border border-white/20 transition-colors ${
                  recipe.isFavorite
                    ? "bg-[#C2410C] text-white"
                    : "bg-[#1A1A1A]/80 text-white hover:bg-[#1A1A1A]"
                }`}
                title="Favorite"
              >
                <Heart className={`w-4 h-4 ${recipe.isFavorite ? "fill-white" : ""}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white border border-white/20 transition-colors"
                title="Copy recipe text"
              >
                {copiedShare ? <Check className="w-4 h-4 text-[#C2410C]" /> : <Share2 className="w-4 h-4" />}
              </button>

              {/* Download Recipe File Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="p-2 bg-[#1A1A1A]/80 hover:bg-[#C2410C] text-white border border-white/20 transition-colors flex items-center gap-1"
                  title="Download recipe file"
                >
                  <Download className="w-4 h-4" />
                </button>

                {showDownloadMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDownloadMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-[#FDFCFB] border border-[#1A1A1A]/20 shadow-2xl p-1.5 z-50 rounded-none text-left">
                      <div className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-wider text-[#C2410C] border-b border-[#1A1A1A]/10">
                        Download Recipe File
                      </div>
                      <button
                        onClick={() => {
                          setShowDownloadMenu(false);
                          downloadRecipeMarkdown(recipe);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-sans hover:bg-[#F9F8F6] flex items-center justify-between text-[#1A1A1A] transition-colors"
                      >
                        <span>Markdown Document</span>
                        <span className="font-mono text-[9px] text-[#C2410C] font-bold">.MD</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDownloadMenu(false);
                          downloadRecipeText(recipe);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-sans hover:bg-[#F9F8F6] flex items-center justify-between text-[#1A1A1A] transition-colors"
                      >
                        <span>Plain Text File</span>
                        <span className="font-mono text-[9px] text-[#1A1A1A]/60 font-bold">.TXT</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowDownloadMenu(false);
                          downloadRecipeJSON(recipe);
                        }}
                        className="w-full text-left px-2.5 py-2 text-xs font-sans hover:bg-[#F9F8F6] flex items-center justify-between text-[#1A1A1A] transition-colors border-t border-[#1A1A1A]/5"
                      >
                        <span>JSON Structured Data</span>
                        <span className="font-mono text-[9px] text-emerald-700 font-bold">.JSON</span>
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={() => onEditRecipe(recipe)}
                className="p-2 bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white border border-white/20 transition-colors"
                title="Edit Recipe"
              >
                <Edit className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 bg-[#1A1A1A]/80 hover:bg-[#1A1A1A] text-white border border-white/20 transition-colors ml-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Title & Primary Cook Action */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="text-white max-w-xl">
              <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#C2410C] font-bold block mb-1">
                Curated Editorial Spec
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-black italic tracking-tight text-white leading-tight">
                {recipe.title}
              </h1>
              <p className="text-white/85 font-serif italic text-xs sm:text-sm mt-1 line-clamp-2">
                {recipe.description}
              </p>
            </div>

            {/* Launch Cook Mode CTA */}
            <button
              onClick={() => onCookMode(recipe, servings)}
              className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 bg-[#C2410C] hover:bg-[#a3360a] text-white font-sans text-[11px] font-black uppercase tracking-widest shadow-xl transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Cook Mode</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8">
          {/* Quick Metrics & Cookbooks Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 bg-[#F9F8F6] border border-[#1A1A1A]/10">
              <div className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 mb-1">
                Total Duration
              </div>
              <div className="font-serif italic font-bold text-base text-[#1A1A1A]">
                {recipe.prepTimeMinutes + recipe.cookTimeMinutes} Mins
              </div>
            </div>

            <div className="p-4 bg-[#F9F8F6] border border-[#1A1A1A]/10">
              <div className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 mb-1">
                Caloric Index
              </div>
              <div className="font-serif italic font-bold text-base text-[#1A1A1A]">
                {recipe.nutrition?.calories ? `${recipe.nutrition.calories} kcal` : "—"}
              </div>
            </div>

            <div className="p-4 bg-[#F9F8F6] border border-[#1A1A1A]/10">
              <div className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 mb-1">
                Skill Level
              </div>
              <div className="font-serif italic font-bold text-base text-[#1A1A1A]">
                {recipe.difficulty || "Intermediate"}
              </div>
            </div>

            <div className="p-4 bg-[#F9F8F6] border border-[#1A1A1A]/10">
              <div className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 mb-1">
                Protein
              </div>
              <div className="font-serif italic font-bold text-base text-[#1A1A1A]">
                {recipe.nutrition?.protein ? `${recipe.nutrition.protein}g` : "Balanced"}
              </div>
            </div>
          </div>

          {/* Servings Scaler & Actions Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#F9F8F6] border border-[#1A1A1A]/15">
            {/* Serving scaler controls */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[#1A1A1A] font-sans text-[10px] font-bold uppercase tracking-widest">
                <Users className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>Yield / Servings:</span>
              </div>

              <div className="flex items-center gap-1 bg-white border border-[#1A1A1A]/20 p-1">
                <button
                  onClick={() => setServings(Math.max(1, servings - 1))}
                  className="w-6 h-6 flex items-center justify-center hover:bg-[#F9F8F6] text-[#1A1A1A] font-mono font-bold text-xs"
                  title="Decrease servings"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono font-bold text-[#1A1A1A] text-xs">
                  {servings}
                </span>
                <button
                  onClick={() => setServings(servings + 1)}
                  className="w-6 h-6 flex items-center justify-center hover:bg-[#F9F8F6] text-[#1A1A1A] font-mono font-bold text-xs"
                  title="Increase servings"
                >
                  +
                </button>
              </div>

              {/* Quick Multipliers */}
              <div className="hidden sm:flex items-center gap-1">
                {[1, 2, 4].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => setServings(mult * (recipe.servings || 2))}
                    className={`px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                      servings === mult * (recipe.servings || 2)
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-white text-[#1A1A1A]/60 border-[#1A1A1A]/20 hover:border-[#1A1A1A]"
                    }`}
                  >
                    {mult}x
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Planner & Add to Grocery buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddToPlanner(recipe)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F9F8F6] hover:bg-white text-[#1A1A1A] font-sans text-[10px] uppercase tracking-widest font-bold border border-[#1A1A1A]/20 transition-colors"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>Schedule Meal</span>
              </button>

              <button
                onClick={() => onAddToGrocery(recipe, recipe.ingredients)}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[10px] uppercase tracking-widest font-black transition-colors"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Ledger</span>
              </button>
            </div>
          </div>

          {/* Two-Column Layout: Ingredients & Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Ingredients Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                <h3 className="font-serif font-black italic text-xl text-[#1A1A1A]">
                  Ingredients Spec
                </h3>
                <span className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                  {recipe.ingredients.length} items
                </span>
              </div>

              <div className="space-y-2">
                {recipe.ingredients.map((ing) => {
                  const scaled = scaleAmount(ing.amount, recipe.servings, servings);
                  const amountStr = formatAmount(scaled);
                  const isChecked = checkedIngredients.includes(ing.id);

                  return (
                    <div
                      key={ing.id}
                      className={`group p-3 border transition-all flex items-start justify-between gap-3 ${
                        isChecked
                          ? "bg-[#F9F8F6] border-[#1A1A1A]/10 opacity-50"
                          : "bg-[#FDFCFB] border-[#1A1A1A]/10 hover:border-[#1A1A1A]"
                      }`}
                    >
                      <div
                        onClick={() => toggleIngredientCheck(ing.id)}
                        className="flex items-start gap-3 flex-1 cursor-pointer select-none"
                      >
                        <div
                          className={`mt-0.5 w-4 h-4 rounded-none border flex items-center justify-center transition-colors ${
                            isChecked
                              ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                              : "border-[#1A1A1A]/30 bg-white group-hover:border-[#1A1A1A]"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="text-xs sm:text-sm font-sans">
                          <span
                            className={`font-mono font-bold ${
                              isChecked ? "line-through text-[#1A1A1A]/40" : "text-[#C2410C]"
                            }`}
                          >
                            {amountStr} {ing.unit}{" "}
                          </span>
                          <span
                            className={`font-medium ${
                              isChecked ? "line-through text-[#1A1A1A]/40" : "text-[#1A1A1A]"
                            }`}
                          >
                            {ing.name}
                          </span>
                          {ing.notes && (
                            <span className="text-[#1A1A1A]/50 font-serif italic text-xs block mt-0.5">
                              ({ing.notes})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* AI Substitution Trigger */}
                      <button
                        onClick={() => onOpenSubstitute(recipe, ing.name)}
                        className="opacity-0 group-hover:opacity-100 px-2 py-1 font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A] bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A]/20 transition-all"
                        title={`Find substitutes for ${ing.name}`}
                      >
                        Substitute
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Nutrition Summary Card */}
              {recipe.nutrition && (
                <div className="p-4 bg-[#F9F8F6] border border-[#1A1A1A]/10 mt-6">
                  <div className="font-sans text-[9px] font-bold text-[#1A1A1A]/70 uppercase tracking-[0.2em] mb-2.5">
                    Nutritional Analysis (Per Serving)
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-white border border-[#1A1A1A]/10">
                      <div className="font-mono font-bold text-[#1A1A1A] text-sm">
                        {recipe.nutrition.calories}
                      </div>
                      <div className="font-sans text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider">Calories</div>
                    </div>
                    <div className="p-2 bg-white border border-[#1A1A1A]/10">
                      <div className="font-mono font-bold text-[#1A1A1A] text-sm">
                        {recipe.nutrition.protein}g
                      </div>
                      <div className="font-sans text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider">Protein</div>
                    </div>
                    <div className="p-2 bg-white border border-[#1A1A1A]/10">
                      <div className="font-mono font-bold text-[#1A1A1A] text-sm">
                        {recipe.nutrition.carbs}g
                      </div>
                      <div className="font-sans text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider">Carbs</div>
                    </div>
                    <div className="p-2 bg-white border border-[#1A1A1A]/10">
                      <div className="font-mono font-bold text-[#1A1A1A] text-sm">
                        {recipe.nutrition.fat}g
                      </div>
                      <div className="font-sans text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider">Fat</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions Column */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 pb-2">
                <h3 className="font-serif font-black italic text-xl text-[#1A1A1A]">
                  Preparation Sequence
                </h3>
                <span className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                  {recipe.steps.length} steps
                </span>
              </div>

              <div className="space-y-4">
                {recipe.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-5 bg-[#FDFCFB] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/30 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-white bg-[#1A1A1A] px-2.5 py-1">
                        Step {step.stepNumber}
                      </span>

                      {/* Direct Start Timer button if step has minutes */}
                      {step.timerMinutes && step.timerMinutes > 0 && (
                        <button
                          onClick={() =>
                            onStartTimer(
                              `Step ${step.stepNumber}: ${recipe.title.slice(0, 20)}...`,
                              step.timerMinutes!,
                              recipe.title,
                              step.stepNumber
                            )
                          }
                          className="flex items-center gap-1.5 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A] bg-[#F9F8F6] hover:border-[#1A1A1A] border border-[#1A1A1A]/20 transition-colors"
                        >
                          <Timer className="w-3.5 h-3.5 text-[#C2410C]" />
                          <span>{step.timerMinutes} Min Timer</span>
                        </button>
                      )}
                    </div>

                    <p className="font-serif text-base leading-relaxed text-[#1A1A1A]">
                      {step.instruction}
                    </p>

                    {step.tip && (
                      <div className="mt-3 p-3 border-l-2 border-[#C2410C] bg-[#F9F8F6] text-[#1A1A1A] font-serif italic text-xs flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#C2410C] shrink-0 mt-0.5" />
                        <span>{step.tip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Hack Secret / Viral Technique Callout if present */}
              {recipe.hackTip && (
                <div className="p-4 border border-amber-300 bg-amber-50 text-amber-950 text-xs leading-relaxed flex items-start gap-2.5 shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-sans font-black uppercase tracking-wider text-[10px] text-amber-800 block mb-0.5">
                      💡 Viral Food Hack & Secret Technique
                    </span>
                    <p className="font-serif italic text-sm text-amber-900 leading-relaxed">
                      {recipe.hackTip}
                    </p>
                  </div>
                </div>
              )}

              {/* Chef Notes / Tips */}
              {recipe.chefNotes && (
                <div className="p-4 border border-[#1A1A1A]/15 bg-[#F9F8F6] text-[#1A1A1A] text-xs leading-relaxed flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-sans font-bold uppercase tracking-wider text-[10px] text-[#1A1A1A] block mb-0.5">
                      Chef's Commentary
                    </span>
                    <p className="font-serif italic text-sm text-[#1A1A1A]/80">
                      {recipe.chefNotes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 bg-[#F9F8F6] border-t border-[#1A1A1A]/10 flex items-center justify-between gap-4">
          <button
            onClick={() => onDeleteRecipe(recipe.id)}
            className="flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest text-[#1A1A1A]/50 hover:text-[#C2410C] font-bold px-3 py-2 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Archive Recipe</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:bg-white text-[#1A1A1A] font-sans text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onCookMode(recipe, servings)}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Cook Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
