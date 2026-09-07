import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  BookOpen,
  Plus,
  Play,
  Clock,
  Flame,
  Check,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Layers
} from "lucide-react";
import {
  ArchiveDish,
  getFullArchiveCatalog,
  convertArchiveDishToRecipe,
  CULINARY_CUISINES
} from "../data/recipeArchive";
import { Recipe } from "../types";

interface RecipeArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecipe: (recipe: Recipe) => void;
  onStartCookMode: (recipe: Recipe) => void;
  existingRecipeTitles?: string[];
}

export const RecipeArchiveModal: React.FC<RecipeArchiveModalProps> = ({
  isOpen,
  onClose,
  onAddRecipe,
  onStartCookMode,
  existingRecipeTitles = []
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string>("All Cuisines");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "dense">("grid");
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  // Full catalog of 3,000+ recipes including viral TikTok trends and clever food hacks
  const fullCatalog = useMemo(() => getFullArchiveCatalog(), []);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return fullCatalog.filter((dish) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = dish.title.toLowerCase().includes(q);
        const matchesCuisine = dish.cuisine.toLowerCase().includes(q);
        const matchesIngredients = dish.signatureIngredients.some((i) =>
          i.toLowerCase().includes(q)
        );
        const matchesTags = dish.tags.some((t) => t.toLowerCase().includes(q));
        const matchesHack = dish.hackTip ? dish.hackTip.toLowerCase().includes(q) : false;
        if (!matchesTitle && !matchesCuisine && !matchesIngredients && !matchesTags && !matchesHack) {
          return false;
        }
      }

      // Cuisine
      if (selectedCuisine !== "All Cuisines" && dish.cuisine !== selectedCuisine) {
        return false;
      }

      // Category
      if (selectedCategory !== "All" && dish.category !== selectedCategory) {
        return false;
      }

      // Tag
      if (selectedTag !== "All") {
        if (selectedTag === "🔥 TikTok Trends") {
          const isTT = dish.tags.includes("TikTok Trend") || dish.cuisine === "Viral TikTok Trends" || dish.isTrending;
          if (!isTT) return false;
        } else if (selectedTag === "💡 Food Hacks") {
          const isHack = dish.tags.includes("Food Hack") || dish.cuisine === "Clever Food Hacks" || !!dish.hackTip;
          if (!isHack) return false;
        } else if (selectedTag === "Air Fryer") {
          const isAir = dish.tags.includes("Air Fryer") || dish.title.toLowerCase().includes("air fryer") || dish.title.toLowerCase().includes("air-fryer");
          if (!isAir) return false;
        } else if (selectedTag === "1-Pan / Sheet Pan") {
          const isPan = dish.tags.includes("1-Pan Hack") || dish.title.toLowerCase().includes("one-pan") || dish.title.toLowerCase().includes("sheet-pan");
          if (!isPan) return false;
        } else if (selectedTag === "Quick <30m") {
          if ((dish.prepTimeMinutes + dish.cookTimeMinutes) > 30) return false;
        } else if (selectedTag === "High Protein") {
          if (dish.protein < 30 && !dish.tags.includes("High Protein")) return false;
        } else if (!dish.tags.includes(selectedTag)) {
          return false;
        }
      }

      return true;
    });
  }, [fullCatalog, searchQuery, selectedCuisine, selectedCategory, selectedTag]);

  if (!isOpen) return null;

  const handleAddDish = (dish: ArchiveDish) => {
    const fullRecipe = convertArchiveDishToRecipe(dish);
    onAddRecipe(fullRecipe);
    setAddedIds((prev) => ({ ...prev, [dish.id]: true }));
  };

  const handleCookNow = (dish: ArchiveDish) => {
    const fullRecipe = convertArchiveDishToRecipe(dish);
    onStartCookMode(fullRecipe);
    onClose();
  };

  const quickTags = [
    "All",
    "🔥 TikTok Trends",
    "💡 Food Hacks",
    "Quick <30m",
    "High Protein",
    "Air Fryer",
    "1-Pan / Sheet Pan",
    "Vegetarian",
    "Seafood",
    "Gluten-Free"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-[#FDFCFB] text-[#1A1A1A] w-full max-w-6xl max-h-[92vh] flex flex-col border border-[#1A1A1A]/20 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 border-b border-[#1A1A1A]/10 bg-[#F9F8F6] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A1A1A] text-white flex items-center justify-center border border-[#1A1A1A]">
              <Globe className="w-5 h-5 text-[#C2410C]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-[#C2410C]">
                  Grand World Archive & Viral Lab
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-[10px] font-bold">
                  {fullCatalog.length.toLocaleString()}+ Master Recipes & Hacks
                </span>
              </div>
              <h2 className="font-serif font-black italic text-xl sm:text-2xl text-[#1A1A1A]">
                Explore World Recipes, TikTok Trends & Food Hacks
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center border border-[#1A1A1A]/20 bg-white p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("dense")}
                className={`px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors ${
                  viewMode === "dense"
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                }`}
              >
                Index
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#1A1A1A]/60 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors border border-transparent hover:border-[#1A1A1A]/20"
              title="Close Archive"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter and Search Bar Strip */}
        <div className="p-4 sm:p-5 border-b border-[#1A1A1A]/10 bg-white shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Live Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#1A1A1A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 3,000+ recipes, TikTok trends, food hacks, or ingredients (e.g. Feta Pasta, Air Fryer, Smashed Potatoes)..."
                className="w-full pl-9 pr-8 py-2 bg-[#F9F8F6] border border-[#1A1A1A]/15 font-serif italic text-sm text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none focus:border-[#1A1A1A] focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Cuisine Select */}
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="bg-[#F9F8F6] border border-[#1A1A1A]/15 px-3 py-2 font-sans text-xs uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            >
              {CULINARY_CUISINES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Course Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#F9F8F6] border border-[#1A1A1A]/15 px-3 py-2 font-sans text-xs uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            >
              <option value="All">All Courses</option>
              <option value="Dinner">Dinner</option>
              <option value="Lunch">Lunch</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Dessert">Dessert</option>
              <option value="Snack">Snack</option>
            </select>
          </div>

          {/* Quick Dietary and Speed Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-sans">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#1A1A1A]/40 mr-1 shrink-0">
              Quick Filter:
            </span>
            {quickTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors border ${
                    active
                      ? "bg-[#C2410C] text-white border-[#C2410C]"
                      : "bg-[#F9F8F6] text-[#1A1A1A]/70 border-[#1A1A1A]/15 hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                  }`}
                >
                  {tag}
                </button>
              );
            })}

            <span className="ml-auto text-[11px] font-mono text-[#1A1A1A]/50 shrink-0">
              Showing {filteredDishes.length} matches
            </span>
          </div>
        </div>

        {/* Scrollable Results Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredDishes.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="font-serif italic text-lg text-[#1A1A1A]/60">
                No recipes found matching "{searchQuery}" under the selected filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCuisine("All Cuisines");
                  setSelectedCategory("All");
                  setSelectedTag("All");
                }}
                className="px-4 py-2 border border-[#1A1A1A] bg-[#1A1A1A] text-white text-xs font-sans font-bold uppercase tracking-wider hover:bg-[#C2410C] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDishes.map((dish) => {
                const isAdded = addedIds[dish.id] || existingRecipeTitles.includes(dish.title);
                return (
                  <div
                    key={dish.id}
                    className="border border-[#1A1A1A]/15 bg-white flex flex-col justify-between hover:border-[#1A1A1A] transition-all group"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-44 overflow-hidden bg-stone-100 border-b border-[#1A1A1A]/10">
                        <img
                          src={dish.image}
                          alt={dish.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 max-w-[85%]">
                          {dish.cuisine === "Viral TikTok Trends" || dish.tags.includes("TikTok Trend") || dish.isTrending ? (
                            <span className="px-2 py-0.5 bg-[#C2410C] text-white font-sans text-[9px] font-black uppercase tracking-wider backdrop-blur-xs flex items-center gap-1 shadow-xs">
                              <Flame className="w-2.5 h-2.5 fill-current" /> TikTok Viral
                            </span>
                          ) : dish.cuisine === "Clever Food Hacks" || dish.tags.includes("Food Hack") ? (
                            <span className="px-2 py-0.5 bg-amber-600 text-white font-sans text-[9px] font-black uppercase tracking-wider backdrop-blur-xs flex items-center gap-1 shadow-xs">
                              <Sparkles className="w-2.5 h-2.5" /> Food Hack
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-[#1A1A1A]/90 text-white font-sans text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs">
                              {dish.cuisine}
                            </span>
                          )}
                          <span className="px-2 py-0.5 bg-white/95 text-[#1A1A1A] font-sans text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs border border-[#1A1A1A]/20">
                            {dish.category}
                          </span>
                        </div>
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 backdrop-blur-xs">
                          <Clock className="w-3 h-3 text-[#C2410C]" />
                          <span>{dish.prepTimeMinutes + dish.cookTimeMinutes}m</span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4 space-y-2">
                        <h3 className="font-serif font-black text-base text-[#1A1A1A] group-hover:text-[#C2410C] transition-colors leading-tight line-clamp-2">
                          {dish.title}
                        </h3>
                        <p className="font-serif italic text-xs text-[#1A1A1A]/70 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>

                        {/* Hack Tip Highlight if available */}
                        {dish.hackTip && (
                          <div className="p-2 bg-amber-50/90 border border-amber-200/90 font-sans text-[11px] text-amber-950 leading-snug">
                            <span className="font-bold text-amber-800 flex items-center gap-1 mb-0.5">
                              <Sparkles className="w-3 h-3 text-[#C2410C]" /> Hack Secret:
                            </span>
                            <span className="line-clamp-2 italic">{dish.hackTip}</span>
                          </div>
                        )}

                        {/* Nutrition & Specs */}
                        <div className="flex items-center gap-3 font-mono text-[11px] text-[#1A1A1A]/70 pt-2 border-t border-[#1A1A1A]/10">
                          <span>🔥 {dish.calories} kcal</span>
                          <span>💪 {dish.protein}g protein</span>
                          <span className="ml-auto font-sans text-[10px] font-bold uppercase tracking-wider text-[#C2410C]">
                            {dish.difficulty}
                          </span>
                        </div>

                        {/* Signature Ingredients Pills */}
                        <div className="pt-2">
                          <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/40 block mb-1">
                            Signature Elements:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {dish.signatureIngredients.slice(0, 3).map((sig, sIdx) => (
                              <span
                                key={sIdx}
                                className="px-1.5 py-0.5 bg-[#F9F8F6] border border-[#1A1A1A]/10 font-serif italic text-[11px] text-[#1A1A1A]/80"
                              >
                                {sig}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => handleAddDish(dish)}
                        disabled={isAdded}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-sans font-black uppercase tracking-wider border transition-colors ${
                          isAdded
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-[#F9F8F6] hover:bg-white text-[#1A1A1A] border-[#1A1A1A]/20 hover:border-[#1A1A1A]"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>In Cookbook</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 text-[#C2410C]" />
                            <span>+ Cookbook</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCookNow(dish)}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white text-[10px] font-sans font-black uppercase tracking-wider transition-colors"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Cook Now</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Dense Index View */
            <div className="border border-[#1A1A1A]/15 bg-white divide-y divide-[#1A1A1A]/10">
              <div className="p-3 bg-[#F9F8F6] font-sans text-[10px] font-black uppercase tracking-wider text-[#1A1A1A]/60 grid grid-cols-12 gap-3 items-center">
                <span className="col-span-5 sm:col-span-4">Recipe / Origin</span>
                <span className="col-span-3 sm:col-span-2 text-center">Time & Difficulty</span>
                <span className="hidden sm:block sm:col-span-2 text-center">Nutrition</span>
                <span className="hidden md:block md:col-span-2">Ingredients</span>
                <span className="col-span-4 sm:col-span-2 text-right">Actions</span>
              </div>

              {filteredDishes.map((dish) => {
                const isAdded = addedIds[dish.id] || existingRecipeTitles.includes(dish.title);
                return (
                  <div
                    key={dish.id}
                    className="p-3 sm:p-4 grid grid-cols-12 gap-3 items-center hover:bg-[#F9F8F6]/60 transition-colors"
                  >
                    {/* Title and Cuisine */}
                    <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                      <img
                        src={dish.image}
                        alt={dish.title}
                        className="w-12 h-12 object-cover border border-[#1A1A1A]/10 shrink-0 hidden sm:block"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-sans text-[9px] font-black uppercase tracking-wider text-[#C2410C] block truncate">
                            {dish.cuisine} · {dish.category}
                          </span>
                          {dish.cuisine === "Viral TikTok Trends" || dish.tags.includes("TikTok Trend") || dish.isTrending ? (
                            <span className="px-1.5 py-0.2 bg-[#C2410C] text-white font-sans text-[8px] font-black uppercase tracking-wider">
                              🔥 Trend
                            </span>
                          ) : dish.cuisine === "Clever Food Hacks" || dish.tags.includes("Food Hack") ? (
                            <span className="px-1.5 py-0.2 bg-amber-600 text-white font-sans text-[8px] font-black uppercase tracking-wider">
                              💡 Hack
                            </span>
                          ) : null}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-[#1A1A1A] truncate">
                          {dish.title}
                        </h4>
                        {dish.hackTip && (
                          <span className="text-[10px] text-amber-800 font-sans italic truncate block">
                            Tip: {dish.hackTip}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="col-span-3 sm:col-span-2 text-center">
                      <div className="font-mono text-xs text-[#1A1A1A]">
                        {dish.prepTimeMinutes + dish.cookTimeMinutes} min
                      </div>
                      <span className="font-sans text-[9px] uppercase tracking-wider text-[#1A1A1A]/60">
                        {dish.difficulty}
                      </span>
                    </div>

                    {/* Nutrition */}
                    <div className="hidden sm:block sm:col-span-2 text-center font-mono text-xs text-[#1A1A1A]/70">
                      <div>{dish.calories} kcal</div>
                      <div className="text-[10px] text-emerald-700">{dish.protein}g protein</div>
                    </div>

                    {/* Ingredients */}
                    <div className="hidden md:block md:col-span-2 font-serif italic text-xs text-[#1A1A1A]/70 truncate">
                      {dish.signatureIngredients.join(", ")}
                    </div>

                    {/* Actions */}
                    <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddDish(dish)}
                        disabled={isAdded}
                        className={`p-1.5 sm:px-2.5 sm:py-1 text-[10px] font-sans font-black uppercase tracking-wider border transition-colors ${
                          isAdded
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-white hover:bg-[#F9F8F6] text-[#1A1A1A] border-[#1A1A1A]/20 hover:border-[#1A1A1A]"
                        }`}
                        title={isAdded ? "Added to Cookbook" : "Add to Cookbook"}
                      >
                        {isAdded ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 inline" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-[#C2410C] inline" />
                        )}
                        <span className="hidden sm:inline ml-1">{isAdded ? "Added" : "Add"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCookNow(dish)}
                        className="p-1.5 sm:px-2.5 sm:py-1 bg-[#1A1A1A] hover:bg-[#C2410C] text-white text-[10px] font-sans font-black uppercase tracking-wider transition-colors"
                        title="Start Cook Mode"
                      >
                        <Play className="w-3 h-3 fill-current inline" />
                        <span className="hidden sm:inline ml-1">Cook</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Quick Summary */}
        <div className="p-3 sm:p-4 border-t border-[#1A1A1A]/10 bg-[#F9F8F6] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-sans text-[#1A1A1A]/70 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Click any dish to instantly add complete ingredients and timer-guided steps to your cookbook.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1A1A1A] text-white font-sans text-[11px] font-black uppercase tracking-wider hover:bg-[#C2410C] transition-colors"
          >
            Done Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
