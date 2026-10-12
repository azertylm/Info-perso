import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { getQuotaStatus, QuotaStatus } from "../lib/quotaManager";

interface AlphabetteNavbarProps {
  onOpenPricing: () => void;
  onOpenKeyring: () => void;
  themeMode?: "light" | "dark";
  activeApp?: string;
}

export const ALPHABETTE_APPS = [
  { id: "proxilien", name: "Proxilien", subtitle: "Proximité & Artisans", icon: "📍" },
  { id: "infoperso", name: "Info Perso", subtitle: "Actualité & Synthèse IA", icon: "📰", current: true },
  { id: "focusnews", name: "Focus News", subtitle: "Veille & Décryptage", icon: "🎯" },
  { id: "loeildelatelier", name: "L'Œil de l'Atelier", subtitle: "Gestion & Rentabilité", icon: "🏺" },
  { id: "papierpapier", name: "Papier Papier", subtitle: "Édition & Rédaction", icon: "✍️" },
  { id: "iadebat", name: "IA Débat", subtitle: "Contradiction & Pensée", icon: "⚖️" },
];

export default function AlphabetteNavbar({
  onOpenPricing,
  onOpenKeyring,
  themeMode = "dark",
  activeApp = "infoperso"
}: AlphabetteNavbarProps) {
  const [quota, setQuota] = useState<QuotaStatus>(getQuotaStatus);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  useEffect(() => {
    const update = () => setQuota(getQuotaStatus());
    window.addEventListener("alphabette_quota_updated", update);
    const interval = setInterval(update, 5000);
    return () => {
      window.removeEventListener("alphabette_quota_updated", update);
      clearInterval(interval);
    };
  }, []);

  const isDark = themeMode === "dark";

  return (
    <div
      className={`w-full border-b text-xs select-none transition-colors ${
        isDark
          ? "bg-slate-950/95 border-slate-800 text-zinc-300"
          : "bg-slate-100/95 border-slate-200 text-slate-700"
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        {/* Bouquet Brand & Links */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <span className="font-black tracking-wider uppercase text-[10px] sm:text-xs text-indigo-400 flex items-center gap-1 mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block" />
            Alphabette
          </span>

          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5">
            {ALPHABETTE_APPS.map((app) => {
              const isCurrent = app.id === activeApp || app.current;
              return (
                <button
                  key={app.id}
                  onClick={() => {
                    if (!isCurrent) {
                      onOpenPricing();
                    }
                  }}
                  title={`${app.name} — ${app.subtitle} (Bouquet Alphabette 40 €/an)`}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                    isCurrent
                      ? isDark
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-xs font-bold"
                        : "bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold"
                      : isDark
                        ? "hover:bg-slate-900 text-zinc-400 hover:text-zinc-200"
                        : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span className="text-[12px]">{app.icon}</span>
                  <span className="hidden md:inline">{app.name}</span>
                  {isCurrent && (
                    <span className="w-1 h-1 rounded-full bg-emerald-400 inline-block ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quota & Access Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 text-[11px]">
          {quota.isSubscribed ? (
            <span
              onClick={onOpenKeyring}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold cursor-pointer hover:bg-emerald-500/20"
              title="Abonnement Actif : Requêtes illimitées sur votre clé API (BYOK)"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Abonné (Illimité BYOK)</span>
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span
                onClick={onOpenPricing}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold cursor-pointer transition-all ${
                  quota.isQuotaExceeded
                    ? "bg-amber-500/15 border-amber-500/40 text-amber-400 animate-pulse"
                    : isDark
                      ? "bg-slate-900 border-zinc-800 text-zinc-300 hover:border-zinc-700"
                      : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
                title={
                  quota.isTrial
                    ? `Essai 7 jours : ${quota.remaining} requêtes offertes restantes aujourd'hui`
                    : `Palier offert : ${quota.remaining} requêtes restantes aujourd'hui`
                }
              >
                <span className="text-[10px] text-zinc-400 hidden lg:inline">Quota :</span>
                <span className={quota.isQuotaExceeded ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                  {quota.dailyCount}/{quota.dailyLimit}
                </span>
                <span className="text-[10px] opacity-75 hidden sm:inline">
                  ({quota.isTrial ? `${quota.trialDaysLeft}j essai` : "offert"})
                </span>
              </span>

              <button
                onClick={onOpenPricing}
                className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/30 font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[11px]">Pass 15€/an</span>
              </button>
            </div>
          )}

          {/* Trousseau API direct button */}
          <button
            onClick={onOpenKeyring}
            className={`p-1 sm:px-2 sm:py-0.5 rounded-md border flex items-center gap-1 transition-all cursor-pointer ${
              isDark
                ? "bg-slate-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                : "bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            title="Panneau Trousseau API (Mistral, Google, OpenAI, Anthropic, DeepSeek, Grok) - Facturation au prix coûtant"
          >
            <Key className="w-3 h-3 text-indigo-400" />
            <span className="hidden md:inline font-medium">Trousseau API</span>
          </button>
        </div>
      </div>
    </div>
  );
}
