import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  CheckCircle,
  Copy,
  Check,
  AlertTriangle,
  Wrench,
  Clock,
  Package,
  User,
  PlusCircle,
  RotateCcw,
  Zap
} from "lucide-react";
import { ArtisanIntervention, saveInterventionOffline } from "../lib/artisanInterventionDb";

interface ArtisanVoiceCommandProps {
  onInterventionCreated?: (intervention: ArtisanIntervention) => void;
  className?: string;
}

export const ArtisanVoiceCommand: React.FC<ArtisanVoiceCommandProps> = ({
  onInterventionCreated,
  className = ""
}) => {
  const [isListeningWakeWord, setIsListeningWakeWord] = useState(false);
  const [isDictating, setIsDictating] = useState(false);
  const [wakeWordDetected, setWakeWordDetected] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isProcessingMistral, setIsProcessingMistral] = useState(false);
  const [formattedTask, setFormattedTask] = useState<Partial<ArtisanIntervention> | null>(null);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Veille vocale désactivée");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [selectedWakeWord, setSelectedWakeWord] = useState("atelier");

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialisation Web Speech API
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setStatusMessage("Web Speech API non supportée sur ce navigateur.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "fr-FR";

    recognition.onresult = (event: any) => {
      let currentInterim = "";
      let finalChunk = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalChunk += item[0].transcript;
        } else {
          currentInterim += item[0].transcript;
        }
      }

      setInterimTranscript(currentInterim);

      const fullText = (finalChunk || currentInterim).toLowerCase();

      // Mode 1 : Écoute passive du Wake-Word
      if (!isDictating) {
        const matchesWakeWord =
          fullText.includes("atelier") ||
          fullText.includes("dis atelier") ||
          fullText.includes("hey atelier") ||
          fullText.includes("alphabette") ||
          fullText.includes("chantier");

        if (matchesWakeWord) {
          playAudioChime(660, 880); // Bip sonore d'activation
          setWakeWordDetected(true);
          setIsDictating(true);
          setStatusMessage("Mot-clé détecté ! Dictée en cours...");
          setTranscript("");
          setInterimTranscript("");
          resetSilenceTimer();
        }
      } else {
        // Mode 2 : Dictée active
        if (finalChunk) {
          setTranscript((prev) => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
          resetSilenceTimer();
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "no-speech") {
        console.warn("[Voice Command] Erreur SpeechRecognition :", event.error);
      }
    };

    recognition.onend = () => {
      // Redémarrage automatique si toujours en mode écoute
      if (isListeningWakeWord || isDictating) {
        try {
          recognition.start();
        } catch {
          // Ignorer erreur de redémarrage immédiat
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch {}
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, [isDictating, isListeningWakeWord]);

  // Bip audio natif sans fichier MP3 via Web Audio API
  const playAudioChime = (freq1 = 520, freq2 = 780) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignorer blocage autoplay
    }
  };

  // Réinitialiser le timer d'inactivité (3,5 secondes de silence déclenchent l'analyse)
  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      handleFinalizeDictation();
    }, 3500);
  };

  const toggleWakeWordListening = () => {
    if (!recognitionRef.current) return;

    if (isListeningWakeWord) {
      recognitionRef.current.stop();
      setIsListeningWakeWord(false);
      setIsDictating(false);
      setStatusMessage("Veille vocale coupée");
    } else {
      try {
        recognitionRef.current.start();
        setIsListeningWakeWord(true);
        setStatusMessage(`En attente du mot-clé : "Dis Atelier" ou "Atelier"...`);
        playAudioChime(440, 550);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const forceStartDictation = () => {
    playAudioChime(550, 770);
    setIsDictating(true);
    setWakeWordDetected(true);
    setStatusMessage("Dictée manuelle en cours...");
    if (recognitionRef.current && !isListeningWakeWord) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
    resetSilenceTimer();
  };

  const handleFinalizeDictation = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    setIsDictating(false);
    setWakeWordDetected(false);
    playAudioChime(770, 440); // Bip fin
    setStatusMessage("Note vocale captée. Formatage via Mistral local...");
    processWithMistralLocal();
  };

  // Transformation en tâche structurée avec Mistral Local ou Heuristique Hors-Ligne
  const processWithMistralLocal = async () => {
    const rawNote = (transcript + " " + interimTranscript).trim();
    if (!rawNote || rawNote.length < 5) {
      setStatusMessage("Aucun texte capté. Essayez à nouveau.");
      return;
    }

    setIsProcessingMistral(true);

    try {
      const prompt = `Tu es l'assistant de chantier pour l'artisanat souverain français (ALPHABETTE SASU - L'Œil de l'Atelier).
Convertis la note vocale brute suivante d'un artisan en tâche d'intervention ultra-structurée et synthétique au format JSON strict.

Note vocale brute :
"${rawNote}"

Format JSON attendu :
{
  "title": "Titre clair et concis de l'intervention (ex: Remplacement Chauffe-eau 200L)",
  "clientName": "Nom du client ou 'Chantier en cours' si non précisé",
  "location": "Adresse ou lieu de l'intervention si mentionné, sinon 'Atelier / Chantier'",
  "trade": "Corps de métier (Plomberie, Chauffage, Électricité, Menuiserie, Maçonnerie, Peinture, Serrurerie, etc.)",
  "urgency": "Normale" | "Urgente" | "Critique",
  "estimatedHours": nombre d'heures estimées (ex: 2.5),
  "materials": ["Liste", "des", "matériaux", "et pièces"],
  "description": "Consignes techniques et détails opératoires"
}`;

      // Appel unifié au routeur IA (Mistral local préféré)
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          providerOverride: "mistral",
          systemInstruction: "Tu formates fidèlement les interventions artisanales en JSON strict.",
          responseFormat: "json"
        })
      });

      if (!res.ok) throw new Error("Erreur routeur IA");

      const data = await res.json();
      let parsed: any;
      try {
        const text = data.text || "";
        const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleanJson);
      } catch {
        parsed = fallbackLocalHeuristic(rawNote);
      }

      setFormattedTask({
        ...parsed,
        voiceTranscriptionRaw: rawNote,
        createdAt: Date.now(),
        synced: false
      });
      setStatusMessage("Tâche d'intervention générée par Mistral.");
    } catch (err) {
      // Secours local 100% hors ligne
      console.warn("[Voice] Utilisation du parseur heuristique local :", err);
      const parsed = fallbackLocalHeuristic(rawNote);
      setFormattedTask({
        ...parsed,
        voiceTranscriptionRaw: rawNote,
        createdAt: Date.now(),
        synced: false
      });
      setStatusMessage("Intervention formatée via le parseur local autonome.");
    } finally {
      setIsProcessingMistral(false);
    }
  };

  // Parseur heuristique de secours 100% local (aucune dépendance réseau)
  const fallbackLocalHeuristic = (raw: string): any => {
    const lower = raw.toLowerCase();
    let urgency: "Normale" | "Urgente" | "Critique" = "Normale";
    if (lower.includes("urgent") || lower.includes("fuite") || lower.includes("court-circuit")) {
      urgency = "Urgente";
    }
    if (lower.includes("danger") || lower.includes("critique") || lower.includes("inondation") || lower.includes("feu")) {
      urgency = "Critique";
    }

    let trade = "Artisanat Général";
    if (lower.includes("plomb") || lower.includes("eau") || lower.includes("tuyau") || lower.includes("robinet")) trade = "Plomberie";
    else if (lower.includes("electr") || lower.includes("cabl") || lower.includes("disjoncteur") || lower.includes("prise")) trade = "Électricité";
    else if (lower.includes("bois") || lower.includes("porte") || lower.includes("fenetre") || lower.includes("meuble")) trade = "Menuiserie";
    else if (lower.includes("peint") || lower.includes("enduit")) trade = "Peinture";
    else if (lower.includes("chauff") || lower.includes("chaudiere") || lower.includes("pompe")) trade = "Chauffage";

    return {
      title: raw.length > 40 ? raw.slice(0, 40) + "..." : raw,
      clientName: "Client Atelier",
      location: "Chantier en cours",
      trade,
      urgency,
      estimatedHours: 2.0,
      materials: ["Outillage de base", "Consommables de chantier"],
      description: raw
    };
  };

  const handleSaveToIndexedDb = async () => {
    if (!formattedTask) return;

    const newIntervention: ArtisanIntervention = {
      id: "int_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      title: formattedTask.title || "Intervention Atelier",
      clientName: formattedTask.clientName || "Client Atelier",
      location: formattedTask.location || "Chantier",
      trade: formattedTask.trade || "Polyvalent",
      description: formattedTask.description || "",
      materials: formattedTask.materials || [],
      urgency: formattedTask.urgency || "Normale",
      estimatedHours: formattedTask.estimatedHours || 1.5,
      photos: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      synced: false,
      source: "vocal",
      voiceTranscriptionRaw: formattedTask.voiceTranscriptionRaw
    };

    try {
      await saveInterventionOffline(newIntervention);
      if (onInterventionCreated) onInterventionCreated(newIntervention);
      setStatusMessage("Intervention enregistrée dans IndexedDB !");
      // Réinitialiser la tâche
      setTimeout(() => {
        setFormattedTask(null);
        setTranscript("");
      }, 2000);
    } catch (err: any) {
      console.error("Erreur sauvegarde IndexedDB:", err);
      setStatusMessage("Erreur de sauvegarde locale : " + err.message);
    }
  };

  const copyTaskAsText = () => {
    if (!formattedTask) return;
    const textToCopy = `[FICHE CHANTIER - L'ŒIL DE L'ATELIER]
Titre : ${formattedTask.title}
Client : ${formattedTask.clientName}
Lieu : ${formattedTask.location}
Corps d'état : ${formattedTask.trade}
Urgence : ${formattedTask.urgency}
Temps estimé : ${formattedTask.estimatedHours}h
Matériaux : ${(formattedTask.materials || []).join(", ")}
Consignes : ${formattedTask.description}
Note vocale : ${formattedTask.voiceTranscriptionRaw}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950/20 p-5 shadow-xl text-slate-100 ${className}`}
    >
      {/* Header Commande Vocale */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
              isDictating
                ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50"
                : isListeningWakeWord
                ? "bg-amber-500 text-slate-950 ring-4 ring-amber-500/20"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {isDictating ? <Mic className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-base md:text-lg flex items-center gap-2">
                Commande Vocale Mains-Libres
                <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/30">
                  L'Œil de l'Atelier
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Détection mot-clé local • Formatage Mistral • Idéal mains sales en atelier
            </p>
          </div>
        </div>

        {/* Boutons d'action rapides */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleWakeWordListening}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-sm ${
              isListeningWakeWord
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold"
                : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
            }`}
            title="Active la veille permanente pour réagir dès que vous prononcez 'Atelier'"
          >
            {isListeningWakeWord ? (
              <>
                <Zap className="h-4 w-4 animate-bounce text-slate-950" />
                Veille active (« Atelier »)
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Activer veille « Atelier »
              </>
            )}
          </button>

          <button
            onClick={forceStartDictation}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-900/30 transition-all active:scale-95"
          >
            <Mic className="h-4 w-4" />
            Dictée directe
          </button>
        </div>
      </div>

      {/* État courant & Bandeau d'écoute */}
      <div className="mt-4 rounded-xl bg-slate-950/80 border border-slate-800 p-3.5 flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-slate-400">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isDictating
                  ? "bg-red-500 animate-ping"
                  : isListeningWakeWord
                  ? "bg-amber-400"
                  : "bg-slate-600"
              }`}
            />
            {statusMessage}
          </span>
          {isDictating && (
            <button
              onClick={handleFinalizeDictation}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
            >
              Terminer la dictée
            </button>
          )}
        </div>

        {/* Retranscription en temps réel */}
        {(transcript || interimTranscript) && (
          <div className="mt-1 p-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-sm text-slate-200 italic font-sans leading-relaxed">
            <span>{transcript}</span>
            <span className="text-amber-400 animate-pulse font-normal ml-1">
              {interimTranscript}
            </span>
          </div>
        )}
      </div>

      {/* Traitement en cours via Mistral */}
      {isProcessingMistral && (
        <div className="mt-4 flex items-center justify-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm animate-pulse">
          <Sparkles className="h-5 w-5 animate-spin" />
          <span>Mistral local analyse et structure votre intervention artisanale...</span>
        </div>
      )}

      {/* Tâche formatée générée */}
      {formattedTask && (
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-400" />
              <h4 className="font-bold text-slate-100 text-sm md:text-base">
                {formattedTask.title || "Nouvelle tâche d'intervention"}
              </h4>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                formattedTask.urgency === "Critique"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40"
                  : formattedTask.urgency === "Urgente"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              Urgence {formattedTask.urgency}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60">
              <User className="h-4 w-4 text-amber-400" />
              <span>Client : <strong>{formattedTask.clientName}</strong></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60">
              <Wrench className="h-4 w-4 text-amber-400" />
              <span>Métier : <strong>{formattedTask.trade}</strong></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Temps estimé : <strong>{formattedTask.estimatedHours} h</strong></span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60">
              <Package className="h-4 w-4 text-amber-400" />
              <span className="truncate">
                Matériaux : <strong>{(formattedTask.materials || []).join(", ")}</strong>
              </span>
            </div>
          </div>

          {formattedTask.description && (
            <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              {formattedTask.description}
            </p>
          )}

          {/* Actions : Sauvegarder dans IndexedDB ou Copier en 1-clic */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveToIndexedDb}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-white shadow transition-all active:scale-95"
              >
                <PlusCircle className="h-4 w-4" />
                Enregistrer dans IndexedDB (Hors-ligne)
              </button>
              <button
                onClick={() => setFormattedTask(null)}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs text-slate-300"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Annuler
              </button>
            </div>

            {/* Bouton de copie 1-clic direct (Règle AGENTS.md) */}
            <button
              onClick={copyTaskAsText}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 border border-slate-700 transition-all"
              title="Copier la fiche textuelle en 1 clic"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copié !</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copier fiche 1-clic</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Guide rapide wake-word */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
        <span>Prononcez simplement : <em>« Dis Atelier... fuite sous évier chez M. Martin... »</em></span>
        <span className="text-amber-500/80 font-medium">100% Souverain • Zéro pub • Zéro fuite</span>
      </div>
    </div>
  );
};
