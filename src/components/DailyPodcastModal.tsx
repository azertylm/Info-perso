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
  MessageSquare
} from "lucide-react";

export type PodcastFormat = "duo" | "flash" | "enquete";

export interface PodcastChapter {
  id: string;
  speaker: "presentateur" | "expert" | "solo";
  speakerName: string;
  title: string;
  category: string;
  textToSpeak: string;
  displayScript: string;
  keyTakeaway?: string;
  sourceArticle?: NewsArticle;
}

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

  // Radio Station Chime Intro (FM News Jingle: 3 notes F4 -> A4 -> C5)
  playIntroJingle() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [349.23, 440.0, 523.25]; // F4, A4, C5

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.18);

        gain.gain.setValueAtTime(0, now + idx * 0.18);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.18 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.18);
        osc.stop(now + idx * 0.18 + 0.5);
      });
    } catch {
      // AudioContext might be blocked before user gesture
    }
  }

  // Subtle chapter change ping / swoosh
  playChapterPing() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
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
      const notes = [523.25, 440.0, 349.23];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0.15, now + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.65);
      });
    } catch {
      // Ignore
    }
  }
}

const radioAudio = new RadioAudioEngine();

export const DailyPodcastModal: React.FC<DailyPodcastModalProps> = ({
  isOpen,
  onClose,
  articles,
  isDark,
  onNotify,
  onOpenArticle,
  geminiApiKey
}) => {
  const [format, setFormat] = useState<PodcastFormat>("duo");
  const [chapters, setChapters] = useState<PodcastChapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.05);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [voicePresenter, setVoicePresenter] = useState<SpeechSynthesisVoice | null>(null);
  const [voiceExpert, setVoiceExpert] = useState<SpeechSynthesisVoice | null>(null);

  const activeChapterRef = useRef(0);
  activeChapterRef.current = currentChapterIndex;
  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  // Initialize SpeechSynthesis and detect distinct voices
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const s = window.speechSynthesis;
      setSynth(s);

      const setupVoices = () => {
        const voices = s.getVoices();
        const frVoices = voices.filter((v) => v.lang.startsWith("fr"));

        if (frVoices.length >= 2) {
          // Find natural or distinct voices (e.g. female + male, or Google + Natural)
          const femaleCandidate = frVoices.find(
            (v) =>
              v.name.toLowerCase().includes("audrey") ||
              v.name.toLowerCase().includes("celine") ||
              v.name.toLowerCase().includes("denise") ||
              v.name.toLowerCase().includes("hortense") ||
              v.name.toLowerCase().includes("female")
          ) || frVoices[0];

          const maleCandidate = frVoices.find(
            (v) =>
              v !== femaleCandidate &&
              (v.name.toLowerCase().includes("thomas") ||
                v.name.toLowerCase().includes("henri") ||
                v.name.toLowerCase().includes("mathieu") ||
                v.name.toLowerCase().includes("paul") ||
                v.name.toLowerCase().includes("male") ||
                v.name.toLowerCase().includes("google"))
          ) || frVoices[1] || frVoices[0];

          setVoicePresenter(femaleCandidate);
          setVoiceExpert(maleCandidate);
        } else if (frVoices.length === 1) {
          setVoicePresenter(frVoices[0]);
          setVoiceExpert(frVoices[0]);
        }
      };

      setupVoices();
      s.onvoiceschanged = setupVoices;
    }
  }, []);

  // Heuristic Broadcast Script Builder (High-craft journalistic script writing)
  const generateBroadcastScript = (arts: NewsArticle[], fmt: PodcastFormat): PodcastChapter[] => {
    if (!arts || arts.length === 0) return [];
    const top = arts.slice(0, 3);
    const dateStr = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

    const chs: PodcastChapter[] = [];

    if (fmt === "duo") {
      // DUO DIALOGUE (Léa la présentatrice & Marc l'analyste)
      chs.push({
        id: "intro-duo",
        speaker: "presentateur",
        speakerName: "Léa (Présentatrice)",
        title: "Ouverture du Matinal & Sommaire",
        category: "Édito Direct",
        textToSpeak: `Bonjour à toutes et à tous ! Nous sommes le ${dateStr}, et vous écoutez le Matinal InfoPerso en direct. Avec moi en studio, notre éditorialiste Marc. Marc, bonjour ! Au sommaire aujourd'hui, trois dossiers brûlants : tout d'abord, ${top[0]?.title || "les tensions majeures"}. Nous analyserons ensuite ${top[1]?.title || "les remous du secteur"}. Et nous finirons avec ${top[2]?.title || "un arbitrage décisif"}. Marc, on commence sans attendre !`,
        displayScript: `🎙️ **Léa :** « Bonjour à tous ! Bienvenue sur le Matinal InfoPerso du ${dateStr}. Avec moi en studio, Marc. Au sommaire aujourd'hui : trois dossiers qui bousculent l'actualité. »\n\n🎧 **Marc :** « Bonjour Léa, et bonjour à tous. Des révélations importantes et des arbitrages qui méritent qu'on s'y arrête sans filtre. »`,
        keyTakeaway: "3 dossiers prioritaires disséqués en dialogue direct."
      });

      top.forEach((art, i) => {
        const rawSummary = art.summary || art.content.slice(0, 240);
        const cleanSummary = rawSummary.replace(/<[^>]+>/g, "").replace(/\s+/g, " ");

        // Question / Lancement par Léa
        chs.push({
          id: `art-${art.id}-lea`,
          speaker: "presentateur",
          speakerName: "Léa (Présentatrice)",
          title: `${i + 1}. Le Fait : ${art.title}`,
          category: art.category || "Actualité",
          textToSpeak: `Marc, venons-en au premier dossier qui fait couler beaucoup d'encre ce matin : ${art.title}, une information révélée par la rédaction de ${art.source}. En clair, que s'est-il passé et pourquoi est-ce si stratégique ?`,
          displayScript: `🎙️ **Léa :** « Marc, venons-en à ce dossier rapporté par ${art.source} : *"${art.title}"*. Que s'est-il réellement passé ? »`,
          sourceArticle: art,
          keyTakeaway: `Rapporté par ${art.source}`
        });

        // Décryptage par Marc
        chs.push({
          id: `art-${art.id}-marc`,
          speaker: "expert",
          speakerName: "Marc (Analyste)",
          title: `Décryptage & Impact : ${art.title}`,
          category: "Analyse",
          textToSpeak: `C'est un véritable tournant, Léa. Les faits sont clairs : ${cleanSummary}. Ce qu'il faut surtout retenir, c'est que derrière l'annonce officielle, les acteurs du secteur ${art.category} préparent déjà l'après. Ce n'est pas un simple détail technique, cela touche directement les équilibres du marché.`,
          displayScript: `🔍 **Marc :** « C'est un tournant, Léa. Les faits sont clairs : *${cleanSummary}*. Mais attention au piège de l'évidence : les répercussions vont bien au-delà de ce que les communiqués laissent entendre. »`,
          sourceArticle: art,
          keyTakeaway: `Impact direct sur le secteur ${art.category}`
        });
      });

      // Conclusion Duo
      chs.push({
        id: "outro-duo",
        speaker: "presentateur",
        speakerName: "Léa & Marc",
        title: "Conclusion & Perspectives",
        category: "Fin d'antenne",
        textToSpeak: `Merci Marc pour ces éclairages percutants. Voilà pour l'essentiel de ce briefing matinal. Retrouvez tous ces articles complets, les graphiques et le débat contradictoire sur votre espace InfoPerso. Très bonne journée à l'écoute de nos analyses !`,
        displayScript: `✨ **Léa :** « Merci Marc pour ces éclairages percutants. Vous avez désormais toutes les clés en main. »\n\n🤝 **Marc :** « Bonne journée à tous, et restez vigilants face aux raccourcis médiatiques ! »`,
        keyTakeaway: "Briefing terminé. Rendez-vous dans le fil pour approfondir."
      });
    } else if (fmt === "flash") {
      // FLASH INFO RYTHMÉ (Style France Info / RTL / Journal Parlé 120 secondes chrono)
      chs.push({
        id: "intro-flash",
        speaker: "solo",
        speakerName: "Flash Info Express",
        title: "⚡ Flash 120s Chrono",
        category: "Flash",
        textToSpeak: `Flash InfoPerso. Nous sommes le ${dateStr}, top chrono 120 secondes pour saisir l'essentiel de l'actualité sans filtre. Trois alertes majeures à la une ce matin.`,
        displayScript: `⚡ **FLASH INFO 120 SECONDES** — Édition du ${dateStr}\n\n*Format ultra-rythmé, factuel et sans concession.*`,
        keyTakeaway: "120s pour saisir les 3 alertes prioritaires du jour."
      });

      top.forEach((art, i) => {
        const cleanSum = (art.summary || art.content.slice(0, 220)).replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
        const punchHeaders = [
          "Première alerte majeure",
          "Deuxième coup de projecteur",
          "Et enfin, l'arbitrage décisif"
        ];
        const punchHeader = punchHeaders[i] || "Autre fait marquant";

        // Extract a strong punchy sentence
        const firstSentence = cleanSum.split(/[.!?]+/)[0] || cleanSum;
        const secondSentence = cleanSum.split(/[.!?]+/)[1] || "";

        chs.push({
          id: `art-${art.id}-flash`,
          speaker: "solo",
          speakerName: "Flash Info Express",
          title: `${i + 1}. ${art.title}`,
          category: art.category,
          textToSpeak: `${punchHeader} : ${art.title}. D'après les informations de ${art.source}, ${firstSentence}. ${secondSentence ? `Conséquence immédiate : ${secondSentence}.` : ""} Un dossier sous haute tension dans le secteur ${art.category}.`,
          displayScript: `🔴 **${punchHeader} : ${art.title}**\n\n📌 *Dépêche ${art.source}*\n\n> ${firstSentence}.\n\n*Catégorie : ${art.category}*`,
          sourceArticle: art,
          keyTakeaway: `${art.source} : ${firstSentence.slice(0, 90)}...`
        });
      });

      chs.push({
        id: "outro-flash",
        speaker: "solo",
        speakerName: "Flash Info Express",
        title: "Point de situation complet",
        category: "Clôture",
        textToSpeak: `Voilà pour les 120 secondes chrono. Les analyses approfondies, les graphiques et le débat contradictoire vous attendent dès maintenant dans votre fil InfoPerso. Bonne journée et restez informés.`,
        displayScript: `🏁 **Fin du Flash Express** — Vous avez toutes les clés prioritaires. Retrouvez les dossiers complets dans votre fil.`,
        keyTakeaway: "Briefing express terminé."
      });
    } else {
      // ENQUÊTE / DÉCRYPTAGE BIAIS & RISQUES
      chs.push({
        id: "intro-enquete",
        speaker: "expert",
        speakerName: "L'Œil Critique",
        title: "L'Envers du Décor & Angles Morts",
        category: "Chronique",
        textToSpeak: `Bienvenue dans l'Envers du Décor. Ce matin, nous ne nous contentons pas de lire les dépêches : nous regardons ce qu'on ne vous dit pas sur l'actualité de ce ${dateStr}.`,
        displayScript: `🔍 **L'Envers du Décor** — Décryptage des angles morts et des intérêts sous-jacents.`,
        keyTakeaway: "Décryptage critique des annonces médiatiques."
      });

      top.forEach((art, i) => {
        const cleanSum = (art.summary || art.content.slice(0, 220)).replace(/<[^>]+>/g, "").replace(/\s+/g, " ");
        chs.push({
          id: `art-${art.id}-enquete`,
          speaker: "expert",
          speakerName: "L'Œil Critique",
          title: `L'Angle Mort : ${art.title}`,
          category: "Analyse critique",
          textToSpeak: `Premier constat sur "${art.title}". Les médias traditionnels retiennent ${cleanSum}. Mais qui finance, et surtout à qui profite réellement cet arbitrage ? Dans le secteur ${art.category}, les véritables bénéficiaires ne sont pas ceux mis en avant dans la communication de crise.`,
          displayScript: `💥 **L'Angle Mort de : ${art.title}**\n\n*Au-delà du récit officiel :*\n\n${cleanSum}\n\n*Vigilance :* Intérêts croisés et coûts différés.`,
          sourceArticle: art,
          keyTakeaway: `Qui profite de cette décision ?`
        });
      });

      chs.push({
        id: "outro-enquete",
        speaker: "expert",
        speakerName: "L'Œil Critique",
        title: "Bilan Critique",
        category: "Épilogue",
        textToSpeak: `Gardez l'esprit critique. Ne vous fiez jamais au premier degré des annonces publiques. Excellente journée sur InfoPerso.`,
        displayScript: `🛡️ **Gardez l'esprit critique.** Retrouvez la dialectique complète dans l'Avocat du Diable.`,
        keyTakeaway: "Vérification et esprit critique permanents."
      });
    }

    return chs;
  };

  // Re-generate chapters when format or articles change
  useEffect(() => {
    if (articles.length > 0) {
      const generated = generateBroadcastScript(articles, format);
      setChapters(generated);
      setCurrentChapterIndex(0);
    }
  }, [articles, format]);

  // AI Script Generation with Gemini
  const handleGenerateScriptWithAI = async () => {
    if (!articles || articles.length === 0) return;
    setIsGeneratingAI(true);
    onNotify("🎙️ Écriture de la chronique radio par l'IA en cours...");

    try {
      const topArts = articles.slice(0, 3).map((a, i) => ({
        index: i + 1,
        title: a.title,
        source: a.source,
        category: a.category,
        summary: a.summary || a.content.slice(0, 280)
      }));

      const prompt = `Tu es un grand producteur et rédacteur en chef de radio (style France Inter / Radio France / NPR).
Tu dois écrire le script oral complet d'une émission radio matinale dynamique, passionnante et très naturelle en français d'une durée d'environ 3 minutes.
Format demandé : "${format === "duo" ? "Dialogue à deux voix : Léa la présentatrice curieuse et Marc l'analyste percutant qui se répondent avec complicité et naturel" : format === "flash" ? "Flash radio d'urgence 120s ultra-percutant (style France Info / RTL) : phrases courtes, verbes d'action, chiffres clés, direct au but, zéro temps mort ni formules creuses" : "Chronique d'investigation qui dévoile les angles morts et les non-dits"}".

Articles du jour à traiter :
${JSON.stringify(topArts, null, 2)}

RÈGLES D'ÉCRITURE RADIOPHONIQUE IMPÉRATIVES :
1. Style PARLÉ, VIVANT et NATUREL : utilise de vraies tournures de radio ("Bonjour à tous !", "Alors Marc, pourquoi cette annonce fait-elle tant de bruit ?", "C'est très simple Léa : regardez les chiffres...").
2. Jamais de jargon mécanique comme "Dossier numéro 1" ou "Rubrique Technologie". Utilise de vraies transitions fluides journalistiques.
3. Structure en 5 à 7 répliques courtes/chapitres.
4. Réponds STRICTEMENT avec un JSON valide :
{
  "chapters": [
    {
      "speaker": "presentateur" | "expert" | "solo",
      "speakerName": "Léa (Présentatrice)" | "Marc (Analyste)" | "Journaliste",
      "title": "Titre percutant de la séquence",
      "category": "Catégorie ou Rubrique",
      "textToSpeak": "Texte oralisé exactement comme le prononcerait l'animateur au micro (sans balises HTML, ponctué naturellement pour la respiration).",
      "displayScript": "Version mise en forme en Markdown avec réplique stylisée.",
      "keyTakeaway": "Point clé à retenir en 1 phrase courte",
      "articleIndex": 1 (ou null si intro/outro)
    }
  ]
}`;

      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "gemini",
          model: "gemini-3.8-flash",
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
              const art = ch.articleIndex ? articles[ch.articleIndex - 1] : undefined;
              return {
                id: `ai-ch-${idx}`,
                speaker: ch.speaker || (idx % 2 === 0 ? "presentateur" : "expert"),
                speakerName: ch.speakerName || (idx % 2 === 0 ? "Léa (Présentatrice)" : "Marc (Analyste)"),
                title: ch.title || `Séquence ${idx + 1}`,
                category: ch.category || "Radio",
                textToSpeak: ch.textToSpeak,
                displayScript: ch.displayScript || ch.textToSpeak,
                keyTakeaway: ch.keyTakeaway,
                sourceArticle: art
              };
            });

            setChapters(aiChapters);
            setCurrentChapterIndex(0);
            stopPlayback();
            onNotify("✨ Chronique radio écrite avec succès par l'IA !");
            return;
          }
        }
      }
      throw new Error("Format de réponse non reconnu");
    } catch (err) {
      console.warn("AI Script generation error:", err);
      onNotify("⚠️ Script optimisé prêt en mode heuristique.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Audio Playback Engine
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
    const isFirstChapter = index === 0;

    // Sound effect: Intro Jingle or Chapter Ping
    if (soundEffectsEnabled) {
      if (isFirstChapter) {
        radioAudio.playIntroJingle();
      } else {
        radioAudio.playChapterPing();
      }
    }

    const utterance = new SpeechSynthesisUtterance(chapter.textToSpeak);
    utterance.lang = "fr-FR";
    utterance.rate = playbackRate;

    // Configure distinct vocal qualities depending on speaker
    if (chapter.speaker === "presentateur") {
      if (voicePresenter) utterance.voice = voicePresenter;
      utterance.pitch = 1.08; // Energetic, bright radio host pitch
    } else if (chapter.speaker === "expert") {
      if (voiceExpert) utterance.voice = voiceExpert;
      utterance.pitch = 0.92; // Deeper, reflective expert tone
    } else {
      if (voicePresenter) utterance.voice = voicePresenter;
      utterance.pitch = 1.0;
    }

    utterance.onend = () => {
      if (activeChapterRef.current < chapters.length - 1) {
        const nextIdx = activeChapterRef.current + 1;
        setCurrentChapterIndex(nextIdx);
        // Brief natural radio pause between interventions
        setTimeout(() => {
          if (isPlayingRef.current) {
            playChapter(nextIdx);
          }
        }, 320);
      } else {
        setIsPlaying(false);
        if (soundEffectsEnabled) {
          radioAudio.playOutroJingle();
        }
        onNotify("🏁 Émission terminée ! Vous êtes parfaitement à jour.");
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech error:", e);
      setIsPlaying(false);
    };

    setCurrentChapterIndex(index);
    setIsPlaying(true);

    // Wait a tiny bit for the jingle note to chime before speech starts
    const delay = soundEffectsEnabled && isFirstChapter ? 450 : 80;
    setTimeout(() => {
      synth.speak(utterance);
    }, delay);
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

  const handleCopyFullScript = () => {
    const fullText = chapters
      .map((c) => `### ${c.speakerName} : ${c.title}\n${c.textToSpeak}\n`)
      .join("\n---\n\n");
    navigator.clipboard.writeText(fullText);
    setCopiedScript(true);
    onNotify("📋 Script complet de l'émission copié dans le presse-papiers !");
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleClose = () => {
    stopPlayback();
    onClose();
  };

  if (!isOpen) return null;

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-3xl rounded-3xl border shadow-2xl flex flex-col max-h-[94vh] overflow-hidden ${
          isDark
            ? "bg-gradient-to-b from-slate-900 via-zinc-950 to-black border-indigo-500/40 text-slate-100"
            : "bg-gradient-to-b from-white via-indigo-50/30 to-slate-100 border-indigo-300 text-slate-900"
        }`}
      >
        {/* Studio Header & "ON AIR" status */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-indigo-500/20 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center shadow-lg">
                <Radio className={`w-5 h-5 ${isPlaying ? "animate-pulse text-red-400" : ""}`} />
              </div>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2">
                  <span>Studio Flash InfoPerso</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1 border transition-all ${
                      isPlaying
                        ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                        : "bg-slate-700/30 text-slate-400 border-slate-700/50"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? "bg-red-500 animate-ping" : "bg-slate-400"}`} />
                    {isPlaying ? "ON AIR" : "STANDBY"}
                  </span>
                </h3>
              </div>
              <p className="text-xs opacity-75">
                Chronique audio personnalisée et vivante • Durée estimée ~3 min
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Jingle SFX Toggle */}
            <button
              onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                soundEffectsEnabled
                  ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-300"
                  : "bg-slate-800/40 border-slate-700/40 text-slate-500 opacity-60"
              }`}
              title="Jingles Radio FM & Signaux Sonores"
            >
              {soundEffectsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-[10px] hidden sm:inline">Jingles</span>
            </button>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Bar: 3 Modes */}
        <div className="px-4 py-2.5 border-b border-indigo-500/10 bg-black/10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar pb-1 sm:pb-0">
            <span className="text-[11px] font-mono opacity-60 mr-1 hidden sm:inline">Format :</span>
            <button
              onClick={() => {
                setFormat("duo");
                stopPlayback();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                format === "duo"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : isDark
                  ? "bg-slate-800/60 hover:bg-slate-800 text-slate-300"
                  : "bg-slate-200/80 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>🎙️ Duo Présentateur & Analyste</span>
            </button>

            <button
              onClick={() => {
                setFormat("flash");
                stopPlayback();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                format === "flash"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : isDark
                  ? "bg-slate-800/60 hover:bg-slate-800 text-slate-300"
                  : "bg-slate-200/80 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Flash Info Express</span>
            </button>

            <button
              onClick={() => {
                setFormat("enquete");
                stopPlayback();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                format === "enquete"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : isDark
                  ? "bg-slate-800/60 hover:bg-slate-800 text-slate-300"
                  : "bg-slate-200/80 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>🔍 Décryptage & Non-Dits</span>
            </button>
          </div>

          {/* AI Re-generation Button */}
          <button
            onClick={handleGenerateScriptWithAI}
            disabled={isGeneratingAI}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Faire rédiger la chronique par Gemini pour un style radio impeccable"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingAI ? "animate-spin" : ""}`} />
            <span>{isGeneratingAI ? "Écriture radio..." : "Rédiger avec l'IA"}</span>
          </button>
        </div>

        {/* Dynamic Studio Stage: Live Visualizer & Teleprompter */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto scrollbar flex-1">
          {/* Main Visualizer Deck */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden transition-all ${
              isDark
                ? "bg-slate-950/70 border-indigo-500/30 shadow-inner"
                : "bg-white/90 border-indigo-100 shadow-md"
            }`}
          >
            {/* Audio Wave Visualizer Bars */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-12 w-full px-4">
              {[35, 65, 45, 95, 25, 80, 55, 100, 40, 75, 90, 45, 85, 60, 95, 30, 70, 50, 90, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 sm:w-1.5 rounded-full transition-all duration-200 ${
                    isPlaying
                      ? "bg-gradient-to-t from-indigo-500 via-cyan-400 to-amber-300 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                      : isDark
                      ? "bg-slate-800"
                      : "bg-slate-300"
                  }`}
                  style={{
                    height: isPlaying
                      ? `${Math.max(20, (h * (Math.sin(i * 0.5 + Date.now() / 250) + 1.2)) / 2)}%`
                      : "22%"
                  }}
                />
              ))}
            </div>

            {/* Current Speaker & Sequence Title */}
            <div className="space-y-1.5 w-full max-w-lg">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                    currentChapter?.speaker === "presentateur"
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                      : currentChapter?.speaker === "expert"
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  }`}
                >
                  <Headphones className="w-3 h-3" />
                  <span>{currentChapter?.speakerName || "Présentation"}</span>
                </span>
                <span className="text-[11px] opacity-70 font-mono">
                  Séquence {currentChapterIndex + 1} / {chapters.length}
                </span>
              </div>

              <h4 className="font-extrabold text-sm sm:text-lg leading-tight">
                {currentChapter?.title}
              </h4>

              {currentChapter?.keyTakeaway && (
                <p className="text-xs text-amber-400 font-medium">
                  💡 {currentChapter.keyTakeaway}
                </p>
              )}
            </div>

            {/* Live Teleprompter / Dialogue Box */}
            <div
              className={`w-full p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed text-left max-h-40 overflow-y-auto scrollbar transition-all ${
                isDark
                  ? "bg-black/60 border-slate-800 text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-800"
              }`}
            >
              <div className="whitespace-pre-line font-sans opacity-95">
                {currentChapter?.displayScript || currentChapter?.textToSpeak}
              </div>
            </div>

            {/* Link to Source Article */}
            {currentChapter?.sourceArticle && onOpenArticle && (
              <button
                onClick={() => {
                  stopPlayback();
                  onOpenArticle(currentChapter.sourceArticle!);
                  onClose();
                }}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 flex items-center gap-1.5 cursor-pointer pt-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ouvrir l'article complet : « {currentChapter.sourceArticle.title} »</span>
              </button>
            )}
          </div>

          {/* Chapters Rundown List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-bold uppercase tracking-wider opacity-70 flex items-center gap-1.5">
                <ListMusic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Conducteur de l'Émission ({chapters.length} séquences)</span>
              </h5>

              <button
                onClick={handleCopyFullScript}
                className="text-[11px] opacity-80 hover:opacity-100 flex items-center gap-1 font-mono text-indigo-400 cursor-pointer"
              >
                {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedScript ? "Script copié !" : "Copier le script"}</span>
              </button>
            </div>

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
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                          isCurrent
                            ? "bg-white/20 text-white"
                            : isDark
                            ? "bg-slate-800 text-slate-400"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs truncate font-medium flex items-center gap-1.5">
                          <span className="opacity-75 font-mono text-[10px]">[{ch.speakerName.split(" ")[0]}]</span>
                          <span className="truncate">{ch.title}</span>
                        </div>
                        <div className="text-[10px] opacity-70 truncate">{ch.category}</div>
                      </div>
                    </div>

                    {isCurrent && isPlaying && (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Master Console Controller Footer */}
        <div className="p-3 sm:p-4 border-t border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 bg-black/30">
          {/* Rate Selection */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] opacity-60 font-mono hidden xs:inline">Cadence:</span>
            {[0.9, 1.05, 1.25, 1.5].map((r) => (
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
                    : isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }`}
              >
                {r}x
              </button>
            ))}
          </div>

          {/* Center Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentChapterIndex === 0}
              className="p-2.5 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Séquence précédente"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className={`px-6 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer ${
                isPlaying
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40"
                  : "bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-600/40"
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              <span>{isPlaying ? "Pause Direct" : "Lancer l'Émission"}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentChapterIndex === chapters.length - 1}
              className="p-2.5 rounded-xl border border-slate-700/60 hover:bg-slate-800/60 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              title="Séquence suivante"
            >
              <FastForward className="w-4 h-4" />
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-slate-700/60 hover:bg-slate-800/60 transition-all cursor-pointer"
          >
            Quitter le Studio
          </button>
        </div>
      </div>
    </div>
  );
};
