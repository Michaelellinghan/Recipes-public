import React, { useState } from "react";
import {
  UtensilsCrossed,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Thermometer,
  Scale,
  Sparkles,
  Info
} from "lucide-react";
import { ActiveTimer } from "../types";
import { playKitchenChime } from "../utils/scaler";

interface KitchenToolsViewProps {
  activeTimers: ActiveTimer[];
  onUpdateTimers: (timers: ActiveTimer[]) => void;
}

const SOUS_VIDE_GUIDES = [
  {
    category: "Beef & Lamb (Ribeye, Strip, Tenderloin)",
    items: [
      { cut: "Rare", tempF: "120°F - 128°F", tempC: "49°C - 53°C", time: "1 - 3 hrs", notes: "Very red, tender, juicy" },
      { cut: "Medium-Rare (Recommended)", tempF: "129°F - 134°F", tempC: "54°C - 57°C", time: "1 - 4 hrs", notes: "Warm red center, optimal tenderness" },
      { cut: "Medium", tempF: "135°F - 144°F", tempC: "57°C - 62°C", time: "1 - 4 hrs", notes: "Warm pink center, firm" },
      { cut: "Tough Cuts (Chuck Roast, Short Ribs)", tempF: "135°F", tempC: "57°C", time: "24 - 48 hrs", notes: "Gelatin breaks down into steak-like texture" }
    ]
  },
  {
    category: "Poultry",
    items: [
      { cut: "Chicken Breast (Ultra Juicy)", tempF: "145°F", tempC: "63°C", time: "1.5 - 3 hrs", notes: "Incredibly tender, pasteurized by time" },
      { cut: "Chicken Breast (Traditional)", tempF: "150°F", tempC: "65°C", time: "1 - 3 hrs", notes: "Familiar firm texture without dryness" },
      { cut: "Chicken Thighs / Confit", tempF: "165°F", tempC: "74°C", time: "2 - 6 hrs", notes: "Melts connective tissue, shreddable" }
    ]
  },
  {
    category: "Seafood",
    items: [
      { cut: "Salmon (Mi-Cuit / Soft)", tempF: "115°F", tempC: "46°C", time: "30 - 45 mins", notes: "Silky sashimi-like translucence" },
      { cut: "Salmon (Traditional Flaky)", tempF: "125°F", tempC: "52°C", time: "40 - 50 mins", notes: "Moist, easily flakes into large petals" },
      { cut: "Lobster Tails with Butter", tempF: "135°F", tempC: "57°C", time: "45 mins", notes: "Tender, impossible to overcook" }
    ]
  },
  {
    category: "Eggs",
    items: [
      { cut: "Japanese Onsen Tamago", tempF: "145°F", tempC: "63°C", time: "45 mins", notes: "Custardy yolk, delicate soft white" },
      { cut: "Sous-Vide Poached Egg", tempF: "148°F", tempC: "64.5°C", time: "45 mins", notes: "Firm egg white with runny golden yolk" }
    ]
  }
];

export const KitchenToolsView: React.FC<KitchenToolsViewProps> = ({
  activeTimers,
  onUpdateTimers,
}) => {
  // Converter States
  const [convType, setConvType] = useState<"volume" | "temp" | "weight">("volume");
  const [volAmount, setVolAmount] = useState("1");
  const [volUnit, setVolUnit] = useState<"cups" | "tbsp" | "tsp" | "ml" | "fl_oz">("cups");

  const [tempF, setTempF] = useState("350");
  const [tempC, setTempC] = useState("175");

  // Custom timer form
  const [newTimerLabel, setNewTimerLabel] = useState("");
  const [newTimerMinutes, setNewTimerMinutes] = useState("10");

  const handleCreateTimer = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseFloat(newTimerMinutes);
    if (isNaN(mins) || mins <= 0) return;

    const newTimer: ActiveTimer = {
      id: "timer-" + Date.now(),
      label: newTimerLabel.trim() || `${mins} min timer`,
      totalSeconds: Math.round(mins * 60),
      remainingSeconds: Math.round(mins * 60),
      isRunning: true,
    };

    onUpdateTimers([...activeTimers, newTimer]);
    setNewTimerLabel("");
    setNewTimerMinutes("10");
  };

  const handleToggleTimer = (id: string) => {
    onUpdateTimers(
      activeTimers.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t))
    );
  };

  const handleResetTimer = (id: string) => {
    onUpdateTimers(
      activeTimers.map((t) =>
        t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t
      )
    );
  };

  const handleDeleteTimer = (id: string) => {
    onUpdateTimers(activeTimers.filter((t) => t.id !== id));
  };

  // Unit conversion formulas
  const calculateVolumeConversions = (val: number, unit: string) => {
    let ml = 0;
    if (unit === "cups") ml = val * 236.588;
    else if (unit === "tbsp") ml = val * 14.7868;
    else if (unit === "tsp") ml = val * 4.92892;
    else if (unit === "ml") ml = val;
    else if (unit === "fl_oz") ml = val * 29.5735;

    return {
      cups: (ml / 236.588).toFixed(2),
      tbsp: (ml / 14.7868).toFixed(1),
      tsp: (ml / 4.92892).toFixed(1),
      ml: Math.round(ml).toString(),
      fl_oz: (ml / 29.5735).toFixed(1),
    };
  };

  const volResults = calculateVolumeConversions(parseFloat(volAmount) || 0, volUnit);

  const handleFChange = (val: string) => {
    setTempF(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setTempC(Math.round(((num - 32) * 5) / 9).toString());
    }
  };

  const handleCChange = (val: string) => {
    setTempC(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      setTempF(Math.round((num * 9) / 5 + 32).toString());
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[#1A1A1A]">
      {/* Header */}
      <div className="bg-[#FDFCFB] p-6 sm:p-10 border border-[#1A1A1A]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#C2410C] block mb-2">
            Culinary Reference & Utilities
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black italic tracking-tight text-[#1A1A1A]">
            Sous-Vide & Kitchen Metrics
          </h1>
          <p className="font-serif italic text-xs sm:text-sm text-[#1A1A1A]/70 mt-1 max-w-2xl">
            Thermal equilibrium tables, algorithmic volume & oven temperature scales, and concurrent kitchen multi-timers.
          </p>
        </div>
      </div>

      {/* Multi-Timer Central Station */}
      <div className="bg-[#1A1A1A] text-[#FDFCFB] border border-[#1A1A1A] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FDFCFB]/10">
          <div className="flex items-center gap-2.5">
            <Timer className="w-5 h-5 text-[#C2410C]" />
            <div>
              <span className="font-sans text-[9px] font-black uppercase tracking-[0.25em] text-[#C2410C] block">
                Concurrent Clocks
              </span>
              <h2 className="text-lg font-serif italic font-bold text-[#FDFCFB]">
                Active Kitchen Multi-Timers
              </h2>
            </div>
          </div>

          {/* Quick Create Timer */}
          <form onSubmit={handleCreateTimer} className="flex items-center gap-2">
            <input
              type="text"
              value={newTimerLabel}
              onChange={(e) => setNewTimerLabel(e.target.value)}
              placeholder="Timer label (e.g. Pasta, Dough)..."
              className="bg-[#242424] border border-[#FDFCFB]/15 rounded-none px-3 py-2 text-xs font-sans text-[#FDFCFB] placeholder-[#FDFCFB]/40 focus:outline-none focus:border-[#C2410C]"
            />
            <input
              type="number"
              step="any"
              value={newTimerMinutes}
              onChange={(e) => setNewTimerMinutes(e.target.value)}
              placeholder="Mins"
              className="w-16 bg-[#242424] border border-[#FDFCFB]/15 rounded-none px-2 py-2 text-xs font-mono text-[#FDFCFB] text-center focus:outline-none focus:border-[#C2410C]"
            />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#C2410C] hover:bg-[#a3360a] text-white font-sans text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start</span>
            </button>
          </form>
        </div>

        {activeTimers.length === 0 ? (
          <div className="text-center py-8 text-[#FDFCFB]/40 font-serif italic text-xs">
            No active kitchen timers. Initiate a timer from any recipe step in Cook Mode or register one above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTimers.map((t) => (
              <div
                key={t.id}
                className="p-5 bg-[#222222] border border-[#FDFCFB]/10 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif italic font-bold text-[#FDFCFB] text-sm truncate max-w-[180px]">
                    {t.label}
                  </span>
                  <button
                    onClick={() => handleDeleteTimer(t.id)}
                    className="p-1 text-[#FDFCFB]/40 hover:text-[#C2410C] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Big Timer Clock */}
                <div className="font-mono text-3xl sm:text-4xl font-bold text-[#FDFCFB] tracking-wider">
                  {formatTimer(t.remainingSeconds)}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#111111] h-1.5 overflow-hidden">
                  <div
                    className="bg-[#C2410C] h-full transition-all duration-500"
                    style={{
                      width: `${(t.remainingSeconds / t.totalSeconds) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleToggleTimer(t.id)}
                    className={`flex-1 py-2 font-sans text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors ${
                      t.isRunning
                        ? "bg-[#C2410C] text-white"
                        : "bg-[#FDFCFB] text-[#1A1A1A] hover:bg-[#C2410C] hover:text-white"
                    }`}
                  >
                    {t.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{t.isRunning ? "Pause" : "Resume"}</span>
                  </button>
                  <button
                    onClick={() => handleResetTimer(t.id)}
                    className="p-2 bg-[#1A1A1A] hover:bg-[#333333] text-[#FDFCFB] border border-[#FDFCFB]/15 transition-colors"
                    title="Reset"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Columns: Kitchen Unit Converter & Sous-Vide Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Unit Converter (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FDFCFB] p-6 sm:p-8 border border-[#1A1A1A]/15 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1A1A1A]/10">
              <Scale className="w-4 h-4 text-[#C2410C]" />
              <h3 className="font-serif font-black italic text-lg text-[#1A1A1A]">
                Culinary Unit Converter
              </h3>
            </div>

            {/* Converter Tabs */}
            <div className="flex border border-[#1A1A1A]/20 p-0.5 bg-[#F9F8F6]">
              <button
                onClick={() => setConvType("volume")}
                className={`flex-1 py-2 font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
                  convType === "volume"
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                }`}
              >
                Volume & Spoons
              </button>
              <button
                onClick={() => setConvType("temp")}
                className={`flex-1 py-2 font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
                  convType === "temp"
                    ? "bg-[#1A1A1A] text-white"
                    : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                }`}
              >
                Oven Heat (°F / °C)
              </button>
            </div>

            {convType === "volume" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={volAmount}
                    onChange={(e) => setVolAmount(e.target.value)}
                    className="flex-1 bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2.5 font-mono text-sm font-bold text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none"
                  />
                  <select
                    value={volUnit}
                    onChange={(e) => setVolUnit(e.target.value as any)}
                    className="bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-3 py-2.5 font-sans text-xs font-bold text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none"
                  >
                    <option value="cups">Cups</option>
                    <option value="tbsp">Tablespoons (tbsp)</option>
                    <option value="tsp">Teaspoons (tsp)</option>
                    <option value="ml">Milliliters (ml)</option>
                    <option value="fl_oz">Fluid Ounces (fl oz)</option>
                  </select>
                </div>

                {/* Results Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-[#F9F8F6] border border-[#1A1A1A]/10">
                    <span className="font-sans text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider block">
                      Cups
                    </span>
                    <span className="font-mono text-base font-bold text-[#1A1A1A]">
                      {volResults.cups}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F9F8F6] border border-[#1A1A1A]/10">
                    <span className="font-sans text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider block">
                      Tablespoons
                    </span>
                    <span className="font-mono text-base font-bold text-[#1A1A1A]">
                      {volResults.tbsp} tbsp
                    </span>
                  </div>
                  <div className="p-3 bg-[#F9F8F6] border border-[#1A1A1A]/10">
                    <span className="font-sans text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider block">
                      Teaspoons
                    </span>
                    <span className="font-mono text-base font-bold text-[#1A1A1A]">
                      {volResults.tsp} tsp
                    </span>
                  </div>
                  <div className="p-3 bg-[#F9F8F6] border border-[#1A1A1A]/10">
                    <span className="font-sans text-[9px] text-[#1A1A1A]/50 font-bold uppercase tracking-wider block">
                      Metric Volume
                    </span>
                    <span className="font-mono text-base font-bold text-[#1A1A1A]">
                      {volResults.ml} ml
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                      Fahrenheit (°F)
                    </label>
                    <input
                      type="number"
                      value={tempF}
                      onChange={(e) => handleFChange(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2 font-mono text-sm font-bold text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-sans text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/60 mb-1">
                      Celsius (°C)
                    </label>
                    <input
                      type="number"
                      value={tempC}
                      onChange={(e) => handleCChange(e.target.value)}
                      className="w-full bg-[#F9F8F6] border border-[#1A1A1A]/15 rounded-none px-4 py-2 font-mono text-sm font-bold text-[#1A1A1A] focus:border-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Common Oven Landmarks */}
                <div className="p-4 bg-[#F9F8F6] border border-[#1A1A1A]/10 text-xs text-[#1A1A1A] space-y-1.5">
                  <div className="font-sans text-[9px] font-black uppercase tracking-[0.2em] text-[#C2410C] mb-2">
                    Standard Oven Benchmarks
                  </div>
                  <div className="flex justify-between border-b border-[#1A1A1A]/5 pb-1">
                    <span className="font-serif italic">Gentle Simmer / Proofing</span>
                    <span className="font-mono font-bold text-[#1A1A1A]">200°F (95°C)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A1A1A]/5 pb-1">
                    <span className="font-serif italic">Pastry & Cake Baking</span>
                    <span className="font-mono font-bold text-[#1A1A1A]">350°F (175°C)</span>
                  </div>
                  <div className="flex justify-between border-b border-[#1A1A1A]/5 pb-1">
                    <span className="font-serif italic">Roasting Meats & Vegetables</span>
                    <span className="font-mono font-bold text-[#1A1A1A]">400°F (205°C)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-serif italic">Artisan Pizza & Hearth Bread</span>
                    <span className="font-mono font-bold text-[#1A1A1A]">500°F (260°C)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sous-Vide Precision Guide (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FDFCFB] p-6 sm:p-8 border border-[#1A1A1A]/15 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[#1A1A1A]/10">
              <Thermometer className="w-4 h-4 text-[#C2410C]" />
              <h3 className="font-serif font-black italic text-lg text-[#1A1A1A]">
                Precision Sous-Vide Immersion Almanac
              </h3>
            </div>

            <div className="space-y-6">
              {SOUS_VIDE_GUIDES.map((group, idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-[#C2410C]">
                    {group.category}
                  </h4>
                  <div className="border border-[#1A1A1A]/15 divide-y divide-[#1A1A1A]/10">
                    {group.items.map((item, i) => (
                      <div
                        key={i}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F9F8F6] transition-colors"
                      >
                        <div>
                          <div className="text-xs sm:text-sm font-serif italic font-bold text-[#1A1A1A]">
                            {item.cut}
                          </div>
                          <div className="text-[11px] font-sans text-[#1A1A1A]/60">
                            {item.notes}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-xs shrink-0">
                          <span className="px-2.5 py-1 bg-[#1A1A1A] text-white font-mono text-[11px] font-bold">
                            {item.tempF} ({item.tempC})
                          </span>
                          <span className="font-mono text-[#1A1A1A]/70 text-[11px]">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
