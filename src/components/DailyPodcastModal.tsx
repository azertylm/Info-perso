import React, { useState, useEffect, useRef } from "react";
import { NewsArticle } from "../types";
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Radio,
  Sparkles,
  X,
  ListMusic,
  CheckCircle2,
  Share2
} from "lucide-react";

interface PodcastChapter {
  id: string;
  title: string;
  category: string;
  textToSpeak: string;
  displayScript: string;
  sourceArticle?: NewsArticle;
}

interface DailyPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  isDark: boolean;
  onNotify: (msg: string) => void;
  onOpenArticle?: (article: NewsArticle) => void;
}

export const DailyPodcastModal: React.FC<DailyPodcastModalProps> = ({
  isOpen,
  onClose,
  articles,
  isDark,
  onNotify,
  onOpenArticle
}) => {
  const [chapters, setChapters] = useState<PodcastChapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const activeChapterRef = useRef(0);
  activeChapterRef.current = currentChapterIndex;

  // Initialize speech synth
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSynth(window.speechSynthesis);
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(v => v.lang.startsWith("fr") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Thomas") || v.name.includes("Audrey") || v.name.includes("Henri") || v.name.includes("Celine"))) || voices.find(v => v.lang.startsWith("fr"));
        if (frenchVoice) setSelectedVoice(frenchVoice);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Generate chapters from top 3-4 articles
  useEffect(() => {
    if (!articles || articles.length === 0) return;

    const topArticles = articles.slice(0, 4);
    const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

    const chs: PodcastChapter[] = [];

    // Intro
    chs.push({
      id: "intro",
      title: "Introduction & Sommaire",
      category: "Édito",
      textToSpeak: `Bonjour et bienvenue dans votre Flash Info quotidien du ${today}. Installez-vous confortablement. Au sommaire de cette édition : premièrement, ${topArticles[0]?.title || "les titres majeurs"}. Nous ferons ensuite le point sur ${topArticles[1]?.title || "les actualités clés"}, avant de terminer par ${topArticles[2]?.title || "l'essentiel de l'actualité"}. C'est parti pour trois minutes d'information claire et sans détour.`,
      displayScript: `🎙️ **Édition du ${today}**\n\nBienvenue dans votre Briefing Matinal InfoPerso. Nous synthétisons pour vous les 3 dossiers incontournables du jour.`
    });

    // Main Articles
    topArticles.forEach((art, idx) => {
      const summaryText = art.summary || art.content.slice(0, 260) + ".";
      const cleanSummary = summaryText.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

      chs.push({
        id: `art-${art.id}`,
        title: `${idx + 1}. ${art.title}`,
        category: art.category || "Actualité",
        textToSpeak: `Dossier numéro ${idx + 1}, rubrique ${art.category}, rapporté par ${art.source}. ${art.title}. Retenez l'essentiel : ${cleanSummary}. Une évolution majeure à suivre de près.`,
        displayScript: `**${art.title}**\n\n*Source : ${art.source} • Rubrique : ${art.category}*\n\n${cleanSummary}`,
        sourceArticle: art
      });
    });

    // Outro
    chs.push({
      id: "outro",
      title: "Conclusion & Perspectives",
      category: "Édito",
      textToSpeak: `Voilà pour l'essentiel de votre actualité matinale sur InfoPerso. Retrouvez tous ces articles complets, leurs analyses et vos centres d'intérêt directement dans votre flux interactif. Excellente journée à tous !`,
      displayScript: `✨ **Fin du Briefing InfoPerso**\n\nVous êtes à jour ! Cliquez sur l'un des articles ci-dessus pour approfondir, poser vos questions à l'IA ou écouter les analyses détaillées.`
    });

    setChapters(chs);
    setCurrentChapterIndex(0);
  }, [articles]);

  const stopPlayback = () => {
    if (synth) {
      synth.cancel();
    }
    setIsPlaying(false);
  };

  const playChapter = (index: number) => {
    if (!synth || !chapters[index]) return;
    synth.cancel();

    const chapter = chapters[index];
    const utterance = new SpeechSynthesisUtterance(chapter.textToSpeak);
    utterance.lang = "fr-FR";
    utterance.rate = playbackRate;
    utterance.pitch = 1.0;
    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.onend = () => {
      if (activeChapterRef.current < chapters.length - 1) {
        const next = activeChapterRef.current + 1;
        setCurrentChapterIndex(next);
        playChapter(next);
      } else {
        setIsPlaying(false);
        onNotify("🏁 Briefing Audio Flash terminé !");
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error:", e);
      setIsPlaying(false);
    };

    setCurrentChapterIndex(index);
    setIsPlaying(true);
    synth.speak(utterance);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      playChapter(currentChapterIndex);
    }
  };

  const handleNext = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const next = currentChapterIndex + 1;
      if (isPlaying) {
        playChapter(next);
      } else {
        setCurrentChapterIndex(next);
      }
    }
  };

  const handlePrev = () => {
    if (currentChapterIndex > 0) {
      const prev = currentChapterIndex - 1;
      if (isPlaying) {
        playChapter(prev);
      } else {
        setCurrentChapterIndex(prev);
      }
    }
  };

  const handleClose = () => {
    stopPlayback();
    onClose();
  };

  if (!isOpen) return null;

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          isDark
            ? "bg-gradient-to-b from-slate-900 via-zinc-950 to-black border-indigo-500/30 text-slate-100"
            : "bg-gradient-to-b from-white via-indigo-50/20 to-slate-100 border-indigo-200 text-slate-900"
        }`}
      >
        {/* Header Strip */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-indigo-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                  <span>Podcast Flash 3 Min</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 uppercase font-black tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    Direct
                  </span>
                </h3>
              </div>
              <p className="text-xs opacity-75">
                Chronique audio matinale générée sur vos actualités prioritaires
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-slate-800/40 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Studio Stage: Animated Waveform & Teleprompter */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto scrollbar flex-1">
          {/* Visual Player Deck */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden ${
              isDark
                ? "bg-slate-950/70 border-indigo-500/20 shadow-inner"
                : "bg-white/80 border-indigo-100 shadow-sm"
            }`}
          >
            {/* Audio Wave Visualizer Bars */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-10 w-full">
              {[40, 75, 55, 90, 30, 85, 60, 95, 45, 70, 100, 50, 80, 65, 90, 35].map((height, i) => (
                <div
                  key={i}
                  className={`w-1 sm:w-1.5 rounded-full transition-all duration-300 ${
                    isPlaying
                      ? "bg-gradient-to-t from-indigo-500 to-cyan-400 animate-pulse"
                      : "bg-slate-700/40"
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (height * (Math.sin(i + Date.now() / 300) + 1.2)) / 2)}%` : "20%"
                  }}
                />
              ))}
            </div>

            {/* Current Chapter Badge */}
            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                {currentChapter?.category || "Édito"} • Chapitre {currentChapterIndex + 1} / {chapters.length}
              </span>
              <h4 className="font-extrabold text-sm sm:text-lg leading-snug line-clamp-2 px-2">
                {currentChapter?.title}
              </h4>
            </div>

            {/* Live Teleprompter Text */}
            <div
              className={`w-full p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm leading-relaxed text-left max-h-36 overflow-y-auto scrollbar ${
                isDark ? "bg-black/50 border-slate-800 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <div className="whitespace-pre-line font-serif italic opacity-95">
                {currentChapter?.displayScript}
              </div>
            </div>

            {/* Link to source article if available */}
            {currentChapter?.sourceArticle && onOpenArticle && (
              <button
                onClick={() => {
                  stopPlayback();
                  onOpenArticle(currentChapter.sourceArticle!);
                  onClose();
                }}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline underline-offset-4 flex items-center gap-1 cursor-pointer"
              >
                <span>Lire l'article complet & sources détaillées</span>
              </button>
            )}
          </div>

          {/* Chapters Timeline List */}
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
              <ListMusic className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sommaire du Briefing</span>
            </h5>
            <div className="space-y-1 max-h-44 overflow-y-auto scrollbar pr-1">
              {chapters.map((ch, idx) => {
                const isCurrent = idx === currentChapterIndex;
                return (
                  <button
                    key={ch.id}
                    onClick={() => playChapter(idx)}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-indigo-600 text-white border-indigo-400 shadow-md font-bold"
                        : isDark
                        ? "hover:bg-slate-900 border-slate-800/80 text-slate-300"
                        : "hover:bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                        isCurrent ? "bg-white/20 text-white" : isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600"
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs truncate font-medium">{ch.title}</div>
                        <div className="text-[10px] opacity-75">{ch.category}</div>
                      </div>
                    </div>
                    {isCurrent && isPlaying && (
                      <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Master Audio Controller Footer */}
        <div className="p-3 sm:p-4 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 bg-black/20">
          {/* Rate Selection */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] opacity-60 font-mono hidden xs:inline">Vitesse:</span>
            {[0.85, 1.0, 1.25, 1.5].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setPlaybackRate(r);
                  if (isPlaying) {
                    playChapter(currentChapterIndex);
                  }
                }}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  playbackRate === r
                    ? "bg-indigo-600 text-white shadow-xs"
                    : isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Center Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentChapterIndex === 0}
              className="p-2.5 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Chapitre précédent"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className={`px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              <span>{isPlaying ? "Pause" : "Écouter le Briefing"}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentChapterIndex === chapters.length - 1}
              className="p-2.5 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Chapitre suivant"
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>

          {/* Close or Stop */}
          <button
            onClick={handleClose}
            className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-700/60 hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
