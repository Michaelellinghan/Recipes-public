import React, { useState, useEffect } from "react";
import { X, Sparkles, Loader2, ArrowRightLeft, Check, AlertCircle } from "lucide-react";
import { SubstitutionResult } from "../types";

interface SubstitutionModalProps {
  recipeTitle: string;
  initialIngredient: string;
  onClose: () => void;
}

export const SubstitutionModal: React.FC<SubstitutionModalProps> = ({
  recipeTitle,
  initialIngredient,
  onClose,
}) => {
  const [ingredient, setIngredient] = useState(initialIngredient);
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SubstitutionResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFetchSubstitutions = async () => {
    if (!ingredient.trim()) return;
    setIsLoading(true);
    setErrorMsg(null);
    setResults([]);

    try {
      const response = await fetch("/api/gemini/substitute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredient: ingredient.trim(),
          recipeTitle,
          reason,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to find substitutions.");
      }

      setResults(data.substitutes || []);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to find substitutions.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialIngredient) {
      handleFetchSubstitutions();
    }
  }, [initialIngredient]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FDFCFB] border border-[#1A1A1A] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl p-6 sm:p-8 animate-in fade-in duration-150 my-auto text-[#1A1A1A]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[#1A1A1A]/20 bg-[#F9F8F6] text-[#C2410C] flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#C2410C]">
                  Culinary Equivalency Matrix
                </span>
              </div>
              <h2 className="font-serif font-black italic text-2xl text-[#1A1A1A]">
                Ingredient Substitution
              </h2>
              <p className="font-serif italic text-xs text-[#1A1A1A]/60 truncate max-w-xs">
                For "{recipeTitle}"
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F9F8F6] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="py-4 space-y-3">
          <div>
            <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1">
              Ingredient to Replace:
            </label>
            <input
              type="text"
              value={ingredient}
              onChange={(e) => setIngredient(e.target.value)}
              placeholder="e.g. Buttermilk, Heavy Cream, Mirin, Eggs..."
              className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2 font-serif italic text-xs sm:text-sm text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <div>
            <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] mb-1">
              Reason / Dietary Constraint (Optional):
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Out of stock, dairy-free, vegan, low-carb..."
              className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2 font-serif italic text-xs text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A]"
            />
          </div>

          <button
            onClick={handleFetchSubstitutions}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Analyzing Chemical & Flavor Profiles...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Find Equivalents</span>
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-sans flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {results.map((sub, idx) => (
            <div
              key={idx}
              className="p-4 bg-[#F9F8F6] border border-[#1A1A1A]/15 hover:border-[#1A1A1A] transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-serif italic font-bold text-[#1A1A1A] text-base">
                  {sub.substituteName}
                </span>
                <span className="px-2.5 py-0.5 bg-white border border-[#1A1A1A]/15 font-mono text-[11px] text-[#1A1A1A] font-bold">
                  Ratio: {sub.ratio}
                </span>
              </div>

              <p className="font-serif italic text-xs text-[#1A1A1A]/70 leading-relaxed">
                <strong className="font-sans not-italic font-bold text-[#1A1A1A]">Impact: </strong>
                {sub.flavorTextureImpact}
              </p>

              <div className="font-sans text-xs text-[#1A1A1A]/60">
                <strong className="font-bold text-[#1A1A1A]">Optimal Context: </strong> {sub.bestFor}
              </div>

              {sub.proTip && (
                <div className="p-3 bg-white border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] flex items-start gap-2 font-serif italic">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2410C] shrink-0 mt-0.5" />
                  <span>
                    <strong className="font-sans not-italic font-bold text-[#C2410C]">Chef Note:</strong> {sub.proTip}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-[#1A1A1A]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#C2410C] text-white font-sans text-[11px] font-black uppercase tracking-widest transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
