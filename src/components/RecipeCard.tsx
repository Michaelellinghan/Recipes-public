import React from "react";
import { Clock, Flame, Heart, Play, CalendarPlus, ShoppingCart, Star } from "lucide-react";
import { Recipe } from "../types";

interface RecipeCardProps {
  recipe: Recipe;
  onSelect: (recipe: Recipe) => void;
  onCookMode: (recipe: Recipe) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAddToPlanner: (recipe: Recipe, e: React.MouseEvent) => void;
  onAddToGrocery: (recipe: Recipe, e: React.MouseEvent) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
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
      className="group bg-[#FDFCFB] border border-[#1A1A1A]/10 hover:border-[#1A1A1A]/40 transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Photo with Editorial Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#E5E7EB]">
        <img
          src={recipe.image || "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80"}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Subtle dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Favorite button */}
        <button
          onClick={(e) => onToggleFavorite(recipe.id, e)}
          className={`absolute top-3 left-3 p-1.5 transition-all border ${
            recipe.isFavorite
              ? "bg-[#C2410C] text-white border-[#C2410C]"
              : "bg-white/80 hover:bg-white text-[#1A1A1A] border-[#1A1A1A]/10 backdrop-blur-sm"
          }`}
          title={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-3.5 h-3.5 ${recipe.isFavorite ? "fill-white" : ""}`} />
        </button>

        {/* Category & Cuisine badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap justify-end">
          {recipe.isTrending || recipe.tags?.includes("TikTok Trend") ? (
            <span className="bg-[#C2410C] text-white px-2 py-0.5 text-[9px] font-sans font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              <Flame className="w-2.5 h-2.5 fill-current" /> Viral Trend
            </span>
          ) : recipe.hackTip || recipe.tags?.includes("Food Hack") ? (
            <span className="bg-amber-600 text-white px-2 py-0.5 text-[9px] font-sans font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
              💡 Hack
            </span>
          ) : null}
          <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-sans font-bold uppercase tracking-widest text-[#1A1A1A] border border-[#1A1A1A]/10">
            {recipe.cuisine || recipe.category}
          </span>
        </div>

        {/* Quick Info Bar at bottom of photo */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] font-sans uppercase tracking-wider text-white drop-shadow-sm font-semibold">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>{totalTime} Mins</span>
          </div>
          {recipe.difficulty && (
            <span className="text-[10px] text-white/90 uppercase tracking-widest">
              {recipe.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-[#FDFCFB]">
        <div>
          {/* Micro Editorial Eyebrow */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#C2410C] font-bold">
              {recipe.category || "Culinary Collection"}
            </span>
            <div className="flex items-center gap-1 text-[#1A1A1A] text-xs font-sans font-bold">
              <Star className="w-3 h-3 fill-[#C2410C] text-[#C2410C]" />
              <span>{recipe.rating || 4.8}</span>
            </div>
          </div>

          <h3 className="font-serif text-xl sm:text-2xl italic font-bold leading-tight text-[#1A1A1A] group-hover:text-[#C2410C] transition-colors line-clamp-1">
            {recipe.title}
          </h3>

          <p className="font-sans text-xs text-[#1A1A1A]/70 mt-2 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>

          {/* Food Hack snippet if available */}
          {recipe.hackTip && (
            <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200/80 font-sans text-[10px] text-amber-950 flex items-start gap-1.5">
              <span className="font-bold text-amber-800 shrink-0">💡 Hack:</span>
              <span className="line-clamp-1 italic">{recipe.hackTip}</span>
            </div>
          )}

          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {recipe.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="font-sans text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#F9F8F6] border border-[#1A1A1A]/10 text-[#1A1A1A]/70 font-semibold"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 3 && (
                <span className="font-sans text-[9px] text-[#1A1A1A]/40 py-0.5">
                  +{recipe.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Editorial Action Row */}
        <div className="mt-5 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between gap-2">
          {/* Cook Mode Launch Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCookMode(recipe);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[10px] font-black uppercase tracking-widest transition-colors"
            title="Launch step-by-step Cook Mode"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Cook Mode</span>
          </button>

          {/* Quick Add to Planner */}
          <button
            onClick={(e) => onAddToPlanner(recipe, e)}
            className="p-2 border border-[#1A1A1A]/15 bg-[#F9F8F6] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
            title="Add to Weekly Meal Plan"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
          </button>

          {/* Quick Add to Grocery */}
          <button
            onClick={(e) => onAddToGrocery(recipe, e)}
            className="p-2 border border-[#1A1A1A]/15 bg-[#F9F8F6] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-colors"
            title="Add ingredients to Grocery List"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
