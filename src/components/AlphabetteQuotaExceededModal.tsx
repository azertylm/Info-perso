import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Sparkles,
  ShieldCheck,
  Key,
  X,
  ArrowRight,
  ExternalLink,
  Lock
} from "lucide-react";
import { getQuotaStatus, QuotaStatus } from "../lib/quotaManager";

interface AlphabetteQuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSubscribe: () => void;
  onOpenKeyring: () => void;
  themeMode?: "light" | "dark";
}

export default function AlphabetteQuotaExceededModal({
  isOpen,
  onClose,
  onOpenSubscribe,
  onOpenKeyring,
  themeMode = "dark"
}: AlphabetteQuotaExceededModalProps) {
  const [quota, setQuota] = useState<QuotaStatus>(getQuotaStatus);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setQuota(getQuotaStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const isDark = themeMode === "dark";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? "bg-slate-900 border-amber-500/30 text-white shadow-amber-950/30"
            : "bg-white border-amber-300 text-slate-900 shadow-xl"
        }`}
      >
        {/* Header with Warning Icon */}
        <div className="p-5 sm:p-6 border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-amber-400">
                  Quota Journalier Épuisé
                </h3>
                <p className="text-xs text-zinc-400">
                  {quota.isTrial
                    ? `Période d'essai (${quota.trialDaysLeft} j restants) : 20 requêtes / jour`
                    : "Palier offert standard : 5 requêtes / jour"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Status Box */}
          <div
            className={`p-4 rounded-xl border flex items-center justify-between ${
              isDark ? "bg-slate-950/60 border-zinc-800" : "bg-amber-50/60 border-amber-200"
            }`}
          >
            <div>
              <span className="text-xs text-zinc-400 block font-medium">Consommation du jour</span>
              <span className="text-xl font-black text-amber-400">
                {quota.dailyCount} / {quota.dailyLimit} requêtes
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3 text-amber-400" /> Réinitialisation dans
              </span>
              <span className="text-sm font-mono font-bold text-zinc-300">
                {quota.formattedTimeUntilReset}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Pour garantir une infrastructure pérenne, souveraine et sans publicité, le palier offert sur
            l'infrastructure interne Alphabette est limité à <strong>{quota.isTrial ? "20" : "5"} requêtes quotidiennes</strong>.
            La remise à zéro se fait automatiquement chaque nuit à minuit.
          </p>

          {/* Pricing reminder */}
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              isDark ? "bg-indigo-950/30 border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border-indigo-200 text-indigo-900"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Formules Annuelles Officielles ALPHABETTE (sans frais mensuels)</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              • <strong>Info Perso</strong> : 15 € TTC / an pour un accès autonome illimité.<br />
              • <strong>Pass ALPHABETTE</strong> : 40 € TTC / an pour l'ensemble du bouquet applicatif.
            </p>
          </div>

          {/* Action Options (Strictly the two options requested by user) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Option 1: Revenir demain */}
            <button
              onClick={onClose}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-zinc-300 border-zinc-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
              }`}
            >
              <Clock className="w-4 h-4 text-zinc-400" />
              Revenir demain
            </button>

            {/* Option 2: S'abonner pour débloquer l'illimité avec ma clé API */}
            <button
              onClick={() => {
                onClose();
                onOpenSubscribe();
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>S'abonner (Illimité BYOK)</span>
            </button>
          </div>

          {/* Direct Keyring shortcut if user already has an API key */}
          <div className="text-center pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenKeyring();
              }}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
              J'ai déjà une clé API (Mistral, Google, OpenAI...) : Ouvrir le Trousseau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
