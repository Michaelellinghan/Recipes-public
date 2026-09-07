export interface Cookbook {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export type NavigationTab = "recipes" | "planner" | "grocery" | "tools";

export interface Ingredient {
  id: string;
  amount?: number;
  unit?: string;
  name: string;
  notes?: string;
  category?: 'Produce' | 'Meat & Seafood' | 'Dairy & Eggs' | 'Bakery' | 'Pantry & Spices' | 'Oils & Condiments' | 'Other';
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timerMinutes?: number;
  tip?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  category: 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snack' | 'Beverage' | 'Side';
  tags: string[];
  ingredients: Ingredient[];
  steps: RecipeStep[];
  nutrition: NutritionInfo;
  cookbooks: string[];
  isFavorite: boolean;
  rating: number; // 1 to 5
  sourceUrl?: string;
  chefNotes?: string;
  hackTip?: string;
  isTrending?: boolean;
  createdAt: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  category: string;
  checked: boolean;
  recipeTitle?: string;
}

export interface ActiveTimer {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  recipeTitle?: string;
  stepNumber?: number;
}

export interface MealSlotItem {
  recipeId: string;
  recipeTitle: string;
  image: string;
  calories: number;
  protein: number;
  servings: number;
}

export interface MealPlanDay {
  date: string; // YYYY-MM-DD
  dayLabel: string; // "Monday", "Tuesday", etc.
  breakfast: MealSlotItem[];
  lunch: MealSlotItem[];
  dinner: MealSlotItem[];
  snack: MealSlotItem[];
}

export interface SubstitutionResult {
  substituteName: string;
  ratio: string;
  flavorTextureImpact: string;
  bestFor: string;
  proTip: string;
}
