import React, { useState, useEffect, useRef } from "react";
import { NewsArticle } from "../types";
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Rewind,
  Volume2,
  VolumeX,
  Sparkles,
  X,
  ListMusic,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Headphones,
  Users,
  Zap,
  ShieldAlert,
  ExternalLink,
  Flame,
  MessageSquare,
  Cpu,
  Loader2,
  RotateCw,
  Download,
  Maximize2,
  FileText,
  HardDrive,
  RefreshCw,
  Star
} from "lucide-react";
import { normalizeFrenchPhonetics, injectSpeechProsody, purgeFillerWords } from "../lib/phoneticNormalizer";
import {
  computeAudioHash,
  getCachedAudio,
  saveCachedAudio,
  getAudioCacheMetrics
} from "../lib/podcastAudioCache";
import {
  PodcastChapter,
  PodcastFormat,
  generateFivePodcastChapters,
  saveListenedArticleIds,
  getListenedArticleIds,
  clearListenedArticleIds,
  buildEssentialBrief
} from "../lib/podcastCurator";

export type { PodcastFormat, PodcastChapter };

interface DailyPodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  isDark: boolean;
  onNotify: (msg: string) => void;
  onOpenArticle?: (article: NewsArticle) => void;
  geminiApiKey?: string;
}

// Web Audio API Sound generator for radio studio jingles (No external sound files required)
class RadioAudioEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Radio Station Chime Intro (Short direct chime)
  playIntroJingle() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440.0, 523.25]; // A4, C5 (Bref, 2 notes sèches)

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.10);

        gain.gain.setValueAtTime(0, now + idx * 0.10);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.10 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.10 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.10);
        osc.stop(now + idx * 0.10 + 0.28);
      });
    } catch {
      // AudioContext might be blocked before user gesture
    }
  }

  // Subtle chapter change ping / swoosh (80ms sec)
  playChapterPing() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08);

      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.10);
    } catch {
      // Ignore
    }
  }

  // Outro closing chord
  playOutroJingle() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 440.0];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.10);

        gain.gain.setValueAtTime(0.12, now + idx * 0.10);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.10 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.10);
        osc.stop(now + idx * 0.10 + 0.35);
      });
    } catch {
      // Ignore
    }
  }
}

const radioAudio = new RadioAudioEngine();

/**
 * Règle stricte des 3 phrases par dossier (Solution 3) & Attaque In Media Res (Solution 2)
 */
function buildThreeSentenceBrief(
  art: NewsArticle,
  fmt: PodcastFormat,
  index: number
): {
  title: string;
  textToSpeak: string;
  displayScript: string;
  keyTakeaway: string;
} {
  const cleanSummary = purgeFillerWords(art.summary || art.content || "");
  const sentences = cleanSummary
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15 && !s.toLowerCase().startsWith("retrouvez"));

  // Phrase 1 : Fait brut vérifié (Attaque directe sans préambule)
  let p1 = sentences[0] || `${art.title}.`;
  p1 = purgeFillerWords(p1);
  if (!p1.endsWith(".") && !p1.endsWith("!") && !p1.endsWith("?")) p1 += ".";

  // Phrase 2 : Donnée chiffrée ou mécanisme d'action
  let p2 = sentences[1] || `Le dossier engage directement les équilibres du secteur ${art.category || "économique"}.`;
  p2 = purgeFillerWords(p2);
  if (!p2.endsWith(".") && !p2.endsWith("!") && !p2.endsWith("?")) p2 += ".";

  // Phrase 3 : Conséquence directe pour le citoyen ou le marché
  let p3 = sentences[2] || `Les arbitrages en cours fixeront les conditions opérationnelles des prochains mois.`;
  p3 = purgeFillerWords(p3);
  if (!p3.endsWith(".") && !p3.endsWith("!") && !p3.endsWith("?")) p3 += ".";

  if (fmt === "strategic") {
    p3 = `Conséquence stratégique : ${p3}`;
  } else if (fmt === "impact") {
    p3 = `Impact économique : ${p3}`;
  }

  // Pas de connecteurs oratoires, juste les 3 faits enchaînés
  const textToSpeak = `${p1} ${p2} ${p3}`;
  const displayScript = `⚡ **1. Fait brut :** ${p1}\n\n📊 **2. Donnée clé :** ${p2}\n\n🎯 **3. Conséquence directe :** ${p3}`;
  const keyTakeaway = sentences[0]?.slice(0, 85) || art.title;

  return {
    title: `${index + 1}. ${art.title}`,
    textToSpeak,
    displayScript,
    keyTakeaway
  };
}

export const DailyPodcastModal: React.FC<DailyPodcastModalProps> = ({
  isOpen,
  onClose,
  articles,
  isDark,
  onNotify,
  onOpenArticle,
  geminiApiKey
}) => {
  const [format, setFormat] = useState<PodcastFormat>("express");
  const [chapters, setChapters] = useState<PodcastChapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.1); // Solution 12: Cadence dynamique 1.1x standard radio
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [voiceEngine, setVoiceEngine] = useState<"neural" | "local">("neural"); // Solution 6, 7, 8
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Écoute continue et renouvellement automatique de 5 chapitres selon les intérêts
  const [listenedIds, setListenedIds] = useState<Set<number>>(() => getListenedArticleIds());
  const [autoRenew, setAutoRenew] = useState(true);

  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [voiceJournaliste, setVoiceJournaliste] = useState<SpeechSynthesisVoice | null>(null);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);

  // Solutions 11, 12, 13 : Suivi temps réel du lecteur & Buffer de pré-chargement audio
  const [chapterProgress, setChapterProgress] = useState(0); // 0 à 100%
  const [chapterCurrentTime, setChapterCurrentTime] = useState(0);
  const [chapterDuration, setChapterDuration] = useState(30);
  const [isDownloading, setIsDownloading] = useState(false);
  const prefetchedAudiosRef = useRef<Record<number, { audioBase64: string; mimeType: string }>>({});
  const localTimerRef = useRef<any>(null);

  // Solutions 16, 17, 19, 20 : Cache IndexedDB, métriques de latence & mode prompteur
  const [audioLatency, setAudioLatency] = useState<{ ms: number; source: string } | null>(null);
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState(false);
  const [cacheStats, setCacheStats] = useState<{ count: number; totalSizeKB: number } | null>(null);

  const activeChapterRef = useRef(0);
  activeChapterRef.current = currentChapterIndex;
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  // Charger les métriques du cache local au démarrage (Solution 20)
  useEffect(() => {
    getAudioCacheMetrics().then(setCacheStats);
  }, []);

  // Initialize SpeechSynthesis (Single authoritative journalist voice - Solution 1)
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const s = window.speechSynthesis;
      setSynth(s);

      const setupVoices = () => {
        const voices = s.getVoices();
        const frVoices = voices.filter((v) => v.lang.startsWith("fr"));

        if (frVoices.length > 0) {
          const preferredVoice =
            frVoices.find(
              (v) =>
                v.name.toLowerCase().includes("natural") ||
                v.name.toLowerCase().includes("google") ||
                v.name.toLowerCase().includes("thomas") ||
                v.name.toLowerCase().includes("henri") ||
                v.name.toLowerCase().includes("denise") ||
                v.name.toLowerCase().includes("audrey")
            ) || frVoices[0];

          setVoiceJournaliste(preferredVoice);
        }
      };

      setupVoices();
      s.onvoiceschanged = setupVoices;
    }
  }, []);

  // Initialisation : Exactement 5 chapitres dès le début, ordonnés par affinité auditeur
  useEffect(() => {
    if (articles.length > 0) {
      const { chapters: genChapters } = generateFivePodcastChapters(articles, format, listenedIds);
      setChapters(genChapters);
      setCurrentChapterIndex(0);
    }
  }, [articles, format]);

  // Recréation des 5 chapitres : dès qu'une écoute est achevée ou sur demande utilisateur
  const handleRenewFiveChapters = (autoStartNext: boolean = false) => {
    stopPlayback();

    // 1. Récupérer les IDs des 5 dossiers actuels pour les marquer comme écoutés
    const finishedIds = chapters
      .map((c) => c.sourceArticle?.id)
      .filter((id): id is number => typeof id === "number");

    saveListenedArticleIds(finishedIds);
    const updated = new Set([...Array.from(listenedIds), ...finishedIds]);
    setListenedIds(updated);

    // 2. Sélectionner les 5 prochains articles les plus pertinents selon les centres d'intérêt
    const { chapters: nextChapters } = generateFivePodcastChapters(articles, format, updated);

    if (nextChapters.length > 0) {
      setChapters(nextChapters);
      setCurrentChapterIndex(0);
      prefetchedAudiosRef.current = {};
      onNotify("✨ 5 nouveaux chapitres créés sur mesure selon vos intérêts !");

      if (autoStartNext) {
        setTimeout(() => {
          playChapter(0);
        }, 500);
      }
    } else {
      // Cycle complet achevé : on réinitialise pour recommencer un flux sans blocage
      clearListenedArticleIds();
      setListenedIds(new Set());
      const { chapters: freshChapters } = generateFivePodcastChapters(articles, format, new Set());
      setChapters(freshChapters);
      setCurrentChapterIndex(0);
      prefetchedAudiosRef.current = {};
      onNotify("🔄 Cycle d'écoute complet ! 5 nouveaux dossiers réinitialisés.");

      if (autoStartNext) {
        setTimeout(() => {
          playChapter(0);
        }, 500);
      }
    }
  };

  // AI Script Generation with Gemini (Strictly Monologue, In Media Res, 5 dossiers x 3 sentences = 15 facts)
  const handleGenerateScriptWithAI = async () => {
    if (!articles || articles.length === 0) return;
    setIsGeneratingAI(true);
    onNotify("⚡ Rédaction express du flash (5 dossiers sur mesure)...");

    try {
      const { selectedArticles } = generateFivePodcastChapters(articles, format, listenedIds);
      const topArts = selectedArticles.map((a, i) => ({
        index: i + 1,
        title: a.title,
        source: a.source,
        category: a.category,
        summary: purgeFillerWords(a.summary || a.content.slice(0, 260))
      }));

      const prompt = `Tu es un rédacteur en chef d'agence de presse radio (style dépêche AFP / flash chrono InfoPerso).
RÈGLES ABSOLUES ET STRICTES :
1. FORMAT : MONOLOGUE JOURNALISTIQUE UNIQUE (Une seule voix, solo). INTERDICTION FORMELLE DE FAIRE UN DIALOGUE, UNE INTERVIEW OU D'UTILISER DEUX PERSONNAGES.
2. ATTAQUE IN MEDIA RES : Zéro introduction, zéro formule de bienvenue, zéro "Bonjour à tous". Le tout premier mot est directement le fait de l'article 1.
3. RÈGLE STRICTE DES 3 PHRASES PAR DOSSIER (Strictement 3 phrases par dossier, exactement 5 dossiers = 15 phrases denses au total) :
   - Phrase 1 : Le fait brut vérifié (Sujet + Verbe d'action au présent, droit au but).
   - Phrase 2 : Le chiffre clé ou mécanisme stratégique précis.
   - Phrase 3 : La conséquence directe pour le citoyen ou le secteur.
4. ZÉRO FORMULE DE CONCLUSION NI D'ADIEU : Aucune phrase de fin type "Merci de nous avoir écoutés", "Bonne journée", "À demain". L'émission s'arrête net sur la dernière conséquence du 5ème dossier.
5. ÉLAGAGE TOTAL : Interdiction des connecteurs creux ("En effet", "Notons que", "Il convient de noter", "Force est de constater").
6. EXACTEMENT 5 DOSSIERS DANS L'ORDRE D'INTÉRÊT :

Dossiers à traiter :
${JSON.stringify(topArts, null, 2)}

Format JSON requis :
{
  "chapters": [
    {
      "speaker": "journaliste",
      "speakerName": "Journaliste InfoPerso",
      "title": "Titre direct du dossier",
      "category": "Catégorie",
      "textToSpeak": "Exactement les 3 phrases enchaînées sans fioritures.",
      "displayScript": "⚡ **1. Fait brut :** Phrase 1\\n\\n📊 **2. Donnée clé :** Phrase 2\\n\\n🎯 **3. Conséquence :** Phrase 3",
      "keyTakeaway": "Point clé en 1 phrase courte",
      "articleIndex": 1
    }
  ]
}`;

      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "gemini",
          model: "gemini-3.5-flash-lite",
          apiKey: geminiApiKey || "",
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.message?.content || data?.content || "";
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          if (parsed.chapters && Array.isArray(parsed.chapters) && parsed.chapters.length > 0) {
            const aiChapters: PodcastChapter[] = parsed.chapters.map((ch: any, idx: number) => {
              const art = ch.articleIndex ? selectedArticles[ch.articleIndex - 1] : selectedArticles[idx] || articles[idx];
              return {
                id: `ai-brief-${idx}-${Date.now()}`,
                speaker: "journaliste",
                speakerName: "Journaliste InfoPerso",
                title: ch.title || `${idx + 1}. ${art?.title || "Dossier prioritaire"}`,
                category: ch.category || art?.category || "Actualité",
                textToSpeak: purgeFillerWords(ch.textToSpeak),
                displayScript: ch.displayScript || ch.textToSpeak,
                keyTakeaway: ch.keyTakeaway,
                sourceArticle: art,
                interestReason: "IA éditoriale calibrée"
              };
            });

            setChapters(aiChapters);
            setCurrentChapterIndex(0);
            stopPlayback();
            onNotify("⚡ Flash audio 5 dossiers calibré avec succès !");
            return;
          }
        }
      }
      throw new Error("Format de réponse non reconnu");
    } catch (err) {
      console.warn("AI Script generation error:", err);
      onNotify("⚡ Flash 5 dossiers optimisé prêt en mode direct.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Audio Playback Engine (Solutions 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)
  const stopPlayback = () => {
    if (localTimerRef.current) {
      clearInterval(localTimerRef.current);
      localTimerRef.current = null;
    }
    if (htmlAudioRef.current) {
      htmlAudioRef.current.pause();
      htmlAudioRef.current.currentTime = 0;
      htmlAudioRef.current = null;
    }
    if (synth) {
      synth.cancel();
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
    setChapterProgress(0);
    setChapterCurrentTime(0);
  };

  // Solution 13 & 16 : Pré-chargement buffer en tâche de fond + Cache persistant IndexedDB
  const prefetchNextChapterAudio = async (nextIndex: number) => {
    if (voiceEngine !== "neural" || !chapters[nextIndex]) return;
    if (prefetchedAudiosRef.current[nextIndex]) return;

    try {
      const textToSpeak = chapters[nextIndex].textToSpeak;
      const textHash = await computeAudioHash(textToSpeak);

      // 1. Vérifier si présent dans le cache persistant IndexedDB
      const localCached = await getCachedAudio(textHash);
      if (localCached) {
        prefetchedAudiosRef.current[nextIndex] = localCached;
        return;
      }

      // 2. Sinon, appel en arrière-plan vers le serveur
      const res = await fetch("/api/podcast/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToSpeak,
          speed: playbackRate,
          apiKey: geminiApiKey || ""
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.audioBase64) {
          const item = {
            audioBase64: data.audioBase64,
            mimeType: data.mimeType || "audio/mp3"
          };
          prefetchedAudiosRef.current[nextIndex] = item;
          // Sauvegarder dans le cache IndexedDB souverain
          await saveCachedAudio(textHash, item.audioBase64, item.mimeType);
          getAudioCacheMetrics().then(setCacheStats);
        }
      }
    } catch (e) {
      console.debug("[Prefetch] Tampon discret silencieux:", e);
    }
  };

  // Solution 12 : Saut d'écoute rapide (-10s / +10s)
  const handleSeek = (deltaSeconds: number) => {
    if (htmlAudioRef.current) {
      const cur = htmlAudioRef.current.currentTime || 0;
      const dur = htmlAudioRef.current.duration || 30;
      const target = Math.max(0, Math.min(dur, cur + deltaSeconds));
      htmlAudioRef.current.currentTime = target;
      setChapterCurrentTime(target);
      if (dur > 0) {
        setChapterProgress((target / dur) * 100);
      }
    } else if (synth) {
      playLocalUtterance(chapters[currentChapterIndex], false);
      onNotify(deltaSeconds < 0 ? "⏪ Recul au début du dossier" : "⏩ Avance rapide");
    }
  };

  // Solution 15 : Téléchargement MP3 direct en 1 clic pour écoute nomade hors-ligne
  const handleDownloadAudio = async () => {
    const ch = chapters[currentChapterIndex];
    if (!ch) return;

    setIsDownloading(true);
    try {
      let base64 = prefetchedAudiosRef.current[currentChapterIndex]?.audioBase64;
      let mime = prefetchedAudiosRef.current[currentChapterIndex]?.mimeType || "audio/mp3";

      if (!base64) {
        const res = await fetch("/api/podcast/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: ch.textToSpeak,
            speed: playbackRate,
            apiKey: geminiApiKey || ""
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.audioBase64) {
            base64 = data.audioBase64;
            mime = data.mimeType || "audio/mp3";
          }
        }
      }

      if (base64) {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `InfoPerso-Flash90s-Dossier-${currentChapterIndex + 1}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        onNotify("📥 Téléchargement MP3 réussi ! Prêt pour le métro ou l'avion.");
      } else {
        handleCopyFullScript();
        onNotify("ℹ️ Fichier audio indisponible hors-ligne : script copié.");
      }
    } catch (e) {
      console.warn("[Download] Erreur téléchargement audio:", e);
      onNotify("Erreur lors de l'exportation audio.");
    } finally {
      setIsDownloading(false);
    }
  };

  const playLocalUtterance = (chapter: PodcastChapter, isFirstChapter: boolean) => {
    if (!synth) return;
    synth.cancel();
    if (localTimerRef.current) clearInterval(localTimerRef.current);

    // Solution 9 & 10 : Normalisation phonétique et micro-pauses respiratoires pour fluidité maximale
    const prosodyText = injectSpeechProsody(chapter.textToSpeak);
    const utterance = new SpeechSynthesisUtterance(prosodyText);
    utterance.lang = "fr-FR";
    utterance.rate = playbackRate;

    if (voiceJournaliste) {
      utterance.voice = voiceJournaliste;
    }
    utterance.pitch = 1.0;

    // Simulation de progression pour la synthèse vocale locale
    const words = chapter.textToSpeak.split(/\s+/).length;
    const estimatedDuration = Math.max(12, Math.round((words / 150) * 60 / playbackRate));
    setChapterDuration(estimatedDuration);
    setChapterCurrentTime(0);
    setChapterProgress(0);

    const startTime = Date.now();
    localTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setChapterCurrentTime(Math.min(estimatedDuration, elapsed));
      setChapterProgress(Math.min(99, (elapsed / estimatedDuration) * 100));
    }, 200);

    utterance.onend = () => {
      if (localTimerRef.current) {
        clearInterval(localTimerRef.current);
        localTimerRef.current = null;
      }
      setChapterProgress(100);

      if (activeChapterRef.current < chapters.length - 1) {
        const nextIdx = activeChapterRef.current + 1;
        setCurrentChapterIndex(nextIdx);
        setTimeout(() => {
          if (isPlayingRef.current) {
            playChapter(nextIdx);
          }
        }, 180);
      } else {
        if (soundEffectsEnabled) {
          radioAudio.playOutroJingle();
        }
        // Recréer automatiquement 5 chapitres dès l'écoute achevée
        handleRenewFiveChapters(autoRenew);
      }
    };

    utterance.onerror = (e) => {
      if (localTimerRef.current) clearInterval(localTimerRef.current);
      console.warn("[TTS] Speech error:", e);
      setIsPlaying(false);
    };

    setIsPlaying(true);
    const delay = soundEffectsEnabled && isFirstChapter ? 450 : 80;
    setTimeout(() => {
      synth.speak(utterance);
    }, delay);
  };

  const playAudioElement = (
    audioBase64: string,
    mimeType: string,
    chapter: PodcastChapter,
    isFirstChapter: boolean,
    index: number
  ) => {
    const audioUrl = `data:${mimeType || "audio/mp3"};base64,${audioBase64}`;
    const audio = new Audio(audioUrl);
    audio.playbackRate = playbackRate;
    htmlAudioRef.current = audio;

    audio.ontimeupdate = () => {
      if (audio.duration && audio.duration > 0) {
        setChapterCurrentTime(audio.currentTime);
        setChapterDuration(audio.duration);
        setChapterProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.onended = () => {
      setChapterProgress(100);
      if (activeChapterRef.current < chapters.length - 1) {
        const nextIdx = activeChapterRef.current + 1;
        setCurrentChapterIndex(nextIdx);
        setTimeout(() => {
          if (isPlayingRef.current) {
            playChapter(nextIdx);
          }
        }, 180);
      } else {
        if (soundEffectsEnabled) {
          radioAudio.playOutroJingle();
        }
        // Recréer automatiquement 5 chapitres dès l'écoute achevée
        handleRenewFiveChapters(autoRenew);
      }
    };

    audio.onerror = () => {
      console.warn("[TTS] Erreur lecture audio HTML5, bascule locale...");
      setIsLoadingAudio(false);
      playLocalUtterance(chapter, isFirstChapter);
    };

    setIsLoadingAudio(false);

    // Déclencher le pré-chargement en tâche de fond du dossier suivant (Solution 13)
    if (index + 1 < chapters.length) {
      prefetchNextChapterAudio(index + 1);
    }

    const delay = soundEffectsEnabled && isFirstChapter ? 450 : 80;
    setTimeout(() => {
      if (isPlayingRef.current) {
        audio.play().catch(() => {
          playLocalUtterance(chapter, isFirstChapter);
        });
      }
    }, delay);
  };

  const playChapter = async (index: number) => {
    if (!chapters[index]) return;
    stopPlayback();

    const chapter = chapters[index];
    const isFirstChapter = index === 0;
    setCurrentChapterIndex(index);
    setIsPlaying(true);
    setChapterProgress(0);
    setChapterCurrentTime(0);

    // Sound effect: Intro Jingle or Chapter Ping
    if (soundEffectsEnabled) {
      if (isFirstChapter) {
        radioAudio.playIntroJingle();
      } else {
        radioAudio.playChapterPing();
      }
    }

    // Solution 6, 7, 8, 16, 20 : Essai prioritaire mémoire, IndexedDB et moteur TTS Neuronal HD
    if (voiceEngine === "neural") {
      const startT = performance.now();

      // 1. Vérifier si déjà en mémoire tampon RAM pré-chargée (Solution 13)
      const cachedBuffer = prefetchedAudiosRef.current[index];
      if (cachedBuffer) {
        setAudioLatency({ ms: Math.round(performance.now() - startT), source: "Buffer RAM (0 ms)" });
        playAudioElement(cachedBuffer.audioBase64, cachedBuffer.mimeType, chapter, isFirstChapter, index);
        return;
      }

      // 2. Vérifier si déjà dans le cache persistant IndexedDB (Solution 16)
      try {
        const textHash = await computeAudioHash(chapter.textToSpeak);
        const idbCached = await getCachedAudio(textHash);
        if (idbCached) {
          const latency = Math.round(performance.now() - startT);
          setAudioLatency({ ms: latency, source: "Cache local souverain (0 ms)" });
          prefetchedAudiosRef.current[index] = idbCached;
          playAudioElement(idbCached.audioBase64, idbCached.mimeType, chapter, isFirstChapter, index);
          return;
        }

        // 3. Synthèse via le serveur (Piper VPS / Cloud TTS)
        setIsLoadingAudio(true);
        const res = await fetch("/api/podcast/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: chapter.textToSpeak,
            speed: playbackRate,
            apiKey: geminiApiKey || ""
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.audioBase64) {
            const item = {
              audioBase64: data.audioBase64,
              mimeType: data.mimeType || "audio/mp3"
            };
            const latency = Math.round(performance.now() - startT);
            const sourceLabel =
              data.source === "sovereign_piper_vps"
                ? "VPS OVH Piper"
                : data.source === "cache"
                ? "Cache serveur"
                : "Synthèse HD";
            setAudioLatency({ ms: latency, source: sourceLabel });

            // Stocker en mémoire vive et dans IndexedDB (Solution 16)
            prefetchedAudiosRef.current[index] = item;
            await saveCachedAudio(textHash, item.audioBase64, item.mimeType);
            getAudioCacheMetrics().then(setCacheStats);

            playAudioElement(item.audioBase64, item.mimeType, chapter, isFirstChapter, index);
            return;
          }
        }
      } catch (err) {
        console.warn("[TTS] Erreur appel API TTS neuronal:", err);
      } finally {
        setIsLoadingAudio(false);
      }
    }

    // Solution 9 & 10 : Moteur local optimisé avec phonétique et prosodie
    setAudioLatency({ ms: 0, source: "Voix Système Locale" });
    playLocalUtterance(chapter, isFirstChapter);
  };

  // Solution 14 : Synchronisation native avec MediaSession API (Écran de verrouillage, Bluetooth, Écouteurs)
  useEffect(() => {
    if (typeof window === "undefined" || !("mediaSession" in navigator)) return;
    const currentChapter = chapters[currentChapterIndex];
    if (!currentChapter) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${currentChapterIndex + 1}. ${currentChapter.title.replace(/^\d+\.\s*/, "")}`,
        artist: "InfoPerso — ALPHABETTE SASU",
        album: "Flash Vocal 90s Chrono",
        artwork: [
          { src: "/favicon.ico", sizes: "96x96", type: "image/x-icon" },
          { src: "/logo.png", sizes: "512x512", type: "image/png" }
        ]
      });

      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";

      navigator.mediaSession.setActionHandler("play", () => {
        if (!isPlayingRef.current) playChapter(activeChapterRef.current);
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        stopPlayback();
      });
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        handlePrev();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        handleNext();
      });
      navigator.mediaSession.setActionHandler("seekbackward", () => {
        handleSeek(-10);
      });
      navigator.mediaSession.setActionHandler("seekforward", () => {
        handleSeek(10);
      });
    } catch (err) {
      console.debug("[MediaSession] Non supporté:", err);
    }
  }, [currentChapterIndex, chapters, isPlaying]);

  // Solution 17 : Gestion des interruptions audio et déchargement de page
  useEffect(() => {
    const handlePageHide = () => {
      stopPlayback();
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

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

  const handleCopyFullScript = () => {
    const fullText = chapters
      .map((c) => `### ${c.speakerName} : ${c.title}\n${c.textToSpeak}\n`)
      .join("\n---\n\n");
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    onNotify("📋 Script complet des 5 dossiers copié dans le presse-papiers !");
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleCopyCurrentChapter = () => {
    const ch = chapters[currentChapterIndex];
    if (!ch) return;
    const text = `=== DOSSIER ${currentChapterIndex + 1} : ${ch.title.toUpperCase()} ===\n${ch.displayScript || ch.textToSpeak}\n`;
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    onNotify("📋 Dossier copié dans le presse-papiers (1 clic) !");
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleClose = () => {
    stopPlayback();
    onClose();
  };

  if (!isOpen) return null;

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
          isDark
            ? "bg-zinc-950 border-zinc-800 text-white"
            : "bg-white border-zinc-300 text-zinc-900"
        }`}
      >
        {/* Ligne 1 unique ultra-compacte : Titre, 5 dossiers, bouton régénérer 5 et contrôles */}
        <div
          className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b shrink-0 ${
            isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          {/* Titre & Statut */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                isDark
                  ? "bg-zinc-900 border-zinc-750 text-white"
                  : "bg-white border-zinc-300 text-zinc-900"
              }`}
            >
              <Radio className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isPlaying ? "animate-pulse" : "opacity-80"}`} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs sm:text-sm tracking-tight text-zinc-900 dark:text-white truncate">
                  Flash 90 secondes
                </h3>
                <span className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium shrink-0">
                  5 dossiers
                </span>
                {isPlaying && (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Lecture
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions : Régénération facile de 5 dossiers + options discrètes */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Bouton principal : Régénérer 5 facilement */}
            <button
              onClick={() => handleRenewFiveChapters(false)}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                isDark
                  ? "bg-white text-black hover:bg-zinc-200 border-white"
                  : "bg-black text-white hover:bg-zinc-800 border-black"
              }`}
              title="Régénérer immédiatement 5 nouveaux dossiers selon vos centres d'intérêt"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Régénérer (5)</span>
            </button>

            {/* Régénération IA compacte */}
            <button
              onClick={handleGenerateScriptWithAI}
              disabled={isGeneratingAI}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                isDark
                  ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-700"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
              } disabled:opacity-40`}
              title="Régénérer un script 5 dossiers via l'IA"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? "animate-spin" : ""}`} />
              <span className="hidden md:inline">IA</span>
            </button>

            {/* Bascule Voix HD / Locale */}
            <button
              onClick={() => {
                const next = voiceEngine === "neural" ? "local" : "neural";
                setVoiceEngine(next);
                stopPlayback();
                onNotify(
                  next === "neural"
                    ? "🎙️ Voix HD activée : Synthèse Neuronale naturelle"
                    : "📱 Voix Locale activée : Synthèse locale hors-ligne"
                );
              }}
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                isDark
                  ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-700"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
              }`}
              title={voiceEngine === "neural" ? "Voix HD Neuronale active" : "Voix Locale active"}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{voiceEngine === "neural" ? "HD" : "Locale"}</span>
            </button>

            {/* Prompteur plein écran */}
            <button
              onClick={() => setIsTeleprompterOpen(!isTeleprompterOpen)}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                isDark
                  ? "bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border-zinc-700"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300"
              }`}
              title="Prompteur plein écran"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Fermer */}
            <button
              onClick={handleClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark
                  ? "text-zinc-400 hover:text-white hover:bg-zinc-850"
                  : "text-zinc-500 hover:text-black hover:bg-zinc-150"
              }`}
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corps du Flash : 5 Dossiers & Lecteur (Design sobre Blanc & Noir haute lisibilité) */}
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 overflow-y-auto scrollbar flex-1 min-h-0">
          {/* Deck Central : Barre 5 dossiers + Visualiseur + Fiche du dossier en cours */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden transition-all ${
              isDark
                ? "bg-zinc-900/50 border-zinc-800 text-white"
                : "bg-zinc-50 border-zinc-200 text-zinc-900"
            }`}
          >
            {/* Barre de progression segmentée 5 dossiers */}
            <div className="w-full grid grid-cols-5 gap-1.5 sm:gap-2">
              {chapters.map((ch, idx) => {
                const isPast = idx < currentChapterIndex;
                const isCurrent = idx === currentChapterIndex;
                const progress = isPast ? 100 : isCurrent ? chapterProgress : 0;

                return (
                  <button
                    key={ch.id}
                    onClick={() => playChapter(idx)}
                    className="group relative flex flex-col gap-1 text-left cursor-pointer transition-all focus:outline-none"
                    title={`Dossier ${idx + 1} : ${ch.title}`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span
                        className={`truncate ${
                          isCurrent
                            ? "font-bold text-black dark:text-white"
                            : isPast
                            ? "text-zinc-600 dark:text-zinc-400 font-medium"
                            : "text-zinc-400 dark:text-zinc-600"
                        }`}
                      >
                        {idx + 1}. {ch.category ? ch.category.slice(0, 9) : `Dos. ${idx + 1}`}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 ml-0.5 shrink-0">
                        {isPast ? "✓" : isCurrent ? `${Math.round(chapterCurrentTime)}s` : ""}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
                      <div
                        className={`h-full transition-all duration-150 rounded-full ${
                          isCurrent
                            ? isDark
                              ? "bg-white"
                              : "bg-black"
                            : isPast
                            ? isDark
                              ? "bg-zinc-500"
                              : "bg-zinc-400"
                            : "bg-transparent"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Visualiseur d'onde audio monochrome */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-7 w-full px-4">
              {[35, 65, 45, 95, 25, 80, 55, 100, 40, 75, 90, 45, 85, 60, 95, 30, 70, 50, 90, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 sm:w-1.5 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? isDark
                        ? "bg-white"
                        : "bg-black"
                      : isDark
                      ? "bg-zinc-800"
                      : "bg-zinc-300"
                  }`}
                  style={{
                    height: isPlaying
                      ? `${Math.max(20, (h * (Math.sin(i * 0.5 + Date.now() / 250) + 1.2)) / 2)}%`
                      : "22%"
                  }}
                />
              ))}
            </div>

            {/* Chargement audio neuronal */}
            {isLoadingAudio && (
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-200/60 dark:bg-zinc-850 px-3 py-1 rounded-md animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Synthèse audio en cours...</span>
              </div>
            )}

            {/* Métadonnées épurées & Titre du dossier en cours */}
            <div className="space-y-1.5 w-full text-left sm:text-center">
              <div className="flex items-center justify-between sm:justify-center gap-2 flex-wrap text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-bold text-zinc-950 dark:text-white">
                  Dossier {currentChapterIndex + 1} sur {chapters.length}
                </span>
                <span>·</span>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {currentChapter?.category || "Actualité"}
                </span>
                {currentChapter?.interestReason && (
                  <>
                    <span>·</span>
                    <span className="truncate max-w-[200px] text-zinc-600 dark:text-zinc-400">
                      {currentChapter.interestReason}
                    </span>
                  </>
                )}
                {/* Bouton de copie directe 1-clic du dossier (Règle absolue AGENTS.md) */}
                <button
                  onClick={handleCopyCurrentChapter}
                  className="ml-auto sm:ml-2 text-xs text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1 font-mono cursor-pointer transition-colors"
                  title="Copier le texte de ce dossier en 1 clic"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedScript ? "Copié !" : "Copier (1 clic)"}</span>
                </button>
              </div>

              <h4 className="font-bold text-sm sm:text-base leading-snug text-zinc-950 dark:text-white">
                {currentChapter?.title}
              </h4>
            </div>

            {/* Texte intégral du dossier : Noir et Blanc haute lisibilité */}
            <div
              className={`w-full p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm leading-relaxed text-left max-h-44 overflow-y-auto scrollbar transition-all ${
                isDark
                  ? "bg-black border-zinc-800 text-zinc-100"
                  : "bg-white border-zinc-300 text-zinc-950"
              }`}
            >
              <div className="whitespace-pre-line font-sans">
                {currentChapter?.displayScript || currentChapter?.textToSpeak}
              </div>
            </div>

            {/* Lien vers l'article complet */}
            {currentChapter?.sourceArticle && onOpenArticle && (
              <button
                onClick={() => {
                  stopPlayback();
                  onOpenArticle(currentChapter.sourceArticle!);
                  onClose();
                }}
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white underline underline-offset-4 flex items-center gap-1.5 cursor-pointer pt-0.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ouvrir l'article complet : « {currentChapter.sourceArticle.title} »</span>
              </button>
            )}
          </div>

          {/* Sommaire des 5 dossiers */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <ListMusic className="w-3.5 h-3.5 opacity-70" />
                <span>Sommaire — 5 dossiers express</span>
              </h5>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleRenewFiveChapters(false)}
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  title="Générer 5 nouveaux dossiers"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Régénérer 5</span>
                </button>

                <button
                  onClick={handleCopyFullScript}
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  title="Copier l'intégralité du script en 1 clic"
                >
                  {copiedScript ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedScript ? "Script copié !" : "Copier le script complet"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-1 max-h-44 overflow-y-auto scrollbar pr-1">
              {chapters.map((ch, idx) => {
                const isCurrent = idx === currentChapterIndex;
                return (
                  <button
                    key={ch.id}
                    onClick={() => playChapter(idx)}
                    className={`w-full p-2 sm:p-2.5 rounded-lg border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                      isCurrent
                        ? isDark
                          ? "bg-white text-black border-white font-bold"
                          : "bg-black text-white border-black font-bold"
                        : isDark
                        ? "bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800 text-zinc-200"
                        : "bg-white hover:bg-zinc-100 border-zinc-200 text-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                          isCurrent
                            ? isDark
                              ? "bg-black text-white"
                              : "bg-white text-black"
                            : isDark
                            ? "bg-zinc-800 text-zinc-300"
                            : "bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs truncate font-medium flex items-center gap-1.5">
                          <span className="truncate">{ch.title}</span>
                        </div>
                        <div className="text-[11px] opacity-70 truncate font-mono">{ch.category}</div>
                      </div>
                    </div>

                    {isCurrent && isPlaying && (
                      <span className={`w-2 h-2 rounded-full ${isDark ? "bg-black" : "bg-white"} animate-ping shrink-0`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Master Console Controller Footer (Sobre, Noir & Blanc) */}
        <div
          className={`p-3 sm:p-3.5 border-t flex flex-wrap items-center justify-between gap-2.5 shrink-0 ${
            isDark ? "bg-zinc-950 border-zinc-800 text-white" : "bg-zinc-50 border-zinc-200 text-zinc-900"
          }`}
        >
          {/* Sélection de la vitesse */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-zinc-500 font-mono hidden xs:inline">Vitesse :</span>
            {[0.9, 1.0, 1.15, 1.25, 1.5].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setPlaybackRate(r);
                  if (isPlaying) {
                    playChapter(currentChapterIndex);
                  }
                }}
                className={`px-2 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  playbackRate === r
                    ? isDark
                      ? "bg-white text-black font-bold"
                      : "bg-black text-white font-bold"
                    : isDark
                    ? "text-zinc-400 hover:text-white hover:bg-zinc-900"
                    : "text-zinc-600 hover:text-black hover:bg-zinc-200"
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Boutons de lecture audio */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrev}
              disabled={currentChapterIndex === 0}
              className={`p-2 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isDark
                  ? "border-zinc-750 hover:bg-zinc-850 text-zinc-200"
                  : "border-zinc-300 hover:bg-zinc-200 text-zinc-800"
              }`}
              title="Dossier précédent"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSeek(-10)}
              className={`p-2 sm:px-2.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isDark
                  ? "border-zinc-750 hover:bg-zinc-850 text-zinc-200"
                  : "border-zinc-300 hover:bg-zinc-200 text-zinc-800"
              }`}
              title="Reculer de 10 secondes"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">-10s</span>
            </button>

            <button
              onClick={togglePlay}
              className={`px-5 sm:px-6 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95 cursor-pointer ${
                isPlaying
                  ? isDark
                    ? "bg-zinc-200 text-black hover:bg-white"
                    : "bg-zinc-800 text-white hover:bg-black"
                  : isDark
                  ? "bg-white text-black hover:bg-zinc-200"
                  : "bg-black text-white hover:bg-zinc-800"
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              <span>{isPlaying ? "Pause" : "Lancer le Flash"}</span>
            </button>

            <button
              onClick={() => handleSeek(10)}
              className={`p-2 sm:px-2.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                isDark
                  ? "border-zinc-750 hover:bg-zinc-850 text-zinc-200"
                  : "border-zinc-300 hover:bg-zinc-200 text-zinc-800"
              }`}
              title="Avancer de 10 secondes"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">+10s</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentChapterIndex === chapters.length - 1}
              className={`p-2 rounded-lg border transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                isDark
                  ? "border-zinc-750 hover:bg-zinc-850 text-zinc-200"
                  : "border-zinc-300 hover:bg-zinc-200 text-zinc-800"
              }`}
              title="Dossier suivant"
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>

          {/* Actions annexes : Téléchargement MP3 & Fermer */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownloadAudio}
              disabled={isDownloading}
              className={`p-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                isDark
                  ? "border-zinc-750 hover:bg-zinc-850 text-zinc-300"
                  : "border-zinc-300 hover:bg-zinc-200 text-zinc-700"
              }`}
              title="Télécharger l'audio MP3"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="font-mono text-[11px] hidden sm:inline">MP3</span>
            </button>

            <button
              onClick={handleClose}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? "border-zinc-750 hover:bg-zinc-850 text-zinc-300"
                  : "border-zinc-300 hover:bg-zinc-200 text-zinc-700"
              }`}
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Modal Prompteur Plein Écran Haute Visibilité (Noir & Blanc épuré) */}
        {isTeleprompterOpen && (
          <div className="absolute inset-0 z-50 bg-black text-white flex flex-col p-4 sm:p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-750 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                    <span>Prompteur Studio Direct</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                      Grand Écran
                    </span>
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyFullScript}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-750 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript ? "Script copié !" : "Copier le texte (1 clic)"}</span>
                </button>

                <button
                  onClick={() => setIsTeleprompterOpen(false)}
                  className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all cursor-pointer"
                  title="Fermer le prompteur"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Texte défilant des 5 dossiers */}
            <div className="flex-1 overflow-y-auto scrollbar space-y-6 pr-2 py-2">
              {chapters.map((ch, idx) => {
                const isCurrent = idx === currentChapterIndex;
                return (
                  <div
                    key={ch.id}
                    onClick={() => playChapter(idx)}
                    className={`p-4 sm:p-5 rounded-xl border transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-zinc-900 border-white ring-1 ring-white"
                        : "bg-zinc-950/80 border-zinc-800 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                        Dossier {idx + 1} sur 5 • {ch.category}
                      </span>
                      {isCurrent && isPlaying && (
                        <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-bold animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          EN LECTURE
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                      {ch.title}
                    </h3>

                    <p className="text-sm sm:text-base font-normal leading-relaxed text-zinc-200">
                      {ch.textToSpeak}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Contrôles du prompteur */}
            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSeek(-10)}
                  className="p-1.5 px-2.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white font-mono text-xs flex items-center gap-1 border border-zinc-800"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-10s</span>
                </button>
                <button
                  onClick={togglePlay}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 ${
                    isPlaying ? "bg-zinc-200 text-black" : "bg-white text-black"
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? "Pause" : "Lecture"}</span>
                </button>
                <button
                  onClick={() => handleSeek(10)}
                  className="p-1.5 px-2.5 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white font-mono text-xs flex items-center gap-1 border border-zinc-800"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+10s</span>
                </button>
              </div>

              <div className="text-xs text-zinc-400 font-mono hidden sm:block">
                Cliquez sur un dossier pour le lire directement
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
