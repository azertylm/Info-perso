import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Cpu,
  X,
  Sliders,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Briefcase,
  Users,
  Wrench,
  FolderLock,
  Calculator,
  Compass,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import { AVAILABLE_MODELS, ChatMessage, ApiKeys, Provider } from "../types";
import { safeFetchJson } from "../lib/apiHelper";

export type UserProfileMode = "particulier" | "pro";

interface MultiChatProps {
  apiKeys: ApiKeys;
  onNotify: (msg: string) => void;
  displayMode?: "sobre" | "pro" | "warm" | "cyber" | "fun";
  themeMode?: "light" | "dark";
  onNavigateToTab?: (tab: any) => void;
  onOpenVault?: () => void;
  onOpenWorkshop?: () => void;
  onOpenPricing?: () => void;
  onSetTheme?: (theme: "light" | "dark") => void;
  onSetDisplayMode?: (mode: any) => void;
  onFilterCategory?: (category: string) => void;
  appName?: string;
}

interface ActionExecutionResult {
  tool: string;
  label: string;
  status: "success" | "pending_confirmation" | "declined";
  details?: string;
}

export default function MultiChat({
  apiKeys,
  onNotify,
  displayMode = "pro",
  themeMode = "dark",
  onNavigateToTab,
  onOpenVault,
  onOpenWorkshop,
  onOpenPricing,
  onSetTheme,
  onSetDisplayMode,
  onFilterCategory,
  appName = "Info Perso"
}: MultiChatProps) {
  const [selectedModelId, setSelectedModelId] = useState("mistral-small-latest");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfigMobile, setShowConfigMobile] = useState(false);

  // Profil Utilisateur : "Particulier" vs "Entreprise / Professionnel (B2B)"
  const [userProfile, setUserProfile] = useState<UserProfileMode>(() => {
    return (localStorage.getItem("infoperso_chat_profile") as UserProfileMode) || "particulier";
  });

  // Mode Vocal : Reconnaissance vocale (Speech-to-Text) et Synthèse vocale (TTS)
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Action sensible en attente de confirmation
  const [pendingSensitiveAction, setPendingSensitiveAction] = useState<{
    actionType: "clear_chat";
    callback: () => void;
    description: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Construction dynamique des instructions système
  const getDynamicSystemPrompt = (profile: UserProfileMode, voiceActive: boolean) => {
    return (
      `# IDENTITÉ ET MISSION\n` +
      `Tu es l'assistant intelligent officiel intégré à l'application "${appName}" éditée par ALPHABETTE SASU (fondée par Valentin RICHAUD à La Grande-Motte, hub : http://alphabette.fr).\n` +
      `Ta mission est double :\n` +
      `1. Répondre et expliquer clairement toute question, démarche ou concept à l'utilisateur, qu'il s'agisse d'un particulier ou d'un professionnel/entreprise.\n` +
      `2. Piloter l'application en exécutant des actions à la demande de l'utilisateur (via texte ou commande vocale) grâce aux outils/fonctions mis à ta disposition.\n\n` +
      `# EXCLUSIVITÉ MISTRAL AI & CONFORMITÉ RGPD\n` +
      `- L'application s'appuie rigoureusement et exclusivement sur les modèles de Mistral AI.\n` +
      `- Traitement 100% hébergé en France et en Europe, garantissant l'absence de transfert hors UE et le respect strict du RGPD.\n` +
      `- Confidentialité : Aucune donnée ni invite utilisateur n'est réutilisée pour l'entraînement public des modèles.\n\n` +
      `# PROFIL UTILISATEUR ACTUEL : ${profile === "particulier" ? "Particulier (Grand Public)" : "Entreprise / Professionnel (B2B)"}\n\n` +
      `# ADAPTATION DU NIVEAU ET DU TON (${profile === "particulier" ? "PARTICULIER" : "ENTREPRISE / B2B"})\n` +
      (profile === "particulier"
        ? `- Profil Particulier : Adopte un ton chaleureux, bienveillant, clair et pédagogique. Évite le jargon technique ou administratif complexe. Illustre par des exemples simples du quotidien.\n`
        : `- Profil Entreprise / Professionnel (B2B) : Adopte un ton concis, structuré, professionnel et axé sur les résultats (ROI, productivité, conformité, étapes opérationnelles). Privilégie les listes à puces et les synthèses directes.\n`) +
      `\n# CONTRÔLE DE L'APPLICATION ET PILOTAGE (FUNCTION CALLING)\n` +
      `Lorsque l'utilisateur demande une action, déclenche-la en insérant au tout début de ta réponse un bloc au format JSON strict :\n` +
      `\`\`\`tool_call\n` +
      `{"tool": "<NOM_OUTIL>", "args": { ... }}\n` +
      `\`\`\`\n` +
      `Puis enchaîne directement avec une confirmation vocale ou textuelle courte et naturelle (ex. "C'est fait, je vous ai ouvert le simulateur de rentabilité."). Les outils reconnus sont :\n` +
      `- navigate_to_tab: {"tab": "flux"|"simulateur"|"communaute"|"auth"|"keys"|"donations"|"shortcuts"}\n` +
      `- open_vault: {} (Ouvre le coffre-fort numérique Zero-Knowledge)\n` +
      `- open_workshop: {} (Ouvre L'Œil de l'Atelier / chantiers artisans)\n` +
      `- open_pricing: {} (Ouvre les tarifs dynamiques de la suite Alphabette sur http://alphabette.fr)\n` +
      `- change_theme: {"theme": "light"|"dark"}\n` +
      `- change_style: {"style": "sobre"|"pro"|"warm"|"cyber"|"fun"}\n` +
      `- filter_feed: {"category": "IA"|"Technologie"|"Culture"|"Local"|"Design"|"Économie"|"Médias"}\n` +
      `- clear_chat: {} (Action sensible de réinitialisation)\n\n` +
      `# RÈGLES DE CONVERSATION ET FORMAT DE RÉPONSE\n` +
      (voiceActive
        ? `- En mode vocal : formule des phrases courtes, rythmées et directes, idéales pour la synthèse vocale, sans tableaux ni markdown lourd.\n`
        : `- En mode texte : structure tes explications avec des paragraphes clairs et aérés.\n`) +
      `- Si une demande est ambiguë, pose une question de clarification rapide et ciblée.\n` +
      `- ACTIONS SENSIBLES : Pour toute action critique ou irréversible (effacement, validation légale, souscription financière), demande d'abord une confirmation claire à l'utilisateur avant d'exécuter la fonction.\n` +
      `- POLITIQUE TARIFAIRE SUITE ALPHABETTE (DYNAMIQUE) :\n` +
      `  * Essai gratuit : 7 jours d'accès complet offerts sur clé Mistral managée.\n` +
      `  * Application individuelle : Formule Autonome (BYOK) à 39 € / an ou Formule Confort (managé) à 59 € / an.\n` +
      `  * Pass Bouquet Alphabette (15 applications) : Bouquet BYOK à 99 € / an ou Bouquet Intégral à 199 € / an.\n` +
      `  * Codes privilèges / amis : vérifiés en temps réel à usage unique via POST http://alphabette.fr/api/verify-code.\n` +
      `  * Hub central : http://alphabette.fr\n` +
      `- RÈGLE DES RÉSUMÉS : À chaque fois qu'un résumé ou une synthèse est demandée, fournis le texte dans un bloc de code copiable (Markdown/text) pour permettre la copie en 1 clic.`
    );
  };

  const [customSystemInstruction, setCustomSystemInstruction] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialisation Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "fr-FR";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInput(transcript);
            onNotify(`🎙️ Commande vocale entendue : "${transcript}"`);
            // Auto submit speech command
            setTimeout(() => {
              triggerSendMessage(transcript);
            }, 300);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [userProfile, selectedModelId, ttsEnabled]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      onNotify("⚠️ La reconnaissance vocale n'est pas supportée sur ce navigateur.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        onNotify("🎙️ À l'écoute... Parlez maintenant.");
      } catch (err) {
        console.error("Erreur micro :", err);
      }
    }
  };

  // Synthèse vocale TTS
  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    window.speechSynthesis.cancel();
    // Nettoyer le texte du markdown et des blocs d'outils
    const clean = text
      .replace(/```tool_call[\s\S]*?```/g, "")
      .replace(/```[\s\S]*?```/g, "résumé disponible dans la boîte de code.")
      .replace(/[*#_`>]/g, "")
      .trim();

    if (!clean) return;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = "fr-FR";
    utterance.rate = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const activeModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  // Exécution locale d'un outil (Action Pilotage)
  const executeApplicationAction = (
    tool: string,
    args: any = {}
  ): { executed: boolean; message: string } => {
    try {
      switch (tool) {
        case "navigate_to_tab": {
          const tab = args.tab;
          if (onNavigateToTab && tab) {
            onNavigateToTab(tab);
            const tabNames: Record<string, string> = {
              flux: "Flux d'actualités",
              simulateur: "Simulateur de rentabilité",
              communaute: "Espace Communauté",
              auth: "Mon Compte & Synchro",
              keys: "Clés API",
              donations: "Soutien & RIB",
              shortcuts: "Raccourcis Clavier"
            };
            return {
              executed: true,
              message: `Navigation vers ${tabNames[tab] || tab}.`
            };
          }
          break;
        }

        case "open_vault": {
          if (onOpenVault) {
            onOpenVault();
            return { executed: true, message: "Coffre-fort Zero-Knowledge ouvert." };
          }
          break;
        }

        case "open_workshop": {
          if (onOpenWorkshop) {
            onOpenWorkshop();
            return { executed: true, message: "L'Œil de l'Atelier ouvert." };
          }
          break;
        }

        case "open_pricing": {
          if (onOpenPricing) {
            onOpenPricing();
            return { executed: true, message: "Tarifs officiels ALPHABETTE affichés (15€ / 40€/an)." };
          }
          break;
        }

        case "change_theme": {
          const theme = args.theme === "light" ? "light" : "dark";
          if (onSetTheme) {
            onSetTheme(theme);
            return { executed: true, message: `Thème passé en mode ${theme === "dark" ? "Sombre" : "Clair"}.` };
          }
          break;
        }

        case "change_style": {
          const style = args.style;
          if (onSetDisplayMode && style) {
            onSetDisplayMode(style);
            return { executed: true, message: `Style d'affichage basculé sur ${style}.` };
          }
          break;
        }

        case "filter_feed": {
          const cat = args.category;
          if (onFilterCategory && cat) {
            onFilterCategory(cat);
            return { executed: true, message: `Flux filtré sur la catégorie « ${cat} ».` };
          }
          break;
        }

        case "clear_chat": {
          // Action sensible ! Déclenche confirmation
          setPendingSensitiveAction({
            actionType: "clear_chat",
            callback: () => {
              setMessages([]);
              onNotify("Conversation effacée.");
              setPendingSensitiveAction(null);
            },
            description: "Effacer l'ensemble de l'historique de discussion actuel."
          });
          return {
            executed: false,
            message: "Demande de confirmation pour l'effacement du chat..."
          };
        }
      }
    } catch (err: any) {
      console.error("Erreur exécution outil applicatif :", err);
    }

    return { executed: false, message: "" };
  };

  // Détection locale des intentions si l'utilisateur commande directement
  const detectDirectIntent = (text: string): { tool: string; args: any } | null => {
    const lower = text.toLowerCase().trim();

    if (lower.includes("simulateur") || lower.includes("rentabilit") || lower.includes("point mort")) {
      return { tool: "navigate_to_tab", args: { tab: "simulateur" } };
    }
    if (lower.includes("coffre") || lower.includes("zero knowledge") || lower.includes("vault")) {
      return { tool: "open_vault", args: {} };
    }
    if (lower.includes("atelier") || lower.includes("chantier") || lower.includes("intervention")) {
      return { tool: "open_workshop", args: {} };
    }
    if (lower.includes("tarif") || lower.includes("prix") || lower.includes("combien") || lower.includes("abonnement")) {
      return { tool: "open_pricing", args: {} };
    }
    if (lower.includes("mode sombre") || lower.includes("thème sombre") || lower.includes("nuit")) {
      return { tool: "change_theme", args: { theme: "dark" } };
    }
    if (lower.includes("mode clair") || lower.includes("thème clair") || lower.includes("jour")) {
      return { tool: "change_theme", args: { theme: "light" } };
    }
    if (lower.includes("actualit") || lower.includes("flux") || lower.includes("accueil")) {
      return { tool: "navigate_to_tab", args: { tab: "flux" } };
    }
    if (lower.includes("compte") || lower.includes("profil") || lower.includes("synchro")) {
      return { tool: "navigate_to_tab", args: { tab: "auth" } };
    }
    if (lower.includes("efface la conversation") || lower.includes("effacer le chat")) {
      return { tool: "clear_chat", args: {} };
    }

    return null;
  };

  const triggerSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const trimmedInput = textToSend.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Détection d'intention directe (réactivité immédiate)
    const directAction = detectDirectIntent(trimmedInput);
    let directExecutionMessage = "";
    if (directAction) {
      const res = executeApplicationAction(directAction.tool, directAction.args);
      if (res.executed) {
        directExecutionMessage = res.message;
        onNotify(`⚡ ${res.message}`);
      }
    }

    // Préparation du prompt système selon profil et voix
    const effectiveSystemPrompt =
      getDynamicSystemPrompt(userProfile, ttsEnabled || isListening) +
      (customSystemInstruction.trim() ? `\n\nCONSIGNES ADDITIONNELLES :\n${customSystemInstruction}` : "");

    const apiMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: effectiveSystemPrompt }
    ];

    const recentMessages = messages.concat(userMessage).slice(-8);
    recentMessages.forEach((msg) => {
      apiMessages.push({ role: msg.role, content: msg.content });
    });

    const activeProvider = activeModel.provider;
    const userApiKey = apiKeys[activeProvider];

    try {
      const { ok, data, error } = await safeFetchJson<{
        content?: string;
        error?: string;
        usage?: any;
      }>("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeProvider,
          model: activeModel.id,
          enableSearch: activeProvider === "gemini",
          messages: apiMessages,
          apiKey: userApiKey
        })
      });

      if (ok && data?.content) {
        let assistantContent = data.content;

        // Analyse d'un éventuel appel d'outil (tool_call) émis par le modèle
        const toolCallRegex = /```tool_call\s*([\s\S]*?)\s*```/;
        const match = assistantContent.match(toolCallRegex);
        let executedActionName = "";

        if (match && match[1]) {
          try {
            const parsed = JSON.parse(match[1]);
            if (parsed.tool) {
              const res = executeApplicationAction(parsed.tool, parsed.args);
              if (res.executed) {
                executedActionName = res.message;
                onNotify(`⚡ ${res.message}`);
              }
            }
          } catch (e) {
            console.warn("Échec parsing tool_call:", e);
          }
          // Nettoyer le bloc tool_call de l'affichage utilisateur
          assistantContent = assistantContent.replace(toolCallRegex, "").trim();
        }

        // Si une intention directe avait déjà été exécutée et que l'IA ne l'a pas explicitée
        if (directExecutionMessage && !assistantContent.toLowerCase().includes("c'est fait") && !assistantContent.toLowerCase().includes("ouvert")) {
          assistantContent = `⚡ **Action effectuée** : ${directExecutionMessage}\n\n${assistantContent}`;
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: assistantContent,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: activeModel.name,
          usage: data.usage,
          isReasoning: activeModel.id === "deepseek-reasoner"
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Synthèse vocale si le son est actif
        if (ttsEnabled) {
          speakText(assistantContent);
        }
      } else {
        const errorMsg = data?.error || error || "Erreur lors de l'appel du modèle.";
        onNotify(`⚠️ Erreur: ${errorMsg}`);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ **Erreur de connexion (${activeModel.name})** : ${errorMsg}\n\n*Vérifiez vos clés API ou essayez avec un autre modèle.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Erreur réseau** : Impossible de joindre le serveur.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSendMessage(input);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify("Texte copié en 1 clic !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    setPendingSensitiveAction({
      actionType: "clear_chat",
      callback: () => {
        setMessages([]);
        onNotify("Conversation réinitialisée.");
        setPendingSensitiveAction(null);
      },
      description: "Effacer l'intégralité de la conversation actuelle."
    });
  };

  // Message d'accueil initial adapté au profil
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeParticulier =
        `Bonjour ! Je suis votre assistant officiel pour **${appName}**.\n\n` +
        `Je peux vous expliquer tout sujet en termes simples, vous aider à naviguer dans l'application ou répondre à vos questions.\n` +
        `💡 *Exemple de commande vocale ou écrite : « Ouvre le coffre-fort », « Active le mode sombre » ou « Quels sont les tarifs ? »*`;

      const welcomePro =
        `Bonjour. Assistant opérationnel pour **${appName}** à votre service.\n\n` +
        `Objectifs clés :\n` +
        `• **Pilotage applicatif** : accès instantané aux simulateurs de rentabilité, coffre ZK et gestion de chantiers.\n` +
        `• **Analyse d'impact & ROI** : simulation financière et conformité souveraine.\n` +
        `• **Tarification transparente** : 15 € TTC/an par outil ou 40 € TTC/an pour le Pass complet ALPHABETTE.\n\n` +
        `Dites-moi quelle tâche ou analyse vous souhaitez exécuter.`;

      setMessages([
        {
          id: "welcome-msg",
          role: "assistant",
          content: userProfile === "particulier" ? welcomeParticulier : welcomePro,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: activeModel.name
        }
      ]);
    }
  }, [userProfile]);

  const PROVIDER_THEMES: Record<string, {
    border: string;
    glow: string;
    badge: string;
    avatar: string;
    text: string;
  }> = {
    gemini: {
      border: "border-cyan-500/25",
      glow: "shadow-cyan-500/5",
      badge: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
      avatar: "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow shadow-cyan-500/30",
      text: "text-cyan-400"
    },
    mistral: {
      border: "border-amber-500/25",
      glow: "shadow-amber-500/5",
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      avatar: "bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow shadow-amber-500/30",
      text: "text-amber-400"
    },
    deepseek: {
      border: "border-blue-500/25",
      glow: "shadow-blue-500/5",
      badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      avatar: "bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow shadow-blue-500/30",
      text: "text-blue-400"
    },
    kimi: {
      border: "border-teal-500/25",
      glow: "shadow-teal-500/5",
      badge: "bg-teal-500/10 text-teal-300 border-teal-500/20",
      avatar: "bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 text-white shadow shadow-teal-500/30",
      text: "text-teal-400"
    }
  };

  const theme = PROVIDER_THEMES[activeModel.provider] || PROVIDER_THEMES.gemini;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full relative overflow-hidden">
      {/* Modale de confirmation pour action sensible */}
      {pendingSensitiveAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h4 className="font-bold text-base text-slate-100">Confirmation d'action sensible</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {pendingSensitiveAction.description}
              <br />
              <span className="text-slate-400 mt-1 block">
                Cette opération ne peut pas être annulée. Souhaitez-vous continuer ?
              </span>
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPendingSensitiveAction(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => pendingSensitiveAction.callback()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-all"
              >
                Confirmer l'action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Backdrop Overlay */}
      {showConfigMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden transition-all"
          onClick={() => setShowConfigMobile(false)}
        />
      )}

      {/* Sidebar: Config, Profil, Modèle & Outils */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-slate-950 border-r border-indigo-500/15 p-4 flex flex-col justify-between space-y-4 shadow-2xl transform transition-transform duration-200 ease-in-out overflow-y-auto
        ${showConfigMobile ? "translate-x-0" : "-translate-x-full"}
        lg:static lg:w-auto lg:translate-x-0 lg:z-auto lg:transition-none lg:col-span-1 lg:bg-slate-900/80 lg:backdrop-blur-md lg:border lg:border-indigo-500/15 lg:rounded-2xl lg:shadow-xl
      `}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <h3 className="font-sans font-bold text-xs uppercase text-slate-300 tracking-wider">
                Assistant & Pilotage
              </h3>
            </div>

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={() => setShowConfigMobile(false)}
              className="lg:hidden p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* SÉLECTEUR DE PROFIL : PARTICULIER VS ENTREPRISE / PRO */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 uppercase font-sans font-bold flex items-center justify-between">
              <span>Profil d'échange</span>
              <span className="text-[10px] text-indigo-400 font-mono">
                {userProfile === "particulier" ? "Pédagogique" : "Opérationnel B2B"}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setUserProfile("particulier");
                  localStorage.setItem("infoperso_chat_profile", "particulier");
                  onNotify("Profil basculé sur « Particulier » (ton chaleureux et pédagogique)");
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  userProfile === "particulier"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Particulier</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserProfile("pro");
                  localStorage.setItem("infoperso_chat_profile", "pro");
                  onNotify("Profil basculé sur « Entreprise / Pro » (ton concis, axé ROI et étapes)");
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  userProfile === "pro"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Entreprise / Pro</span>
              </button>
            </div>
          </div>

          {/* SÉLECTION DU MODÈLE IA */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 uppercase font-sans font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Modèle Actif</span>
            </label>
            <select
              value={selectedModelId}
              onChange={(e) => {
                setSelectedModelId(e.target.value);
                onNotify(`Modèle basculé sur ${AVAILABLE_MODELS.find((m) => m.id === e.target.value)?.name}`);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none focus:border-indigo-500 font-sans cursor-pointer transition-all"
            >
              {AVAILABLE_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* PALETTE D'ACTIONS PILOTABLES */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80">
            <label className="text-[11px] text-slate-400 uppercase font-sans font-bold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilotage rapide (Actions 1-Clic)</span>
            </label>
            <div className="grid grid-cols-1 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  triggerSendMessage("Ouvre le simulateur de rentabilité financière pour mon entreprise.");
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-slate-300 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Simulateur Seuil de Rentabilité</span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerSendMessage("Ouvre le coffre-fort numérique Zero-Knowledge.");
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-slate-300 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <FolderLock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Coffre-fort Zero-Knowledge</span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerSendMessage("Explique-moi les formules et tarifs ALPHABETTE (15€ / 40€).");
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-slate-300 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Tarifs & Pass ALPHABETTE</span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerSendMessage("Ouvre le module des chantiers L'Œil de l'Atelier.");
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 text-slate-300 flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>L'Œil de l'Atelier (Chantiers)</span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Bouton d'effacement sécurisé */}
        <button
          onClick={handleClearChat}
          disabled={messages.length <= 1}
          className="w-full py-2 bg-slate-950 border border-slate-850 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 disabled:opacity-35 text-xs font-sans font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Effacer la conversation
        </button>
      </div>

      {/* Main Column: Conversations et Contrôles Vocaux */}
      <div className="lg:col-span-3 bg-slate-900/80 backdrop-blur-md border border-indigo-500/15 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl">
        {/* Chat Column Header */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Mobile Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowConfigMobile(true)}
              className="lg:hidden p-2 -ml-1 bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              title="Configurer l'IA"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-bold text-slate-100">
                    Assistant {appName}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      userProfile === "particulier"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {userProfile === "particulier" ? "Particulier" : "B2B Pro"}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  {activeModel.name} • Commandes vocales & textuelles
                </p>
              </div>
            </div>
          </div>

          {/* Voice synthesis toggle & Clear */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !ttsEnabled;
                setTtsEnabled(next);
                if (!next && typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
                onNotify(next ? "🔊 Réponses vocales activées" : "🔇 Réponses vocales désactivées");
              }}
              className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                ttsEnabled
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
              }`}
              title={ttsEnabled ? "Désactiver la lecture vocale" : "Activer la lecture vocale automatique"}
            >
              {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{ttsEnabled ? "Voix Active" : "Muet"}</span>
            </button>
          </div>
        </div>

        {/* Chat Messages flow */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const msgModel = AVAILABLE_MODELS.find((m) => m.name === msg.model);
            const msgTheme = msgModel ? PROVIDER_THEMES[msgModel.provider] || PROVIDER_THEMES.gemini : theme;

            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`flex gap-3 max-w-[88%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Icon Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? "bg-gradient-to-r from-fuchsia-500 to-rose-500 text-white shadow shadow-fuchsia-500/30"
                      : msgTheme.avatar
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5 min-w-0">
                  <div
                    className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text ${
                      isUser
                        ? "bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white rounded-tr-none font-sans font-medium shadow-md shadow-violet-500/10"
                        : "bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none font-sans shadow-xs"
                    }`}
                  >
                    {/* DeepSeek Reasoning tag */}
                    {msg.isReasoning && !isUser && (
                      <div className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/25 mb-2 font-mono flex items-center gap-1">
                        <Cpu className="w-3 h-3 animate-pulse" />
                        Chaîne de pensée DeepThink activée
                      </div>
                    )}

                    {msg.content}
                  </div>

                  {/* Metadata bottom & 1-click copy */}
                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-500 ${
                      isUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isUser && msg.model && (
                      <span className={`font-sans font-bold ${msgTheme.text}`}>{msg.model}</span>
                    )}
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <>
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
                          title="Copier la réponse en 1 clic"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span className="hidden sm:inline">Copier</span>
                        </button>
                        <button
                          onClick={() => speakText(msg.content)}
                          className="hover:text-indigo-400 transition-colors cursor-pointer flex items-center gap-1 ml-1"
                          title="Écouter la réponse"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span className="hidden sm:inline">Écouter</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${theme.avatar}`}>
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-950 border border-slate-850 rounded-2xl rounded-tl-none px-4 py-2.5 flex items-center gap-2 text-xs text-slate-400 shadow-sm">
                <span className="font-sans font-semibold">Analyse et exécution en cours</span>
                <span className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input form with Voice Recognition Microphone */}
        <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
          {/* Micro bouton (Speech-to-text) */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
              isListening
                ? "bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-600/30"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
            }`}
            title={isListening ? "Arrêter l'écoute" : "Dicter une commande vocale"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={
              isListening
                ? "Écoute en cours... Dites votre commande..."
                : userProfile === "particulier"
                ? `Posez une question ou demandez une action (« Ouvre le coffre », « Active le mode sombre »)...`
                : `Exécutez une tâche ou demandez une analyse (« Ouvre le simulateur », « Calcul ROI »)...`
            }
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-4 text-xs sm:text-sm text-slate-100 outline-none transition-colors font-sans placeholder-slate-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-30 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg shadow-indigo-500/20"
            title="Envoyer la commande"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Pied de page standardisé obligatoire */}
        <div className="py-2 px-3 bg-slate-950/90 border-t border-slate-800/80 text-center shrink-0">
          <a
            href="http://alphabette.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1 transition-colors"
          >
            <span>Découvrir toutes les applications de la suite sur http://alphabette.fr ↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}
