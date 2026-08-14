import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, Trash2, Copy, Check, AlertCircle, Cpu, MessageSquare, X, Sliders } from "lucide-react";
import { AVAILABLE_MODELS, ChatMessage, ApiKeys, Provider } from "../types";

interface MultiChatProps {
  apiKeys: ApiKeys;
  onNotify: (msg: string) => void;
  displayMode?: "sobre" | "pro" | "warm" | "cyber" | "fun";
  themeMode?: "light" | "dark";
}

export default function MultiChat({
  apiKeys,
  onNotify,
  displayMode = "pro",
  themeMode = "dark"
}: MultiChatProps) {
  const [selectedModelId, setSelectedModelId] = useState("gemini-3.5-flash");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("Tu es un assistant IA professionnel, utile, précis, créatif et concis. Réponds toujours en français.");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showConfigMobile, setShowConfigMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const activeModel = AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Build entire message history including system prompt
    const apiMessages = [];
    if (systemPrompt.trim()) {
      apiMessages.push({ role: "system", content: systemPrompt.trim() });
    }

    // Include last 10 messages for context
    const recentMessages = messages.concat(userMessage).slice(-10);
    recentMessages.forEach((msg) => {
      apiMessages.push({ role: msg.role, content: msg.content });
    });

    const activeProvider = activeModel.provider;
    const userApiKey = apiKeys[activeProvider];

    try {
      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeProvider,
          model: activeModel.id,
          messages: apiMessages,
          apiKey: userApiKey,
        }),
      });

      const data = await res.json();

      if (res.ok && data.content) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: activeModel.name,
          usage: data.usage,
          isReasoning: activeModel.id === "deepseek-reasoner",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMsg = data.error || "Une erreur est survenue lors de l'appel de l'API.";
        onNotify(`⚠️ Erreur: ${errorMsg}`);
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ **Erreur de connexion (${activeModel.name})** : ${errorMsg}\n\n*Veuillez vérifier vos clés de connexion dans l'onglet Clés API ou tenter avec un autre modèle.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Erreur réseau** : Impossible de contacter le serveur proxy. Veuillez ré-essayer.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify("Message copié !");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm("Voulez-vous effacer toute la conversation actuelle ?")) {
      setMessages([]);
      onNotify("Conversation effacée.");
    }
  };

  // Seed initial system example
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome-msg",
          role: "assistant",
          content: `Bonjour ! Je suis votre compagnon intelligent d'**InfoPerso** alimenté par **Gemini 3.5 Flash**.\n\nVous pouvez me poser des questions complexes, me demander de résumer des fiches, d'analyser l'actualité ou d'approfondir les thématiques de votre filtre personnalisé !`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          model: activeModel.name,
        },
      ]);
    }
  }, [selectedModelId]);

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
      avatar: "bg-linear-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow shadow-cyan-500/30",
      text: "text-cyan-400"
    },
    mistral: {
      border: "border-amber-500/25",
      glow: "shadow-amber-500/5",
      badge: "bg-amber-500/10 text-amber-300 border-amber-500/20",
      avatar: "bg-linear-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow shadow-amber-500/30",
      text: "text-amber-400"
    },
    deepseek: {
      border: "border-blue-500/25",
      glow: "shadow-blue-500/5",
      badge: "bg-blue-500/10 text-blue-300 border-blue-500/20",
      avatar: "bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 text-white shadow shadow-blue-500/30",
      text: "text-blue-400"
    },
    kimi: {
      border: "border-teal-500/25",
      glow: "shadow-teal-500/5",
      badge: "bg-teal-500/10 text-teal-300 border-teal-500/20",
      avatar: "bg-linear-to-r from-teal-500 via-emerald-400 to-cyan-500 text-white shadow shadow-teal-500/30",
      text: "text-teal-400"
    }
  };

  const theme = PROVIDER_THEMES[activeModel.provider] || PROVIDER_THEMES.gemini;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full relative overflow-hidden">
      {/* Mobile Sidebar Backdrop Overlay */}
      {showConfigMobile && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-40 lg:hidden transition-all"
          onClick={() => setShowConfigMobile(false)}
        />
      )}

      {/* Sidebar: Config & Model detail */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 border-r border-indigo-500/15 p-4 flex flex-col justify-between space-y-4 shadow-2xl transform transition-transform duration-200 ease-in-out
        ${showConfigMobile ? "translate-x-0" : "-translate-x-full"}
        lg:static lg:w-auto lg:translate-x-0 lg:z-auto lg:transition-none lg:col-span-1 lg:bg-slate-900/80 lg:backdrop-blur-md lg:border lg:border-indigo-500/15 lg:rounded-2xl lg:shadow-xl
      `}>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="font-sans font-bold text-xs uppercase text-slate-300 tracking-wider">
                Choix du Cerveau (IA)
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

          {/* Model selection dropdown */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 uppercase font-sans font-bold">Modèle Actif</label>
            <select
              value={selectedModelId}
              onChange={(e) => {
                setSelectedModelId(e.target.value);
                onNotify(`Modèle basculé sur ${AVAILABLE_MODELS.find(m => m.id === e.target.value)?.name}`);
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

          {/* Active Model specs panel */}
          <div className={`bg-slate-950/60 p-3.5 rounded-xl border ${theme.border} ${theme.glow} shadow-sm space-y-2 text-xs transition-all`}>
            <div className={`flex items-center gap-1.5 ${theme.text} font-bold text-xs`}>
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Spécifications du Modèle
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{activeModel.description}</p>
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 font-sans">Fournisseur :</span>
                <span className={`font-mono font-bold capitalize ${theme.text}`}>{activeModel.provider}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 font-sans">Contexte max :</span>
                <span className="text-slate-300 font-mono font-semibold">{activeModel.contextWindow}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500 font-sans">Point fort :</span>
                <span className={`font-sans font-bold ${theme.text}`}>{activeModel.strength}</span>
              </div>
            </div>
          </div>

          {/* System Prompt editor */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 uppercase font-sans font-bold">Instructions Système (Prompt)</label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-colors font-sans leading-relaxed resize-none"
              placeholder="Saisir des consignes pour orienter la personnalité de l'IA..."
            />
          </div>
        </div>

        {/* Clear thread action */}
        <button
          onClick={handleClearChat}
          disabled={messages.length <= 1}
          className="w-full py-2 bg-slate-950 border border-slate-850 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 disabled:opacity-35 text-xs font-sans font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Effacer le Chat
        </button>
      </div>

      {/* Main Column: Conversations */}
      <div className="lg:col-span-3 bg-slate-900/80 backdrop-blur-md border border-indigo-500/15 rounded-2xl flex flex-col justify-between overflow-hidden shadow-xl">
        {/* Chat Column Header */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Mobile Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowConfigMobile(true)}
              className="lg:hidden p-2 -ml-1 bg-slate-950 border border-slate-800 hover:border-indigo-500 text-slate-400 hover:text-indigo-400 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 shadow-sm"
              title="Configurer l'IA"
            >
              <Sliders className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                theme.text === "text-cyan-400" ? "bg-cyan-400" :
                theme.text === "text-emerald-400" ? "bg-emerald-400" :
                theme.text === "text-orange-400" ? "bg-orange-400" :
                theme.text === "text-amber-400" ? "bg-amber-400" :
                "bg-indigo-400"
              } animate-pulse`} />
              <span className="text-xs font-sans font-bold text-slate-300">Conversation active</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-sans font-bold border ${theme.badge} ml-2 hidden sm:inline`}>
                {activeModel.name}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleClearChat}
            disabled={messages.length <= 1}
            className="px-2.5 py-1 bg-slate-950/60 border border-slate-850 hover:border-rose-500/30 hover:text-rose-400 text-slate-400 disabled:opacity-35 text-[11px] font-sans font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Effacer le Chat</span>
          </button>
        </div>

        {/* Chat Messages flow */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            const msgModel = AVAILABLE_MODELS.find(m => m.name === msg.model);
            const msgTheme = msgModel ? (PROVIDER_THEMES[msgModel.provider] || PROVIDER_THEMES.gemini) : theme;

            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
              >
                {/* Icon Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isUser ? "bg-linear-to-r from-fuchsia-500 to-rose-500 text-white shadow shadow-fuchsia-500/30" : msgTheme.avatar
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text ${
                      isUser
                        ? "bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white rounded-tr-none font-sans font-medium shadow-md shadow-violet-500/10"
                        : "bg-slate-950 border border-slate-850 text-slate-200 rounded-tl-none font-sans shadow-xs"
                    }`}
                  >
                    {/* DeepSeek Reasoning tag */}
                    {msg.isReasoning && !isUser && (
                      <div className="text-[10px] text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/25 mb-2 font-mono flex items-center gap-1">
                        <Cpu className="w-3 h-3 animate-pulse" />
                        Chaîne de pensée DeepThink (R1) activée
                      </div>
                    )}
                    {msg.content}
                  </div>

                  {/* Metadata bottom */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isUser ? "justify-end" : "justify-start"}`}>
                    {!isUser && msg.model && (
                      <span className={`font-sans font-bold ${msgTheme.text}`}>{msg.model}</span>
                    )}
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="hover:text-cyan-400 transition-colors cursor-pointer"
                        title="Copier le texte"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                      </button>
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
                <span className="font-sans font-semibold">{activeModel.name} réfléchit</span>
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

        {/* Chat Input form */}
        <form onSubmit={handleSend} className="p-3.5 border-t border-slate-800 bg-slate-900/60 flex gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={`Écrire votre message pour ${activeModel.name}...`}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 px-4.5 text-xs sm:text-sm text-slate-100 outline-none transition-colors font-sans placeholder-slate-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-linear-to-r from-cyan-500 via-indigo-500 to-fuchsia-500 hover:opacity-90 disabled:opacity-30 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-lg shadow-indigo-500/20"
            title="Envoyer le message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
