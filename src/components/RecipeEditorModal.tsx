import React, { useState } from "react";
import { X, Plus, Trash2, Check, Sparkles, Image, Clock, Flame, ChefHat } from "lucide-react";
import { Recipe, Ingredient, RecipeStep } from "../types";

interface RecipeEditorModalProps {
  initialRecipe?: Recipe | null;
  onClose: () => void;
  onSave: (recipe: Recipe) => void;
}

export const RecipeEditorModal: React.FC<RecipeEditorModalProps> = ({
  initialRecipe,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialRecipe;

  const [title, setTitle] = useState(initialRecipe?.title || "");
  const [description, setDescription] = useState(initialRecipe?.description || "");
  const [image, setImage] = useState(
    initialRecipe?.image ||
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=80"
  );
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(
    initialRecipe?.prepTimeMinutes?.toString() || "15"
  );
  const [cookTimeMinutes, setCookTimeMinutes] = useState(
    initialRecipe?.cookTimeMinutes?.toString() || "20"
  );
  const [servings, setServings] = useState(
    initialRecipe?.servings?.toString() || "4"
  );
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">(
    initialRecipe?.difficulty || "Easy"
  );
  const [cuisine, setCuisine] = useState(initialRecipe?.cuisine || "American");
  const [category, setCategory] = useState<
    "Breakfast" | "Lunch" | "Dinner" | "Dessert" | "Snack" | "Beverage" | "Side"
  >(initialRecipe?.category || "Dinner");
  const [tagsInput, setTagsInput] = useState(
    initialRecipe?.tags?.join(", ") || "Homemade, Weeknight Dinner"
  );
  const [chefNotes, setChefNotes] = useState(initialRecipe?.chefNotes || "");

  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients || [
      { id: "i1", amount: 1, unit: "lb", name: "Main protein or vegetable", category: "Produce" },
      { id: "i2", amount: 2, unit: "tbsp", name: "Olive oil", category: "Oils & Condiments" },
    ]
  );

  // Steps
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialRecipe?.steps || [
      { stepNumber: 1, instruction: "Prepare all ingredients and preheat pan.", timerMinutes: 0 },
      { stepNumber: 2, instruction: "Cook over medium heat until tender and fragrant.", timerMinutes: 10 },
    ]
  );

  // Nutrition
  const [calories, setCalories] = useState(
    initialRecipe?.nutrition?.calories?.toString() || "400"
  );
  const [protein, setProtein] = useState(
    initialRecipe?.nutrition?.protein?.toString() || "25"
  );
  const [carbs, setCarbs] = useState(
    initialRecipe?.nutrition?.carbs?.toString() || "35"
  );
  const [fat, setFat] = useState(
    initialRecipe?.nutrition?.fat?.toString() || "15"
  );

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      {
        id: "ing-" + Date.now() + Math.random().toString(36).slice(2, 5),
        amount: 1,
        unit: "",
        name: "",
        category: "Produce",
      },
    ]);
  };

  const handleUpdateIngredient = (index: number, field: keyof Ingredient, value: any) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddStep = () => {
    setSteps([
      ...steps,
      {
        stepNumber: steps.length + 1,
        instruction: "",
        timerMinutes: 0,
      },
    ]);
  };

  const handleUpdateStep = (index: number, field: keyof RecipeStep, value: any) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    const filtered = steps.filter((_, i) => i !== index);
    const reindexed = filtered.map((st, i) => ({ ...st, stepNumber: i + 1 }));
    setSteps(reindexed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const fullRecipe: Recipe = {
      id: initialRecipe?.id || "rec-" + Date.now(),
      title: title.trim(),
      description: description.trim() || "Delicious home-cooked recipe.",
      image: image.trim(),
      prepTimeMinutes: parseInt(prepTimeMinutes) || 10,
      cookTimeMinutes: parseInt(cookTimeMinutes) || 15,
      servings: parseInt(servings) || 4,
      difficulty,
      cuisine: cuisine.trim() || "Home Cooking",
      category,
      tags,
      ingredients: ingredients.filter((i) => i.name.trim()),
      steps: steps.filter((s) => s.instruction.trim()),
      nutrition: {
        calories: parseInt(calories) || 0,
        protein: parseInt(protein) || 0,
        carbs: parseInt(carbs) || 0,
        fat: parseInt(fat) || 0,
      },
      cookbooks: initialRecipe?.cookbooks || ["All Recipes"],
      isFavorite: initialRecipe?.isFavorite || false,
      rating: initialRecipe?.rating || 5.0,
      chefNotes: chefNotes.trim(),
      createdAt: initialRecipe?.createdAt || new Date().toISOString(),
    };

    onSave(fullRecipe);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FDFCFB] border border-[#1A1A1A] max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl p-6 sm:p-8 animate-in fade-in duration-150 my-auto text-[#1A1A1A]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/10">
          <div>
            <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#C2410C] font-bold block mb-0.5">
              Manuscript & Documentation
            </span>
            <h2 className="font-serif font-black italic text-2xl text-[#1A1A1A]">
              {isEditing ? "Revise Culinary Spec" : "Draft New Formulation"}
            </h2>
            <p className="text-xs font-serif italic text-[#1A1A1A]/60">
              Document precise quantities, techniques, kitchen timings, and culinary notes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F9F8F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1">
                Recipe Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Braised Heritage Pork Shank with Star Anise"
                className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/20 rounded-none px-4 py-2.5 font-serif italic text-base font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1">
                Editorial Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Evocative summary of flavors, textures, origin, and aroma..."
                className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2 text-xs font-serif italic text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] resize-none"
              />
            </div>

            <div>
              <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1">
                Photography URL
              </label>
              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2 text-xs font-sans text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>

            {/* Timings, Servings, Cuisine & Category */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                  Prep (Mins)
                </label>
                <input
                  type="number"
                  value={prepTimeMinutes}
                  onChange={(e) => setPrepTimeMinutes(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                  Cook (Mins)
                </label>
                <input
                  type="number"
                  value={cookTimeMinutes}
                  onChange={(e) => setCookTimeMinutes(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                  Yield (Servings)
                </label>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                  Technique Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs font-sans font-bold text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                  Tradition / Cuisine
                </label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g. Provençal, Nordic, Japanese"
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs font-sans text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                  Course
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs font-sans text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Snack">Snack</option>
                  <option value="Side">Side</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                Index Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Comfort Food, Heritage, Quick, Gluten-Free"
                className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2 text-xs font-sans text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>

          {/* Ingredients Section */}
          <div className="pt-4 border-t border-[#1A1A1A]/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Ingredients Spec ({ingredients.length})
              </span>
              <button
                type="button"
                onClick={handleAddIngredient}
                className="flex items-center gap-1 font-sans text-[10px] font-black uppercase tracking-widest text-[#C2410C] hover:text-[#1A1A1A] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ingredient</span>
              </button>
            </div>

            <div className="space-y-2">
              {ingredients.map((ing, idx) => (
                <div
                  key={ing.id || idx}
                  className="flex items-center gap-2 bg-[#F9F8F6] p-2 border border-[#1A1A1A]/10"
                >
                  <input
                    type="number"
                    step="any"
                    value={ing.amount || ""}
                    onChange={(e) =>
                      handleUpdateIngredient(
                        idx,
                        "amount",
                        parseFloat(e.target.value) || undefined
                      )
                    }
                    placeholder="Qty"
                    className="w-16 bg-white border border-[#1A1A1A]/15 rounded-none px-2 py-1.5 font-mono text-xs text-center focus:border-[#1A1A1A] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={ing.unit || ""}
                    onChange={(e) => handleUpdateIngredient(idx, "unit", e.target.value)}
                    placeholder="Unit"
                    className="w-20 bg-white border border-[#1A1A1A]/15 rounded-none px-2 py-1.5 font-sans text-xs focus:border-[#1A1A1A] focus:outline-none"
                  />
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => handleUpdateIngredient(idx, "name", e.target.value)}
                    placeholder="Ingredient item *"
                    className="flex-1 bg-white border border-[#1A1A1A]/15 rounded-none px-2.5 py-1.5 font-sans text-xs font-medium focus:border-[#1A1A1A] focus:outline-none"
                  />
                  <select
                    value={ing.category || "Produce"}
                    onChange={(e) =>
                      handleUpdateIngredient(idx, "category", e.target.value)
                    }
                    className="w-28 bg-white border border-[#1A1A1A]/15 rounded-none px-2 py-1.5 font-sans text-xs text-[#1A1A1A] hidden sm:block focus:border-[#1A1A1A] focus:outline-none"
                  >
                    <option value="Produce">Produce</option>
                    <option value="Meat & Seafood">Meat & Seafood</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Pantry & Spices">Pantry</option>
                    <option value="Oils & Condiments">Oils</option>
                    <option value="Other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(idx)}
                    className="p-1.5 text-[#1A1A1A]/40 hover:text-[#C2410C] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Steps Section */}
          <div className="pt-4 border-t border-[#1A1A1A]/10">
            <div className="flex items-center justify-between mb-3">
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]">
                Sequence of Execution ({steps.length})
              </span>
              <button
                type="button"
                onClick={handleAddStep}
                className="flex items-center gap-1 font-sans text-[10px] font-black uppercase tracking-widest text-[#C2410C] hover:text-[#1A1A1A] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-3">
              {steps.map((st, idx) => (
                <div
                  key={idx}
                  className="bg-[#F9F8F6] p-4 border border-[#1A1A1A]/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-white bg-[#1A1A1A] px-2 py-0.5">
                      Step {st.stepNumber}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#C2410C]" />
                        <input
                          type="number"
                          value={st.timerMinutes || ""}
                          onChange={(e) =>
                            handleUpdateStep(
                              idx,
                              "timerMinutes",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-12 bg-white border border-[#1A1A1A]/15 rounded-none px-1.5 py-1 text-xs text-center font-mono focus:border-[#1A1A1A] focus:outline-none"
                        />
                        <span className="font-sans text-[10px] text-[#1A1A1A]/50">Min Timer</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(idx)}
                        className="p-1 text-[#1A1A1A]/40 hover:text-[#C2410C] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    value={st.instruction}
                    onChange={(e) => handleUpdateStep(idx, "instruction", e.target.value)}
                    placeholder="Step instruction..."
                    className="w-full bg-white border border-[#1A1A1A]/15 rounded-none p-2.5 font-serif italic text-xs text-[#1A1A1A] resize-none focus:border-[#1A1A1A] focus:outline-none"
                  />

                  <input
                    type="text"
                    value={st.tip || ""}
                    onChange={(e) => handleUpdateStep(idx, "tip", e.target.value)}
                    placeholder="Editorial cue / sensory tip (optional)..."
                    className="w-full bg-white border border-[#1A1A1A]/15 rounded-none px-2.5 py-1.5 font-serif italic text-xs text-[#C2410C] placeholder-[#1A1A1A]/40 focus:border-[#1A1A1A] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Estimates */}
          <div className="pt-4 border-t border-[#1A1A1A]/10">
            <span className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-2">
              Nutritional Profile (per portion)
            </span>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="font-sans text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider block mb-1">
                  Calories
                </label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-1.5 font-mono text-xs text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-sans text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider block mb-1">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-1.5 font-mono text-xs text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-sans text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider block mb-1">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-1.5 font-mono text-xs text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none"
                />
              </div>
              <div>
                <label className="font-sans text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider block mb-1">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-1.5 font-mono text-xs text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Chef Notes */}
          <div>
            <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1">
              Chef Commentary & Serving Suggestions
            </label>
            <textarea
              rows={2}
              value={chefNotes}
              onChange={(e) => setChefNotes(e.target.value)}
              placeholder="Pairing ideas, wine matches, historical origins, preservation tips..."
              className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none p-3 font-serif italic text-xs text-[#1A1A1A] resize-none focus:border-[#1A1A1A] focus:outline-none"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-[#1A1A1A]/30 hover:border-[#1A1A1A] hover:bg-white text-[#1A1A1A] font-sans text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-black uppercase tracking-widest transition-colors"
            >
              Commit Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
