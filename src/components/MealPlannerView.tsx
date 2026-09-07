import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  ShoppingCart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  Check,
  RotateCcw
} from "lucide-react";
import { MealPlanDay, Recipe, MealSlotItem, Ingredient } from "../types";

interface MealPlannerViewProps {
  mealPlan: MealPlanDay[];
  recipes: Recipe[];
  onUpdateMealPlan: (plan: MealPlanDay[]) => void;
  onAddPlanToGrocery: (ingredients: Ingredient[]) => void;
  onSelectRecipe: (recipe: Recipe) => void;
}

export const MealPlannerView: React.FC<MealPlannerViewProps> = ({
  mealPlan,
  recipes,
  onUpdateMealPlan,
  onAddPlanToGrocery,
  onSelectRecipe,
}) => {
  const [activeSlotPicker, setActiveSlotPicker] = useState<{
    dayIndex: number;
    slot: "breakfast" | "lunch" | "dinner" | "snack";
  } | null>(null);

  const [groceryAddedSuccess, setGroceryAddedSuccess] = useState(false);

  const handleAddRecipeToSlot = (recipe: Recipe) => {
    if (!activeSlotPicker) return;

    const { dayIndex, slot } = activeSlotPicker;
    const updatedPlan = [...mealPlan];
    const newItem: MealSlotItem = {
      recipeId: recipe.id,
      recipeTitle: recipe.title,
      image: recipe.image,
      calories: recipe.nutrition?.calories || 0,
      protein: recipe.nutrition?.protein || 0,
      servings: recipe.servings || 2,
    };

    updatedPlan[dayIndex][slot] = [...updatedPlan[dayIndex][slot], newItem];
    onUpdateMealPlan(updatedPlan);
    setActiveSlotPicker(null);
  };

  const handleRemoveItem = (
    dayIndex: number,
    slot: "breakfast" | "lunch" | "dinner" | "snack",
    itemIndex: number
  ) => {
    const updatedPlan = [...mealPlan];
    updatedPlan[dayIndex][slot] = updatedPlan[dayIndex][slot].filter(
      (_, i) => i !== itemIndex
    );
    onUpdateMealPlan(updatedPlan);
  };

  const handleGenerateGroceryList = () => {
    // Collect all recipe IDs in the meal plan
    const collectedIngredients: Ingredient[] = [];

    mealPlan.forEach((day) => {
      (["breakfast", "lunch", "dinner", "snack"] as const).forEach((slot) => {
        day[slot].forEach((item) => {
          const originalRecipe = recipes.find((r) => r.id === item.recipeId);
          if (originalRecipe) {
            originalRecipe.ingredients.forEach((ing) => {
              collectedIngredients.push({
                ...ing,
                notes: `For ${originalRecipe.title} (${day.dayLabel})`,
              });
            });
          }
        });
      });
    });

    if (collectedIngredients.length > 0) {
      onAddPlanToGrocery(collectedIngredients);
      setGroceryAddedSuccess(true);
      setTimeout(() => setGroceryAddedSuccess(false), 2500);
    }
  };

  const handleAutoFillWeek = () => {
    if (recipes.length === 0) return;
    const updatedPlan = mealPlan.map((day, idx) => {
      const dinnerRecipe = recipes[idx % recipes.length];
      const lunchRecipe = recipes[(idx + 1) % recipes.length];

      return {
        ...day,
        lunch: [
          {
            recipeId: lunchRecipe.id,
            recipeTitle: lunchRecipe.title,
            image: lunchRecipe.image,
            calories: lunchRecipe.nutrition?.calories || 0,
            protein: lunchRecipe.nutrition?.protein || 0,
            servings: lunchRecipe.servings || 2,
          },
        ],
        dinner: [
          {
            recipeId: dinnerRecipe.id,
            recipeTitle: dinnerRecipe.title,
            image: dinnerRecipe.image,
            calories: dinnerRecipe.nutrition?.calories || 0,
            protein: dinnerRecipe.nutrition?.protein || 0,
            servings: dinnerRecipe.servings || 4,
          },
        ],
      };
    });
    onUpdateMealPlan(updatedPlan);
  };

  const handleClearWeek = () => {
    const cleared = mealPlan.map((d) => ({
      ...d,
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    }));
    onUpdateMealPlan(cleared);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-[#FDFCFB] p-6 sm:p-8 border border-[#1A1A1A]/10">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#C2410C] font-bold block mb-1">
            Weekly Schedule & Menus
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black italic text-[#1A1A1A]">
            The Culinary Planner
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-[#1A1A1A]/70 mt-1 max-w-xl">
            Coordinate weekly gastronomy, track daily nutritional targets, and generate grocery lists with precision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAutoFillWeek}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#F9F8F6] border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] font-sans text-[11px] uppercase tracking-widest font-bold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
            <span>Smart Auto-Fill</span>
          </button>

          <button
            onClick={handleClearWeek}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-[#1A1A1A]/50 hover:text-[#C2410C] font-sans text-[11px] uppercase tracking-widest font-bold hover:bg-[#F9F8F6] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={handleGenerateGroceryList}
            className={`flex items-center gap-2 px-5 py-2.5 font-sans text-[11px] uppercase tracking-widest font-black transition-colors ${
              groceryAddedSuccess
                ? "bg-[#1A1A1A] text-white"
                : "bg-[#1A1A1A] hover:bg-[#C2410C] text-white"
            }`}
          >
            {groceryAddedSuccess ? (
              <>
                <Check className="w-4 h-4 text-[#C2410C]" />
                <span>Ingredients Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Sync to Grocery</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 7-Day Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        {mealPlan.map((day, dayIdx) => {
          // Calculate daily total calories & protein
          const allDayItems = [
            ...day.breakfast,
            ...day.lunch,
            ...day.dinner,
            ...day.snack,
          ];
          const totalCalories = allDayItems.reduce(
            (acc, curr) => acc + (curr.calories || 0),
            0
          );
          const totalProtein = allDayItems.reduce(
            (acc, curr) => acc + (curr.protein || 0),
            0
          );

          return (
            <div
              key={day.dayLabel}
              className="bg-[#FDFCFB] border border-[#1A1A1A]/10 flex flex-col justify-between"
            >
              {/* Day Header */}
              <div className="p-3.5 bg-[#F9F8F6] border-b border-[#1A1A1A]/10 flex items-center justify-between">
                <div>
                  <div className="font-serif italic font-bold text-base text-[#1A1A1A]">
                    {day.dayLabel}
                  </div>
                  <div className="font-sans text-[9px] uppercase tracking-widest text-[#1A1A1A]/40">
                    {day.date}
                  </div>
                </div>

                {totalCalories > 0 && (
                  <div className="text-right">
                    <div className="text-[11px] font-mono font-bold text-[#C2410C] flex items-center gap-0.5 justify-end">
                      <Flame className="w-3 h-3" />
                      <span>{totalCalories}</span>
                    </div>
                    <div className="text-[9px] font-sans text-[#1A1A1A]/40 uppercase tracking-wider">
                      {totalProtein}g protein
                    </div>
                  </div>
                )}
              </div>

              {/* Meal Slots (Breakfast, Lunch, Dinner, Snack) */}
              <div className="p-3 space-y-3 flex-1">
                {(["breakfast", "lunch", "dinner", "snack"] as const).map(
                  (slotName) => {
                    const items = day[slotName];

                    return (
                      <div key={slotName} className="space-y-1.5">
                        <div className="flex items-center justify-between font-sans text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-[0.2em]">
                          <span>{slotName}</span>
                          <button
                            onClick={() =>
                              setActiveSlotPicker({ dayIndex: dayIdx, slot: slotName })
                            }
                            className="p-0.5 text-[#1A1A1A]/40 hover:text-[#C2410C] transition-colors"
                            title={`Add ${slotName}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {items.length === 0 ? (
                          <button
                            onClick={() =>
                              setActiveSlotPicker({ dayIndex: dayIdx, slot: slotName })
                            }
                            className="w-full py-1.5 px-2 border border-dashed border-[#1A1A1A]/15 hover:border-[#1A1A1A] font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/40 hover:text-[#1A1A1A] flex items-center justify-center gap-1 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>Assign</span>
                          </button>
                        ) : (
                          <div className="space-y-1">
                            {items.map((item, itemIdx) => (
                              <div
                                key={itemIdx}
                                className="group relative border border-[#1A1A1A]/10 bg-[#F9F8F6] hover:border-[#1A1A1A] p-1.5 flex items-center gap-2 transition-colors cursor-pointer"
                                onClick={() => {
                                  const r = recipes.find(
                                    (rec) => rec.id === item.recipeId
                                  );
                                  if (r) onSelectRecipe(r);
                                }}
                              >
                                <img
                                  src={item.image}
                                  alt={item.recipeTitle}
                                  className="w-8 h-8 object-cover shrink-0 border border-[#1A1A1A]/10"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="flex-1 min-w-0 pr-4">
                                  <div className="font-serif italic text-xs font-bold text-[#1A1A1A] truncate">
                                    {item.recipeTitle}
                                  </div>
                                  <div className="font-sans text-[9px] uppercase tracking-wider text-[#C2410C] font-semibold">
                                    {item.calories} kcal
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveItem(dayIdx, slotName, itemIdx);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 absolute right-1 p-1 text-[#1A1A1A]/40 hover:text-[#C2410C] bg-white border border-[#1A1A1A]/10 transition-opacity"
                                  title="Remove from slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Slot Selection Modal */}
      {activeSlotPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFCFB] border border-[#1A1A1A] max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/10">
              <div>
                <span className="font-sans text-[9px] uppercase tracking-[0.25em] text-[#C2410C] font-bold block mb-1">
                  Assign to {mealPlan[activeSlotPicker.dayIndex].dayLabel} • {activeSlotPicker.slot}
                </span>
                <h3 className="font-serif font-black italic text-[#1A1A1A] text-2xl">
                  Select Recipe
                </h3>
              </div>
              <button
                onClick={() => setActiveSlotPicker(null)}
                className="p-1 text-[#1A1A1A]/50 hover:text-[#1A1A1A] font-sans text-xs uppercase tracking-widest"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2.5">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => handleAddRecipeToSlot(recipe)}
                  className="p-3 border border-[#1A1A1A]/10 hover:border-[#1A1A1A] bg-[#F9F8F6] hover:bg-[#FDFCFB] flex items-center gap-3 cursor-pointer transition-all"
                >
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-12 h-12 object-cover shrink-0 border border-[#1A1A1A]/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-bold italic text-sm text-[#1A1A1A] truncate">
                      {recipe.title}
                    </h4>
                    <div className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 flex items-center gap-2 mt-0.5">
                      <span>{recipe.cuisine}</span>
                      <span>•</span>
                      <span>
                        {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                      </span>
                      <span>•</span>
                      <span className="text-[#C2410C] font-semibold">{recipe.nutrition?.calories || 0} kcal</span>
                    </div>
                  </div>
                  <button className="px-3.5 py-1.5 bg-[#1A1A1A] text-white hover:bg-[#C2410C] font-sans text-[10px] uppercase tracking-widest font-black transition-colors">
                    Assign
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
