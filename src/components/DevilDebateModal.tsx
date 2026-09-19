import React, { useState } from "react";
import { createPortal } from "react-dom";
import { NewsArticle } from "../types";
import {
  Flame,
  ShieldAlert,
  HelpCircle,
  TrendingDown,
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw
} from "lucide-react";

interface DebateMessage {
  id: string;
  sender: "user" | "devil";
  text: string;
  personaTitle?: string;
}

interface DevilDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: NewsArticle | null;
  isDark: boolean;
  onNotify: (msg: string) => void;
  geminiApiKey?: string;
}

type PersonaType = "avocat" | "socrate" | "economiste";

const PERSONAS: Record<PersonaType, { name: string; icon: string; desc: string; systemPrompt: string }> = {
  avocat: {
    name: "L'Avocat du Diable",
    icon: "🛡️",
    desc: "Démonte les évidences et attaque la thèse officielle.",
    systemPrompt: "Tu es l'Avocat du Diable le plus brillant et lucide. Ton but est de contredire intelligemment la thèse de l'article, révéler les biais de confirmation, les failles d'argumentation et les risques négligés. Sois percutant, rationnel et sans concession."
  },
  socrate: {
    name: "Le Philosophe Socratique",
    icon: "🏛️",
    desc: "Interroge les angles morts, l'éthique et les non-dits.",
    systemPrompt: "Tu es un philosophe socratique. Tu ne donnes pas de leçons mais poses 2 ou 3 questions dérangeantes sur les postulats moraux, les non-dits et le sens profond de cette actualité."
  },
  economiste: {
    name: "L'Économiste Réaliste",
    icon: "📉",
    desc: "Suit l'argent, démasque les coûts cachés et les gagnants réels.",
    systemPrompt: "Tu es un économiste pragmatique et impitoyable. Tu analyses 'Cui bono' (À qui profite le crime ?), les externalités négatives, qui va réellement payer la facture et les intérêts financiers en coulisses."
  }
};

export const DevilDebateModal: React.FC<DevilDebateModalProps> = ({
  isOpen,
  onClose,
  article,
  isDark,
  onNotify,
  geminiApiKey
}) => {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>("avocat");
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize opening rebuttal when article or persona changes
  React.useEffect(() => {
    if (!article) return;

    let initialText = "";
    if (currentPersona === "avocat") {
      initialText = `La version présentée dans "${article.title}" semble séduisante au premier regard. Cependant, on oublie trop vite de s'interroger sur les biais du narratif : ne s'agit-il pas d'un effet d'annonce gonflé ? Quels sont les effets secondaires pervers que personne n'ose évoquer ? Soumettez-moi votre point de vue et testons sa solidité.`;
    } else if (currentPersona === "socrate") {
      initialText = `Face à cette nouvelle concernant "${article.title}", demandons-nous : quel problème fondamental prétendons-nous résoudre ? Ne confondons-nous pas l'urgence médiatique et l'importance réelle pour la société ?`;
    } else {
      initialText = `Dans ce dossier rapporté par ${article.source}, il y a ceux qui communiquent et ceux qui encaissent. Qui finance réellement cette opération et qui va en supporter le coût final ? Décortiquons la mécanique financière.`;
    }

    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: "devil",
        text: initialText,
        personaTitle: PERSONAS[currentPersona].name
      }
    ]);
  }, [article, currentPersona]);

  const handleSendMessage = async (userPrompt: string) => {
    if (!userPrompt.trim() || !article) return;

    const userMsg: DebateMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userPrompt
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsLoading(true);

    try {
      const persona = PERSONAS[currentPersona];
      const conversationContext = messages.map(m => `${m.sender === "user" ? "Utilisateur" : persona.name}: ${m.text}`).join("\n");
      const prompt = `${persona.systemPrompt}
Article de référence :
Titre : "${article.title}"
Contenu : "${article.summary || article.content.slice(0, 500)}"

Historique du débat :
${conversationContext}
Utilisateur : ${userPrompt}

Réponds avec concision (150 à 200 mots maximum), mordant et arguments factuels précis.`;

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
        const replyText = data?.message?.content || data?.content || "Réponse générée.";
        setMessages((prev) => [
          ...prev,
          {
            id: `d-${Date.now()}`,
            sender: "devil",
            text: replyText,
            personaTitle: persona.name
          }
        ]);
      } else {
        throw new Error("Proxy error");
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `d-${Date.now()}`,
          sender: "devil",
          text: `C'est un argument recevable, mais vous sous-estimez l'asymétrie d'information. Les acteurs dominants ont tout intérêt à orienter le débat public sur ce sujet précis pour masquer des arbitrages bien plus contraignants.`,
          personaTitle: PERSONAS[currentPersona].name
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !article) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl flex flex-col max-h-[85dvh] sm:max-h-[88vh] overflow-hidden ${
          isDark
            ? "bg-slate-900 border-rose-500/30 text-slate-100"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-700/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-inner">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight flex items-center gap-2">
                <span>L'Avocat du Diable : Test de Solidité</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono font-bold">
                  Dialectique
                </span>
              </h3>
              <p className="text-xs opacity-75 truncate max-w-md">
                {article.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Persona Switcher Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-3 border-b border-slate-700/30 bg-black/20 shrink-0">
          {(Object.keys(PERSONAS) as PersonaType[]).map((pKey) => {
            const p = PERSONAS[pKey];
            const isSelected = currentPersona === pKey;
            return (
              <button
                key={pKey}
                onClick={() => setCurrentPersona(pKey)}
                className={`p-2 rounded-xl border text-left flex flex-col transition-all cursor-pointer ${
                  isSelected
                    ? "bg-rose-600 text-white border-rose-400 shadow-md font-bold"
                    : isDark
                    ? "bg-slate-800/40 border-slate-700/50 text-slate-300 hover:bg-slate-800"
                    : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <div className="flex items-center gap-1 text-xs font-bold truncate">
                  <span>{p.icon}</span>
                  <span className="truncate">{p.name}</span>
                </div>
                <div className="text-[10px] opacity-75 truncate mt-0.5">
                  {p.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Chat History */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto scrollbar flex-1 min-h-0">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "devil" && (
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 text-sm">
                  {PERSONAS[currentPersona].icon}
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed border ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-none font-medium"
                    : isDark
                    ? "bg-slate-800/80 border-slate-700/70 text-slate-100 rounded-tl-none"
                    : "bg-slate-100 border-slate-200 text-slate-800 rounded-tl-none"
                }`}
              >
                {m.personaTitle && (
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">
                    {m.personaTitle}
                  </div>
                )}
                <div className="whitespace-pre-wrap">{m.text}</div>
              </div>
              {m.sender === "user" && (
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-rose-400 italic">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>{PERSONAS[currentPersona].name} prépare sa contre-offensive...</span>
            </div>
          )}
        </div>

        {/* Quick Challenge Chips */}
        <div className="px-4 py-2 border-t border-slate-700/30 flex flex-wrap gap-1.5 bg-black/10 shrink-0">
          {[
            "💥 Quelle est la plus grande faille de cet article ?",
            "🔍 Quels sont les non-dits passés sous silence ?",
            "💰 Qui profite réellement de cette annonce ?"
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-700/40 flex items-center gap-2 bg-black/20 shrink-0">
          <input
            type="text"
            placeholder="Posez une objection ou défendez votre point de vue..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputQuery)}
            className={`flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-rose-500 ${
              isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
            }`}
          />
          <button
            onClick={() => handleSendMessage(inputQuery)}
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-rose-600/30"
            title="Envoyer l'argument"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : modalContent;
};
