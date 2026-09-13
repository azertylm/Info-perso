import React from "react";
import { NewsArticle } from "../types";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Download,
  FileText,
  Sparkles,
  Maximize2,
  Minimize2,
  Quote,
  Share2
} from "lucide-react";

interface FlexTabletopDeckProps {
  article: NewsArticle;
  isPlayingSpeech: boolean;
  onToggleSpeech: () => void;
  speechRate: number;
  onChangeSpeechRate: (rate: number) => void;
  onNextArticle?: () => void;
  onPrevArticle?: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  fontScale: number;
  onChangeFontScale: (scale: number) => void;
  isDark: boolean;
  onToggleDark: () => void;
  onExportHtml: (isDarkTheme: boolean) => void;
  zenMode: boolean;
  onToggleZen: () => void;
  extractedQuotes?: string[];
  onExtractQuotes?: () => void;
  isExtractingQuotes?: boolean;
}

export const FlexTabletopDeck: React.FC<FlexTabletopDeckProps> = ({
  article,
  isPlayingSpeech,
  onToggleSpeech,
  speechRate,
  onChangeSpeechRate,
  onNextArticle,
  onPrevArticle,
  hasNext,
  hasPrev,
  fontScale,
  onChangeFontScale,
  isDark,
  onToggleDark,
  onExportHtml,
  zenMode,
  onToggleZen,
  extractedQuotes = [],
  onExtractQuotes,
  isExtractingQuotes
}) => {
  return (
    <div
      className={`w-full border-t shadow-2xl p-3 sm:p-4 transition-all duration-300 select-none flex flex-col justify-between gap-3 ${
        isDark
          ? "bg-gradient-to-b from-slate-900 to-black border-cyan-500/30 text-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
          : "bg-gradient-to-b from-slate-50 to-white border-slate-300 text-slate-900 shadow-[0_-8px_24px_rgba(0,0,0,0.08)]"
      }`}
    >
      {/* Top Status Strip: Fold Flex Mode Active Banner */}
      <div className="flex items-center justify-between gap-2 border-b pb-2 border-slate-700/30">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 shrink-0">
            <span>📐 Pupitre Tactile Flex</span>
          </span>
          <span className="text-xs font-semibold truncate opacity-85">
            {article.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleDark}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
            }`}
            title="Basculer Fond Noir OLED / Clair"
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onToggleZen}
            className={`px-2 py-1 rounded-xl border text-[11px] font-bold cursor-pointer transition-all ${
              zenMode
                ? "bg-indigo-600 text-white border-indigo-500"
                : isDark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-700 border-slate-200"
            }`}
            title="Mode Zen plein écran"
          >
            {zenMode ? "Zen Activé" : "Zen"}
          </button>
        </div>
      </div>

      {/* Primary Row: Audio TTS Presenter + Navigation */}
      <div className="grid grid-cols-12 gap-2 sm:gap-3 items-center">
        {/* Navigation Prev Button */}
        <button
          onClick={onPrevArticle}
          disabled={!hasPrev}
          className={`col-span-2 h-12 rounded-2xl border flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
            hasPrev
              ? isDark ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 active:scale-95" : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800 active:scale-95"
              : "opacity-35 cursor-not-allowed border-transparent bg-transparent"
          }`}
          title="Article précédent"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Large Play/Pause TTS Presenter Deck (Center) */}
        <div className="col-span-8 flex items-center gap-2 p-1.5 rounded-2xl border bg-indigo-500/10 border-indigo-500/30">
          <button
            onClick={onToggleSpeech}
            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer shrink-0 ${
              isPlayingSpeech
                ? "bg-rose-500 text-white shadow-rose-500/30 animate-pulse"
                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/30"
            }`}
            title={isPlayingSpeech ? "Mettre en pause la lecture" : "Écouter l'article"}
          >
            {isPlayingSpeech ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1 text-indigo-400">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isPlayingSpeech ? "Lecture vocale en cours..." : "Présentateur Vocal"}</span>
              </span>
              <span className="font-mono text-[10px] opacity-75">{speechRate}x</span>
            </div>
            {/* Speed Buttons */}
            <div className="flex items-center gap-1 mt-1">
              {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  onClick={() => onChangeSpeechRate(rate)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    speechRate === rate
                      ? "bg-indigo-600 text-white shadow-xs"
                      : isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-800"
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Next Button */}
        <button
          onClick={onNextArticle}
          disabled={!hasNext}
          className={`col-span-2 h-12 rounded-2xl border flex items-center justify-center font-bold text-xs transition-all cursor-pointer ${
            hasNext
              ? isDark ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 active:scale-95" : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800 active:scale-95"
              : "opacity-35 cursor-not-allowed border-transparent bg-transparent"
          }`}
          title="Article suivant"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Secondary Controls: Font Zoom + HTML Export */}
      <div className="flex items-center justify-between gap-2 pt-1">
        {/* Font Zoom tactile pills */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] opacity-65 font-bold uppercase tracking-wider hidden xs:inline">
            Zoom :
          </span>
          <div className="flex items-center rounded-xl p-0.5 border border-slate-700/40 bg-slate-800/30">
            <button
              onClick={() => onChangeFontScale(Math.max(0.85, fontScale - 0.15))}
              className="px-2.5 py-1 text-xs font-black hover:text-indigo-400 cursor-pointer"
              title="Diminuer texte"
            >
              A-
            </button>
            <span className="px-2 text-[11px] font-mono font-bold text-indigo-400">
              {Math.round(fontScale * 100)}%
            </span>
            <button
              onClick={() => onChangeFontScale(Math.min(1.6, fontScale + 0.15))}
              className="px-2.5 py-1 text-xs font-black hover:text-indigo-400 cursor-pointer"
              title="Agrandir texte"
            >
              A+
            </button>
          </div>
        </div>

        {/* Quotes Extractor / Peek */}
        {onExtractQuotes && (
          <button
            onClick={onExtractQuotes}
            disabled={isExtractingQuotes}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300"
                : "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900"
            }`}
            title="Extraire les citations clés de l'article"
          >
            <Quote className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Citations clés</span>
          </button>
        )}

        {/* HTML Export buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onExportHtml(true)}
            className="px-2.5 py-1.5 rounded-xl bg-black hover:bg-zinc-900 text-zinc-100 border border-zinc-700 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            title="Télécharger l'article en fichier HTML autonome Fond Noir"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>HTML Noir</span>
          </button>
          <button
            onClick={() => onExportHtml(false)}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
            title="Télécharger l'article en fichier HTML autonome Fond Clair"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden xs:inline">Clair</span>
          </button>
        </div>
      </div>

      {/* Extracted Pull Quotes Carousel if present */}
      {extractedQuotes && extractedQuotes.length > 0 && (
        <div className="pt-1.5 border-t border-slate-700/20 overflow-x-auto no-scrollbar flex items-center gap-2">
          <Quote className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          {extractedQuotes.map((q, i) => (
            <div
              key={i}
              className={`px-2.5 py-1 rounded-xl text-[11px] italic shrink-0 max-w-[280px] truncate border ${
                isDark ? "bg-slate-800/80 border-slate-700 text-slate-200" : "bg-amber-50/80 border-amber-200 text-amber-950"
              }`}
              title={q}
            >
              {q}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
