import React, { useState, useEffect, useMemo } from "react";
import { Header } from "./components/Header";
import { RecipeCard } from "./components/RecipeCard";
import { RecipeDetailModal } from "./components/RecipeDetailModal";
import { CookModeModal } from "./components/CookModeModal";
import { RecipeImportModal } from "./components/RecipeImportModal";
import { FridgeWizardModal } from "./components/FridgeWizardModal";
import { SubstitutionModal } from "./components/SubstitutionModal";
import { RecipeEditorModal } from "./components/RecipeEditorModal";
import { MealPlannerView } from "./components/MealPlannerView";
import { GroceryListView } from "./components/GroceryListView";
import { KitchenToolsView } from "./components/KitchenToolsView";

import { RecipeArchiveModal } from "./components/RecipeArchiveModal";
import { RecipeDenseRow } from "./components/RecipeDenseRow";
import { ExportDownloadModal } from "./components/ExportDownloadModal";

import {
  Recipe,
  Cookbook,
  GroceryItem,
  MealPlanDay,
  ActiveTimer,
  Ingredient,
  NavigationTab,
} from "./types";
import {
  loadRecipes,
  saveRecipes,
  loadCookbooks,
  saveCookbooks,
  loadGroceryItems,
  saveGroceryItems,
  loadMealPlan,
  saveMealPlan,
} from "./utils/storage";
import { playKitchenChime, scaleAmount } from "./utils/scaler";
import {
  Plus,
  Sparkles,
  Wand2,
  Filter,
  SlidersHorizontal,
  FolderPlus,
  Heart,
  ChefHat,
  Search,
  CheckCircle2,
  Play,
  Globe,
  LayoutGrid,
  List,
  Eye,
  Clock,
  CalendarPlus,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";

export default function App() {
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState<NavigationTab>("recipes");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCookbook, setSelectedCookbook] = useState("All Recipes");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "dense">("grid");
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "quickest" | "rating" | "calories">("newest");

  // Core Data
  const [recipes, setRecipes] = useState<Recipe[]>(() => loadRecipes());
  const [cookbooks, setCookbooks] = useState<Cookbook[]>(() => loadCookbooks());
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>(() => loadGroceryItems());
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>(() => loadMealPlan());

  // Timers Engine
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([
    {
      id: "demo-timer-1",
      label: "Simmer Sauce",
      totalSeconds: 300,
      remainingSeconds: 240,
      isRunning: false,
    },
  ]);

  // Modals
  const [selectedRecipeDetail, setSelectedRecipeDetail] = useState<Recipe | null>(null);
  const [cookModeState, setCookModeState] = useState<{
    recipe: Recipe;
    servings: number;
  } | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isFridgeWizardOpen, setIsFridgeWizardOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [substitutionContext, setSubstitutionContext] = useState<{
    recipeTitle: string;
    ingredient: string;
  } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-persist changes
  useEffect(() => {
    saveRecipes(recipes);
  }, [recipes]);

  useEffect(() => {
    saveCookbooks(cookbooks);
  }, [cookbooks]);

  useEffect(() => {
    saveGroceryItems(groceryItems);
  }, [groceryItems]);

  useEffect(() => {
    saveMealPlan(mealPlan);
  }, [mealPlan]);

  // Timers countdown interval
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTimers((prevTimers) => {
        let hasChanges = false;
        const updated = prevTimers.map((timer) => {
          if (timer.isRunning && timer.remainingSeconds > 0) {
            hasChanges = true;
            const nextSecs = timer.remainingSeconds - 1;
            if (nextSecs === 0) {
              playKitchenChime();
              showToast(`⏰ Timer Complete: ${timer.label}`);
            }
            return { ...timer, remainingSeconds: nextSecs };
          }
          return timer;
        });
        return hasChanges ? updated : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Recipe Handlers
  const handleToggleFavorite = (recipeId: string) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipeId ? { ...r, isFavorite: !r.isFavorite } : r))
    );
    if (selectedRecipeDetail && selectedRecipeDetail.id === recipeId) {
      setSelectedRecipeDetail((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    if (selectedRecipeDetail?.id === recipeId) {
      setSelectedRecipeDetail(null);
    }
    showToast("Recipe deleted");
  };

  const handleSaveRecipe = (recipe: Recipe) => {
    setRecipes((prev) => {
      const exists = prev.some((r) => r.id === recipe.id);
      if (exists) {
        return prev.map((r) => (r.id === recipe.id ? recipe : r));
      }
      return [recipe, ...prev];
    });

    setIsEditorOpen(false);
    setEditingRecipe(null);
    setIsImportModalOpen(false);
    showToast(`"${recipe.title}" saved to library`);
  };

  const handleImportBackup = (data: { recipes: Recipe[]; mealPlan?: MealPlanDay[]; groceryItems?: GroceryItem[] }) => {
    if (data.recipes && data.recipes.length > 0) {
      setRecipes(data.recipes);
    }
    if (data.mealPlan) {
      setMealPlan(data.mealPlan);
    }
    if (data.groceryItems) {
      setGroceryItems(data.groceryItems);
    }
    showToast(`Restored ${data.recipes?.length || 0} recipes successfully!`);
  };

  // Grocery Handlers
  const handleAddIngredientsToGrocery = (
    recipe: Recipe,
    ingredientsToAdd: Ingredient[]
  ) => {
    const newItems: GroceryItem[] = ingredientsToAdd.map((ing) => ({
      id: "groc-" + Date.now() + Math.random().toString(36).slice(2, 6),
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      category: ing.category || "Produce",
      recipeTitle: recipe.title,
      checked: false,
    }));

    setGroceryItems((prev) => [...newItems, ...prev]);
    showToast(`Added ${newItems.length} ingredients to Grocery List!`);
  };

  const handleAddPlanToGrocery = (ingredients: Ingredient[]) => {
    const newItems: GroceryItem[] = ingredients.map((ing) => ({
      id: "groc-" + Date.now() + Math.random().toString(36).slice(2, 6),
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      category: ing.category || "Produce",
      recipeTitle: ing.notes || "Meal Plan",
      checked: false,
    }));

    setGroceryItems((prev) => [...newItems, ...prev]);
    showToast(`Added weekly plan items to Grocery List!`);
  };

  // Timer Start Trigger from recipe step
  const handleStartTimer = (
    label: string,
    minutes: number,
    recipeTitle: string,
    stepNumber?: number
  ) => {
    const newTimer: ActiveTimer = {
      id: "timer-" + Date.now(),
      label: stepNumber ? `${recipeTitle} (Step ${stepNumber})` : label,
      totalSeconds: Math.round(minutes * 60),
      remainingSeconds: Math.round(minutes * 60),
      isRunning: true,
      recipeTitle,
      stepNumber,
    };

    setActiveTimers((prev) => [newTimer, ...prev]);
    showToast(`Started ${minutes}m timer for ${recipeTitle}`);
  };

  // Unique lists for filtering
  const allCuisines = useMemo(() => {
    const set = new Set<string>();
    recipes.forEach((r) => {
      if (r.cuisine) set.add(r.cuisine);
    });
    return ["All", ...Array.from(set)];
  }, [recipes]);

  // Filtered & Sorted Recipes
  const filteredRecipes = useMemo(() => {
    return recipes
      .filter((recipe) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = recipe.title.toLowerCase().includes(q);
          const matchesDesc = recipe.description.toLowerCase().includes(q);
          const matchesCuisine = recipe.cuisine?.toLowerCase().includes(q);
          const matchesIng = recipe.ingredients.some((i) =>
            i.name.toLowerCase().includes(q)
          );
          if (!matchesTitle && !matchesDesc && !matchesCuisine && !matchesIng) {
            return false;
          }
        }

        // Cookbook filter
        if (selectedCookbook === "Favorites") {
          if (!recipe.isFavorite) return false;
        } else if (selectedCookbook !== "All Recipes") {
          if (!recipe.cookbooks?.includes(selectedCookbook)) return false;
        }

        // Cuisine filter
        if (selectedCuisine !== "All" && recipe.cuisine !== selectedCuisine) {
          return false;
        }

        // Category filter
        if (selectedCategory !== "All" && recipe.category !== selectedCategory) {
          return false;
        }

        // Quick Tag filter
        if (selectedTag !== "All") {
          if (selectedTag === "🔥 TikTok Trends") {
            const isTT = recipe.tags?.some((t) => t.toLowerCase().includes("tiktok") || t.toLowerCase().includes("trend")) || recipe.isTrending;
            if (!isTT) return false;
          } else if (selectedTag === "💡 Food Hacks") {
            const isHack = recipe.tags?.some((t) => t.toLowerCase().includes("hack")) || !!recipe.hackTip;
            if (!isHack) return false;
          } else if (selectedTag === "Air Fryer") {
            const isAir = recipe.tags?.some((t) => t.toLowerCase().includes("air fryer")) || recipe.title.toLowerCase().includes("air fryer");
            if (!isAir) return false;
          } else if (selectedTag === "Quick <30m") {
            if ((recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0) > 30) return false;
          } else if (selectedTag === "High Protein") {
            if (!recipe.tags?.includes("High Protein") && (recipe.nutrition?.protein || 0) < 30) return false;
          } else if (selectedTag === "Vegetarian") {
            if (!recipe.tags?.includes("Vegetarian")) return false;
          } else if (selectedTag === "Gluten-Free") {
            if (!recipe.tags?.includes("Gluten-Free")) return false;
          } else if (!recipe.tags?.includes(selectedTag)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "quickest") {
          return (
            a.prepTimeMinutes + a.cookTimeMinutes - (b.prepTimeMinutes + b.cookTimeMinutes)
          );
        }
        if (sortBy === "rating") {
          return (b.rating || 0) - (a.rating || 0);
        }
        if (sortBy === "calories") {
          return (a.nutrition?.calories || 0) - (b.nutrition?.calories || 0);
        }
        // Default newest
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [recipes, searchQuery, selectedCookbook, selectedCuisine, selectedCategory, selectedTag, sortBy]);

  const uncheckedGroceryCount = groceryItems.filter((i) => !i.checked).length;
  const runningTimersCount = activeTimers.filter((t) => t.isRunning).length;

  const featuredRecipe = filteredRecipes.length > 0 ? filteredRecipes[0] : null;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#C2410C]/20 selection:text-[#C2410C]">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 px-5 py-3 bg-[#1A1A1A] text-white text-xs font-sans uppercase tracking-widest font-bold shadow-2xl border border-[#1A1A1A]">
            <CheckCircle2 className="w-4 h-4 text-[#C2410C] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Global Application Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        groceryCount={uncheckedGroceryCount}
        activeTimers={activeTimers}
        onOpenTimers={() => setCurrentTab("tools")}
        onOpenImport={() => setIsImportModalOpen(true)}
        onOpenFridgeWizard={() => setIsFridgeWizardOpen(true)}
        onOpenCreateRecipe={() => {
          setEditingRecipe(null);
          setIsEditorOpen(true);
        }}
        onOpenArchive={() => setIsArchiveModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentTab === "recipes" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* World Archive Spotlight Banner */}
            <div className="border border-[#1A1A1A]/15 bg-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 border border-[#1A1A1A]">
                  <Globe className="w-5 h-5 text-[#C2410C]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans text-[10px] font-black uppercase tracking-[0.25em] text-[#C2410C]">
                      World Culinary Archive & Viral Trends Lab
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-900 font-mono text-[10px] font-bold">
                      3,000+ Master Recipes & Hacks
                    </span>
                  </div>
                  <p className="font-serif italic text-xs sm:text-sm text-[#1A1A1A]/80 mt-0.5">
                    Browse thousands of world classics, viral TikTok recipes, and clever kitchen hacks with instant 1-click import into your cookbook.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Browse 3,000+ Recipes & Hacks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-3.5 py-2 border border-[#1A1A1A]/20 bg-[#F9F8F6] hover:bg-white text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                  title="Download Files, Backups & Source Code"
                >
                  <Download className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Download Files</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="px-3.5 py-2 border border-[#1A1A1A]/20 bg-[#F9F8F6] hover:bg-white text-[#1A1A1A] font-sans text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Web / Photo Scan</span>
                </button>
              </div>
            </div>

            {/* Editorial Recipe of the Day Hero Feature (when browsing main library) */}
            {!searchQuery &&
              selectedCookbook === "All Recipes" &&
              selectedCuisine === "All" &&
              selectedCategory === "All" &&
              selectedTag === "All" &&
              featuredRecipe && (
                <section className="border border-[#1A1A1A]/15 bg-[#FDFCFB] grid grid-cols-1 lg:grid-cols-12 overflow-hidden shadow-xs">
                  {/* Left Column: Publication Title, Details & Meta */}
                  <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#1A1A1A]/10">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#C2410C] font-bold">
                          Featured Chef Selection
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsHeroCollapsed(!isHeroCollapsed)}
                          className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 hover:text-[#1A1A1A] flex items-center gap-1"
                        >
                          {isHeroCollapsed ? (
                            <>
                              <span>Expand</span>
                              <ChevronDown className="w-3 h-3" />
                            </>
                          ) : (
                            <>
                              <span>Minimize</span>
                              <ChevronUp className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>

                      <h2 className="text-2xl sm:text-4xl font-serif font-black italic tracking-tight mb-4 text-[#1A1A1A]">
                        {featuredRecipe.title}
                      </h2>

                      {!isHeroCollapsed && (
                        <>
                          {/* Micro Specs Strip */}
                          <div className="flex flex-wrap gap-4 sm:gap-8 font-sans text-xs uppercase tracking-wider border-y border-[#1A1A1A]/10 py-3 mb-4 text-[#1A1A1A]">
                            <div>
                              <span className="opacity-50 block text-[10px] mb-0.5">Prep</span>
                              {featuredRecipe.prepTimeMinutes || 15} Mins
                            </div>
                            <div>
                              <span className="opacity-50 block text-[10px] mb-0.5">Difficulty</span>
                              {featuredRecipe.difficulty || "Intermediate"}
                            </div>
                            <div>
                              <span className="opacity-50 block text-[10px] mb-0.5">Yield</span>
                              {featuredRecipe.servings || 4} Servings
                            </div>
                            {featuredRecipe.nutrition?.calories ? (
                              <div>
                                <span className="opacity-50 block text-[10px] mb-0.5">Calories</span>
                                {featuredRecipe.nutrition.calories} kcal
                              </div>
                            ) : null}
                          </div>

                          <p className="text-sm sm:text-base leading-relaxed text-[#1A1A1A]/80 max-w-xl font-serif italic line-clamp-2">
                            {featuredRecipe.description}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Launch Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#1A1A1A]/10 mt-4">
                      <button
                        onClick={() =>
                          setCookModeState({
                            recipe: featuredRecipe,
                            servings: featuredRecipe.servings,
                          })
                        }
                        className="bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-black uppercase tracking-widest px-5 py-2.5 transition-colors flex items-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Cook Mode</span>
                      </button>
                      <button
                        onClick={() => setSelectedRecipeDetail(featuredRecipe)}
                        className="border border-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:bg-[#F9F8F6] text-[#1A1A1A] font-sans text-[11px] font-black uppercase tracking-widest px-5 py-2.5 transition-colors"
                      >
                        Inspect Recipe
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Visual */}
                  <div className="lg:col-span-5 bg-[#E5E7EB] relative overflow-hidden flex flex-col justify-end min-h-[220px] lg:min-h-[300px]">
                    <img
                      src={
                        featuredRecipe.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"
                      }
                      alt={featuredRecipe.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="relative p-4 flex items-end justify-between text-white">
                      <div className="bg-[#C2410C] text-white font-sans text-[9px] uppercase tracking-[0.2em] px-3 py-1 font-bold">
                        Step-by-step Guide
                      </div>
                      <span className="font-sans text-[10px] uppercase tracking-wider text-white/90 font-bold">
                        {featuredRecipe.cuisine} • {featuredRecipe.category}
                      </span>
                    </div>
                  </div>
                </section>
              )}

            {/* Neat Filter & Organization Toolbar */}
            <div className="space-y-3 bg-white border border-[#1A1A1A]/10 p-4">
              {/* Row 1: Cookbooks & View Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/10 pb-3">
                {/* Cookbook Filter Tabs */}
                <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none font-sans text-xs uppercase tracking-wider font-bold">
                  {cookbooks.map((cb) => {
                    const isSelected = selectedCookbook === cb.name;
                    const count =
                      cb.name === "All Recipes"
                        ? recipes.length
                        : cb.name === "Favorites"
                        ? recipes.filter((r) => r.isFavorite).length
                        : recipes.filter((r) => r.cookbooks?.includes(cb.name)).length;

                    return (
                      <button
                        key={cb.id}
                        onClick={() => setSelectedCookbook(cb.name)}
                        className={`transition-colors whitespace-nowrap flex items-center gap-1.5 pb-1 border-b-2 ${
                          isSelected
                            ? "border-[#1A1A1A] text-[#1A1A1A]"
                            : "border-transparent text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
                        }`}
                      >
                        {cb.name === "Favorites" && <Heart className="w-3.5 h-3.5 fill-current text-[#C2410C]" />}
                        <span>{cb.name}</span>
                        <span className="text-[10px] opacity-60">({count})</span>
                      </button>
                    );
                  })}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto border border-[#1A1A1A]/20 bg-[#F9F8F6] p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors ${
                      viewMode === "grid"
                        ? "bg-[#1A1A1A] text-white"
                        : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                    }`}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("dense")}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-sans font-bold uppercase tracking-wider transition-colors ${
                      viewMode === "dense"
                        ? "bg-[#1A1A1A] text-white"
                        : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                    }`}
                    title="Compact Index Table View"
                  >
                    <List className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Index</span>
                  </button>
                </div>
              </div>

              {/* Row 2: Tag Chips & Dropdown Selectors */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
                {/* Dietary & Speed Tag Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-sans">
                  {[
                    "All",
                    "🔥 TikTok Trends",
                    "💡 Food Hacks",
                    "Quick <30m",
                    "High Protein",
                    "Air Fryer",
                    "Vegetarian",
                    "Gluten-Free"
                  ].map((tag) => {
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
                </div>

                {/* Dropdowns */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Cuisine Filter */}
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-2.5 py-1 font-sans text-xs uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="All">All Cuisines</option>
                    {allCuisines.filter((c) => c !== "All").map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-2.5 py-1 font-sans text-xs uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="All">All Courses</option>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Snack">Snack</option>
                  </select>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-2.5 py-1 font-sans text-xs uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                  >
                    <option value="newest">Latest Additions</option>
                    <option value="quickest">Shortest Cook Time</option>
                    <option value="rating">Critic's Rating</option>
                    <option value="calories">Calorie Index</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Catalog Section Header */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-black text-[#1A1A1A]">
                  {selectedCookbook}
                </h3>
                {selectedTag !== "All" && (
                  <span className="px-2 py-0.5 bg-[#C2410C]/10 text-[#C2410C] font-sans text-[10px] font-bold uppercase tracking-wider">
                    {selectedTag}
                  </span>
                )}
              </div>
              <span className="font-sans text-[10px] text-[#C2410C] font-bold uppercase tracking-widest">
                {filteredRecipes.length} Dishes Shown
              </span>
            </div>

            {/* Recipes Grid or Dense Table View */}
            {filteredRecipes.length === 0 ? (
              <div className="bg-[#F9F8F6] border border-[#1A1A1A]/10 p-12 text-center space-y-4">
                <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center mx-auto">
                  <ChefHat className="w-6 h-6" />
                </div>
                <h3 className="font-serif italic font-bold text-stone-900 text-xl">
                  No recipes found in this view
                </h3>
                <p className="text-xs sm:text-sm font-sans text-stone-600 max-w-sm mx-auto">
                  Adjust your search query or filter tags, or explore the 1,000+ World Archive to discover master recipes.
                </p>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCookbook("All Recipes");
                      setSelectedCuisine("All");
                      setSelectedCategory("All");
                      setSelectedTag("All");
                    }}
                    className="px-4 py-2 bg-[#F9F8F6] border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] text-xs font-sans uppercase tracking-widest font-bold"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setIsArchiveModalOpen(true)}
                    className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white text-xs font-sans uppercase tracking-widest font-bold transition-colors"
                  >
                    Open 1,000+ Archive
                  </button>
                </div>
              </div>
            ) : viewMode === "grid" ? (
              /* Cards Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onSelect={(r) => setSelectedRecipeDetail(r)}
                    onCookMode={(r) => setCookModeState({ recipe: r, servings: r.servings })}
                    onToggleFavorite={handleToggleFavorite}
                    onAddToPlanner={(r, e) => {
                      e.stopPropagation();
                      const updated = [...mealPlan];
                      updated[0].dinner.push({
                        recipeId: r.id,
                        recipeTitle: r.title,
                        image: r.image,
                        calories: r.nutrition?.calories || 0,
                        protein: r.nutrition?.protein || 0,
                        servings: r.servings,
                      });
                      setMealPlan(updated);
                      showToast(`Added "${r.title}" to Monday dinner!`);
                    }}
                    onAddToGrocery={(r, e) => {
                      e.stopPropagation();
                      handleAddIngredientsToGrocery(r, r.ingredients);
                    }}
                  />
                ))}
              </div>
            ) : (
              /* Dense Index Table */
              <div className="border border-[#1A1A1A]/15 bg-white divide-y divide-[#1A1A1A]/10">
                <div className="p-3 bg-[#F9F8F6] font-sans text-[10px] font-black uppercase tracking-wider text-[#1A1A1A]/60 grid grid-cols-12 gap-3 items-center">
                  <span className="col-span-5 sm:col-span-4">Dish Title & Style</span>
                  <span className="col-span-3 sm:col-span-2 text-center">Timing & Level</span>
                  <span className="hidden sm:block sm:col-span-2 text-center">Nutrition</span>
                  <span className="hidden md:block md:col-span-2">Ingredients</span>
                  <span className="col-span-4 sm:col-span-2 text-right">Actions</span>
                </div>

                {filteredRecipes.map((recipe) => {
                  const totalTime = (recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0);
                  return (
                    <div
                      key={recipe.id}
                      onClick={() => setSelectedRecipeDetail(recipe)}
                      className="p-3 sm:p-4 grid grid-cols-12 gap-3 items-center hover:bg-[#F9F8F6]/60 transition-colors cursor-pointer group"
                    >
                      {/* Title and Thumbnail */}
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-12 h-12 object-cover border border-[#1A1A1A]/10 shrink-0 hidden sm:block group-hover:scale-105 transition-transform"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="font-sans text-[9px] font-black uppercase tracking-wider text-[#C2410C] block truncate">
                            {recipe.cuisine || "Classic"} · {recipe.category || "Dinner"}
                          </span>
                          <h4 className="font-serif font-bold text-sm text-[#1A1A1A] group-hover:text-[#C2410C] transition-colors truncate">
                            {recipe.title}
                          </h4>
                        </div>
                      </div>

                      {/* Time */}
                      <div className="col-span-3 sm:col-span-2 text-center">
                        <div className="font-mono text-xs text-[#1A1A1A]">{totalTime} min</div>
                        <span className="font-sans text-[9px] uppercase tracking-wider text-[#1A1A1A]/60">
                          {recipe.difficulty || "Medium"}
                        </span>
                      </div>

                      {/* Nutrition */}
                      <div className="hidden sm:block sm:col-span-2 text-center font-mono text-xs text-[#1A1A1A]/70">
                        <div>{recipe.nutrition?.calories || "—"} kcal</div>
                        {recipe.nutrition?.protein && (
                          <div className="text-[10px] text-emerald-700">{recipe.nutrition.protein}g protein</div>
                        )}
                      </div>

                      {/* Ingredients */}
                      <div className="hidden md:block md:col-span-2 font-serif italic text-xs text-[#1A1A1A]/70 truncate">
                        {recipe.ingredients?.map((i) => i.name).slice(0, 3).join(", ") || "—"}
                      </div>

                      {/* Actions */}
                      <div className="col-span-4 sm:col-span-2 flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setCookModeState({ recipe, servings: recipe.servings })}
                          className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#C2410C] text-white text-[10px] font-sans font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                          title="Cook Mode"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span className="hidden sm:inline">Cook</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(recipe.id)}
                          className={`p-1.5 border transition-colors ${
                            recipe.isFavorite
                              ? "bg-[#C2410C] text-white border-[#C2410C]"
                              : "bg-white text-[#1A1A1A]/70 border-[#1A1A1A]/15 hover:border-[#1A1A1A]"
                          }`}
                          title="Favorite"
                        >
                          <Heart className={`w-3.5 h-3.5 ${recipe.isFavorite ? "fill-white" : ""}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {currentTab === "planner" && (
          <MealPlannerView
            mealPlan={mealPlan}
            recipes={recipes}
            onUpdateMealPlan={setMealPlan}
            onAddPlanToGrocery={handleAddPlanToGrocery}
            onSelectRecipe={(r) => setSelectedRecipeDetail(r)}
          />
        )}

        {currentTab === "grocery" && (
          <GroceryListView
            groceryItems={groceryItems}
            onUpdateItems={setGroceryItems}
          />
        )}

        {currentTab === "tools" && (
          <KitchenToolsView
            activeTimers={activeTimers}
            onUpdateTimers={setActiveTimers}
          />
        )}
      </main>

      {/* Editorial Publication Footer */}
      <footer className="border-t border-[#1A1A1A]/10 py-6 px-6 sm:px-10 mt-auto flex flex-col sm:flex-row items-center justify-between font-sans text-[9px] uppercase tracking-[0.2em] text-[#1A1A1A]/50 bg-[#FDFCFB] gap-3">
        <span>© Chefbook Publishing • The Essential Collection</span>
        <span>New York / Paris / Tokyo</span>
        <span>Ref: 902-EDITORIAL</span>
      </footer>

      {/* Recipe Detail Modal */}
      {selectedRecipeDetail && (
        <RecipeDetailModal
          recipe={selectedRecipeDetail}
          onClose={() => setSelectedRecipeDetail(null)}
          onCookMode={(r, s) => {
            setSelectedRecipeDetail(null);
            setCookModeState({ recipe: r, servings: s });
          }}
          onToggleFavorite={handleToggleFavorite}
          onAddToPlanner={(r) => {
            // Add to today's dinner
            const updated = [...mealPlan];
            updated[0].dinner.push({
              recipeId: r.id,
              recipeTitle: r.title,
              image: r.image,
              calories: r.nutrition?.calories || 0,
              protein: r.nutrition?.protein || 0,
              servings: r.servings,
            });
            setMealPlan(updated);
            showToast(`Added "${r.title}" to Monday dinner!`);
          }}
          onAddToGrocery={handleAddIngredientsToGrocery}
          onEditRecipe={(r) => {
            setSelectedRecipeDetail(null);
            setEditingRecipe(r);
            setIsEditorOpen(true);
          }}
          onDeleteRecipe={handleDeleteRecipe}
          onOpenSubstitute={(r, ingName) => {
            setSubstitutionContext({ recipeTitle: r.title, ingredient: ingName });
          }}
          onStartTimer={handleStartTimer}
        />
      )}

      {/* Full-Screen Hands-Free Cook Mode Modal */}
      {cookModeState && (
        <CookModeModal
          recipe={cookModeState.recipe}
          targetServings={cookModeState.servings}
          onClose={() => setCookModeState(null)}
          onStartTimer={handleStartTimer}
        />
      )}

      {/* AI Smart Recipe Import Modal */}
      {isImportModalOpen && (
        <RecipeImportModal
          onClose={() => setIsImportModalOpen(false)}
          onRecipeImported={handleSaveRecipe}
        />
      )}

      {/* "What Can I Cook?" Fridge Wizard Modal */}
      {isFridgeWizardOpen && (
        <FridgeWizardModal
          onClose={() => setIsFridgeWizardOpen(false)}
          onRecipeSaved={(r) => {
            handleSaveRecipe(r);
          }}
        />
      )}

      {/* AI Ingredient Substitution Modal */}
      {substitutionContext && (
        <SubstitutionModal
          recipeTitle={substitutionContext.recipeTitle}
          initialIngredient={substitutionContext.ingredient}
          onClose={() => setSubstitutionContext(null)}
        />
      )}

      {/* Manual / Edit Recipe Modal */}
      {isEditorOpen && (
        <RecipeEditorModal
          initialRecipe={editingRecipe}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingRecipe(null);
          }}
          onSave={handleSaveRecipe}
        />
      )}

      {/* Grand 1,000+ World Recipe Archive Modal */}
      {isArchiveModalOpen && (
        <RecipeArchiveModal
          isOpen={isArchiveModalOpen}
          onClose={() => setIsArchiveModalOpen(false)}
          onAddRecipe={(r) => {
            handleSaveRecipe(r);
            showToast(`Added "${r.title}" to Cookbook!`);
          }}
          onStartCookMode={(r) => {
            handleSaveRecipe(r);
            setCookModeState({ recipe: r, servings: r.servings });
          }}
          existingRecipeTitles={recipes.map((r) => r.title)}
        />
      )}

      {/* Export & Download Center Modal */}
      <ExportDownloadModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        recipes={recipes}
        mealPlan={mealPlan}
        groceryItems={groceryItems}
        onImportBackup={handleImportBackup}
        showToast={showToast}
      />
    </div>
  );
}
