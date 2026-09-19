import React, { useState, useMemo, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  Sliders,
  Filter,
  Bookmark,
  Wifi,
  TrendingUp,
  Tag,
  Plus,
  Trash2,
  X,
  SlidersHorizontal,
  Check,
  Star,
  Compass,
  Search,
  Save,
  Clock,
  ArrowRight,
  Layers,
  Sparkle,
  RotateCcw,
  Palette,
  Zap,
  Film
} from "lucide-react";
import { NewsArticle } from "../types";
import {
  DEFAULT_THEMATIC_PACKS,
  ThematicPack,
  getNextSuggestedWords,
  getTagsWithCounts,
  groupTagsByRubrique,
  normalizeKeyword,
  RelatedWord
} from "../lib/semanticExplorer";
import { CULTURE_SHORTCUTS } from "./CultureBarAndModal";

interface SettingsVoletProps {
  isOpen: boolean;
  onClose: () => void;
  // Theme styling
  theme?: string;
  isDark?: boolean;
  // Filters & State
  minScore: number;
  setMinScore: (val: number) => void;
  readingTimeFilter: "all" | "short" | "medium" | "long";
  setReadingTimeFilter: (val: "all" | "short" | "medium" | "long") => void;
  onlyBookmarks: boolean;
  setOnlyBookmarks: (val: boolean | ((prev: boolean) => boolean)) => void;
  bandwidthSaver: boolean;
  setBandwidthSaver: (val: boolean | ((prev: boolean) => boolean)) => void;
  // Algorithmic weights
  categoryWeights: Record<string, number>;
  updateCategoryWeight: (cat: string, weight: number) => void;
  tagWeights: Record<string, "boost" | "neutral" | "exclude">;
  updateTagWeight: (tag: string, val: "boost" | "neutral" | "exclude") => void;
  // Custom interests
  customInterests: string[];
  newInterestInput: string;
  setNewInterestInput: (val: string) => void;
  handleAddCustomInterest: () => void;
  handleDeleteCustomInterest: (interest: string) => void;
  handleGenerateCustomArticle: (interest: string) => void;
  isGeneratingCustom: string | null;
  // Bulk Generation & Reset
  handleBulkGenerateIAArticles: (forceFresh: boolean) => void;
  isBulkGenerating: boolean;
  handleResetToBaseline: () => void;
  handleResetAlgorithmicData: () => void;
  // Trends, Articles & Semantic Navigation
  articles?: NewsArticle[];
  trendingTags: string[];
  clickedTrendTag: string | null;
  setClickedTrendTag: (tag: string | null) => void;
  selectedTrendTags?: string[];
  setSelectedTrendTags?: React.Dispatch<React.SetStateAction<string[]>>;
  semanticTrail?: string[];
  setSemanticTrail?: React.Dispatch<React.SetStateAction<string[]>>;
  // Helpers
  onNotify: (msg: string) => void;
  activeFiltersCount: number;
  handleClearAllFilters: () => void;
}

export const SettingsVolet: React.FC<SettingsVoletProps> = ({
  isOpen,
  onClose,
  theme = "default",
  isDark = true,
  minScore,
  setMinScore,
  readingTimeFilter,
  setReadingTimeFilter,
  onlyBookmarks,
  setOnlyBookmarks,
  bandwidthSaver,
  setBandwidthSaver,
  categoryWeights,
  updateCategoryWeight,
  tagWeights,
  updateTagWeight,
  customInterests,
  newInterestInput,
  setNewInterestInput,
  handleAddCustomInterest,
  handleDeleteCustomInterest,
  handleGenerateCustomArticle,
  isGeneratingCustom,
  handleBulkGenerateIAArticles,
  isBulkGenerating,
  handleResetToBaseline,
  handleResetAlgorithmicData,
  articles = [],
  trendingTags,
  clickedTrendTag,
  setClickedTrendTag,
  selectedTrendTags = [],
  setSelectedTrendTags,
  semanticTrail = [],
  setSemanticTrail,
  onNotify,
  activeFiltersCount,
  handleClearAllFilters,
}) => {
  const [activeTab, setActiveTab] = useState<"themes" | "flux_ia" | "filters" | "algo">("themes");
  const [themesSubTab, setThemesSubTab] = useState<"rebond" | "culture" | "packs" | "nuage">("rebond");

  // Local search filter for tags
  const [tagSearchQuery, setTagSearchQuery] = useState("");
  const [tagGroupingMode, setTagGroupingMode] = useState<"rubriques" | "frequence">("rubriques");

  // Pinned tags (Solution 3: Favoris ⭐)
  const [pinnedTags, setPinnedTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("infoperso_pinned_tags");
      return saved ? JSON.parse(saved) : ["IA", "Europe", "Environnement"];
    } catch {
      return ["IA", "Europe", "Environnement"];
    }
  });

  // Recently explored tags (Solution 3: Récents 🕒)
  const [recentTags, setRecentTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("infoperso_recent_tags");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom user saved packs (Solution 2: Packs sauvegardés)
  const [customPacks, setCustomPacks] = useState<ThematicPack[]>(() => {
    try {
      const saved = localStorage.getItem("infoperso_custom_packs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newPackName, setNewPackName] = useState("");
  const [showSavePackModal, setShowSavePackModal] = useState(false);

  // Persistent settings option (Solution 5: Mémorisation automatique)
  const [rememberPreferences, setRememberPreferences] = useState<boolean>(() => {
    try {
      return localStorage.getItem("infoperso_remember_filters") === "true";
    } catch {
      return true;
    }
  });

  // Calculate article counts per tag
  const tagCountsMap = useMemo(() => getTagsWithCounts(articles), [articles]);

  // All unique tags available in the feed + defaults
  const allAvailableTags = useMemo(() => {
    const fromArticles = Array.from(tagCountsMap.keys());
    const merged = Array.from(new Set([...fromArticles, ...trendingTags]));
    return merged.sort((a, b) => (tagCountsMap.get(b) || 0) - (tagCountsMap.get(a) || 0));
  }, [tagCountsMap, trendingTags]);

  // Filtered tags for search
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery.trim()) return allAvailableTags;
    const query = normalizeKeyword(tagSearchQuery);
    return allAvailableTags.filter(t => normalizeKeyword(t).includes(query));
  }, [allAvailableTags, tagSearchQuery]);

  // Rubriques grouping
  const rubriques = useMemo(() => groupTagsByRubrique(filteredTags), [filteredTags]);

  // Dynamic next suggested words for the Semantic Rebound (user's primary request)
  const nextSuggestedWords = useMemo(() => {
    return getNextSuggestedWords(articles, semanticTrail, allAvailableTags);
  }, [articles, semanticTrail, allAvailableTags]);

  // Real-time calculation of how many articles match the current selection (unconditional hook)
  const matchingArticlesCount = useMemo(() => {
    if (!articles || articles.length === 0) return 20;
    return articles.filter(art => {
      if (selectedTrendTags && selectedTrendTags.length > 0) {
        const matches = selectedTrendTags.some(t => (art.tags || []).includes(t));
        if (!matches) return false;
      }
      if (semanticTrail && semanticTrail.length > 0) {
        const artText = `${art.title} ${art.summary} ${(art.tags || []).join(" ")}`.toLowerCase();
        const matches = semanticTrail.some(w => {
          const norm = normalizeKeyword(w);
          return (art.tags || []).some(t => normalizeKeyword(t).includes(norm)) || artText.includes(norm);
        });
        if (!matches) return false;
      }
      return true;
    }).length;
  }, [articles, selectedTrendTags, semanticTrail]);

  // Helper: toggle tag selection (Solution 1: multi-sélection)
  const handleToggleTag = (tag: string) => {
    if (!setSelectedTrendTags) {
      // Fallback to clickedTrendTag if multi-select not passed
      setClickedTrendTag(clickedTrendTag === tag ? null : tag);
      return;
    }

    const isAlready = selectedTrendTags.includes(tag);
    const updated = isAlready
      ? selectedTrendTags.filter(t => t !== tag)
      : [...selectedTrendTags, tag];

    setSelectedTrendTags(updated);

    // Keep clickedTrendTag synced for backward compatibility
    setClickedTrendTag(updated.length === 1 ? updated[0] : null);

    // Update recents
    if (!isAlready) {
      recordRecentTag(tag);
    }

    // Persist if enabled
    if (rememberPreferences) {
      try {
        localStorage.setItem("infoperso_selected_tags", JSON.stringify(updated));
      } catch {}
    }

    onNotify(isAlready ? `Mot-clé retiré : #${tag}` : `Mot-clé ajouté : #${tag}`);
  };

  // Helper: add to recent history
  const recordRecentTag = (tag: string) => {
    setRecentTags(prev => {
      const filtered = prev.filter(t => t !== tag);
      const next = [tag, ...filtered].slice(0, 8);
      try {
        localStorage.setItem("infoperso_recent_tags", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Helper: toggle pin/favorite (Solution 3)
  const handleTogglePin = (tag: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPinnedTags(prev => {
      const isPinned = prev.includes(tag);
      const next = isPinned ? prev.filter(t => t !== tag) : [...prev, tag];
      try {
        localStorage.setItem("infoperso_pinned_tags", JSON.stringify(next));
      } catch {}
      onNotify(isPinned ? `Épinglage retiré : #${tag}` : `⭐ Mot-clé épinglé en haut : #${tag}`);
      return next;
    });
  };

  // Helper: Semantic trail rebound click (The cascade / word-hop feature)
  const handleSemanticWordClick = (word: string) => {
    if (!setSemanticTrail) return;

    const normWord = normalizeKeyword(word);
    if (semanticTrail.some(step => normalizeKeyword(step) === normWord)) {
      // Already in trail, remove it
      handleRemoveSemanticStep(word);
      return;
    }

    const nextTrail = [...semanticTrail, word];
    setSemanticTrail(nextTrail);
    recordRecentTag(word);

    // Also activate it as a selected tag if it matches an actual tag
    const matchingTag = allAvailableTags.find(t => normalizeKeyword(t) === normWord);
    if (matchingTag && setSelectedTrendTags && !selectedTrendTags.includes(matchingTag)) {
      setSelectedTrendTags([...selectedTrendTags, matchingTag]);
    }

    if (rememberPreferences) {
      try {
        localStorage.setItem("infoperso_semantic_trail", JSON.stringify(nextTrail));
      } catch {}
    }

    onNotify(`Rebond sémantique : « ${word} » ajouté au fil d'exploration.`);
  };

  // Helper: remove a step in the semantic trail
  const handleRemoveSemanticStep = (wordToRemove: string) => {
    if (!setSemanticTrail) return;
    const norm = normalizeKeyword(wordToRemove);
    const nextTrail = semanticTrail.filter(w => normalizeKeyword(w) !== norm);
    setSemanticTrail(nextTrail);

    if (rememberPreferences) {
      try {
        localStorage.setItem("infoperso_semantic_trail", JSON.stringify(nextTrail));
      } catch {}
    }
    onNotify(`Étape « ${wordToRemove} » retirée du fil.`);
  };

  // Helper: Apply a thematic pack in 1 click (Solution 2)
  const handleApplyPack = (pack: ThematicPack) => {
    if (setSelectedTrendTags) {
      setSelectedTrendTags(pack.tags);
    }
    if (setSemanticTrail) {
      // Start semantic trail with the first key concept
      setSemanticTrail(pack.tags.slice(0, 2));
    }
    setClickedTrendTag(null);

    pack.tags.forEach(t => recordRecentTag(t));

    if (rememberPreferences) {
      try {
        localStorage.setItem("infoperso_selected_tags", JSON.stringify(pack.tags));
      } catch {}
    }
    onNotify(`Pack activé : ${pack.emoji} ${pack.name} (${pack.tags.length} mots-clés)`);
  };

  // Helper: Save current selection as a custom pack (Solution 2)
  const handleSaveCurrentAsPack = () => {
    const activeTags = Array.from(new Set([...selectedTrendTags, ...semanticTrail]));
    if (activeTags.length === 0) {
      onNotify("⚠️ Sélectionnez au moins un mot-clé avant d'enregistrer un pack.");
      return;
    }
    if (!newPackName.trim()) {
      onNotify("⚠️ Donnez un nom à votre pack personnel.");
      return;
    }

    const newPack: ThematicPack = {
      id: `custom_${Date.now()}`,
      name: newPackName.trim(),
      emoji: "⭐",
      description: `Créé par vous (${activeTags.join(", ")})`,
      tags: activeTags,
      isCustom: true
    };

    const updated = [newPack, ...customPacks];
    setCustomPacks(updated);
    try {
      localStorage.setItem("infoperso_custom_packs", JSON.stringify(updated));
    } catch {}

    setNewPackName("");
    setShowSavePackModal(false);
    onNotify(`Pack personnel « ${newPack.name} » enregistré avec succès !`);
  };

  // Helper: Delete custom pack
  const handleDeleteCustomPack = (packId: string) => {
    const updated = customPacks.filter(p => p.id !== packId);
    setCustomPacks(updated);
    try {
      localStorage.setItem("infoperso_custom_packs", JSON.stringify(updated));
    } catch {}
    onNotify("Pack supprimé.");
  };

  // Toggle remember preferences
  const handleToggleRemember = () => {
    const nextVal = !rememberPreferences;
    setRememberPreferences(nextVal);
    try {
      localStorage.setItem("infoperso_remember_filters", String(nextVal));
      if (!nextVal) {
        localStorage.removeItem("infoperso_selected_tags");
        localStorage.removeItem("infoperso_semantic_trail");
      } else {
        localStorage.setItem("infoperso_selected_tags", JSON.stringify(selectedTrendTags));
        localStorage.setItem("infoperso_semantic_trail", JSON.stringify(semanticTrail));
      }
    } catch {}
    onNotify(nextVal ? "✓ Vos préférences de filtres seront mémorisées." : "Préférences réinitialisées à chaque session.");
  };

  if (!isOpen) return null;

  const isSobre = theme === "monochrome" || theme === "journal";
  const isWarm = theme === "warm" || theme === "sepia";
  const isCyber = theme === "cyberpunk";
  const isFun = theme === "fun";

  const categories = ["Technologie", "IA", "Économie", "Politique", "Science", "Culture", "Sport", "Local"];

  const activeKeywordsCount = selectedTrendTags.length + (clickedTrendTag ? 1 : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isFun
            ? "bg-amber-50 border-4 border-black text-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            : isSobre
            ? isDark
              ? "bg-zinc-900 border-zinc-700 text-zinc-100"
              : "bg-white border-zinc-300 text-zinc-900 shadow-zinc-300"
            : isWarm
            ? isDark
              ? "bg-[#251f1c] border-[#443831] text-[#f4ecd8]"
              : "bg-[#faf6ee] border-[#dfd3c3] text-[#3d332a]"
            : isCyber
            ? "bg-zinc-950 border-cyan-500/50 text-cyan-400 font-mono shadow-[0_0_20px_rgba(6,182,212,0.2)]"
            : isDark
            ? "bg-slate-900 border-slate-700 text-slate-100"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-200"
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b ${
            isFun
              ? "border-black bg-cyan-300"
              : isSobre
              ? isDark ? "border-zinc-800 bg-zinc-900/90" : "border-zinc-200 bg-zinc-100/90"
              : isWarm
              ? isDark ? "border-[#443831] bg-[#1e1916]" : "border-[#dfd3c3] bg-[#f2ebd9]"
              : isCyber
              ? "border-cyan-500/40 bg-zinc-900"
              : isDark ? "border-slate-800 bg-slate-900/90" : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isFun ? "bg-white border-2 border-black" : "bg-cyan-500/10 text-cyan-400"}`}>
              <Sliders className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                Réglages, Mots-clés &amp; Personnalisation
                {activeFiltersCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500 text-white font-semibold">
                    {activeFiltersCount} actif{activeFiltersCount > 1 ? "s" : ""}
                  </span>
                )}
              </h3>
              <p className="text-xs opacity-75">
                Filtrage thématique par rebond sémantique, packs prêts à l'emploi et algorithme sur mesure.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SOLUTION 5: Persistent Active Filters Bar with 1-click Clear and Memorization */}
        {(activeKeywordsCount > 0 || semanticTrail.length > 0) && (
          <div className={`px-5 py-2.5 border-b flex flex-wrap items-center justify-between gap-2.5 text-xs ${
            isDark ? "bg-slate-950/60 border-slate-800" : "bg-slate-100/80 border-slate-200"
          }`}>
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="font-semibold text-slate-400 shrink-0">Filtres actifs :</span>

              {/* Semantic trail chips */}
              {semanticTrail.length > 0 && (
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="font-bold">Fil :</span>
                  <span className="truncate max-w-[200px]">{semanticTrail.join(" ➔ ")}</span>
                  <button
                    onClick={() => {
                      if (setSemanticTrail) setSemanticTrail([]);
                      onNotify("Fil sémantique effacé.");
                    }}
                    className="ml-1 hover:text-white cursor-pointer"
                    title="Effacer le parcours sémantique"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Individual selected tags */}
              {selectedTrendTags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium"
                >
                  #{tag}
                  <button
                    onClick={() => handleToggleTag(tag)}
                    className="hover:text-white cursor-pointer ml-0.5"
                    title="Retirer ce mot-clé"
                  >
                    ✕
                  </button>
                </span>
              ))}

              {clickedTrendTag && !selectedTrendTags.includes(clickedTrendTag) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-medium">
                  #{clickedTrendTag}
                  <button onClick={() => setClickedTrendTag(null)} className="hover:text-white cursor-pointer ml-0.5">✕</button>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-auto">
              {/* Remember checkbox */}
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-slate-200 select-none text-[11px]">
                <input
                  type="checkbox"
                  checked={rememberPreferences}
                  onChange={handleToggleRemember}
                  className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
                <span>Mémoriser mes choix</span>
              </label>

              <button
                onClick={() => {
                  handleClearAllFilters();
                  onClose();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                title="Réinitialiser tous les filtres et réafficher les 20 articles"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Retomber sur les 20 articles</span>
              </button>

              <button
                onClick={() => {
                  if (setSelectedTrendTags) setSelectedTrendTags([]);
                  if (setSemanticTrail) setSemanticTrail([]);
                  setClickedTrendTag(null);
                  try {
                    localStorage.removeItem("infoperso_selected_tags");
                    localStorage.removeItem("infoperso_semantic_trail");
                  } catch {}
                  onNotify("Filtres de mots-clés effacés.");
                }}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 hover:underline cursor-pointer"
              >
                Tout désélectionner
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div
          className={`flex border-b overflow-x-auto px-4 gap-1 ${
            isFun
              ? "border-black bg-amber-100"
              : isSobre
              ? isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-zinc-100"
              : isWarm
              ? isDark ? "border-[#443831] bg-[#221c19]" : "border-[#dfd3c3] bg-[#f5efe3]"
              : isCyber
              ? "border-cyan-500/30 bg-black/40"
              : isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
          }`}
        >
          <button
            onClick={() => setActiveTab("themes")}
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "themes"
                ? "border-cyan-500 text-cyan-500 font-bold"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            Mots-Clés &amp; Personnalisation
          </button>
          <button
            onClick={() => setActiveTab("flux_ia")}
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "flux_ia"
                ? "border-cyan-500 text-cyan-500 font-bold"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Flux &amp; IA
          </button>
          <button
            onClick={() => setActiveTab("filters")}
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "filters"
                ? "border-cyan-500 text-cyan-500 font-bold"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres &amp; Lecture
          </button>
          <button
            onClick={() => setActiveTab("algo")}
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "algo"
                ? "border-cyan-500 text-cyan-500 font-bold"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Algorithme
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: THÈMES & PERSONNALISATION (CORE RESTRUCTURE) */}
          {activeTab === "themes" && (
            <div className="space-y-5">
              {/* Sub-tabs for Themes & Keywords */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setThemesSubTab("rebond")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      themesSubTab === "rebond"
                        ? "bg-cyan-500 text-white shadow-xs"
                        : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Rebond Sémantique en Cascade
                  </button>
                  <button
                    onClick={() => setThemesSubTab("culture")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      themesSubTab === "culture"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/60"
                    }`}
                  >
                    <Palette className="w-3.5 h-3.5" />
                    🎨 Art &amp; Culture (5 Raccourcis &amp; Réglages)
                  </button>
                  <button
                    onClick={() => setThemesSubTab("packs")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      themesSubTab === "packs"
                        ? "bg-cyan-500 text-white shadow-xs"
                        : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Packs Thématiques en 1 clic
                  </button>
                  <button
                    onClick={() => setThemesSubTab("nuage")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      themesSubTab === "nuage"
                        ? "bg-cyan-500 text-white shadow-xs"
                        : "bg-slate-800/60 text-slate-300 hover:bg-slate-700/60"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    Tous les Mots-clés ({allAvailableTags.length})
                  </button>
                </div>

                {/* Quick Save Selection as Pack button */}
                <button
                  onClick={() => setShowSavePackModal(true)}
                  disabled={selectedTrendTags.length === 0 && semanticTrail.length === 0}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                  title="Enregistrer la sélection actuelle comme pack personnel"
                >
                  <Save className="w-3.5 h-3.5" />
                  Sauvegarder ma sélection
                </button>
              </div>

              {/* SAVE PACK MODAL DIALOG */}
              {showSavePackModal && (
                <div className="p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
                      <Save className="w-3.5 h-3.5 text-indigo-400" />
                      Créer un nouveau Pack Thématique personnel
                    </span>
                    <button onClick={() => setShowSavePackModal(false)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Ce pack regroupera vos mots-clés actifs : <strong className="text-indigo-300">{Array.from(new Set([...selectedTrendTags, ...semanticTrail])).join(", ") || "Aucun"}</strong>
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPackName}
                      onChange={(e) => setNewPackName(e.target.value)}
                      placeholder="Nom de votre pack (ex: Ma veille quotidienne, Tech & Climat...)"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-900 text-white outline-none focus:border-indigo-400"
                    />
                    <button
                      onClick={handleSaveCurrentAsPack}
                      disabled={!newPackName.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg cursor-pointer disabled:opacity-50"
                    >
                      Enregistrer le pack
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-TAB 1: REBOND SÉMANTIQUE EN CASCADE (USER REQUEST HIGHLIGHT) */}
              {themesSubTab === "rebond" && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-800/40 border-slate-700/70" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="text-sm font-bold flex items-center gap-2 text-cyan-400">
                          <Compass className="w-4 h-4" />
                          Cheminement &amp; Rebond d'actualité pas-à-pas
                        </h4>
                        <p className="text-xs opacity-75 mt-0.5">
                          Cliquez sur un mot pour orienter votre fil d'information. Les mots suivants qui vous sont proposés auront automatiquement un <strong>rapport direct et cohérent</strong> avec le mot que vous venez de choisir.
                        </p>
                      </div>

                      {semanticTrail.length > 0 && (
                        <button
                          onClick={() => {
                            if (setSemanticTrail) setSemanticTrail([]);
                            onNotify("Fil sémantique réinitialisé.");
                          }}
                          className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 shrink-0 font-medium cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Recommencer
                        </button>
                      )}
                    </div>

                    {/* Active Trail Breadcrumb */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 min-h-[46px] flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                        <span>Votre fil d'intérêt :</span>
                      </span>

                      {semanticTrail.length === 0 ? (
                        <span className="text-xs text-slate-500 italic">
                          (Aucun mot choisi — cliquez sur un mot ci-dessous pour démarrer votre exploration)
                        </span>
                      ) : (
                        semanticTrail.map((word, idx) => (
                          <React.Fragment key={word}>
                            {idx > 0 && <ArrowRight className="w-3.5 h-3.5 text-cyan-500 shrink-0" />}
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold shadow-xs">
                              <span>{word}</span>
                              <button
                                onClick={() => handleRemoveSemanticStep(word)}
                                className="hover:text-white cursor-pointer ml-0.5"
                                title="Supprimer cette étape"
                              >
                                ✕
                              </button>
                            </span>
                          </React.Fragment>
                        ))
                      )}
                    </div>

                    {/* Next Suggested Related Words */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          {semanticTrail.length === 0 ? (
                            <span>Choisissez un premier point de départ :</span>
                          ) : (
                            <span>
                              Mots reliés à <strong className="text-cyan-400">« {semanticTrail[semanticTrail.length - 1]} »</strong> (cliquez pour rebondir) :
                            </span>
                          )}
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {nextSuggestedWords.length} pistes connectées
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {nextSuggestedWords.map((item) => {
                          const isInTrail = semanticTrail.some(w => normalizeKeyword(w) === normalizeKeyword(item.word));
                          return (
                            <button
                              key={item.word}
                              type="button"
                              onClick={() => handleSemanticWordClick(item.word)}
                              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1 group hover:scale-[1.02] active:scale-[0.98] ${
                                isInTrail
                                  ? "bg-cyan-500 text-white border-cyan-500 shadow-md"
                                  : isDark
                                  ? "bg-slate-900/90 border-slate-700/80 hover:border-cyan-500/60 text-slate-200"
                                  : "bg-white border-slate-200 hover:border-cyan-500 text-slate-800"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold text-xs truncate group-hover:text-cyan-400 transition-colors">
                                  {item.word}
                                </span>
                                {item.count > 0 && (
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold shrink-0 ${
                                    isInTrail ? "bg-white/20 text-white" : "bg-cyan-500/15 text-cyan-400"
                                  }`}>
                                    {item.count} art.
                                  </span>
                                )}
                              </div>
                              <span className={`text-[10px] truncate ${isInTrail ? "text-white/80" : "text-slate-400"}`}>
                                {item.relationship}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action: Generate AI Article on this semantic combination */}
                    {semanticTrail.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <span className="text-xs text-slate-300">
                          Envie d'un décryptage inédit croisant ces sujets ?
                        </span>
                        <button
                          onClick={() => {
                            const topic = semanticTrail.join(" et ");
                            handleGenerateCustomArticle(topic);
                            onClose();
                          }}
                          disabled={!!isGeneratingCustom}
                          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                          Rédiger un article sur « {semanticTrail.join(" + ")} »
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB: ART & CULTURE (5 RACCOURCIS & RÉGLAGES) */}
              {themesSubTab === "culture" && (
                <div className="space-y-4">
                  {/* Curateur & Algorithme Culturel */}
                  <div className={`p-4 rounded-xl border space-y-3 ${isDark ? "bg-rose-950/20 border-rose-500/30 text-rose-100" : "bg-rose-50 border-rose-200 text-rose-950"}`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <Palette className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm flex items-center gap-1.5">
                            Curateur Art &amp; Culture
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-extrabold uppercase">
                              5 Raccourcis Actifs
                            </span>
                          </h4>
                          <p className="text-xs opacity-75">
                            Activez le mode curateur pour propulser l'art, le cinéma, les expositions et le spectacle vivant en tête de votre flux.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const currentWeight = categoryWeights["Culture"] || 3;
                          const nextWeight = currentWeight >= 4 ? 3 : 5;
                          updateCategoryWeight("Culture", nextWeight);
                          const cultureTags = ["Culture", "Cinéma", "Pop Culture", "Dikkenek", "Musées", "Théâtre", "Littérature", "Musique"];
                          cultureTags.forEach(t => {
                            updateTagWeight(t, nextWeight === 5 ? "boost" : "neutral");
                          });
                          onNotify(nextWeight === 5 
                            ? "✨ Mode Curateur Culture activé (pondération maximale 5/5 et tags boostés) !"
                            : "⚖️ Mode Curateur Culture réinitialisé à l'équilibre neutre (3/5)."
                          );
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-900/30 transition-all shrink-0"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{(categoryWeights["Culture"] || 3) >= 4 ? "Curateur Actif (5/5)" : "Activer Boost Curateur"}</span>
                      </button>
                    </div>

                    {/* Culture Category Weight Slider */}
                    <div className="pt-2 border-t border-rose-500/20 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold flex items-center gap-1.5">
                          <SlidersHorizontal className="w-3.5 h-3.5 text-rose-400" />
                          Pondération algorithmique de la catégorie Culture :
                        </span>
                        <span className="font-bold text-rose-400 font-mono">
                          Niveau {categoryWeights["Culture"] || 3}/5
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="1"
                        value={categoryWeights["Culture"] || 3}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          updateCategoryWeight("Culture", val);
                          onNotify(`⚖️ Culture pondérée au niveau ${val}/5.`);
                        }}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                      <div className="flex justify-between text-[10px] opacity-60">
                        <span>1 (Discret)</span>
                        <span>3 (Équilibré)</span>
                        <span>5 (Priorité absolue)</span>
                      </div>
                    </div>
                  </div>

                  {/* Focus Spécial : Dikkenek 20 ans */}
                  <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${isDark ? "bg-amber-950/20 border-amber-500/40 text-amber-200" : "bg-amber-50 border-amber-300 text-amber-950"}`}>
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 text-base shrink-0">
                        🎬
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 uppercase">
                            Pop Culture Culte
                          </span>
                          <span className="text-xs font-bold">Bruxelles - Place Poelaert</span>
                        </div>
                        <h5 className="font-bold text-xs mt-0.5">
                          Dikkenek fêtera ses 20 ans : projections gratuites et répliques d'anthologie
                        </h5>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (setSelectedTrendTags) {
                          setSelectedTrendTags(prev => Array.from(new Set([...prev, "Dikkenek", "Cinéma", "Pop Culture"])));
                        }
                        if (setSemanticTrail) {
                          setSemanticTrail(prev => Array.from(new Set([...prev, "Dikkenek", "Cinéma"])));
                        }
                        updateTagWeight("Dikkenek", "boost");
                        updateTagWeight("Cinéma", "boost");
                        onClose();
                        onNotify("🎬 Mots-clés Dikkenek & Cinéma ciblés dans votre flux !");
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs shrink-0 cursor-pointer shadow-xs transition-all"
                    >
                      Cibler dans mon flux
                    </button>
                  </div>

                  {/* 5 Raccourcis Culturels Détaillés */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                        Les 5 Raccourcis Thématiques Vers l'Art &amp; la Culture
                      </h4>
                      <button
                        onClick={() => {
                          const allCultureTags = ["Culture", "Cinéma", "Pop Culture", "Dikkenek", "Musées", "Théâtre", "Littérature", "Musique"];
                          if (setSelectedTrendTags) setSelectedTrendTags(allCultureTags);
                          if (setSemanticTrail) setSemanticTrail(allCultureTags);
                          allCultureTags.forEach(t => updateTagWeight(t, "boost"));
                          updateCategoryWeight("Culture", 5);
                          onClose();
                          onNotify("🎭 Pack Complet Art & Culture activé avec succès !");
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 font-bold underline cursor-pointer"
                      >
                        Activer les 5 raccourcis en 1 clic
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {CULTURE_SHORTCUTS.map((shortcut) => {
                        const isTagSelected = (selectedTrendTags || []).includes(shortcut.tag) || (semanticTrail || []).includes(shortcut.tag);

                        return (
                          <div
                            key={shortcut.id}
                            className={`p-3 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                              isTagSelected
                                ? "bg-rose-950/40 border-rose-500 text-white shadow-xs"
                                : isDark
                                ? "bg-slate-800/40 border-slate-700/60 hover:border-slate-600"
                                : "bg-slate-50 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-bold text-xs flex items-center gap-1.5">
                                  <span className="text-base">{shortcut.emoji}</span>
                                  {shortcut.label}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  isTagSelected ? "bg-rose-500 text-white" : "bg-slate-700/60 text-slate-300"
                                }`}>
                                  {shortcut.badge}
                                </span>
                              </div>
                              <p className="text-[11px] opacity-75 mt-1 line-clamp-2">
                                {shortcut.desc}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {shortcut.matchTags.slice(0, 3).map(mt => (
                                  <span key={mt} className="text-[9px] px-1.5 py-0.2 rounded bg-black/20 text-slate-300 font-mono">
                                    #{mt}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
                              <span className="text-[10px] opacity-60">
                                {isTagSelected ? "Filtre actif" : "Inactif"}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    if (setSelectedTrendTags) {
                                      if (isTagSelected) {
                                        setSelectedTrendTags(prev => prev.filter(t => t !== shortcut.tag));
                                      } else {
                                        setSelectedTrendTags(prev => Array.from(new Set([...prev, shortcut.tag])));
                                      }
                                    }
                                    if (setSemanticTrail) {
                                      if (isTagSelected) {
                                        setSemanticTrail(prev => prev.filter(t => t !== shortcut.tag));
                                      } else {
                                        setSemanticTrail(prev => Array.from(new Set([...prev, shortcut.tag])));
                                      }
                                    }
                                    updateTagWeight(shortcut.tag, isTagSelected ? "neutral" : "boost");
                                    onNotify(isTagSelected 
                                      ? `Filtre « ${shortcut.label} » retiré.`
                                      : `${shortcut.emoji} Raccourci « ${shortcut.label} » activé.`
                                    );
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                                    isTagSelected
                                      ? "bg-rose-600 text-white hover:bg-rose-500"
                                      : isDark
                                      ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                                      : "bg-white hover:bg-slate-100 text-slate-800 border border-slate-300"
                                  }`}
                                >
                                  {isTagSelected ? "Désactiver" : "Activer Raccourci"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Réglage des Mots-Clés Artistiques */}
                  <div className={`p-3.5 rounded-xl border space-y-2.5 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"}`}>
                    <h5 className="font-bold text-xs flex items-center gap-1.5 text-rose-400">
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      Réglage fin des mots-clés artistiques &amp; culturels
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {["Cinéma", "Pop Culture", "Dikkenek", "Musées", "Théâtre", "Littérature", "Musique", "Patrimoine"].map(t => {
                        const status = tagWeights[t] || "neutral";
                        return (
                          <div key={t} className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/50 flex flex-col justify-between gap-1.5 text-center">
                            <span className="text-xs font-bold truncate">#{t}</span>
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => {
                                  updateTagWeight(t, status === "boost" ? "neutral" : "boost");
                                  onNotify(`Tag #${t} ${status === "boost" ? "remis en neutre" : "boosté (+12 pts)"}.`);
                                }}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                                  status === "boost" ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                }`}
                                title="Booster ce tag"
                              >
                                {status === "boost" ? "Boosté" : "Boost"}
                              </button>
                              <button
                                onClick={() => {
                                  updateTagWeight(t, status === "exclude" ? "neutral" : "exclude");
                                  onNotify(`Tag #${t} ${status === "exclude" ? "remis en neutre" : "masqué"}.`);
                                }}
                                className={`text-[10px] px-1.5 py-0.5 rounded font-bold cursor-pointer transition-all ${
                                  status === "exclude" ? "bg-rose-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                }`}
                                title="Masquer ce tag"
                              >
                                {status === "exclude" ? "Masqué" : "Masquer"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: PACKS THÉMATIQUES PRÉDÉFINIS & PERSONNALISÉS (SOLUTION 2) */}
              {themesSubTab === "packs" && (
                <div className="space-y-4">
                  {/* Custom user packs */}
                  {customPacks.length > 0 && (
                    <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-800/40 border-slate-700/70" : "bg-slate-50 border-slate-200"}`}>
                      <h4 className="text-xs font-bold text-indigo-300 mb-2.5 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        Vos Packs Personnalisés Sauvegardés
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {customPacks.map(pack => (
                          <div
                            key={pack.id}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                              isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-xs flex items-center gap-1.5 text-slate-200">
                                <span>{pack.emoji}</span>
                                <span>{pack.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                {pack.tags.map(t => `#${t}`).join(" ")}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => handleApplyPack(pack)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
                              >
                                Appliquer
                              </button>
                              <button
                                onClick={() => handleDeleteCustomPack(pack.id)}
                                className="p-1 text-slate-500 hover:text-red-400 cursor-pointer"
                                title="Supprimer ce pack"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Built-in Curated Packs */}
                  <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-800/40 border-slate-700/70" : "bg-slate-50 border-slate-200"}`}>
                    <h4 className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Packs Thématiques Prêts à l'Emploi (1 Clic)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DEFAULT_THEMATIC_PACKS.map(pack => {
                        const isFullyActive = pack.tags.every(t => selectedTrendTags.includes(t));
                        return (
                          <div
                            key={pack.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 ${
                              isFullyActive
                                ? "bg-cyan-500/10 border-cyan-500/60"
                                : isDark
                                ? "bg-slate-900/80 border-slate-800 hover:border-slate-700"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-1.5">
                                  <span>{pack.emoji}</span>
                                  <span>{pack.name}</span>
                                </span>
                                {isFullyActive && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500 text-white font-bold">
                                    Actif
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">
                                {pack.description}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {pack.tags.map(t => (
                                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleApplyPack(pack)}
                              className={`w-full py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isFullyActive
                                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                                  : "bg-cyan-500 hover:bg-cyan-600 text-white shadow-xs"
                              }`}
                            >
                              {isFullyActive ? "Ré-appliquer ce pack" : "Activer ce pack"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: TOUS LES MOTS-CLÉS AVEC COMPTEURS, RUBRIQUES ET FAVORIS (SOLUTIONS 1, 3, 4) */}
              {themesSubTab === "nuage" && (
                <div className="space-y-4">
                  {/* Pinned Tags & Recent History Bar (Solution 3) */}
                  <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-100 border-slate-200"
                  }`}>
                    {/* Pinned tags */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        Épinglés :
                      </span>
                      {pinnedTags.length === 0 ? (
                        <span className="text-[11px] text-slate-500 italic">Cliquez sur ⭐ pour épingler vos tags favoris ici</span>
                      ) : (
                        pinnedTags.map(tag => {
                          const isSelected = selectedTrendTags.includes(tag) || clickedTrendTag === tag;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleToggleTag(tag)}
                              className={`px-2 py-0.5 text-xs rounded-md border font-semibold flex items-center gap-1 cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-amber-400 text-slate-950 border-amber-400 font-bold"
                                  : "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700"
                              }`}
                            >
                              <span>#{tag}</span>
                              <span className="text-[9px] opacity-75">({tagCountsMap.get(tag) || 0})</span>
                              <span onClick={(e) => handleTogglePin(tag, e)} className="hover:text-red-400 ml-0.5" title="Détacher">✕</span>
                            </button>
                          );
                        })
                      )}
                    </div>

                    {/* Recently explored */}
                    {recentTags.length > 0 && (
                      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full text-xs shrink-0">
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-slate-500" />
                          Récents :
                        </span>
                        {recentTags.slice(0, 5).map(rt => (
                          <button
                            key={rt}
                            type="button"
                            onClick={() => handleToggleTag(rt)}
                            className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                          >
                            #{rt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Search and View Toggle (Solution 4) */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={tagSearchQuery}
                        onChange={(e) => setTagSearchQuery(e.target.value)}
                        placeholder="Rechercher un mot-clé (ex: IA, Climat, Europe, Puces...)"
                        className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-none ${
                          isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                        }`}
                      />
                      {tagSearchQuery && (
                        <button
                          onClick={() => setTagSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => setTagGroupingMode("rubriques")}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                          tagGroupingMode === "rubriques"
                            ? "bg-slate-700 text-white font-bold"
                            : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Par Rubriques
                      </button>
                      <button
                        onClick={() => setTagGroupingMode("frequence")}
                        className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                          tagGroupingMode === "frequence"
                            ? "bg-slate-700 text-white font-bold"
                            : "bg-slate-800/40 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Par Fréquence
                      </button>
                    </div>
                  </div>

                  {/* Tags Display: Either Grouped by Rubriques or Flat by Frequency (Solutions 1 & 4) */}
                  {tagGroupingMode === "rubriques" ? (
                    <div className="space-y-3.5">
                      {Object.entries(rubriques).map(([rubriqueTitle, tagsInRubrique]: [string, string[]]) => (
                        <div
                          key={rubriqueTitle}
                          className={`p-3 rounded-xl border ${
                            isDark ? "bg-slate-800/30 border-slate-700/60" : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <h5 className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                            <span>{rubriqueTitle}</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              {tagsInRubrique.length} mots-clés
                            </span>
                          </h5>
                          <div className="flex flex-wrap gap-1.5">
                            {tagsInRubrique.map(tag => {
                              const isSelected = selectedTrendTags.includes(tag) || clickedTrendTag === tag;
                              const isPinned = pinnedTags.includes(tag);
                              const count = tagCountsMap.get(tag) || 0;
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => handleToggleTag(tag)}
                                  className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] ${
                                    isSelected
                                      ? "bg-cyan-500 text-white border-cyan-500 font-bold shadow-xs"
                                      : isDark
                                      ? "bg-slate-900/80 border-slate-700/80 hover:border-slate-600 text-slate-200"
                                      : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                                  }`}
                                >
                                  <span>#{tag}</span>
                                  <span className={`text-[10px] px-1 py-0.2 rounded-full font-semibold ${
                                    isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                                  }`}>
                                    {count}
                                  </span>
                                  <span
                                    onClick={(e) => handleTogglePin(tag, e)}
                                    className={`text-[11px] transition-transform hover:scale-125 ${
                                      isPinned ? "text-amber-400 fill-amber-400" : "text-slate-500 hover:text-amber-400"
                                    }`}
                                    title={isPinned ? "Détacher des favoris" : "Épingler en favori"}
                                  >
                                    ★
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={`p-4 rounded-xl border ${isDark ? "bg-slate-800/30 border-slate-700/60" : "bg-slate-50 border-slate-200"}`}>
                      <div className="flex flex-wrap gap-2">
                        {filteredTags.map(tag => {
                          const isSelected = selectedTrendTags.includes(tag) || clickedTrendTag === tag;
                          const isPinned = pinnedTags.includes(tag);
                          const count = tagCountsMap.get(tag) || 0;
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleToggleTag(tag)}
                              className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                                isSelected
                                  ? "bg-cyan-500 text-white border-cyan-500 font-bold shadow-xs"
                                  : isDark
                                  ? "bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-200"
                                  : "bg-white border-slate-200 hover:border-slate-300 text-slate-800"
                              }`}
                            >
                              <span>#{tag}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                                isSelected ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
                              }`}>
                                {count}
                              </span>
                              <span
                                onClick={(e) => handleTogglePin(tag, e)}
                                className={`text-[11px] ${
                                  isPinned ? "text-amber-400 fill-amber-400" : "text-slate-500 hover:text-amber-400"
                                }`}
                                title={isPinned ? "Détacher" : "Épingler"}
                              >
                                ★
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Tag weights quick link */}
                  <div className="pt-2 text-right">
                    <button
                      onClick={() => setActiveTab("algo")}
                      className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      Gérer la pondération et l'exclusion stricte des tags ➔
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FLUX & IA (BULK & SUR MESURE) */}
          {activeTab === "flux_ia" && (
            <div className="space-y-6">
              {/* Bulk Generation Card */}
              <div
                className={`p-4 rounded-xl border ${
                  isFun
                    ? "bg-white border-2 border-black"
                    : isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm sm:text-base flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Génération d'actualité en direct (IA)
                    </h4>
                    <p className="text-xs opacity-75 mt-0.5">
                      Générez 20 nouveaux articles d'actualité vérifiés (&lt; 30 jours) avec croisement de sources fiables.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleBulkGenerateIAArticles(false);
                      onClose();
                    }}
                    disabled={isBulkGenerating}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isBulkGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {isBulkGenerating ? "Rédaction en cours..." : "Régénérer le flux (20 articles)"}
                  </button>
                </div>
              </div>

              {/* Custom Themes Generator */}
              <div
                className={`p-4 rounded-xl border ${
                  isFun
                    ? "bg-white border-2 border-black"
                    : isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <h4 className="font-bold text-sm sm:text-base flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  Rédiger un article sur mesure
                </h4>
                <p className="text-xs opacity-75 mb-3">
                  Entrez n'importe quel sujet (actualité, histoire, science, culture, technologie, ville, philosophie...) pour que l'IA rédige un article complet et le place <strong className="text-cyan-400">en tête (#1) des articles prioritaires</strong>.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newInterestInput}
                    onChange={(e) => setNewInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newInterestInput.trim()) {
                        const topic = newInterestInput.trim();
                        handleAddCustomInterest();
                        handleGenerateCustomArticle(topic);
                        onClose();
                      }
                    }}
                    placeholder="Ex: Révolution française, Trous noirs, Énergies vertes, Montpellier, Jazz..."
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none ${
                      isDark ? "bg-slate-900 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={handleAddCustomInterest}
                      disabled={!newInterestInput.trim()}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Ajouter à la liste des thèmes"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter
                    </button>
                    <button
                      onClick={() => {
                        if (newInterestInput.trim()) {
                          const topic = newInterestInput.trim();
                          handleAddCustomInterest();
                          handleGenerateCustomArticle(topic);
                          onClose();
                        }
                      }}
                      disabled={!newInterestInput.trim() || !!isGeneratingCustom}
                      className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                      title="Rédiger immédiatement et afficher en #1 des articles prioritaires"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                      Rédiger (#1 Prioritaire)
                    </button>
                  </div>
                </div>

                {/* List of custom themes */}
                {customInterests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {customInterests.map((interest) => (
                      <div
                        key={interest}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
                          isDark ? "bg-slate-900/80 border-slate-700" : "bg-white border-slate-200"
                        }`}
                      >
                        <span className="font-medium">{interest}</span>
                        <button
                          onClick={() => {
                            handleGenerateCustomArticle(interest);
                            onClose();
                          }}
                          disabled={isGeneratingCustom === interest}
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          title="Générer un article vérifié et le placer en #1 des prioritaires"
                        >
                          {isGeneratingCustom === interest ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          Rédiger en priorité
                        </button>
                        <button
                          onClick={() => handleDeleteCustomInterest(interest)}
                          className="text-red-400 hover:text-red-300 cursor-pointer ml-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reset to baseline */}
              <div className="flex justify-end">
                <button
                  onClick={handleResetToBaseline}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer underline"
                >
                  <RotateCcw className="w-3 h-3" />
                  Restaurer le flux d'origine (articles initiaux)
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: FILTRES & LECTURE */}
          {activeTab === "filters" && (
            <div className="space-y-6">
              {/* Score Slider */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Score d'intérêt minimum
                  </label>
                  <span className="text-cyan-400 font-bold text-xs sm:text-sm">{minScore}%</span>
                </div>
                <p className="text-xs opacity-75 mb-3">
                  Ne montre que les articles dont la pertinence dépasse ce seuil.
                </p>
                <input
                  type="range"
                  min={40}
                  max={95}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] opacity-60 mt-1">
                  <span>Tout voir (40%)</span>
                  <span>Haute pertinence (95%)</span>
                </div>
              </div>

              {/* Reading time */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <label className="text-xs sm:text-sm font-semibold flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Temps de lecture
                </label>
                <p className="text-xs opacity-75 mb-3">
                  Filtrez selon le format d'article souhaité.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "all", label: "Tous", desc: "Toutes longueurs" },
                    { id: "short", label: "Éclair", desc: "< 2 min" },
                    { id: "medium", label: "Moyen", desc: "2 - 4 min" },
                    { id: "long", label: "Complet", desc: "> 5 min" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setReadingTimeFilter(opt.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        readingTimeFilter === opt.id
                          ? "bg-cyan-500 text-white border-cyan-500 shadow-md font-bold"
                          : isDark
                          ? "bg-slate-900/60 border-slate-700 hover:border-slate-600"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-semibold">{opt.label}</div>
                      <div className={`text-[10px] ${readingTimeFilter === opt.id ? "text-white/80" : "opacity-60"}`}>
                        {opt.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles: Bookmarks & Bandwidth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setOnlyBookmarks((prev) => !prev)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    onlyBookmarks
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                      : isDark
                      ? "bg-slate-800/40 border-slate-700"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Bookmark className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold">Articles sauvegardés</div>
                      <div className="text-[10px] opacity-70">Afficher uniquement les favoris</div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      onlyBookmarks ? "bg-cyan-500 border-cyan-500 text-white" : "border-slate-600"
                    }`}
                  >
                    {onlyBookmarks && <Check className="w-3 h-3" />}
                  </div>
                </button>

                <button
                  onClick={() => setBandwidthSaver((prev) => !prev)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    bandwidthSaver
                      ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                      : isDark
                      ? "bg-slate-800/40 border-slate-700"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wifi className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold">Économie de données</div>
                      <div className="text-[10px] opacity-70">Masquer les prévisualisations lourdes</div>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      bandwidthSaver ? "bg-cyan-500 border-cyan-500 text-white" : "border-slate-600"
                    }`}
                  >
                    {bandwidthSaver && <Check className="w-3 h-3" />}
                  </div>
                </button>
              </div>

              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearAllFilters}
                  className="w-full py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-300 border border-rose-500/30 rounded-xl hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  Réinitialiser tous les filtres actifs ({activeFiltersCount})
                </button>
              )}
            </div>
          )}

          {/* TAB 4: ALGORITHME & PONDÉRATIONS */}
          {activeTab === "algo" && (
            <div className="space-y-6">
              {/* Category Weights */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                    Pondération des catégories
                  </label>
                  <button
                    onClick={handleResetAlgorithmicData}
                    className="text-[10px] text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
                  >
                    Réinitialiser
                  </button>
                </div>
                <p className="text-xs opacity-75 mb-4">
                  Ajustez l'importance de chaque domaine thématique dans votre flux.
                </p>

                <div className="space-y-3">
                  {categories.map((cat) => {
                    const weight = categoryWeights[cat] ?? 50;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium">
                          <span>{cat}</span>
                          <span className="text-cyan-400 font-bold">{weight}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={weight}
                          onChange={(e) => updateCategoryWeight(cat, Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tag Weights (Boost / Exclude) */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <label className="text-xs sm:text-sm font-semibold flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  Pondération des tags (Boost / Masquage strict)
                </label>
                <p className="text-xs opacity-75 mb-3">
                  Boostez la priorité d'un mot-clé ou masquez complètement les articles indésirables.
                </p>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {allAvailableTags.slice(0, 15).map((tag) => {
                    const status = tagWeights[tag] || "neutral";
                    return (
                      <div
                        key={tag}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs ${
                          isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                        }`}
                      >
                        <span className="font-semibold">#{tag}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              updateTagWeight(tag, status === "boost" ? "neutral" : "boost")
                            }
                            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                              status === "boost"
                                ? "bg-emerald-500 text-white"
                                : "bg-slate-700 text-slate-300 opacity-60 hover:opacity-100"
                            }`}
                          >
                            🚀 Boost
                          </button>
                          <button
                            onClick={() =>
                              updateTagWeight(tag, status === "exclude" ? "neutral" : "exclude")
                            }
                            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer transition-all ${
                              status === "exclude"
                                ? "bg-rose-500 text-white"
                                : "bg-slate-700 text-slate-300 opacity-60 hover:opacity-100"
                            }`}
                          >
                            🚫 Masquer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex flex-wrap items-center justify-between px-5 py-3 border-t gap-3 ${
            isFun
              ? "border-black bg-amber-100"
              : isSobre
              ? isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-zinc-100"
              : isWarm
              ? isDark ? "border-[#443831] bg-[#1e1916]" : "border-[#dfd3c3] bg-[#f2ebd9]"
              : isCyber
              ? "border-cyan-500/30 bg-zinc-950"
              : isDark ? "border-slate-800 bg-slate-900" : "border-slate-100 bg-slate-50"
          }`}
        >
          <div className="text-xs text-slate-400">
            {activeKeywordsCount > 0 ? (
              <span className="flex flex-wrap items-center gap-2">
                <strong className="text-cyan-400 font-bold">{activeKeywordsCount} mot{activeKeywordsCount > 1 ? "s" : ""}-clé{activeKeywordsCount > 1 ? "s" : ""} actif{activeKeywordsCount > 1 ? "s" : ""}</strong>
                {matchingArticlesCount === 0 ? (
                  <span className="text-amber-400 font-semibold text-[11px] bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    ⚠️ 0 article actuel ne correspond (utilisez "Retomber sur les 20 articles")
                  </span>
                ) : (
                  <span className="text-emerald-400 text-[11px] font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {matchingArticlesCount} article{matchingArticlesCount > 1 ? "s" : ""} correspondant{matchingArticlesCount > 1 ? "s" : ""}
                  </span>
                )}
              </span>
            ) : (
              <span>Flux complet : 20 articles disponibles</span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                handleClearAllFilters();
                onClose();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1.5 hover:border-cyan-500/40 active:scale-95"
              title="Réinitialiser tous les filtres et revenir directement aux 20 articles"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Retomber sur les 20 articles</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Appliquer &amp; Voir les articles {matchingArticlesCount > 0 ? `(${matchingArticlesCount})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
