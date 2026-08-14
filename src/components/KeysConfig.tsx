import React, { useState } from "react";
import { Key, Eye, EyeOff, CheckCircle2, XCircle, Loader2, RefreshCw, Trash2, HelpCircle } from "lucide-react";
import { ApiKeys } from "../types";

interface KeysConfigProps {
  keys: ApiKeys;
  onKeysChange: (newKeys: ApiKeys) => void;
  displayMode?: "sobre" | "pro" | "warm" | "cyber" | "fun";
  themeMode?: "light" | "dark";
}

export default function KeysConfig({ 
  keys, 
  onKeysChange, 
  displayMode = "pro", 
  themeMode = "dark" 
}: KeysConfigProps) {
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<Record<string, "idle" | "testing" | "success" | "failed">>({});
  const [testError, setTestError] = useState<Record<string, string>>({});

  const isSobre = displayMode === "sobre";
  const isWarm = displayMode === "warm";
  const isCyber = displayMode === "cyber";
  const isFun = displayMode === "fun";
  const isDark = themeMode === "dark";

  const providers = [
    {
      id: "gemini",
      name: "Gemini (Google)",
      placeholder: "Saisir votre clé API Gemini...",
      desc: "Idéal pour Gemini 1.5 Flash / Pro. En l'absence de clé, utilise la clé par défaut de l'administrateur pour votre premier essai gratuit.",
      link: "https://aistudio.google.com/app/apikey",
    },
  ];

  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    const updated = { ...keys, [provider]: value.trim() };
    onKeysChange(updated);
    // Reset test state if modified
    setTestStatus((prev) => ({ ...prev, [provider]: "idle" }));
  };

  const toggleShow = (provider: string) => {
    setShowKey((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const testKey = async (provider: string) => {
    const apiKey = keys[provider as keyof ApiKeys];
    if (!apiKey) {
      setTestStatus((prev) => ({ ...prev, [provider]: "failed" }));
      setTestError((prev) => ({ ...prev, [provider]: "Veuillez d'abord saisir une clé API." }));
      return;
    }

    setTestStatus((prev) => ({ ...prev, [provider]: "testing" }));
    setTestError((prev) => ({ ...prev, [provider]: "" }));

    try {
      const res = await fetch("/api/chat/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      const data = await res.json();

      if (data.success) {
        setTestStatus((prev) => ({ ...prev, [provider]: "success" }));
      } else {
        setTestStatus((prev) => ({ ...prev, [provider]: "failed" }));
        setTestError((prev) => ({ ...prev, [provider]: data.error || "Clé incorrecte ou expirée." }));
      }
    } catch (err: any) {
      setTestStatus((prev) => ({ ...prev, [provider]: "failed" }));
      setTestError((prev) => ({ ...prev, [provider]: "Erreur de connexion au proxy." }));
    }
  };

  const clearKey = (provider: keyof ApiKeys) => {
    handleKeyChange(provider, "");
    setTestStatus((prev) => ({ ...prev, [provider]: "idle" }));
  };

  return (
    <div id="keys-configuration-view" className="space-y-6 max-w-4xl mx-auto">
      <div className={`flex flex-col gap-1 border-b pb-4 transition-all duration-300 ${
        isSobre ? isDark ? "border-zinc-800" : "border-zinc-200" :
        isWarm ? isDark ? "border-amber-900/30 font-serif" : "border-amber-900/15 font-serif" :
        isCyber ? isDark ? "border-cyan-500/20 font-mono" : "border-cyan-500/30 font-mono" :
        isFun ? "border-black font-sans" :
        isDark ? "border-slate-800" : "border-slate-200"
      }`}>
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${
          isSobre ? isDark ? "text-white font-extrabold" : "text-zinc-900 font-extrabold" :
          isWarm ? isDark ? "text-[#F4ECE1] font-bold" : "text-amber-950 font-bold" :
          isCyber ? isDark ? "text-[#00ffcc] font-black" : "text-black font-black" :
          isFun ? isDark ? "text-white font-black" : "text-black font-black" :
          isDark ? "text-white" : "text-slate-900"
        }`}>
          <Key className={`w-5 h-5 ${
            isSobre ? isDark ? "text-zinc-400" : "text-zinc-650" :
            isWarm ? isDark ? "text-amber-550" : "text-amber-900" :
            isCyber ? "text-[#00ffcc]" :
            isFun ? "text-pink-500" :
            "text-cyan-400"
          }`} />
          Configuration des Clés API
        </h2>
        <p className={`text-sm leading-relaxed ${
          isSobre ? isDark ? "text-zinc-400" : "text-zinc-650" :
          isWarm ? isDark ? "text-amber-800/80" : "text-[#543d2b]" :
          isCyber ? isDark ? "text-cyan-500" : "text-cyan-800" :
          isFun ? isDark ? "text-zinc-300 font-semibold" : "text-black font-semibold" :
          isDark ? "text-slate-400" : "text-slate-600"
        }`}>
          Vos clés sont stockées de façon sécurisée localement dans votre navigateur.
          Elles transitent exclusivement par notre serveur proxy pour exécuter vos requêtes sans risque de blocage CORS.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((p) => {
          const providerId = p.id as keyof ApiKeys;
          const keyValue = keys[providerId] || "";
          const status = testStatus[p.id] || "idle";
          const errorMsg = testError[p.id] || "";

          // Themed styles for card
          const cardClass = isSobre
            ? isDark
              ? "bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl hover:border-zinc-750 text-zinc-100"
              : "bg-zinc-50 border border-zinc-250 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-sm text-zinc-850"
            : isWarm
            ? isDark
              ? "bg-[#382F2A] border border-amber-900/20 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-md hover:border-amber-900/30 font-serif text-[#F4ECE1]"
              : "bg-[#FAF6F0] border border-amber-900/15 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xs hover:shadow-sm font-serif text-amber-950"
            : isCyber
            ? isDark
              ? "bg-black border border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] font-mono text-[#00ffcc]"
              : "bg-white border border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] font-mono text-black"
            : isFun
            ? isDark
              ? "bg-[#2A263D] border-3 border-black rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] hover:translate-x-0.5 hover:translate-y-0.5 text-white"
              : "bg-white border-3 border-black rounded-3xl p-5 flex flex-col justify-between transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 text-black"
            : isDark
            ? "bg-slate-900/60 backdrop-blur-md border border-indigo-500/20 hover:border-indigo-500/55 rounded-2xl p-5 flex flex-col justify-between transition-all duration-350 shadow-lg hover:shadow-indigo-500/10 text-slate-200"
            : "bg-white border border-slate-250 hover:border-indigo-500/30 rounded-2xl p-5 flex flex-col justify-between transition-all duration-350 shadow-md hover:shadow-indigo-500/5 text-slate-800";

          const iconBgClass = isSobre
            ? isDark ? "bg-zinc-950 text-zinc-300 border-zinc-850" : "bg-zinc-100 text-zinc-800 border-zinc-200"
            : isWarm
            ? isDark ? "bg-[#2B231F] text-amber-300 border-amber-900/30" : "bg-amber-100 text-amber-900 border-amber-200"
            : isCyber
            ? isDark ? "bg-cyan-950/40 text-[#00ffcc] border-cyan-500/20" : "bg-cyan-100 text-black border-cyan-200"
            : isFun
            ? isDark ? "bg-pink-900/30 text-pink-300 border-2 border-black" : "bg-pink-100 text-black border-2 border-black"
            : isDark ? "bg-indigo-500/10 text-indigo-400 border-white/5" : "bg-indigo-100 text-indigo-750 border-indigo-200/50";

          const titleClass = isSobre
            ? "font-bold text-sm text-zinc-950 font-extrabold"
            : isWarm
            ? "font-serif font-bold text-sm text-amber-950"
            : isCyber
            ? "font-mono font-bold text-sm text-[#00ffcc]"
            : isFun
            ? "font-black text-base text-black"
            : "font-sans font-bold text-sm text-white";

          const descClass = isSobre
            ? isDark ? "text-xs text-zinc-400 leading-relaxed mb-4 min-h-[32px]" : "text-xs text-zinc-550 leading-relaxed mb-4 min-h-[32px]"
            : isWarm
            ? isDark ? "text-xs text-amber-200/80 leading-relaxed mb-4 min-h-[32px]" : "text-xs text-amber-900/80 leading-relaxed mb-4 min-h-[32px]"
            : isCyber
            ? isDark ? "text-xs text-cyan-500 leading-relaxed mb-4 min-h-[32px]" : "text-xs text-cyan-600 leading-relaxed mb-4 min-h-[32px]"
            : isFun
            ? isDark ? "text-xs text-zinc-300 font-medium leading-relaxed mb-4 min-h-[32px]" : "text-xs text-black font-medium leading-relaxed mb-4 min-h-[32px]"
            : isDark ? "text-xs text-slate-400 mb-4 min-h-[32px] leading-relaxed" : "text-xs text-slate-500 mb-4 min-h-[32px] leading-relaxed";

          const inputClass = isSobre
            ? isDark
              ? "w-full bg-zinc-950 border border-zinc-850 rounded-lg py-2 pl-3 pr-20 text-xs text-white outline-none focus:border-zinc-550 transition-colors font-mono"
              : "w-full bg-white border border-zinc-300 rounded-lg py-2 pl-3 pr-20 text-xs text-zinc-900 outline-none focus:border-zinc-500 transition-colors font-mono"
            : isWarm
            ? isDark
              ? "w-full bg-[#2B231F] border border-amber-900/30 rounded-lg py-2 pl-3 pr-20 text-xs text-amber-50 outline-none focus:border-amber-600 transition-colors font-mono"
              : "w-full bg-[#FAF6F0] border border-amber-900/20 rounded-lg py-2 pl-3 pr-20 text-xs text-amber-950 outline-none focus:border-amber-900 transition-colors font-mono"
            : isCyber
            ? isDark
              ? "w-full bg-black border border-cyan-500/40 rounded-lg py-2 pl-3 pr-20 text-xs text-[#00ffcc] outline-none focus:border-cyan-400 transition-colors font-mono shadow-[inset_0_0_6px_rgba(6,182,212,0.1)]"
              : "w-full bg-[#f4fffe] border border-cyan-500/40 rounded-lg py-2 pl-3 pr-20 text-xs text-black outline-none focus:border-cyan-400 transition-colors font-mono"
            : isFun
            ? isDark
              ? "w-full bg-[#1D1B26] border-2 border-black rounded-xl py-2 pl-3 pr-20 text-xs text-white outline-none font-bold"
              : "w-full bg-white border-2 border-black rounded-xl py-2 pl-3 pr-20 text-xs text-black outline-none font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            : isDark
            ? "w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-3 pr-20 text-xs text-white outline-none focus:border-indigo-500 transition-colors font-mono"
            : "w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-20 text-xs text-slate-900 outline-none focus:border-indigo-500 transition-colors font-mono";

          const linkClass = isSobre
            ? isDark ? "text-xs text-zinc-400 hover:text-white hover:underline inline-flex items-center gap-1.5 font-medium transition-colors" : "text-xs text-zinc-550 hover:text-zinc-950 hover:underline inline-flex items-center gap-1.5 font-medium transition-colors"
            : isWarm
            ? isDark ? "text-xs text-amber-300 hover:text-white hover:underline inline-flex items-center gap-1.5 font-medium transition-colors" : "text-xs text-amber-900/60 hover:text-amber-950 hover:underline inline-flex items-center gap-1.5 font-medium transition-colors"
            : isCyber
            ? isDark ? "text-xs text-cyan-500 hover:text-cyan-300 hover:underline inline-flex items-center gap-1.5 font-medium transition-colors" : "text-xs text-cyan-750 hover:text-cyan-550 hover:underline inline-flex items-center gap-1.5 font-medium transition-colors"
            : isFun
            ? isDark ? "text-xs text-zinc-300 hover:underline inline-flex items-center gap-1.5 font-black transition-colors" : "text-xs text-black hover:underline inline-flex items-center gap-1.5 font-black transition-colors"
            : isDark ? "text-xs text-slate-500 hover:text-white hover:underline inline-flex items-center gap-1.5 font-medium transition-colors" : "text-xs text-slate-650 hover:text-slate-900 hover:underline inline-flex items-center gap-1.5 font-medium transition-colors";

          const buttonClass = isSobre
            ? "inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-zinc-900 cursor-pointer shadow-xs"
            : isWarm
            ? "inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-900 hover:bg-amber-950 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-amber-900 cursor-pointer"
            : isCyber
            ? "inline-flex items-center gap-1.5 px-3 py-1.5 bg-black border border-cyan-500/50 text-[#00ffcc] hover:bg-cyan-950/20 rounded-lg text-xs font-bold transition-all disabled:opacity-40 disabled:hover:bg-black cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.1)]"
            : isFun
            ? "inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white border-2 border-black rounded-xl text-xs font-black shadow-[2px_2px_0px_0px_rgba(236,72,153,1)] transition-all disabled:opacity-40 disabled:hover:bg-black cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5"
            : isDark 
            ? "inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 hover:border-indigo-500/40 disabled:opacity-50 disabled:hover:border-slate-800 text-slate-200 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer shadow-md"
            : "inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-250 hover:bg-slate-200 hover:border-indigo-500/30 disabled:opacity-50 text-slate-800 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer shadow-sm";

          return (
            <div key={p.id} id={`card-key-${p.id}`} className={cardClass}>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${iconBgClass}`}>
                      <Key className="w-4 h-4" />
                    </div>
                    <span className={titleClass}>{p.name}</span>
                  </div>

                  {/* Status Indicator */}
                  <div>
                    {status === "testing" && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        isSobre ? isDark ? "bg-zinc-950 text-zinc-300 border-zinc-800" : "bg-zinc-100 text-zinc-800 border-zinc-200" :
                        isWarm ? isDark ? "bg-[#2B231F] text-amber-200 border-amber-900/30" : "bg-amber-100 text-amber-950 border-amber-900/10" :
                        isCyber ? isDark ? "bg-cyan-950/20 text-[#00ffcc] border-cyan-500/20" : "bg-cyan-100 text-cyan-800 border-cyan-300" :
                        isFun ? "bg-yellow-100 text-black border-2 border-black font-black" :
                        isDark ? "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20" : "bg-indigo-50 text-indigo-750 border border-indigo-200"
                      }`}>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Vérification...
                      </span>
                    )}
                    {status === "success" && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        isSobre ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        isWarm ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        isCyber ? "bg-emerald-950/20 text-emerald-400 border-emerald-500/20" :
                        isFun ? "bg-emerald-300 text-black border-2 border-black font-black" :
                        "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                        Valide
                      </span>
                    )}
                    {status === "failed" && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        isSobre ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        isWarm ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                        isCyber ? "bg-rose-950/20 text-rose-400 border-rose-500/20" :
                        isFun ? "bg-rose-300 text-black border-2 border-black font-black" :
                        "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        <XCircle className="w-3 h-3" />
                        Erreur
                      </span>
                    )}
                    {status === "idle" && keyValue && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                        isSobre ? isDark ? "bg-zinc-950 text-zinc-300 border-zinc-800" : "bg-zinc-100 text-zinc-900 border-zinc-300" :
                        isWarm ? isDark ? "bg-[#2B231F] text-amber-200 border-amber-900/30" : "bg-amber-50 text-amber-950 border-amber-900/10" :
                        isCyber ? isDark ? "bg-cyan-950/20 text-cyan-300 border-cyan-500/20" : "bg-cyan-500/10 text-cyan-700 border-cyan-300" :
                        isFun ? "bg-cyan-300 text-black border-2 border-black font-black" :
                        isDark ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20" : "bg-cyan-50 text-cyan-850 border border-cyan-200"
                      }`}>
                        Enregistrée
                      </span>
                    )}
                    {!keyValue && status === "idle" && (
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-dashed ${
                        isSobre ? isDark ? "text-zinc-500 bg-zinc-950 border-zinc-800" : "text-zinc-500 bg-zinc-100 border-zinc-300" :
                        isWarm ? isDark ? "text-amber-500/60 bg-[#2B231F] border-amber-900/20" : "text-amber-850/60 bg-amber-50 border-amber-200" :
                        isCyber ? "text-cyan-700 bg-black border-cyan-900" :
                        isFun ? "text-black/60 bg-white border-2 border-black font-bold" :
                        isDark ? "text-slate-500 bg-slate-950 border-slate-800" : "text-slate-500 bg-slate-50 border-slate-200"
                      }`}>
                        Non configurée
                      </span>
                    )}
                  </div>
                </div>

                <p className={descClass}>
                  {p.desc}
                </p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showKey[p.id] ? "text" : "password"}
                    value={keyValue}
                    onChange={(e) => handleKeyChange(providerId, e.target.value)}
                    placeholder={p.placeholder}
                    className={inputClass}
                  />
                  <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => toggleShow(p.id)}
                      className={`p-1 transition-colors cursor-pointer ${
                        isSobre ? isDark ? "text-zinc-550 hover:text-white" : "text-zinc-400 hover:text-zinc-900" :
                        isWarm ? isDark ? "text-amber-400 hover:text-white" : "text-amber-900/50 hover:text-amber-950" :
                        isCyber ? "text-cyan-600 hover:text-cyan-400" :
                        isFun ? "text-black hover:scale-110" :
                        isDark ? "text-slate-500 hover:text-white" : "text-slate-400 hover:text-slate-800"
                      }`}
                      title={showKey[p.id] ? "Masquer la clé" : "Afficher la clé"}
                    >
                      {showKey[p.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    {keyValue && (
                      <button
                        type="button"
                        onClick={() => clearKey(providerId)}
                        className={`p-1 transition-colors cursor-pointer ${
                          isSobre ? isDark ? "text-zinc-550 hover:text-rose-400" : "text-zinc-400 hover:text-rose-600" :
                          isWarm ? isDark ? "text-amber-400 hover:text-rose-400" : "text-amber-900/50 hover:text-rose-700" :
                          isCyber ? "text-cyan-600 hover:text-pink-500" :
                          isFun ? "text-black hover:scale-110" :
                          isDark ? "text-slate-500 hover:text-rose-400" : "text-slate-450 hover:text-rose-600"
                        }`}
                        title="Effacer la clé"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {errorMsg && (
                  <p className={`text-[11px] leading-snug p-2.5 rounded-lg border ${
                    isSobre ? "text-red-400 bg-red-950/20 border-red-900/30" :
                    isWarm ? "text-rose-400 bg-rose-950/20 border-rose-900/30" :
                    isCyber ? "text-rose-400 bg-rose-950/20 border-rose-900/40" :
                    isFun ? "text-black bg-rose-200 border-2 border-black font-bold" :
                    isDark ? "text-rose-400 bg-rose-950/20 border border-rose-900/40" : "text-rose-600 bg-rose-50 border border-rose-200"
                  }`}>
                    {errorMsg}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className={linkClass}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    Obtenir une clé ↗
                  </a>

                  <button
                    type="button"
                    onClick={() => testKey(p.id)}
                    disabled={!keyValue || status === "testing"}
                    className={buttonClass}
                  >
                    <RefreshCw className={`w-3 h-3 ${status === "testing" ? "animate-spin" : ""}`} />
                    Tester la clé
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`border p-5 flex items-start gap-4 mt-6 relative overflow-hidden transition-all duration-300 ${
        isSobre ? isDark ? "bg-zinc-950 border-zinc-800 text-zinc-400" : "bg-zinc-50 border-zinc-200 rounded-2xl text-zinc-650" :
        isWarm ? isDark ? "bg-[#2B231F] border-amber-900/20 rounded-2xl text-amber-200/80 font-serif" : "bg-[#FAF6F0] border-amber-900/15 rounded-2xl text-[#543d2b] font-serif" :
        isCyber ? isDark ? "bg-black border-cyan-500/20 rounded-2xl text-cyan-550 font-mono shadow-[0_0_15px_rgba(6,182,212,0.05)]" : "bg-white border-cyan-500/40 rounded-2xl text-black font-mono" :
        isFun ? isDark ? "bg-[#1D1B26] border-3 border-black rounded-3xl text-zinc-300" : "bg-pink-50 border-3 border-black rounded-3xl text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" :
        isDark ? "bg-linear-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl text-slate-400" : "bg-slate-50 border border-slate-200 rounded-2xl text-slate-600"
      }`}>
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <CheckCircle2 className={`w-6 h-6 shrink-0 mt-0.5 animate-pulse ${
          isSobre ? isDark ? "text-zinc-400" : "text-zinc-700" :
          isWarm ? isDark ? "text-amber-400" : "text-amber-900" :
          isCyber ? "text-[#00ffcc]" :
          isFun ? "text-pink-500" :
          "text-cyan-400"
        }`} />
        <div className="relative">
          <h4 className={`font-bold text-sm ${
            isSobre ? isDark ? "text-white font-extrabold" : "text-zinc-900 font-extrabold" :
            isWarm ? isDark ? "text-[#F4ECE1] font-bold" : "text-amber-950 font-bold" :
            isCyber ? isDark ? "text-white font-mono" : "text-black font-mono" :
            isFun ? isDark ? "text-white font-black" : "text-black font-black" :
            isDark ? "text-slate-100" : "text-slate-900"
          }`}>Garantie de Sécurité & Confidentialité</h4>
          <p className={`text-xs mt-1.5 leading-relaxed ${
            isSobre ? isDark ? "text-zinc-400" : "text-zinc-600" :
            isWarm ? isDark ? "text-amber-300" : "text-amber-900/80" :
            isCyber ? "text-cyan-500" :
            isFun ? isDark ? "text-zinc-300 font-medium" : "text-black font-medium" :
            isDark ? "text-slate-400" : "text-slate-600"
          }`}>
            Vos clés API sont stockées uniquement dans la base de données <strong>localStorage</strong> de votre navigateur local.
            Notre serveur proxy se contente de relayer vos requêtes d'un point de vue réseau pour contourner les blocages de sécurité des navigateurs,
            sans jamais sauvegarder ou enregistrer vos clés privées. Vos secrets restent 100% vôtres.
          </p>
        </div>
      </div>
    </div>
  );
}
