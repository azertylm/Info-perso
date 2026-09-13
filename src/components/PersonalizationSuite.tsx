import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sliders,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Star,
  Ban,
  EyeOff,
  Compass,
  Target,
  Scale,
  Globe,
  Wand2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Plus,
  X,
  Radio,
  Flame,
  Filter,
  Layers,
  VolumeX,
  TrendingDown,
  TrendingUp,
  Tag as TagIcon
} from "lucide-react";
import { NewsArticle, DiscoveryMode, NaturalRadarProfile } from "../types";

export interface PersonalizationSuiteProps {
  theme: string;
  isDark: boolean;
  categoryWeights: Record<string, number>;
  onUpdateCategoryWeight: (category: string, weight: number) => void;
  onSetAllCategoryWeights: (weights: Record<string, number>) => void;
  tagWeights: Record<string, "boost" | "neutral" | "exclude">;
  onUpdateTagWeight: (tag: string, status: "boost" | "neutral" | "exclude") => void;
  sourceWeights: Record<string, "boost" | "neutral" | "exclude">;
  onUpdateSourceWeight: (source: string, status: "boost" | "neutral" | "exclude") => void;
  followedTags: string[];
  onToggleFollowTag: (tag: string) => void;
  blacklistedTags: string[];
  onAddBlacklistedTag: (tag: string) => void;
  onRemoveBlacklistedTag: (tag: string) => void;
  hiddenArticleIds: number[];
  onHideArticle: (id: number) => void;
  onUnhideAllArticles: () => void;
  discoveryMode: DiscoveryMode;
  onSetDiscoveryMode: (mode: DiscoveryMode) => void;
  naturalRadar: NaturalRadarProfile | null;
  onApplyNaturalRadar: (query: string) => Promise<void>;
  onClearNaturalRadar: () => void;
  onNotify: (msg: string) => void;
  onResetAllPersonalization: () => void;
}

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  IA: { bg: "bg-purple-500/15 border-purple-500/30", text: "text-purple-400", bar: "bg-purple-500" },
  Technologie: { bg: "bg-cyan-500/15 border-cyan-500/30", text: "text-cyan-400", bar: "bg-cyan-500" },
  Économie: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-400", bar: "bg-emerald-500" },
  Local: { bg: "bg-amber-500/15 border-amber-500/30", text: "text-amber-400", bar: "bg-amber-500" },
  Science: { bg: "bg-blue-500/15 border-blue-500/30", text: "text-blue-400", bar: "bg-blue-500" },
  Médias: { bg: "bg-rose-500/15 border-rose-500/30", text: "text-rose-400", bar: "bg-rose-500" },
  Design: { bg: "bg-fuchsia-500/15 border-fuchsia-500/30", text: "text-fuchsia-400", bar: "bg-fuchsia-500" },
  Culture: { bg: "bg-indigo-500/15 border-indigo-500/30", text: "text-indigo-400", bar: "bg-indigo-500" },
  Sport: { bg: "bg-orange-500/15 border-orange-500/30", text: "text-orange-400", bar: "bg-orange-500" },
};

export const MIXER_PRESETS: { name: string; icon: string; desc: string; weights: Record<string, number> }[] = [
  {
    name: "100% Tech & IA",
    icon: "🚀",
    desc: "Priorité absolue aux avancées technologiques et à l'IA",
    weights: { IA: 5, Technologie: 5, Économie: 2, Local: 1, Science: 3, Médias: 1, Design: 3, Culture: 1 }
  },
  {
    name: "Équilibre Généraliste",
    icon: "⚖️",
    desc: "Toutes les thématiques à part égale pour un tour complet",
    weights: { IA: 3, Technologie: 3, Économie: 3, Local: 3, Science: 3, Médias: 3, Design: 3, Culture: 3 }
  },
  {
    name: "Éco, Business & Décideurs",
    icon: "💼",
    desc: "Finance, stratégies d'entreprises, marchés et médias",
    weights: { Économie: 5, Médias: 4, Technologie: 3, IA: 3, Local: 2, Science: 2, Design: 1, Culture: 1 }
  },
  {
    name: "Climat & Sciences",
    icon: "🌿",
    desc: "Découvertes, transition écologique, recherche scientifique",
    weights: { Science: 5, Local: 3, Économie: 3, Technologie: 3, IA: 2, Médias: 2, Design: 1, Culture: 2 }
  },
  {
    name: "Local & Régions",
    icon: "📍",
    desc: "Initiatives de proximité, territoires et vie locale",
    weights: { Local: 5, Économie: 4, Médias: 3, Technologie: 2, IA: 1, Science: 2, Design: 2, Culture: 3 }
  },
  {
    name: "Robotique & Humanoïdes",
    icon: "🥋",
    desc: "Robots humanoïdes (Unitree, Boston Dynamics), IA incarnée et insolite tech",
    weights: { Technologie: 5, IA: 5, Science: 4, Médias: 3, Économie: 2, Local: 1, Design: 2, Culture: 1 }
  }
];

export const RADAR_EXAMPLES = [
  "Robotique humanoïde, Unitree, IA physique et faits insolites high-tech",
  "Cybersécurité, cloud et souveraineté numérique",
  "Transition énergétique, solaire et batteries",
  "Immobilier, taux d'intérêt et marché du logement",
  "Intelligence artificielle générative et santé",
  "Spatial, astronomie et exploration lunaire",
  "Startups régionales et levées de fonds en Occitanie"
];

/**
 * Main Expandable Editorial Mixer & Radar Suite
 */
export const EditorialMixerBar: React.FC<PersonalizationSuiteProps> = ({
  theme,
  isDark,
  categoryWeights,
  onUpdateCategoryWeight,
  onSetAllCategoryWeights,
  tagWeights,
  onUpdateTagWeight,
  sourceWeights,
  onUpdateSourceWeight,
  followedTags,
  onToggleFollowTag,
  blacklistedTags,
  onAddBlacklistedTag,
  onRemoveBlacklistedTag,
  hiddenArticleIds,
  onHideArticle,
  onUnhideAllArticles,
  discoveryMode,
  onSetDiscoveryMode,
  naturalRadar,
  onApplyNaturalRadar,
  onClearNaturalRadar,
  onNotify,
  onResetAllPersonalization
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"mixer" | "radar" | "blacklist">("mixer");
  const [naturalQueryInput, setNaturalQueryInput] = useState("");
  const [isAnalyzingQuery, setIsAnalyzingQuery] = useState(false);
  const [manualBlacklistInput, setManualBlacklistInput] = useState("");

  const categories = Object.keys(categoryWeights).length > 0
    ? Object.keys(categoryWeights)
    : ["Technologie", "IA", "Économie", "Local", "Science", "Médias"];

  // Total weight calculation for percentage breakdown
  const totalWeight = categories.reduce((acc, cat) => acc + (categoryWeights[cat] || 3), 0);

  const handleApplyPreset = (preset: typeof MIXER_PRESETS[0]) => {
    onSetAllCategoryWeights(preset.weights);
    onNotify(`✨ Préréglage appliqué : ${preset.icon} ${preset.name}`);
  };

  const handleNaturalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!naturalQueryInput.trim()) return;

    setIsAnalyzingQuery(true);
    try {
      await onApplyNaturalRadar(naturalQueryInput.trim());
      setNaturalQueryInput("");
    } catch {
      onNotify("Erreur lors de l'analyse du radar");
    } finally {
      setIsAnalyzingQuery(false);
    }
  };

  const handleAddManualBlacklist = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = manualBlacklistInput.trim().replace(/^#/, "");
    if (!clean) return;
    onAddBlacklistedTag(clean);
    setManualBlacklistInput("");
  };

  const isSobre = theme === "monochrome" || theme === "journal";
  const isWarm = theme === "warm" || theme === "sepia";
  const isCyber = theme === "cyberpunk";
  const isFun = theme === "fun";

  return (
    <div
      className={`rounded-2xl border transition-all mb-3 overflow-hidden ${
        isFun
          ? "bg-amber-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black"
          : isSobre
          ? isDark
            ? "bg-zinc-900 border-zinc-700 text-zinc-100 shadow-lg"
            : "bg-white border-zinc-300 text-zinc-900 shadow-sm"
          : isWarm
          ? isDark
            ? "bg-[#251f1c] border-[#443831] text-[#f4ecd8]"
            : "bg-[#faf6ee] border-[#dfd3c3] text-[#3d332a]"
          : isCyber
          ? "bg-zinc-950/95 border-cyan-500/40 text-cyan-300 font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          : isDark
          ? "bg-slate-900/90 border-slate-800 text-slate-100 shadow-lg backdrop-blur-md"
          : "bg-white border-slate-200 text-slate-900 shadow-sm"
      }`}
    >
      {/* COMPACT TOP BAR (Always visible) */}
      <div className="p-2.5 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
              isExpanded
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/25"
                : isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mixeur &amp; Radar Personnel</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Quick Discovery Mode Selector */}
          <div className="flex items-center gap-1 bg-black/20 dark:bg-black/40 p-0.5 rounded-xl border border-slate-700/50 text-[11px]">
            <button
              onClick={() => {
                onSetDiscoveryMode("focus");
                onNotify("🎯 Mode Focus activé : 100% centré sur vos centres d'intérêt");
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                discoveryMode === "focus"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Focus 100% ciblé sur vos centres d'intérêt"
            >
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">Focus</span>
            </button>
            <button
              onClick={() => {
                onSetDiscoveryMode("balanced");
                onNotify("⚖️ Mode Équilibré activé : centres d'intérêt + grands faits majeurs");
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                discoveryMode === "balanced"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Équilibré : centres d'intérêt prioritaires + actualité majeure"
            >
              <Scale className="w-3 h-3" />
              <span className="hidden sm:inline">Équilibré</span>
            </button>
            <button
              onClick={() => {
                onSetDiscoveryMode("serendipity");
                onNotify("🌐 Mode Sérendipité activé : ouvertures inattendues pour casser la bulle");
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold cursor-pointer transition-all ${
                discoveryMode === "serendipity"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Sérendipité : injecte des articles surprenants hors-piste"
            >
              <Globe className="w-3 h-3 text-purple-300" />
              <span className="hidden sm:inline">Découverte</span>
            </button>
          </div>

          {/* Active Radar Chip if set */}
          {naturalRadar && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold animate-in fade-in">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="truncate max-w-[140px] sm:max-w-[200px]" title={naturalRadar.query}>
                Radar: "{naturalRadar.query}"
              </span>
              <button
                onClick={onClearNaturalRadar}
                className="hover:text-white cursor-pointer ml-1 text-purple-400 hover:text-purple-200"
                title="Supprimer ce radar personnalisé"
              >
                ✕
              </button>
            </div>
          )}

          {/* Followed Tags Count */}
          {followedTags.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-400 font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{followedTags.length} sujet{followedTags.length > 1 ? "s" : ""} suivi{followedTags.length > 1 ? "s" : ""}</span>
            </span>
          )}

          {/* Blacklisted Tags Count */}
          {blacklistedTags.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-rose-400 font-bold px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <Ban className="w-3 h-3" />
              <span>{blacklistedTags.length} exclu{blacklistedTags.length > 1 ? "s" : ""}</span>
            </span>
          )}

          {/* Hidden Articles Count */}
          {hiddenArticleIds.length > 0 && (
            <button
              onClick={onUnhideAllArticles}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white font-semibold px-2 py-0.5 rounded-lg bg-zinc-800 border border-zinc-700 cursor-pointer"
              title="Cliquer pour réafficher les articles masqués"
            >
              <EyeOff className="w-3 h-3" />
              <span>{hiddenArticleIds.length} masqué{hiddenArticleIds.length > 1 ? "s" : ""} (Réafficher)</span>
            </button>
          )}
        </div>

        {/* Proportional Segmented Visual Bar (Mini preview) */}
        <div className="w-full sm:w-56 shrink-0 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Dosage éditorial</span>
            <span className="text-cyan-400 font-bold">{categories.length} rubriques</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            {categories.map((cat) => {
              const weight = categoryWeights[cat] || 3;
              const pct = Math.round((weight / (totalWeight || 1)) * 100);
              const color = CATEGORY_COLORS[cat]?.bar || "bg-slate-500";
              return (
                <div
                  key={cat}
                  className={`h-full ${color} transition-all duration-300`}
                  style={{ width: `${pct}%` }}
                  title={`${cat} : ${pct}% (poids ${weight}/5)`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* EXPANDED INTERACTIVE WORKBENCH */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-700/60 p-3 sm:p-4 space-y-4"
          >
            {/* Sub-tabs */}
            <div className="flex items-center gap-2 border-b border-slate-700/50 pb-2">
              <button
                onClick={() => setActiveTab("mixer")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  activeTab === "mixer"
                    ? "bg-cyan-500 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>1. Mixeur des Rubriques</span>
              </button>
              <button
                onClick={() => setActiveTab("radar")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  activeTab === "radar"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>2. Radar Langage Naturel</span>
              </button>
              <button
                onClick={() => setActiveTab("blacklist")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                  activeTab === "blacklist"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Ban className="w-3.5 h-3.5" />
                <span>3. Sujets Suivis &amp; Exclusions</span>
              </button>

              <button
                onClick={onResetAllPersonalization}
                className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-rose-400 font-semibold cursor-pointer transition-colors"
                title="Rétablir la configuration d'origine"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </button>
            </div>

            {/* TAB 1: MIXER SLIDERS & PRESETS */}
            {activeTab === "mixer" && (
              <div className="space-y-4">
                {/* 1-Click Presets */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    ⚡ Profils rapides prêts à l'emploi
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {MIXER_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        onClick={() => handleApplyPreset(p)}
                        className={`p-2 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                          isDark
                            ? "bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200"
                            : "bg-slate-50 hover:bg-white border-slate-200 text-slate-800"
                        }`}
                      >
                        <div className="text-base mb-0.5">{p.icon}</div>
                        <div className="text-xs font-bold truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                          {p.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Category Sliders */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      🎚️ Ajustement précis par rubrique (Poids de 1 à 5)
                    </span>
                    <span className="text-[10px] text-slate-400">
                      1 = discret / 3 = équilibré / 5 = omniprésent
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {categories.map((cat) => {
                      const weight = categoryWeights[cat] || 3;
                      const pct = Math.round((weight / (totalWeight || 1)) * 100);
                      const colorInfo = CATEGORY_COLORS[cat] || { text: "text-cyan-400", bar: "bg-cyan-500" };

                      return (
                        <div
                          key={cat}
                          className="p-2.5 rounded-xl border border-slate-700/60 bg-slate-800/40 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${colorInfo.text}`}>{cat}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-mono text-slate-300 font-semibold">
                                {pct}%
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-200 font-mono font-bold">
                                {weight}/5
                              </span>
                            </div>
                          </div>

                          {/* 5-step interactive button selector */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((lvl) => (
                              <button
                                key={lvl}
                                onClick={() => {
                                  onUpdateCategoryWeight(cat, lvl);
                                  onNotify(`Poids de "${cat}" réglé à ${lvl}/5 (${pct}%)`);
                                }}
                                className={`flex-1 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                                  lvl <= weight
                                    ? `${colorInfo.bar} text-white font-extrabold shadow-xs`
                                    : "bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300"
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: NATURAL LANGUAGE RADAR */}
            {activeTab === "radar" && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <h4 className="text-xs font-bold text-slate-200">
                      Formulez vos souhaits de veille en langage naturel
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    L'IA extrait automatiquement vos centres d'intérêt, les concepts clés et adapte instantanément votre flux d'actualités.
                  </p>

                  <form onSubmit={handleNaturalSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={naturalQueryInput}
                      onChange={(e) => setNaturalQueryInput(e.target.value)}
                      placeholder="Ex: Je prépare un voyage au Japon et je m'intéresse au marché des semi-conducteurs et à la robotique..."
                      className="flex-1 px-3 py-2 rounded-xl text-xs bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="submit"
                      disabled={isAnalyzingQuery || !naturalQueryInput.trim()}
                      className="shrink-0 px-4 py-2 rounded-xl bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/25 transition-all disabled:opacity-50"
                    >
                      {isAnalyzingQuery ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Analyse...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Activer ce Radar</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Example Prompts */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    💡 Exemples d'inspirations à tester en 1 clic :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {RADAR_EXAMPLES.map((ex) => (
                      <button
                        key={ex}
                        type="button"
                        onClick={() => {
                          setNaturalQueryInput(ex);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-purple-600/30 text-slate-300 hover:text-purple-200 border border-slate-700/80 text-xs text-left cursor-pointer transition-all"
                      >
                        « {ex} »
                      </button>
                    ))}
                  </div>
                </div>

                {/* Current Active Radar Details */}
                {naturalRadar && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-purple-400" />
                        Radar actif : « {naturalRadar.query} »
                      </span>
                      <button
                        onClick={onClearNaturalRadar}
                        className="text-xs text-rose-400 hover:underline font-semibold cursor-pointer"
                      >
                        Désactiver
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[10px] text-purple-400 font-semibold">Mots-clés extraits :</span>
                      {naturalRadar.extractedKeywords.map((kw) => (
                        <span key={kw} className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 text-[10px] font-mono">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: FOLLOWED TAGS & BLACKLIST */}
            {activeTab === "blacklist" && (
              <div className="space-y-4">
                {/* 1. Followed Tags (⭐) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      Sujets &amp; Mots-clés Suivis ({followedTags.length})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Les articles contenant ces mots-clés reçoivent un bonus de priorité (+20)
                    </span>
                  </div>

                  {followedTags.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                      Aucun sujet suivi pour le moment. Cliquez sur un tag dans un article pour le suivre.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {followedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold shadow-xs"
                        >
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>#{tag}</span>
                          <button
                            onClick={() => onToggleFollowTag(tag)}
                            className="hover:text-white cursor-pointer ml-1 text-amber-400 hover:text-amber-200"
                            title="Ne plus suivre ce sujet"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Blacklist / Excluded Tags (🚫) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Ban className="w-3.5 h-3.5" />
                      Liste Noire : Sujets &amp; Mots-clés Exclus ({blacklistedTags.length})
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Tout article contenant l'un de ces mots-clés est automatiquement masqué
                    </span>
                  </div>

                  {/* Add manual blacklist input */}
                  <form onSubmit={handleAddManualBlacklist} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={manualBlacklistInput}
                      onChange={(e) => setManualBlacklistInput(e.target.value)}
                      placeholder="Ajouter un mot-clé à bannir (ex: télé-réalité, faits-divers...)"
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="submit"
                      disabled={!manualBlacklistInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Bannir</span>
                    </button>
                  </form>

                  {blacklistedTags.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/50">
                      Aucun sujet sur liste noire. Vous pouvez exclure un sujet ici ou directement via le bouton 👎 sur les articles.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {blacklistedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-bold shadow-xs"
                        >
                          <Ban className="w-3 h-3 text-rose-400" />
                          <span>#{tag}</span>
                          <button
                            onClick={() => onRemoveBlacklistedTag(tag)}
                            className="hover:text-white cursor-pointer ml-1 text-rose-400 hover:text-rose-200"
                            title="Retirer de la liste noire"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Direct Article Feedback Widget (👍 Plus comme ça / 👎 Moins comme ça)
 */
export interface ArticleFeedbackWidgetProps {
  article: NewsArticle;
  onThumbsUp: (article: NewsArticle) => void;
  onThumbsDownOption: (
    article: NewsArticle,
    action: "hide" | "lower_cat" | "exclude_tag" | "ignore_source",
    extraTag?: string
  ) => void;
  isDark: boolean;
  size?: "sm" | "md";
}

export const ArticleFeedbackWidget: React.FC<ArticleFeedbackWidgetProps> = ({
  article,
  onThumbsUp,
  onThumbsDownOption,
  isDark,
  size = "sm"
}) => {
  const [showDownMenu, setShowDownMenu] = useState(false);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasLiked(true);
    onThumbsUp(article);
    setTimeout(() => setHasLiked(false), 2000);
  };

  const handleOpenDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDownMenu(!showDownMenu);
  };

  return (
    <div className="relative inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      {/* Thumbs Up Button */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
          hasLiked
            ? "bg-emerald-500 text-white border-emerald-400 shadow-sm"
            : isDark
            ? "bg-slate-800/80 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border-slate-700/80"
            : "bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200"
        }`}
        title="Plus de sujets comme ça (+ de cette catégorie et de ces mots-clés)"
      >
        <ThumbsUp className={`w-3 h-3 ${hasLiked ? "animate-bounce fill-white" : ""}`} />
        <span className="text-[10px] hidden sm:inline">Plus</span>
      </button>

      {/* Thumbs Down Button */}
      <button
        onClick={handleOpenDown}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all active:scale-95 ${
          showDownMenu
            ? "bg-rose-500 text-white border-rose-400 shadow-sm"
            : isDark
            ? "bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border-slate-700/80"
            : "bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border-slate-200"
        }`}
        title="Moins de sujets comme ça (options d'exclusion et masquage)"
      >
        <ThumbsDown className="w-3 h-3" />
        <span className="text-[10px] hidden sm:inline">Moins</span>
      </button>

      {/* Thumbs Down Context Menu Popover */}
      {showDownMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setShowDownMenu(false);
            }}
          />
          <div
            className={`absolute right-0 bottom-full mb-1 z-50 w-56 rounded-xl border p-1.5 shadow-2xl backdrop-blur-md text-xs font-medium animate-in fade-in zoom-in-95 ${
              isDark
                ? "bg-slate-900/95 border-slate-700 text-slate-200"
                : "bg-white/95 border-slate-200 text-slate-800"
            }`}
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-700/50 mb-1">
              Personnaliser ce flux
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDownMenu(false);
                onThumbsDownOption(article, "hide");
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-300 text-left cursor-pointer transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5 text-rose-400" />
              <span>Masquer cet article</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDownMenu(false);
                onThumbsDownOption(article, "lower_cat");
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-500/15 hover:text-amber-300 text-left cursor-pointer transition-colors"
            >
              <TrendingDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">Moins de « {article.category} »</span>
            </button>

            {article.tags && article.tags[0] && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDownMenu(false);
                  onThumbsDownOption(article, "exclude_tag", article.tags[0]);
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-300 text-left cursor-pointer transition-colors"
              >
                <Ban className="w-3.5 h-3.5 text-rose-400" />
                <span className="truncate">Exclure #{article.tags[0]}</span>
              </button>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDownMenu(false);
                onThumbsDownOption(article, "ignore_source");
              }}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-700/50 text-left cursor-pointer transition-colors"
            >
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">Ignorer source « {article.source} »</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Interactive Tag Popover / Action Menu
 */
export interface TagActionModalProps {
  tag: string;
  isOpen: boolean;
  onClose: () => void;
  isFollowed: boolean;
  isBlacklisted: boolean;
  onToggleFollow: (tag: string) => void;
  onToggleBlacklist: (tag: string) => void;
  onFilterOnly: (tag: string) => void;
  isDark: boolean;
}

export const TagActionModal: React.FC<TagActionModalProps> = ({
  tag,
  isOpen,
  onClose,
  isFollowed,
  isBlacklisted,
  onToggleFollow,
  onToggleBlacklist,
  onFilterOnly,
  isDark
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm rounded-2xl border p-4 shadow-2xl space-y-3 ${
          isDark ? "bg-slate-900 border-slate-700 text-slate-100" : "bg-white border-slate-200 text-slate-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-sm">#{tag}</h4>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Que souhaitez-vous faire avec ce sujet d'actualité ?
        </p>

        <div className="space-y-1.5">
          {/* Suivre ⭐ */}
          <button
            onClick={() => {
              onToggleFollow(tag);
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
              isFollowed
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${isFollowed ? "fill-amber-400 text-amber-400" : "text-amber-400"}`} />
              <span>{isFollowed ? "Retirer du Radar" : "Suivre ce sujet (Ajouter au Radar)"}</span>
            </div>
            {isFollowed && <Check className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Filtrer 🔍 */}
          <button
            onClick={() => {
              onFilterOnly(tag);
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 cursor-pointer transition-all"
          >
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filtrer les articles sur #{tag}</span>
          </button>

          {/* Exclure 🚫 */}
          <button
            onClick={() => {
              onToggleBlacklist(tag);
              onClose();
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
              isBlacklisted
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                : "bg-slate-800 hover:bg-rose-950/40 text-slate-200 hover:text-rose-300 border-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-rose-400" />
              <span>{isBlacklisted ? "Retirer de la liste noire" : "Exclure ce sujet (Liste Noire)"}</span>
            </div>
            {isBlacklisted && <Check className="w-3.5 h-3.5 text-rose-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};
