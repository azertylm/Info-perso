import React from "react";
import { FoldMode, FoldPosture } from "../lib/useFoldable";
import {
  BookOpen,
  Maximize2,
  Smartphone,
  Sparkles,
  Split,
  Laptop,
  ShieldCheck,
  ChevronDown
} from "lucide-react";

interface FoldableBarProps {
  foldMode: FoldMode;
  activePosture: FoldPosture;
  isFoldableDetected: boolean;
  hingeGuard: boolean;
  onSetFoldMode: (mode: FoldMode) => void;
  onSetHingeGuard: (guard: boolean) => void;
  isDark: boolean;
  onNotify: (msg: string) => void;
}

export const FoldableBar: React.FC<FoldableBarProps> = ({
  foldMode,
  activePosture,
  isFoldableDetected,
  hingeGuard,
  onSetFoldMode,
  onSetHingeGuard,
  isDark,
  onNotify
}) => {
  const [isOpenMenu, setIsOpenMenu] = React.useState(false);

  const getPostureLabel = () => {
    switch (activePosture) {
      case "book":
        return "📖 Mode Livre (2 Volets)";
      case "flex":
        return "📐 Mode Pupitre (Flex)";
      case "compact":
        return "📱 Écran Externe Étroit";
      default:
        return "📱 Mode 1 Volet Standard";
    }
  };

  const getPostureBadgeColor = () => {
    switch (activePosture) {
      case "book":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      case "flex":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "compact":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      default:
        return isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="relative inline-block text-xs">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Main Trigger Button */}
        <button
          onClick={() => setIsOpenMenu(!isOpenMenu)}
          className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold transition-all cursor-pointer shadow-xs ${
            isDark
              ? "bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-slate-200"
              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-800"
          }`}
          title="Paramètres d'affichage pour smartphones pliants (Galaxy Z Fold, Pixel Fold, Z Flip)"
        >
          <Split className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden xs:inline">Pliant :</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${getPostureBadgeColor()}`}>
            {activePosture === "book" ? "Livre 2 Volets" : activePosture === "flex" ? "Pupitre Flex" : "Standard"}
          </span>
          {isFoldableDetected && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Écran pliant détecté" />
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpenMenu ? "rotate-180" : ""}`} />
        </button>

        {/* Quick Hinge Protection Indicator */}
        {activePosture === "book" && (
          <button
            onClick={() => {
              const next = !hingeGuard;
              onSetHingeGuard(next);
              onNotify(next ? "🛡️ Protection charnière activée (espacement central anti-pliure)" : "Protection charnière désactivée");
            }}
            className={`px-2 py-1 rounded-lg border text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-all ${
              hingeGuard
                ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                : isDark ? "bg-slate-800/60 text-slate-400 border-slate-700/60" : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
            title="Insérer un espacement central pour éviter que le texte ne soit sur la pliure de l'écran"
          >
            <ShieldCheck className="w-3 h-3" />
            <span className="hidden sm:inline">Charnière</span>
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpenMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpenMenu(false)}
          />
          <div
            className={`absolute left-0 mt-2 w-72 rounded-2xl border shadow-xl z-50 p-3 space-y-3 ${
              isDark
                ? "bg-slate-900 border-slate-700 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-slate-700/40">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-xs">Ergonomie Écran Pliant</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                Fold Engine
              </span>
            </div>

            <p className="text-[11px] opacity-75 leading-relaxed">
              Optimisé pour <strong>Galaxy Z Fold</strong>, <strong>Pixel Fold</strong> et <strong>Z Flip</strong>. Choisissez le mode d'affichage adapté à la posture de votre appareil :
            </p>

            <div className="space-y-1.5">
              {/* Option 1: Auto */}
              <button
                onClick={() => {
                  onSetFoldMode("auto");
                  onNotify("⚡ Détection automatique de la charnière activée !");
                  setIsOpenMenu(false);
                }}
                className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                  foldMode === "auto"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                    : isDark ? "hover:bg-slate-800 border-slate-800 text-slate-300" : "hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <div>
                    <div className="font-bold text-xs">Auto (Recommandé)</div>
                    <div className="text-[10px] opacity-80">S'adapte selon l'ouverture du téléphone</div>
                  </div>
                </div>
                {foldMode === "auto" && <span className="text-xs">✓</span>}
              </button>

              {/* Option 2: 2 Volets (Livre) */}
              <button
                onClick={() => {
                  onSetFoldMode("book");
                  onNotify("📖 Mode Livre (2 Volets côte à côte) forcé !");
                  setIsOpenMenu(false);
                }}
                className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                  foldMode === "book"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                    : isDark ? "hover:bg-slate-800 border-slate-800 text-slate-300" : "hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                  <div>
                    <div className="font-bold text-xs">Mode Livre (2 Volets)</div>
                    <div className="text-[10px] opacity-80">Flux à gauche (45%) + Article à droite (55%)</div>
                  </div>
                </div>
                {foldMode === "book" && <span className="text-xs">✓</span>}
              </button>

              {/* Option 3: Pupitre (Flex Tabletop) */}
              <button
                onClick={() => {
                  onSetFoldMode("flex");
                  onNotify("📐 Mode Pupitre (Flex / Tabletop) forcé !");
                  setIsOpenMenu(false);
                }}
                className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                  foldMode === "flex"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                    : isDark ? "hover:bg-slate-800 border-slate-800 text-slate-300" : "hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Laptop className="w-3.5 h-3.5 text-amber-300" />
                  <div>
                    <div className="font-bold text-xs">Mode Pupitre (Flex)</div>
                    <div className="text-[10px] opacity-80">Article en haut + Commandes tactiles en bas</div>
                  </div>
                </div>
                {foldMode === "flex" && <span className="text-xs">✓</span>}
              </button>

              {/* Option 4: 1 Volet Standard */}
              <button
                onClick={() => {
                  onSetFoldMode("single");
                  onNotify("📱 Mode classique 1 volet activé.");
                  setIsOpenMenu(false);
                }}
                className={`w-full p-2 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                  foldMode === "single"
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                    : isDark ? "hover:bg-slate-800 border-slate-800 text-slate-300" : "hover:bg-slate-100 border-slate-200 text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  <div>
                    <div className="font-bold text-xs">Classique (1 Volet)</div>
                    <div className="text-[10px] opacity-80">Défilement vertical standard</div>
                  </div>
                </div>
                {foldMode === "single" && <span className="text-xs">✓</span>}
              </button>
            </div>

            {/* Hinge Guard Switch */}
            <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
              <div>
                <div className="font-semibold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Protection charnière</span>
                </div>
                <div className="text-[10px] opacity-75">Évite le texte sur la pliure centrale</div>
              </div>
              <input
                type="checkbox"
                checked={hingeGuard}
                onChange={(e) => {
                  onSetHingeGuard(e.target.checked);
                  onNotify(e.target.checked ? "🛡️ Espacement central charnière activé" : "Espacement désactivé");
                }}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
