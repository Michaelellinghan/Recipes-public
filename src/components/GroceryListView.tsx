import React, { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Trash2,
  Check,
  Copy,
  RotateCcw,
  CheckSquare,
  Square,
  Sparkles,
  Tag
} from "lucide-react";
import { GroceryItem } from "../types";
import { formatAmount } from "../utils/scaler";

interface GroceryListViewProps {
  groceryItems: GroceryItem[];
  onUpdateItems: (items: GroceryItem[]) => void;
}

const AISLE_ORDER = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry & Spices",
  "Oils & Condiments",
  "Other",
];

export const GroceryListView: React.FC<GroceryListViewProps> = ({
  groceryItems,
  onUpdateItems,
}) => {
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Produce");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [copiedText, setCopiedText] = useState(false);

  const toggleCheck = (id: string) => {
    onUpdateItems(
      groceryItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const parsedAmount = parseFloat(newItemAmount);

    const newItem: GroceryItem = {
      id: "item-" + Date.now() + Math.random().toString(36).slice(2, 6),
      name: newItemName.trim(),
      amount: isNaN(parsedAmount) ? undefined : parsedAmount,
      category: newItemCategory,
      checked: false,
    };

    onUpdateItems([newItem, ...groceryItems]);
    setNewItemName("");
    setNewItemAmount("");
  };

  const handleDeleteItem = (id: string) => {
    onUpdateItems(groceryItems.filter((i) => i.id !== id));
  };

  const handleClearCompleted = () => {
    onUpdateItems(groceryItems.filter((i) => !i.checked));
  };

  const handleUncheckAll = () => {
    onUpdateItems(groceryItems.map((i) => ({ ...i, checked: false })));
  };

  const handleCopyList = () => {
    if (groceryItems.length === 0) return;

    const grouped: Record<string, GroceryItem[]> = {};
    AISLE_ORDER.forEach((cat) => (grouped[cat] = []));

    groceryItems.forEach((item) => {
      const cat = grouped[item.category] ? item.category : "Other";
      grouped[cat].push(item);
    });

    let text = "🛒 Chefbook Shopping List\n\n";
    AISLE_ORDER.forEach((cat) => {
      const list = grouped[cat];
      if (list && list.length > 0) {
        text += `[${cat.toUpperCase()}]\n`;
        list.forEach((i) => {
          const amt = i.amount ? `${formatAmount(i.amount)} ${i.unit || ""} ` : "";
          text += `${i.checked ? "✅" : "⬜"} ${amt}${i.name}\n`;
        });
        text += "\n";
      }
    });

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Group items by category
  const groupedItems: Record<string, GroceryItem[]> = {};
  AISLE_ORDER.forEach((cat) => (groupedItems[cat] = []));

  groceryItems.forEach((item) => {
    const cat = groupedItems[item.category] ? item.category : "Other";
    groupedItems[cat].push(item);
  });

  const checkedCount = groceryItems.filter((i) => i.checked).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Controls */}
      <div className="bg-[#FDFCFB] p-6 sm:p-8 border border-[#1A1A1A]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#C2410C] font-bold block mb-1">
            Provisions & Inventory
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black italic text-[#1A1A1A]">
            The Market Ledger
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-[#1A1A1A]/70 mt-1">
            Cataloged by department for seamless procurement in specialty markets and grocers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {checkedCount > 0 && (
            <button
              onClick={handleClearCompleted}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F9F8F6] border border-[#1A1A1A]/20 hover:border-[#C2410C] text-[#1A1A1A] hover:text-[#C2410C] font-sans text-[11px] uppercase tracking-widest font-bold transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Done ({checkedCount})</span>
            </button>
          )}

          {groceryItems.length > 0 && (
            <button
              onClick={handleCopyList}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] uppercase tracking-widest font-black transition-colors"
            >
              {copiedText ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C2410C]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy List</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Custom Item Form */}
      <form
        onSubmit={handleAddItem}
        className="bg-[#FDFCFB] p-4 sm:p-5 border border-[#1A1A1A]/10 flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
      >
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="Add custom provision (e.g. Maldon sea salt, sourdough batard...)"
          className="flex-1 w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2.5 font-sans text-xs focus:outline-none focus:border-[#1A1A1A]"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={newItemAmount}
            onChange={(e) => setNewItemAmount(e.target.value)}
            placeholder="Qty"
            className="w-16 sm:w-20 bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2.5 font-sans text-xs text-center focus:outline-none focus:border-[#1A1A1A]"
          />

          <select
            value={newItemCategory}
            onChange={(e) => setNewItemCategory(e.target.value)}
            className="bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2.5 font-sans text-xs uppercase tracking-wider text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
          >
            {AISLE_ORDER.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-black uppercase tracking-widest shrink-0 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {/* Grocery Items Grouped by Department */}
      {groceryItems.length === 0 ? (
        <div className="bg-[#FDFCFB] border border-[#1A1A1A]/10 p-12 text-center">
          <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="font-serif italic font-bold text-[#1A1A1A] text-lg">
            Your Provisions Ledger is Clear
          </h3>
          <p className="text-xs sm:text-sm font-serif italic text-[#1A1A1A]/60 max-w-sm mx-auto mt-1">
            Add ingredients with one click from any recipe card, your weekly meal plan, or log custom items above.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {AISLE_ORDER.map((catName) => {
            const items = groupedItems[catName] || [];
            if (items.length === 0) return null;

            return (
              <div
                key={catName}
                className="bg-[#FDFCFB] border border-[#1A1A1A]/10 overflow-hidden"
              >
                {/* Category Header */}
                <div className="px-6 py-3 bg-[#F9F8F6] border-b border-[#1A1A1A]/10 flex items-center justify-between">
                  <span className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-[#1A1A1A]">
                    {catName}
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-wider text-[#1A1A1A]/50">
                    {items.length} {items.length === 1 ? "entry" : "entries"}
                  </span>
                </div>

                {/* Items List */}
                <div className="divide-y divide-[#1A1A1A]/5">
                  {items.map((item) => {
                    const amtStr = formatAmount(item.amount);

                    return (
                      <div
                        key={item.id}
                        className={`group px-6 py-3.5 flex items-center justify-between gap-4 transition-colors hover:bg-[#F9F8F6] ${
                          item.checked ? "bg-[#F9F8F6]/50" : ""
                        }`}
                      >
                        <div
                          onClick={() => toggleCheck(item.id)}
                          className="flex items-center gap-3.5 flex-1 cursor-pointer select-none"
                        >
                          <div
                            className={`w-4 h-4 rounded-none border flex items-center justify-center transition-colors ${
                              item.checked
                                ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
                                : "border-[#1A1A1A]/30 bg-white group-hover:border-[#1A1A1A]"
                            }`}
                          >
                            {item.checked && (
                              <Check className="w-3 h-3 stroke-[3]" />
                            )}
                          </div>

                          <div>
                            <span
                              className={`text-xs sm:text-sm font-sans ${
                                item.checked
                                  ? "line-through text-[#1A1A1A]/40"
                                  : "text-[#1A1A1A] font-medium"
                              }`}
                            >
                              {amtStr && (
                                <strong className="text-[#C2410C] font-mono font-bold mr-1.5">
                                  {amtStr} {item.unit || ""}
                                </strong>
                              )}
                              {item.name}
                            </span>
                            {item.recipeTitle && (
                              <span className="block font-serif text-[10px] text-[#1A1A1A]/50 italic mt-0.5">
                                Spec for: {item.recipeTitle}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-[#1A1A1A]/40 hover:text-[#C2410C] transition-opacity"
                          title="Delete item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
