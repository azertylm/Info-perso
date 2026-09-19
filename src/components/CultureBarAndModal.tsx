import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Palette,
  Film,
  Landmark,
  Theater,
  BookOpen,
  Music,
  Sliders,
  Sparkles,
  Check,
  X,
  ExternalLink,
  Bookmark,
  Layers,
  Zap,
  Radio,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { NewsArticle } from "../types";

export interface CultureShortcut {
  id: string;
  label: string;
  emoji: string;
  badge: string;
  tag: string;
  matchTags: string[];
  desc: string;
}

export const CULTURE_SHORTCUTS: CultureShortcut[] = [
  {
    id: "cinema",
    label: "Cinéma & Pop Culture",
    emoji: "🎬",
    badge: "Dikkenek 20 ans",
    tag: "Cinéma",
    matchTags: ["Cinéma", "Pop Culture", "Dikkenek", "Film", "Comédie"],
    desc: "Comédies cultes, projections sur la place Poelaert, tournages et cinéma populaire"
  },
  {
    id: "musees",
    label: "Musées & Patrimoine",
    emoji: "🏛️",
    badge: "Expos & Orsay",
    tag: "Musées",
    matchTags: ["Musées", "Patrimoine", "Expositions", "Beaux-Arts", "Peinture"],
    desc: "Grandes rétrospectives, chefs-d'œuvre impressionnistes, trésors historiques et musées"
  },
  {
    id: "theatre",
    label: "Théâtre & Scène",
    emoji: "🎭",
    badge: "Avignon & Spectacles",
    tag: "Théâtre",
    matchTags: ["Théâtre", "Spectacle", "Scène", "Humour", "Comédie", "Opéra"],
    desc: "Spectacle vivant, dramaturgie contemporaine, pièces satiriques et scènes nationales"
  },
  {
    id: "litterature",
    label: "Littérature & BD",
    emoji: "📚",
    badge: "9e Art & Romans",
    tag: "Littérature",
    matchTags: ["Littérature", "BD", "Livres", "Roman", "Bande Dessinée"],
    desc: "Bande dessinée franco-belge, romans de rentrée littéraire et narration graphique"
  },
  {
    id: "musique",
    label: "Musique & Scènes Culte",
    emoji: "🎸",
    badge: "Live & Vinyles",
    tag: "Musique",
    matchTags: ["Musique", "Concert", "Rock", "Légendes", "Vinyles"],
    desc: "Renaissance du disque vinyle, légendes de la scène live et albums anthologiques"
  }
];

interface CultureBarAndModalProps {
  isDark?: boolean;
  theme?: string;
  activeCultureShortcut: string | null;
  onSelectShortcut: (shortcutId: string | null) => void;
  cultureBoostActive: boolean;
  onToggleCultureBoost: () => void;
  cultureWeight: number;
  onUpdateCultureWeight: (weight: number) => void;
  showModal: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  articles: NewsArticle[];
  onOpenArticle: (article: NewsArticle) => void;
  savedIds: Set<number>;
  onToggleSave: (id: number) => void;
  onApplyCulturePack: () => void;
  onNotify: (msg: string) => void;
}

export const CultureBarAndModal: React.FC<CultureBarAndModalProps> = ({
  isDark = true,
  theme = "sobre",
  activeCultureShortcut,
  onSelectShortcut,
  cultureBoostActive,
  onToggleCultureBoost,
  cultureWeight,
  onUpdateCultureWeight,
  showModal,
  onOpenModal,
  onCloseModal,
  articles,
  onOpenArticle,
  savedIds,
  onToggleSave,
  onApplyCulturePack,
  onNotify
}) => {
  const isFun = theme === "fun";

  // Find Dikkenek article if present in feed
  const dikkenekArticle = articles.find(
    (a) =>
      a.title.toLowerCase().includes("dikkenek") ||
      (a.tags || []).some((t) => t.toLowerCase() === "dikkenek")
  );

  // Count articles per shortcut
  const getArticleCountForShortcut = (shortcut: CultureShortcut) => {
    return articles.filter((art) => {
      const matchesTag = (art.tags || []).some((t) =>
        shortcut.matchTags.some((mt) => mt.toLowerCase() === t.toLowerCase())
      );
      const matchesText = `${art.title} ${art.summary || ""}`
        .toLowerCase()
        .includes(shortcut.tag.toLowerCase());
      return matchesTag || (art.category === "Culture" && matchesText);
    }).length;
  };

  const activeShortcutObj = CULTURE_SHORTCUTS.find(
    (s) => s.id === activeCultureShortcut
  );

  return (
    <>
      {/* 1. HORIZONTAL STRIP: 5 SHORTCUTS + REGLAGE BUTTON */}
      <div
        className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
          isFun
            ? "border-3 border-black bg-rose-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black"
            : isDark
            ? "border-rose-500/30 bg-rose-950/20 text-rose-100 shadow-xs"
            : "border-rose-200 bg-rose-50/70 text-rose-950 shadow-xs"
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 pb-2 border-b border-rose-500/20">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <div
              className={`p-1.5 rounded-xl shrink-0 flex items-center justify-center ${
                isFun
                  ? "bg-white border-2 border-black"
                  : isDark
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                  : "bg-rose-100 text-rose-700 border border-rose-300"
              }`}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                Art &amp; Culture : 5 Raccourcis &amp; Réglages
              </span>
              {activeCultureShortcut && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold animate-pulse">
                  Filtre actif : {activeShortcutObj?.label}
                </span>
              )}
              {cultureBoostActive && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-extrabold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  Boost Curateur (+100%)
                </span>
              )}
            </div>
          </div>

          {/* Action buttons: Réglages Culture & Curateur Boost */}
          <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
            <button
              onClick={onToggleCultureBoost}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                cultureBoostActive
                  ? isFun
                    ? "bg-yellow-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-400 shadow-xs"
                  : isDark
                  ? "bg-slate-900/60 hover:bg-slate-850 text-slate-300 border-slate-700 hover:text-white"
                  : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
              }`}
              title="Activer la priorité maximale pour les nouvelles artistiques et culturelles"
            >
              <Zap
                className={`w-3.5 h-3.5 ${
                  cultureBoostActive ? "fill-current text-white" : "text-amber-400"
                }`}
              />
              <span>{cultureBoostActive ? "Curateur Actif" : "Boost Culture"}</span>
            </button>

            <button
              onClick={onOpenModal}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
                isFun
                  ? "bg-white text-black border-2 border-black hover:bg-yellow-200"
                  : isDark
                  ? "bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border-rose-500/40"
                  : "bg-white hover:bg-rose-50 text-rose-800 border-rose-300"
              }`}
              title="Personnaliser les 5 raccourcis et réglages culturels"
            >
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              <span>Réglages Art &amp; Culture</span>
            </button>
          </div>
        </div>

        {/* 5 SHORTCUT PILLS */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2.5 pb-0.5">
          {CULTURE_SHORTCUTS.map((shortcut) => {
            const isSelected = activeCultureShortcut === shortcut.id;
            const count = getArticleCountForShortcut(shortcut);

            return (
              <button
                key={shortcut.id}
                onClick={() => {
                  if (isSelected) {
                    onSelectShortcut(null);
                    onNotify("🔄 Filtre culturel désactivé.");
                  } else {
                    onSelectShortcut(shortcut.id);
                    onNotify(
                      `${shortcut.emoji} Raccourci activé : « ${shortcut.label} »`
                    );
                  }
                }}
                className={`compact-action-btn px-2.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer border flex items-center gap-1.5 shadow-xs ${
                  isSelected
                    ? isFun
                      ? "bg-yellow-300 text-black border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-102"
                      : "bg-rose-600 text-white border-rose-400 shadow-md shadow-rose-600/30 scale-102"
                    : isDark
                    ? "bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/80 hover:border-rose-500/50"
                    : "bg-white hover:bg-rose-50/80 text-slate-800 border-rose-200 hover:border-rose-400"
                }`}
                title={`${shortcut.label} : ${shortcut.desc}`}
              >
                <span className="text-sm">{shortcut.emoji}</span>
                <span className="font-bold">{shortcut.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isSelected
                      ? "bg-black/30 text-white"
                      : isDark
                      ? "bg-slate-800 text-rose-300"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {shortcut.badge}
                </span>
                {count > 0 && (
                  <span
                    className={`text-[9px] px-1 rounded-full font-bold ${
                      isSelected
                        ? "bg-white text-rose-700"
                        : isDark
                        ? "bg-rose-500/20 text-rose-300"
                        : "bg-slate-200 text-slate-750"
                    }`}
                  >
                    {count}
                  </span>
                )}
                {isSelected && <X className="w-3 h-3 ml-0.5 opacity-80" />}
              </button>
            );
          })}
        </div>

        {/* CULTURAL FOCUS BANNER WHEN ACTIVE */}
        {activeShortcutObj && (
          <div
            className={`mt-2 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between gap-2 ${
              isDark
                ? "bg-rose-950/40 border border-rose-500/30 text-rose-200"
                : "bg-rose-100/70 border border-rose-300 text-rose-900"
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">
                {activeShortcutObj.desc} (mots-clés : {activeShortcutObj.matchTags.join(", ")})
              </span>
            </div>
            <button
              onClick={() => onSelectShortcut(null)}
              className="text-[11px] underline font-semibold hover:opacity-80 shrink-0 cursor-pointer"
            >
              Afficher tout le flux
            </button>
          </div>
        )}
      </div>

      {/* 2. DEDICATED MODAL: RÉGLAGES & PERSONNALISATION ART & CULTURE */}
      {showModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={onCloseModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-2xl max-h-[85dvh] sm:max-h-[88vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-all ${
              isFun
                ? "bg-white border-4 border-black text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                : isDark
                ? "bg-slate-900 border-rose-500/40 text-slate-100 shadow-rose-950/50"
                : "bg-white border-rose-200 text-slate-900 shadow-rose-100"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${
                isFun
                  ? "bg-rose-300 border-black"
                  : isDark
                  ? "bg-slate-950/80 border-rose-500/30"
                  : "bg-rose-50 border-rose-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    isFun
                      ? "bg-white border-2 border-black"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  <Palette className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                    Réglages &amp; Raccourcis Art &amp; Culture
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold uppercase">
                      5 Raccourcis Dédiés
                    </span>
                  </h3>
                  <p className="text-xs opacity-75">
                    Configurez votre niveau d'appétence culturelle, vos sources artistiques et accédez aux événements cultes.
                  </p>
                </div>
              </div>
              <button
                onClick={onCloseModal}
                className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto scrollbar space-y-5 text-xs sm:text-sm flex-1 min-h-0">
              {/* SECTION 1: CURATEUR ART & CULTURE (ALGO BOOST & SLIDER) */}
              <div
                className={`p-4 rounded-xl border space-y-3.5 ${
                  isDark
                    ? "bg-slate-950/50 border-slate-800"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <div>
                      <h4 className="font-bold text-sm">
                        Curateur Culturel &amp; Boost Algorithmique
                      </h4>
                      <p className="text-xs opacity-70">
                        Priorise l'actualité artistique, les rétrospectives, le cinéma culte et les expositions.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onToggleCultureBoost();
                      onNotify(
                        cultureBoostActive
                          ? "Mode Curateur Culture désactivé."
                          : "✨ Mode Curateur Art & Culture activé : priorité maximale aux récits culturels !"
                      );
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border ${
                      cultureBoostActive
                        ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30"
                        : isDark
                        ? "bg-slate-800 text-slate-300 border-slate-700 hover:text-white"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 ${
                        cultureBoostActive ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span>
                      {cultureBoostActive ? "Activé (+100%)" : "Activer le Boost"}
                    </span>
                  </button>
                </div>

                {/* Culture Weight Slider */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                      Pondération de la catégorie Culture :
                    </span>
                    <span className="font-bold text-rose-400 font-mono">
                      Niveau {cultureWeight}/5{" "}
                      {cultureWeight >= 4
                        ? "(Priorité forte)"
                        : cultureWeight === 3
                        ? "(Neutre)"
                        : "(Réduite)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={cultureWeight}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateCultureWeight(val);
                      onNotify(
                        `⚖️ Pondération Culture ajustée au niveau ${val}/5 dans votre algorithme.`
                      );
                    }}
                    className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 (Discret)</span>
                    <span>3 (Équilibré)</span>
                    <span>5 (Omniprésent)</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DIKKENEK 20 ANS SPECIAL HIGHLIGHT */}
              {dikkenekArticle && (
                <div
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 ${
                    isDark
                      ? "bg-amber-950/20 border-amber-500/40 text-amber-100"
                      : "bg-amber-50 border-amber-300 text-amber-950"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 border border-amber-500/30 text-lg">
                      🎬
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-500/30 text-amber-300 uppercase">
                          Événement Culte Nostalgie
                        </span>
                        <span className="text-xs font-bold">
                          Place Poelaert Bruxelles
                        </span>
                      </div>
                      <h4 className="font-bold text-xs sm:text-sm mt-0.5 line-clamp-1">
                        {dikkenekArticle.title}
                      </h4>
                      <p className="text-[11px] opacity-80 mt-0.5 line-clamp-2">
                        {dikkenekArticle.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        onToggleSave(dikkenekArticle.id);
                        onNotify(
                          savedIds.has(dikkenekArticle.id)
                            ? "Article retiré des favoris."
                            : "⭐ Article Dikkenek sauvegardé dans vos favoris !"
                        );
                      }}
                      className="p-2 rounded-xl border border-amber-500/40 hover:bg-amber-500/20 transition-all cursor-pointer"
                      title="Sauvegarder cet article"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          savedIds.has(dikkenekArticle.id)
                            ? "fill-amber-400 text-amber-400"
                            : "text-amber-300"
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => {
                        onCloseModal();
                        onOpenArticle(dikkenekArticle);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
                    >
                      <span>Lire l'article</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* SECTION 3: LES 5 RACCOURCIS CULTURELS EN DÉTAIL */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-sm flex items-center justify-between">
                  <span>Les 5 Raccourcis Culturels</span>
                  <span className="text-xs font-normal opacity-70">
                    Cliquez sur un raccourci pour filtrer immédiatement le flux
                  </span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {CULTURE_SHORTCUTS.map((shortcut) => {
                    const isSelected = activeCultureShortcut === shortcut.id;
                    const count = getArticleCountForShortcut(shortcut);

                    return (
                      <div
                        key={shortcut.id}
                        className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? isDark
                              ? "bg-rose-950/40 border-rose-500 text-white"
                              : "bg-rose-100/90 border-rose-400 text-rose-950"
                            : isDark
                            ? "bg-slate-950/40 border-slate-800 hover:border-slate-700"
                            : "bg-slate-50 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs flex items-center gap-1.5">
                              <span className="text-base">{shortcut.emoji}</span>
                              {shortcut.label}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                isSelected
                                  ? "bg-rose-500 text-white"
                                  : isDark
                                  ? "bg-slate-800 text-rose-300"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {shortcut.badge}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-75 mt-1 line-clamp-2">
                            {shortcut.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-800/30">
                          <span className="text-[10px] opacity-60">
                            {count} dépêche{count > 1 ? "s" : ""} disponible{count > 1 ? "s" : ""}
                          </span>
                          <button
                            onClick={() => {
                              if (isSelected) {
                                onSelectShortcut(null);
                                onNotify("🔄 Filtre culturel désactivé.");
                              } else {
                                onSelectShortcut(shortcut.id);
                                onCloseModal();
                                onNotify(
                                  `${shortcut.emoji} Raccourci activé : « ${shortcut.label} »`
                                );
                              }
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? "bg-rose-500 text-white hover:bg-rose-400"
                                : isDark
                                ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                                : "bg-white hover:bg-slate-200 text-slate-800 border border-slate-300"
                            }`}
                          >
                            {isSelected ? "Filtre Actif (✕)" : "Activer"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4: FLUX RSS CULTURELS & PACK 1-CLIC */}
              <div
                className={`p-3.5 rounded-xl border space-y-2.5 ${
                  isDark
                    ? "bg-slate-950/40 border-slate-800"
                    : "bg-slate-100/70 border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="font-bold text-xs flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-rose-400" />
                      Pack Thématique « Art, Culture &amp; Pop Culture »
                    </h5>
                    <p className="text-[11px] opacity-70">
                      Active d'un seul clic tous les centres d'intérêt artistiques et culturels dans votre profil sémantique.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onApplyCulturePack();
                      onCloseModal();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold text-xs shrink-0 cursor-pointer shadow-md shadow-rose-600/20"
                  >
                    Appliquer le Pack 1-Clic
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] opacity-80">
                  <span className="font-semibold text-rose-400">Sources intégrées :</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Nostalgie Belgique
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    France Culture
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Télérama Scènes &amp; Cinéma
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Le Monde &amp; Le Figaro Culture
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`px-5 py-3 border-t shrink-0 flex items-center justify-between ${
                isDark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <button
                onClick={() => {
                  onSelectShortcut(null);
                  onNotify("Tous les filtres culturels ont été réinitialisés.");
                }}
                className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Réinitialiser la sélection
              </button>
              <button
                onClick={onCloseModal}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Terminer
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
