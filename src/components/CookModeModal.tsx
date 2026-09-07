import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  SunMedium,
  CheckCircle2,
  ListFilter,
  Sparkles,
  Info
} from "lucide-react";
import { Recipe, Ingredient } from "../types";
import { scaleAmount, formatAmount, playKitchenChime } from "../utils/scaler";

interface CookModeModalProps {
  recipe: Recipe;
  targetServings: number;
  onClose: () => void;
  onTimerStart: (label: string, minutes: number, recipeTitle: string, stepNumber: number) => void;
}

export const CookModeModal: React.FC<CookModeModalProps> = ({
  recipe,
  targetServings,
  onClose,
  onTimerStart,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showIngredientsDrawer, setShowIngredientsDrawer] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Local step timer
  const currentStep = recipe.steps[currentStepIndex] || recipe.steps[0];
  const stepTimerMinutes = currentStep?.timerMinutes || 0;
  const [stepTimerSeconds, setStepTimerSeconds] = useState(stepTimerMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Reset timer whenever step changes
  useEffect(() => {
    setIsTimerRunning(false);
    setStepTimerSeconds((currentStep?.timerMinutes || 0) * 60);
    // Stop speech if speaking
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentStepIndex, currentStep?.timerMinutes]);

  // Timer countdown loop
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && stepTimerSeconds > 0) {
      interval = setInterval(() => {
        setStepTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            playKitchenChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, stepTimerSeconds]);

  // Screen Wake Lock API
  useEffect(() => {
    async function requestWakeLock() {
      try {
        if ("wakeLock" in navigator) {
          const lock = await (navigator as any).wakeLock.request("screen");
          wakeLockRef.current = lock;
          setWakeLockActive(true);
          lock.addEventListener("release", () => {
            setWakeLockActive(false);
          });
        }
      } catch (err) {
        console.warn("WakeLock error:", err);
      }
    }

    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        handleNextStep();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        handlePrevStep();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === " ") {
        // Space to toggle timer if available
        if (stepTimerMinutes > 0) {
          e.preventDefault();
          setIsTimerRunning((prev) => !prev);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStepIndex, recipe.steps.length, stepTimerMinutes]);

  const handleNextStep = () => {
    if (currentStepIndex < recipe.steps.length - 1) {
      // Mark current as completed
      if (!completedSteps.includes(currentStepIndex)) {
        setCompletedSteps((prev) => [...prev, currentStepIndex]);
      }
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const toggleStepCompleted = (index: number) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps((prev) => prev.filter((i) => i !== index));
    } else {
      setCompletedSteps((prev) => [...prev, index]);
    }
  };

  // Text-to-Speech narration
  const handleToggleSpeak = () => {
    if (!("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `Step ${currentStep.stepNumber}: ${currentStep.instruction}. ${
        currentStep.tip ? `Chef tip: ${currentStep.tip}` : ""
      }`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1A1A] text-[#FDFCFB] flex flex-col select-none overflow-hidden">
      {/* Top Kitchen Status Bar */}
      <div className="px-4 sm:px-8 py-3.5 bg-[#141414] border-b border-[#FDFCFB]/10 flex items-center justify-between gap-4">
        {/* Left: Recipe Name & Step Indicator */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-sans font-black text-[#C2410C] text-[10px] tracking-[0.25em] uppercase">
            Active Kitchen
          </span>
          <span className="text-[#FDFCFB]/20 hidden sm:inline">—</span>
          <h2 className="font-serif italic font-bold text-[#FDFCFB] text-sm sm:text-base truncate max-w-xs sm:max-w-md">
            {recipe.title}
          </h2>
          <span className="font-mono text-[10px] px-2 py-0.5 bg-[#222222] text-[#FDFCFB]/70 border border-[#FDFCFB]/10">
            {targetServings} servings
          </span>
        </div>

        {/* Right: Screen wake-lock badge, Ingredients toggle, and Exit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Wake Lock Status */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1 text-[10px] font-sans font-bold uppercase tracking-wider border ${
              wakeLockActive
                ? "bg-[#C2410C]/20 text-[#C2410C] border-[#C2410C]/40"
                : "bg-[#222222] text-[#FDFCFB]/40 border-[#FDFCFB]/10"
            }`}
            title="Screen stays awake while in Cook Mode"
          >
            <SunMedium className="w-3.5 h-3.5" />
            <span>Screen Awake</span>
          </div>

          {/* Voice Narrator Button */}
          {"speechSynthesis" in window && (
            <button
              onClick={handleToggleSpeak}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest transition-colors ${
                isSpeaking
                  ? "bg-[#C2410C] text-white"
                  : "bg-[#222222] hover:bg-[#333333] text-[#FDFCFB] border border-[#FDFCFB]/15"
              }`}
              title="Read instruction aloud"
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isSpeaking ? "Mute" : "Narrate"}</span>
            </button>
          )}

          {/* Ingredients Drawer Button */}
          <button
            onClick={() => setShowIngredientsDrawer(!showIngredientsDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-sans text-[10px] font-black uppercase tracking-widest border transition-colors ${
              showIngredientsDrawer
                ? "bg-[#C2410C] text-white border-[#C2410C]"
                : "bg-[#222222] hover:bg-[#333333] text-[#FDFCFB] border-[#FDFCFB]/15"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Provisions</span>
          </button>

          {/* Close Cook Mode */}
          <button
            onClick={onClose}
            className="p-1.5 bg-[#222222] hover:bg-[#C2410C] text-[#FDFCFB] border border-[#FDFCFB]/15 transition-colors"
            title="Exit Cook Mode (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#111111] h-1.5 relative overflow-hidden">
        <div
          className="h-full bg-[#C2410C] transition-all duration-300"
          style={{
            width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%`,
          }}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Step Central View */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 max-w-4xl mx-auto w-full overflow-y-auto">
          <div>
            {/* Step Counter & Complete Checkbox */}
            <div className="flex items-center justify-between mb-6 sm:mb-10 pb-4 border-b border-[#FDFCFB]/10">
              <div className="flex items-center gap-3">
                <span className="font-sans text-[10px] font-black uppercase tracking-[0.3em] text-[#C2410C]">
                  Instruction {currentStep.stepNumber} / {recipe.steps.length}
                </span>
                {completedSteps.includes(currentStepIndex) && (
                  <span className="flex items-center gap-1 font-sans text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Executed
                  </span>
                )}
              </div>

              <button
                onClick={() => toggleStepCompleted(currentStepIndex)}
                className={`flex items-center gap-2 px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  completedSteps.includes(currentStepIndex)
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/50"
                    : "bg-[#222222] text-[#FDFCFB]/70 border-[#FDFCFB]/15 hover:border-[#FDFCFB]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{completedSteps.includes(currentStepIndex) ? "Completed" : "Mark Done"}</span>
              </button>
            </div>

            {/* Huge Cooking Instruction */}
            <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif italic text-[#FDFCFB] leading-tight tracking-tight">
              {currentStep.instruction}
            </p>

            {/* Chef Tip Callout */}
            {currentStep.tip && (
              <div className="mt-8 p-4 sm:p-5 bg-[#222222] border-l-2 border-[#C2410C] text-[#FDFCFB] flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
                <div>
                  <div className="font-sans text-[9px] font-black uppercase tracking-[0.25em] text-[#C2410C] mb-1">
                    Editorial Note
                  </div>
                  <div className="font-serif italic text-sm sm:text-base leading-relaxed text-[#FDFCFB]/90">
                    {currentStep.tip}
                  </div>
                </div>
              </div>
            )}

            {/* Step Timer Display (if step specifies a timer) */}
            {stepTimerMinutes > 0 && (
              <div className="mt-8 p-6 bg-[#222222] border border-[#FDFCFB]/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="stroke-[#333333]"
                        strokeWidth="5"
                        fill="transparent"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        className="stroke-[#C2410C] transition-all duration-300"
                        strokeWidth="5"
                        strokeDasharray={213}
                        strokeDashoffset={
                          213 -
                          (213 * stepTimerSeconds) / (stepTimerMinutes * 60)
                        }
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <span className="absolute font-mono text-sm font-bold text-[#C2410C]">
                      {Math.ceil(stepTimerSeconds / 60)}m
                    </span>
                  </div>

                  <div>
                    <div className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#FDFCFB]/50">
                      Step Timer
                    </div>
                    <div className="text-3xl sm:text-4xl font-mono font-bold text-[#FDFCFB] tracking-wider">
                      {formatTimer(stepTimerSeconds)}
                    </div>
                    {stepTimerSeconds === 0 && (
                      <div className="font-sans text-[10px] uppercase tracking-wider text-[#C2410C] font-bold mt-0.5 animate-pulse">
                        Timer elapsed!
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 font-sans text-[11px] font-black uppercase tracking-widest transition-colors ${
                      isTimerRunning
                        ? "bg-[#C2410C] text-white"
                        : "bg-[#FDFCFB] hover:bg-[#C2410C] hover:text-white text-[#1A1A1A]"
                    }`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isTimerRunning ? "Pause" : "Start Timer"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsTimerRunning(false);
                      setStepTimerSeconds(stepTimerMinutes * 60);
                    }}
                    className="p-3 bg-[#1A1A1A] hover:bg-[#333333] text-[#FDFCFB] border border-[#FDFCFB]/20 transition-colors"
                    title="Reset Timer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Step Navigation Controls */}
          <div className="pt-8 border-t border-[#FDFCFB]/10 mt-10 flex items-center justify-between gap-4">
            <button
              onClick={handlePrevStep}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-2 px-5 py-3 font-sans text-[11px] font-black uppercase tracking-widest border transition-all ${
                currentStepIndex === 0
                  ? "opacity-20 cursor-not-allowed border-[#FDFCFB]/10 text-[#FDFCFB]/30"
                  : "bg-[#222222] hover:bg-[#333333] border-[#FDFCFB]/20 text-[#FDFCFB]"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Quick Step Indicators */}
            <div className="hidden sm:flex items-center gap-2">
              {recipe.steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStepIndex(idx)}
                  className={`h-2 transition-all ${
                    idx === currentStepIndex
                      ? "bg-[#C2410C] w-6"
                      : completedSteps.includes(idx)
                      ? "bg-emerald-500 w-2"
                      : "bg-[#333333] w-2 hover:bg-[#555555]"
                  }`}
                  title={`Jump to step ${idx + 1}`}
                />
              ))}
            </div>

            {currentStepIndex < recipe.steps.length - 1 ? (
              <button
                onClick={handleNextStep}
                className="flex items-center gap-2 px-7 py-3 font-sans text-[11px] font-black uppercase tracking-widest bg-[#C2410C] hover:bg-[#a3360a] text-white transition-colors"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-7 py-3 font-sans text-[11px] font-black uppercase tracking-widest bg-[#FDFCFB] hover:bg-[#C2410C] hover:text-white text-[#1A1A1A] transition-colors"
              >
                <span>Complete Recipe</span>
              </button>
            )}
          </div>
        </div>

        {/* Sliding Pinned Ingredients Drawer */}
        {showIngredientsDrawer && (
          <div className="w-80 sm:w-96 bg-[#181818] border-l border-[#FDFCFB]/10 flex flex-col shadow-2xl z-20 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-[#FDFCFB]/10 flex items-center justify-between">
              <div>
                <h3 className="font-serif italic font-bold text-[#FDFCFB] text-base">
                  Ingredients Spec
                </h3>
                <p className="font-sans text-[10px] uppercase tracking-wider text-[#FDFCFB]/50">
                  Scaled for {targetServings} servings
                </p>
              </div>
              <button
                onClick={() => setShowIngredientsDrawer(false)}
                className="p-1 hover:bg-[#282828] text-[#FDFCFB]/60 hover:text-[#FDFCFB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {recipe.ingredients.map((ing) => {
                const scaled = scaleAmount(ing.amount, recipe.servings, targetServings);
                const amountStr = formatAmount(scaled);

                return (
                  <div
                    key={ing.id}
                    className="p-3 bg-[#222222] border border-[#FDFCFB]/10 flex items-start gap-3"
                  >
                    <input
                      type="checkbox"
                      id={`ing-${ing.id}`}
                      className="mt-1 w-4 h-4 rounded-none border-[#FDFCFB]/30 bg-[#1A1A1A] text-[#C2410C] focus:ring-0"
                    />
                    <label
                      htmlFor={`ing-${ing.id}`}
                      className="text-xs text-[#FDFCFB]/90 select-none cursor-pointer flex-1 font-sans"
                    >
                      <span className="font-mono font-bold text-[#C2410C]">
                        {amountStr} {ing.unit}{" "}
                      </span>
                      <span className="font-medium">{ing.name}</span>
                      {ing.notes && (
                        <span className="text-[#FDFCFB]/40 block text-[10px] font-serif italic mt-0.5">
                          ({ing.notes})
                        </span>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
