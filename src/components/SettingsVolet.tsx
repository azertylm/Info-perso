import React, { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  RotateCcw,
  Sliders,
  Filter,
  Bookmark,
  Wifi,
  TrendingUp,
  Tag,
  Plus,
  Trash2,
  X,
  Layers,
  Clock,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Check
} from "lucide-react";
import { NewsArticle } from "../types";

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
  // Trends
  trendingTags: string[];
  clickedTrendTag: string | null;
  setClickedTrendTag: (tag: string | null) => void;
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
  trendingTags,
  clickedTrendTag,
  setClickedTrendTag,
  onNotify,
  activeFiltersCount,
  handleClearAllFilters,
}) => {
  const [activeTab, setActiveTab] = useState<"flux_ia" | "filters" | "themes" | "algo">("flux_ia");

  if (!isOpen) return null;

  const isSobre = theme === "monochrome" || theme === "journal";
  const isWarm = theme === "warm" || theme === "sepia";
  const isCyber = theme === "cyberpunk";
  const isFun = theme === "fun";

  const categories = ["Technologie", "IA", "Économie", "Politique", "Science", "Culture", "Sport", "Local"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
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
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
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
                Volet Réglages & Filtres
                {activeFiltersCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500 text-white font-semibold">
                    {activeFiltersCount} actif{activeFiltersCount > 1 ? "s" : ""}
                  </span>
                )}
              </h3>
              <p className="text-xs opacity-75">
                Configurez l'intelligence artificielle, vos critères de lecture et l'algorithme.
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
            onClick={() => setActiveTab("flux_ia")}
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "flux_ia"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Flux & IA
          </button>
          <button
            onClick={() => setActiveTab("filters")}
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "filters"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres & Lecture
          </button>
          <button
            onClick={() => setActiveTab("themes")}
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "themes"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <Tag className="w-4 h-4" />
            Thèmes & Tendances
          </button>
          <button
            onClick={() => setActiveTab("algo")}
            className={`px-3.5 py-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === "algo"
                ? "border-cyan-500 text-cyan-500"
                : "border-transparent opacity-65 hover:opacity-100"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Algorithme
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: FLUX & IA */}
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
                      Générez 10 à 15 nouveaux articles d'actualité vérifiés (&lt; 30 jours) avec croisement de sources fiables.
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
                    {isBulkGenerating ? "Rédaction en cours..." : "Régénérer le flux (15 articles)"}
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
                  Entrez un sujet ou une ville pour que le moteur InfoPerso vérifie les dépêches récentes et rédige un article vérifié.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterestInput}
                    onChange={(e) => setNewInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddCustomInterest();
                    }}
                    placeholder="Ex: Énergies renouvelables, Montpellier, IA Médicale..."
                    className={`flex-1 px-3 py-2 text-xs rounded-xl border outline-none ${
                      isDark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"
                    }`}
                  />
                  <button
                    onClick={handleAddCustomInterest}
                    className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter
                  </button>
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
                          onClick={() => handleGenerateCustomArticle(interest)}
                          disabled={isGeneratingCustom === interest}
                          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                          title="Générer un article vérifié sur ce sujet"
                        >
                          {isGeneratingCustom === interest ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          Rédiger
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
                  onClick={() => {
                    handleResetToBaseline();
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-medium opacity-80 hover:opacity-100 flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Rétablir les dépêches d'origine de l'application
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FILTRES & LECTURE */}
          {activeTab === "filters" && (
            <div className="space-y-6">
              {/* Score Slider */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Seuil de pertinence algorithmique
                  </label>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400">
                    ≥ {minScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={95}
                  step={5}
                  value={minScore}
                  onChange={(e) => setMinScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] opacity-60 mt-1">
                  <span>Tout afficher (40%)</span>
                  <span>Haute pertinence (85%+)</span>
                </div>
              </div>

              {/* Reading time filter */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <label className="text-xs sm:text-sm font-semibold flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Temps de lecture estimé
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "all", label: "Tous formats" },
                    { id: "short", label: "Flash (< 2 min)" },
                    { id: "medium", label: "Moyen (2-4 min)" },
                    { id: "long", label: "Enquête (5+ min)" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setReadingTimeFilter(item.id as any)}
                      className={`px-3 py-2 text-xs rounded-xl font-medium border text-center transition-all cursor-pointer ${
                        readingTimeFilter === item.id
                          ? "bg-cyan-500 text-white border-cyan-500 shadow-sm"
                          : isDark
                          ? "bg-slate-900 border-slate-700 hover:border-slate-600"
                          : "bg-white border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {item.label}
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

          {/* TAB 3: THÈMES & TENDANCES */}
          {activeTab === "themes" && (
            <div className="space-y-6">
              {/* Trending tags cloud */}
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? "bg-slate-800/50 border-slate-700/60" : "bg-slate-50 border-slate-200"
                }`}
              >
                <label className="text-xs sm:text-sm font-semibold flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Mots-clés en tendance directe
                </label>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => {
                    const isSelected = clickedTrendTag === tag;
                    return (
                      <button
                        key={tag}
                        onClick={() => {
                          setClickedTrendTag(isSelected ? null : tag);
                          onNotify(
                            isSelected ? "Filtre tendance retiré." : `Filtre appliqué : #${tag}`
                          );
                        }}
                        className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-all cursor-pointer ${
                          isSelected
                            ? "bg-cyan-500 text-white border-cyan-500"
                            : isDark
                            ? "bg-slate-900 border-slate-700 hover:border-slate-600"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        #{tag} {isSelected && "✕"}
                      </button>
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
                  Pondération des tags
                </label>
                <p className="text-xs opacity-75 mb-3">
                  Boostez vos centres d'intérêt ou masquez les sujets indésirables.
                </p>

                <div className="space-y-2">
                  {trendingTags.slice(0, 8).map((tag) => {
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
                            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
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
                            className={`px-2 py-1 rounded text-[10px] font-bold cursor-pointer ${
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

          {/* TAB 4: ALGORITHME & CATÉGORIES */}
          {activeTab === "algo" && (
            <div className="space-y-6">
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end px-5 py-3 border-t ${
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
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md transition-colors"
          >
            Appliquer & Voir les articles
          </button>
        </div>
      </div>
    </div>
  );
};
