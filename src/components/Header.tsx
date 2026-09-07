import React from "react";
import { BookOpen, Calendar, ShoppingBag, UtensilsCrossed, Sparkles, Plus, Timer, Search, ChefHat, Wand2, FileText, Globe, Download } from "lucide-react";
import { ActiveTimer } from "../types";

interface HeaderProps {
  currentTab: "recipes" | "planner" | "grocery" | "tools";
  onTabChange: (tab: "recipes" | "planner" | "grocery" | "tools") => void;
  groceryCount: number;
  activeTimers: ActiveTimer[];
  onOpenTimers: () => void;
  onOpenImport: () => void;
  onOpenFridgeWizard: () => void;
  onOpenCreateRecipe: () => void;
  onOpenArchive?: () => void;
  onOpenExport?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  groceryCount,
  activeTimers,
  onOpenTimers,
  onOpenImport,
  onOpenFridgeWizard,
  onOpenCreateRecipe,
  onOpenArchive,
  onOpenExport,
  searchQuery,
  onSearchChange,
}) => {
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const runningTimersCount = activeTimers.filter((t) => t.isRunning).length;

  return (
    <header className="sticky top-0 z-30 bg-[#FDFCFB]/95 backdrop-blur-md text-[#1A1A1A] border-b border-[#1A1A1A]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Masthead Row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pt-6 pb-4 border-b border-[#1A1A1A]/10 gap-4">
          {/* Logo & Publishing Tagline */}
          <div className="flex items-end justify-between md:justify-start gap-6">
            <button
              onClick={() => onTabChange("recipes")}
              className="text-left group cursor-pointer"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tighter uppercase leading-none text-[#1A1A1A] group-hover:text-[#C2410C] transition-colors">
                Chefbook
              </h1>
              <p className="text-[10px] sm:text-xs font-sans tracking-[0.2em] uppercase mt-1.5 text-[#C2410C] font-bold">
                The Essential Collection / Free Edition
              </p>
            </button>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Search Input */}
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 text-[#1A1A1A]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="SEARCH RECIPES..."
                className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 text-[#1A1A1A] placeholder-[#1A1A1A]/40 font-sans text-xs uppercase tracking-wider rounded-none pl-8 pr-4 py-2 focus:outline-none focus:border-[#1A1A1A] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/50 hover:text-[#1A1A1A] font-sans text-[10px] font-bold uppercase tracking-wider"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Kitchen Timers */}
            {activeTimers.length > 0 && (
              <button
                onClick={onOpenTimers}
                className={`flex items-center gap-1.5 px-3 py-2 border font-sans text-[10px] font-bold uppercase tracking-widest transition-all rounded-none ${
                  runningTimersCount > 0
                    ? "border-[#C2410C] bg-[#C2410C]/10 text-[#C2410C] animate-pulse"
                    : "border-[#1A1A1A]/20 bg-[#F9F8F6] text-[#1A1A1A] hover:border-[#1A1A1A]"
                }`}
                title="Kitchen Timers"
              >
                <Timer className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>
                  {activeTimers.length} {activeTimers.length === 1 ? "Timer" : "Timers"}
                </span>
              </button>
            )}

            {/* World Archive Quick Button */}
            {onOpenArchive && (
              <button
                onClick={onOpenArchive}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 border border-[#1A1A1A]/20 bg-[#F9F8F6] hover:border-[#1A1A1A] hover:bg-white text-[#1A1A1A] font-sans text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors rounded-none"
                title="Browse 1,000+ World Recipes"
              >
                <Globe className="w-3.5 h-3.5 text-[#C2410C]" />
                <span>1,000+ Archive</span>
              </button>
            )}

            {/* Export & Download Files Button */}
            {onOpenExport && (
              <button
                onClick={onOpenExport}
                className="flex items-center gap-1.5 px-3 py-2 border border-[#1A1A1A]/20 bg-[#F9F8F6] hover:border-[#1A1A1A] hover:bg-white text-[#1A1A1A] font-sans text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors rounded-none"
                title="Download Recipes, Backups & Files"
              >
                <Download className="w-3.5 h-3.5 text-[#C2410C]" />
                <span className="hidden md:inline">Download Files</span>
                <span className="md:hidden">Files</span>
              </button>
            )}

            {/* Add Recipe Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1A1A1A] text-white hover:bg-[#C2410C] font-sans text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors rounded-none shadow-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Recipe</span>
              </button>

              {showAddMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowAddMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-[#FDFCFB] border border-[#1A1A1A]/20 shadow-2xl p-2 z-50 rounded-none animate-in fade-in duration-100">
                    <div className="px-3 py-2 text-[9px] font-sans font-bold uppercase tracking-[0.2em] text-[#C2410C] border-b border-[#1A1A1A]/10">
                      Recipe Studio & Library
                    </div>
                    {onOpenArchive && (
                      <button
                        onClick={() => {
                          setShowAddMenu(false);
                          onOpenArchive();
                        }}
                        className="w-full text-left flex items-start gap-3 p-3 hover:bg-[#F9F8F6] transition-colors group rounded-none border-b border-[#1A1A1A]/5"
                      >
                        <div className="w-7 h-7 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 group-hover:bg-[#C2410C] transition-colors">
                          <Globe className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-serif font-bold italic text-[#1A1A1A] flex items-center gap-1.5">
                            Grand Culinary Archive
                            <span className="text-[9px] font-sans font-bold bg-emerald-700 text-white px-1.5 py-0.2 uppercase tracking-wider not-italic">
                              1,000+ DISHES
                            </span>
                          </div>
                          <div className="text-[11px] font-sans text-[#1A1A1A]/60 mt-0.5">
                            Browse world classics across 18 regional culinary cultures
                          </div>
                        </div>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenImport();
                      }}
                      className="w-full text-left flex items-start gap-3 p-3 hover:bg-[#F9F8F6] transition-colors group rounded-none"
                    >
                      <div className="w-7 h-7 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 group-hover:bg-[#C2410C] transition-colors">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-serif font-bold italic text-[#1A1A1A] flex items-center gap-1.5">
                          Smart Ingestion
                          <span className="text-[9px] font-sans font-bold bg-[#C2410C] text-white px-1.5 py-0.2 uppercase tracking-wider not-italic">
                            WEB & CAMERA
                          </span>
                        </div>
                        <div className="text-[11px] font-sans text-[#1A1A1A]/60 mt-0.5">
                          Web recipe URLs, food blogs, photos of cookbook pages & handwritten notes
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenFridgeWizard();
                      }}
                      className="w-full text-left flex items-start gap-3 p-3 hover:bg-[#F9F8F6] transition-colors group rounded-none"
                    >
                      <div className="w-7 h-7 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 group-hover:bg-[#C2410C] transition-colors">
                        <Wand2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-serif font-bold italic text-[#1A1A1A]">
                          Fridge Chef Wizard
                        </div>
                        <div className="text-[11px] font-sans text-[#1A1A1A]/60 mt-0.5">
                          Generate meals with pantry ingredients
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        onOpenCreateRecipe();
                      }}
                      className="w-full text-left flex items-start gap-3 p-3 hover:bg-[#F9F8F6] transition-colors group rounded-none border-t border-[#1A1A1A]/5"
                    >
                      <div className="w-7 h-7 bg-[#F9F8F6] border border-[#1A1A1A]/20 text-[#1A1A1A] flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-serif font-bold italic text-[#1A1A1A]">
                          Create Manually
                        </div>
                        <div className="text-[11px] font-sans text-[#1A1A1A]/60 mt-0.5">
                          Draft recipe from scratch
                        </div>
                      </div>
                    </button>

                    {onOpenExport && (
                      <button
                        onClick={() => {
                          setShowAddMenu(false);
                          onOpenExport();
                        }}
                        className="w-full text-left flex items-start gap-3 p-3 hover:bg-[#F9F8F6] transition-colors group rounded-none border-t border-[#1A1A1A]/5"
                      >
                        <div className="w-7 h-7 bg-[#F9F8F6] border border-[#1A1A1A]/20 text-[#1A1A1A] flex items-center justify-center shrink-0 group-hover:bg-[#C2410C] group-hover:text-white transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-serif font-bold italic text-[#1A1A1A]">
                            Download Files & Export
                          </div>
                          <div className="text-[11px] font-sans text-[#1A1A1A]/60 mt-0.5">
                            Backup JSON, Markdown, printable HTML & app ZIP
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Editorial Navigation Tabs */}
        <nav className="flex items-center gap-8 font-sans text-[11px] uppercase tracking-widest font-bold py-3 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onTabChange("recipes")}
            className={`transition-colors whitespace-nowrap flex items-center gap-2 pb-1 ${
              currentTab === "recipes"
                ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A]"
                : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <button
            onClick={() => onTabChange("planner")}
            className={`transition-colors whitespace-nowrap flex items-center gap-2 pb-1 ${
              currentTab === "planner"
                ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A]"
                : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Meal Planner</span>
          </button>

          <button
            onClick={() => onTabChange("grocery")}
            className={`transition-colors whitespace-nowrap flex items-center gap-2 pb-1 ${
              currentTab === "grocery"
                ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A]"
                : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Grocery List</span>
            {groceryCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 font-sans text-[9px] font-bold bg-[#C2410C] text-white">
                {groceryCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange("tools")}
            className={`transition-colors whitespace-nowrap flex items-center gap-2 pb-1 ${
              currentTab === "tools"
                ? "border-b-2 border-[#1A1A1A] text-[#1A1A1A]"
                : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Techniques & Tools</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
