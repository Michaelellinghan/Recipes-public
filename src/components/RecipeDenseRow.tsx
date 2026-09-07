import React from "react";
import { Clock, Heart, Play, CalendarPlus, ShoppingCart, Star, ChevronRight } from "lucide-react";
import { Recipe } from "../types";

interface RecipeDenseRowProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onCookMode: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAddToPlanner: (recipe: Recipe, e: React.MouseEvent) => void;
  onAddToGrocery: (recipe: Recipe, e: React.MouseEvent) => void;
}

export const RecipeDenseRow: React.FC<RecipeDenseRowProps> = ({
  recipe,
  onSelect,
  onCookMode,
  onToggleFavorite,
  onAddToPlanner,
  onAddToGrocery,
}) => {
  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);

  return (
    <div
      onClick={() => onSelect(recipe)}
      className="group p-3 sm:p-4 bg-white hover:bg-[#F9F8F6] border-b border-[#1A1A1A]/10 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
    >
      {/* Left: Thumbnail & Title & Tags */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 overflow-hidden bg-stone-200 border border-[#1A1A1A]/10">
          <img
            src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=400&q=80"}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-sans text-[9px] font-black uppercase tracking-wider text-[#C2410C]">
              {recipe.cuisine || "Culinary"} · {recipe.category || "Dinner"}
            </span>
            {recipe.difficulty && (
              <span className="font-sans text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 font-bold">
                • {recipe.difficulty}
              </span>
            )}
          </div>

          <h4 className="font-serif font-black text-base sm:text-lg text-[#1A1A1A] group-hover:text-[#C2410C] transition-colors truncate">
            {recipe.title}
          </h4>

          <div className="flex items-center gap-3 font-sans text-xs text-[#1A1A1A]/60 mt-0.5">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-[#C2410C]" />
              {totalTime}m
            </span>
            {recipe.nutrition?.calories ? (
              <span className="font-mono text-[11px] hidden xs:inline">
                {recipe.nutrition.calories} kcal
              </span>
            ) : null}
            {recipe.rating ? (
              <span className="flex items-center gap-0.5 font-sans font-bold text-[11px] text-[#1A1A1A]">
                <Star className="w-3 h-3 fill-[#C2410C] text-[#C2410C]" />
                {recipe.rating}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1A1A1A]/10">
        <button
          onClick={(e) => onToggleFavorite(recipe.id, e)}
          className={`p-2 border transition-colors ${
            recipe.isFavorite
              ? "bg-[#C2410C] text-white border-[#C2410C]"
              : "bg-white text-[#1A1A1A]/60 hover:text-[#1A1A1A] border-[#1A1A1A]/15 hover:border-[#1A1A1A]"
          }`}
          title={recipe.isFavorite ? "Remove favorite" : "Add to favorites"}
        >
          <Heart className={`w-3.5 h-3.5 ${recipe.isFavorite ? "fill-white" : ""}`} />
        </button>

        <button
          onClick={(e) => onAddToPlanner(recipe, e)}
          className="p-2 bg-white text-[#1A1A1A]/60 hover:text-[#1A1A1A] border border-[#1A1A1A]/15 hover:border-[#1A1A1A] transition-colors"
          title="Add to Weekly Meal Plan"
        >
          <CalendarPlus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => onAddToGrocery(recipe, e)}
          className="p-2 bg-white text-[#1A1A1A]/60 hover:text-[#1A1A1A] border border-[#1A1A1A]/15 hover:border-[#1A1A1A] transition-colors"
          title="Add ingredients to Grocery List"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onCookMode(recipe);
          }}
          className="flex items-center gap-1.5 px-3 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[10px] font-black uppercase tracking-wider transition-colors"
          title="Start Cook Mode"
        >
          <Play className="w-3 h-3 fill-current" />
          <span>Cook</span>
        </button>
      </div>
    </div>
  );
};
