import { Recipe, GroceryItem, MealPlanDay, ActiveTimer } from "../types";
import { INITIAL_RECIPES, INITIAL_COOKBOOKS } from "../data/initialRecipes";

const STORAGE_KEYS = {
  RECIPES: "chefbook_recipes_v1",
  COOKBOOKS: "chefbook_cookbooks_v1",
  GROCERY: "chefbook_grocery_v1",
  MEAL_PLAN: "chefbook_mealplan_v1",
  TIMERS: "chefbook_timers_v1",
};

export function getSavedRecipes(): Recipe[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECIPES);
    if (!raw) {
      saveRecipes(INITIAL_RECIPES);
      return INITIAL_RECIPES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load recipes from localStorage:", e);
    return INITIAL_RECIPES;
  }
}

export function saveRecipes(recipes: Recipe[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipes));
  } catch (e) {
    console.error("Failed to save recipes to localStorage:", e);
  }
}

export function getSavedCookbooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COOKBOOKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COOKBOOKS, JSON.stringify(INITIAL_COOKBOOKS));
      return INITIAL_COOKBOOKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_COOKBOOKS;
  }
}

export function saveCookbooks(cookbooks: any[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.COOKBOOKS, JSON.stringify(cookbooks));
  } catch (e) {
    console.error("Failed to save cookbooks:", e);
  }
}

export function getSavedGrocery(): GroceryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROCERY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveGrocery(items: GroceryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.GROCERY, JSON.stringify(items));
  } catch (e) {
    console.error("Failed to save grocery items:", e);
  }
}

export function getSavedMealPlan(): MealPlanDay[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEAL_PLAN);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  // Generate current 7-day default structure
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const today = new Date();
  const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0=Mon, 6=Sun

  return days.map((dayName, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() - currentDayIndex + index);
    const dateStr = d.toISOString().split("T")[0];
    return {
      date: dateStr,
      dayLabel: dayName,
      breakfast: [],
      lunch: [],
      dinner: index === 0 ? [
        {
          recipeId: "rec-1",
          recipeTitle: "Creamy Tuscan Garlic Butter Chicken",
          image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1000&q=80",
          calories: 460,
          protein: 44,
          servings: 4
        }
      ] : index === 1 ? [
        {
          recipeId: "rec-2",
          recipeTitle: "15-Minute Chili Crisp Peanut Noodles",
          image: "https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=1000&q=80",
          calories: 420,
          protein: 14,
          servings: 2
        }
      ] : [],
      snack: []
    };
  });
}

export function saveMealPlan(plan: MealPlanDay[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEAL_PLAN, JSON.stringify(plan));
  } catch (e) {
    console.error(e);
  }
}

export function getSavedTimers(): ActiveTimer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TIMERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveTimers(timers: ActiveTimer[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TIMERS, JSON.stringify(timers));
  } catch (e) {
    console.error(e);
  }
}

// Convenient aliases
export const loadRecipes = getSavedRecipes;
export const loadCookbooks = getSavedCookbooks;
export const loadGroceryItems = getSavedGrocery;
export const saveGroceryItems = saveGrocery;
export const loadMealPlan = getSavedMealPlan;
export const loadTimers = getSavedTimers;
