import React, { useState, useEffect } from "react";
import { ShieldCheck, Cpu, Cloud, Sparkles } from "lucide-react";
import { getStoredAiProvider, AiProviderMode } from "../services/aiService";

interface SovereignStatusBadgeProps {
  onClick: () => void;
  isDark?: boolean;
}

export default function SovereignStatusBadge({ onClick, isDark = true }: SovereignStatusBadgeProps) {
  const [provider, setProvider] = useState<AiProviderMode>(getStoredAiProvider());

  useEffect(() => {
    const checkProvider = () => {
      setProvider(getStoredAiProvider());
    };
    window.addEventListener("storage", checkProvider);
    const interval = setInterval(checkProvider, 2500);
    return () => {
      window.removeEventListener("storage", checkProvider);
      clearInterval(interval);
    };
  }, []);

  const getBadgeConfig = () => {
    if (provider === "hybrid_mistral") {
      return {
        label: "IA Souveraine (Hybride)",
        sublabel: "Local + Mistral EU",
        dotColor: "bg-emerald-400 animate-pulse",
        borderColor: "border-emerald-500/30",
        bgColor: "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
        icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" />
      };
    }
    if (provider === "local") {
      return {
        label: "IA 100% Locale",
        sublabel: "On-Premise",
        dotColor: "bg-emerald-400",
        borderColor: "border-emerald-500/30",
        bgColor: "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20",
        icon: <Cpu className="w-3.5 h-3.5 text-emerald-400" />
      };
    }
    if (provider === "mistral") {
      return {
        label: "Mistral Cloud EU",
        sublabel: "Paris / Europe",
        dotColor: "bg-cyan-400",
        borderColor: "border-cyan-500/30",
        bgColor: "bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20",
        icon: <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
      };
    }
    // Default: Gemini (Phase 1 Prototypage)
    return {
      label: "Traitement Sécurisé",
      sublabel: "Gemini / Alphabette",
      dotColor: "bg-indigo-400",
      borderColor: "border-indigo-500/30",
      bgColor: "bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20",
      icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
    };
  };

  const config = getBadgeConfig();

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 landscape:py-0.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer shadow-xs ${config.borderColor} ${config.bgColor}`}
      title="Architecture IA Souveraine ALPHABETTE (Valentin RICHAUD) - Cliquer pour voir les 3 phases et l'état des moteurs"
    >
      {config.icon}
      <span className="hidden xl:inline font-bold">{config.label}</span>
      <span className="xl:hidden inline font-bold">Souverain</span>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
    </button>
  );
}
