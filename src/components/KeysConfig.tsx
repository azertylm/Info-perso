import React, { useState } from "react";
import { Key, Eye, EyeOff, CheckCircle2, XCircle, Loader2, RefreshCw, Trash2, ExternalLink, ShieldCheck, Sparkles, AlertTriangle } from "lucide-react";
import { ApiKeys } from "../types";
import { safeFetchJson } from "../lib/apiHelper";

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
      name: "Google Gemini API",
      subtitle: "Modèles 1.5 Flash, 1.5 Pro, 2.0 Flash & Gemini 3",
      placeholder: "Collez votre clé API Gemini (AIzaSy...)",
      desc: "Nécessaire pour la génération d'articles sur-mesure, l'approfondissement IA, la détection des biais et le MultiChat interactif.",
      link: "https://aistudio.google.com/app/apikey",
    },
  ];

  const handleKeyChange = (provider: keyof ApiKeys, value: string) => {
    const updated = { ...keys, [provider]: value.trim() };
    onKeysChange(updated);
    setTestStatus((prev) => ({ ...prev, [provider]: "idle" }));
  };

  const toggleShow = (provider: string) => {
    setShowKey((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const testKey = async (provider: string) => {
    const apiKey = keys[provider as keyof ApiKeys];
    if (!apiKey) {
      setTestStatus((prev) => ({ ...prev, [provider]: "failed" }));
      setTestError((prev) => ({ ...prev, [provider]: "Veuillez d'abord saisir une clé API avant de tester." }));
      return;
    }

    setTestStatus((prev) => ({ ...prev, [provider]: "testing" }));
    setTestError((prev) => ({ ...prev, [provider]: "" }));

    try {
      const { ok, data, error } = await safeFetchJson<{ success?: boolean; error?: string }>("/api/chat/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });

      if (ok && data?.success) {
        setTestStatus((prev) => ({ ...prev, [provider]: "success" }));
      } else {
        setTestStatus((prev) => ({ ...prev, [provider]: "failed" }));
        setTestError((prev) => ({ ...prev, [provider]: data?.error || error || "Clé incorrecte ou quota dépassé." }));
      }
    } catch (err: any) {
      setTestStatus((prev) => ({ ...prev, [provider]: "failed" }));
      setTestError((prev) => ({ ...prev, [provider]: "Erreur de communication avec le serveur." }));
    }
  };

  const clearKey = (provider: keyof ApiKeys) => {
    handleKeyChange(provider, "");
    setTestStatus((prev) => ({ ...prev, [provider]: "idle" }));
  };

  return (
    <div id="keys-configuration-view" className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête principal haute visibilité */}
      <div className={`flex flex-col gap-2 border-b pb-5 transition-all duration-300 ${
        isSobre ? (isDark ? "border-zinc-800" : "border-zinc-300") :
        isWarm ? (isDark ? "border-amber-800/40 font-serif" : "border-amber-900/20 font-serif") :
        isCyber ? (isDark ? "border-cyan-500/40 font-mono" : "border-cyan-500/50 font-mono") :
        isFun ? "border-black font-sans" :
        (isDark ? "border-slate-800" : "border-slate-300")
      }`}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className={`text-2xl font-bold flex items-center gap-3 ${
            isSobre ? (isDark ? "text-white font-extrabold" : "text-zinc-950 font-extrabold") :
            isWarm ? (isDark ? "text-[#FDF8F0] font-bold" : "text-amber-950 font-bold") :
            isCyber ? (isDark ? "text-[#00ffcc] font-black" : "text-cyan-950 font-black") :
            isFun ? (isDark ? "text-white font-black" : "text-black font-black") :
            (isDark ? "text-white" : "text-slate-900")
          }`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
              isSobre ? (isDark ? "bg-zinc-800 text-white" : "bg-zinc-900 text-white") :
              isWarm ? (isDark ? "bg-amber-700 text-white" : "bg-amber-900 text-amber-100") :
              isCyber ? (isDark ? "bg-cyan-950 border border-cyan-400 text-[#00ffcc]" : "bg-cyan-600 text-white") :
              isFun ? "bg-pink-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" :
              "bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white"
            }`}>
              <Key className="w-5 h-5" />
            </div>
            Configuration de la Clé API
          </h2>

          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isDark 
                ? "bg-indigo-600/25 hover:bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 hover:border-indigo-400" 
                : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 hover:border-indigo-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Obtenir ma clé Gemini gratuite ↗</span>
          </a>
        </div>

        <p className={`text-sm leading-relaxed ${
          isSobre ? (isDark ? "text-zinc-300" : "text-zinc-700") :
          isWarm ? (isDark ? "text-amber-200" : "text-amber-900") :
          isCyber ? (isDark ? "text-cyan-300" : "text-cyan-900") :
          isFun ? (isDark ? "text-zinc-200 font-semibold" : "text-black font-semibold") :
          (isDark ? "text-slate-300" : "text-slate-700")
        }`}>
          Pour débloquer toutes les fonctionnalités d'analyse personnalisée, de synthèse IA en temps réel et de discussion interactive, renseignez votre clé Google Gemini.
        </p>
      </div>

      {/* Carte principale de configuration de la clé API */}
      <div className="space-y-4">
        {providers.map((p) => {
          const providerId = p.id as keyof ApiKeys;
          const keyValue = keys[providerId] || "";
          const status = testStatus[p.id] || "idle";
          const errorMsg = testError[p.id] || "";

          const cardBgClass = isSobre
            ? isDark
              ? "bg-zinc-900 border-2 border-zinc-700 rounded-2xl p-6 shadow-xl text-zinc-100"
              : "bg-white border-2 border-zinc-300 rounded-2xl p-6 shadow-md text-zinc-900"
            : isWarm
            ? isDark
              ? "bg-[#342A24] border-2 border-amber-800/60 rounded-2xl p-6 shadow-xl font-serif text-[#FDF8F0]"
              : "bg-[#FFFDF9] border-2 border-amber-900/30 rounded-2xl p-6 shadow-md font-serif text-amber-950"
            : isCyber
            ? isDark
              ? "bg-zinc-950 border-2 border-cyan-400 rounded-2xl p-6 shadow-[0_0_25px_rgba(6,182,212,0.15)] font-mono text-[#00ffcc]"
              : "bg-white border-2 border-cyan-600 rounded-2xl p-6 shadow-[0_0_15px_rgba(6,182,212,0.15)] font-mono text-cyan-950"
            : isFun
            ? isDark
              ? "bg-[#252136] border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(236,72,153,1)] text-white"
              : "bg-white border-4 border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black"
            : isDark
            ? "bg-slate-900/90 backdrop-blur-md border-2 border-indigo-500/40 hover:border-indigo-400/60 rounded-2xl p-6 shadow-xl text-slate-100 transition-all"
            : "bg-white border-2 border-indigo-200 hover:border-indigo-400 rounded-2xl p-6 shadow-lg text-slate-900 transition-all";

          return (
            <div key={p.id} id={`card-key-${p.id}`} className={cardBgClass}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10 dark:border-white/10 border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      {p.name}
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Gratuit
                      </span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {p.subtitle}
                    </p>
                  </div>
                </div>

                {/* Badge d'état haute visibilité */}
                <div>
                  {status === "testing" && (
                    <span className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      Test de connexion en cours...
                    </span>
                  )}
                  {status === "success" && (
                    <span className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-emerald-500/25 text-emerald-300 dark:text-emerald-300 border border-emerald-500/50 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Clé valide &amp; opérationnelle
                    </span>
                  )}
                  {status === "failed" && (
                    <span className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-sm">
                      <XCircle className="w-4 h-4 text-rose-400" />
                      Erreur de validation
                    </span>
                  )}
                  {status === "idle" && keyValue && (
                    <span className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                      Clé enregistrée localement
                    </span>
                  )}
                  {!keyValue && status === "idle" && (
                    <span className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      En attente de clé
                    </span>
                  )}
                </div>
              </div>

              <p className={`text-xs my-4 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {p.desc}
              </p>

              {/* Champ de saisie haute lisibilité */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300 dark:text-indigo-300">
                    Saisie de la clé API :
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showKey[p.id] ? "text" : "password"}
                      value={keyValue}
                      onChange={(e) => handleKeyChange(providerId, e.target.value)}
                      placeholder={p.placeholder}
                      className={`w-full rounded-xl py-3 pl-4 pr-24 text-sm font-mono transition-all outline-none shadow-inner ${
                        isDark
                          ? "bg-slate-950 border-2 border-indigo-500/50 focus:border-indigo-400 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20"
                          : "bg-slate-50 border-2 border-indigo-300 focus:border-indigo-600 text-slate-950 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20"
                      }`}
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleShow(p.id)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isDark ? "text-slate-300 hover:text-white hover:bg-slate-800" : "text-slate-600 hover:text-slate-950 hover:bg-slate-200"
                        }`}
                        title={showKey[p.id] ? "Masquer la clé" : "Afficher la clé"}
                      >
                        {showKey[p.id] ? <EyeOff className="w-4 h-4 text-indigo-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                      </button>
                      {keyValue && (
                        <button
                          type="button"
                          onClick={() => clearKey(providerId)}
                          className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                          title="Effacer la clé"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message d'erreur haute visibilité */}
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border-2 border-rose-500/50 flex items-start gap-2.5 text-rose-200 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Barre d'action avec boutons bien contrastés */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                      isDark 
                        ? "bg-slate-800/90 hover:bg-slate-700 text-indigo-300 border-indigo-500/40 hover:text-white" 
                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-300"
                    }`}
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Ouvrir Google AI Studio (Gratuit) ↗</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => testKey(p.id)}
                    disabled={!keyValue || status === "testing"}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer ${
                      !keyValue || status === "testing"
                        ? "bg-slate-700 opacity-50 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-indigo-600/30 hover:shadow-indigo-600/50"
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${status === "testing" ? "animate-spin" : ""}`} />
                    <span>Tester la validité de la clé</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide rapide en 3 étapes pour obtenir la clé */}
      <div className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
        isDark 
          ? "bg-slate-900/60 border-slate-700/80 text-slate-200" 
          : "bg-slate-100/80 border-slate-300 text-slate-800"
      }`}>
        <h4 className="font-bold text-sm flex items-center gap-2 mb-3 text-indigo-400 dark:text-indigo-300">
          <Sparkles className="w-4 h-4" />
          Comment obtenir votre clé gratuite en 30 secondes :
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">1</span>
            <p className="font-semibold">Ouvrez Google AI Studio</p>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Connectez-vous simplement avec n'importe quel compte Google gratuit.
            </p>
          </div>
          <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">2</span>
            <p className="font-semibold">Cliquez sur « Get API key »</p>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Générez une clé en 1 clic (commençant par <code className="text-indigo-400 font-mono">AIzaSy...</code>).
            </p>
          </div>
          <div className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${isDark ? "bg-slate-950/60 border-slate-800" : "bg-white border-slate-200 shadow-xs"}`}>
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">3</span>
            <p className="font-semibold">Collez-la ci-dessus</p>
            <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Collez la clé dans le champ et cliquez sur « Tester la validité ». C'est tout !
            </p>
          </div>
        </div>
      </div>

      {/* Garantie de sécurité & confidentialité */}
      <div className={`p-5 rounded-2xl border-2 flex items-start gap-4 transition-all duration-300 ${
        isDark
          ? "bg-slate-900/80 border-indigo-500/30 text-slate-200"
          : "bg-indigo-50/50 border-indigo-200 text-slate-800"
      }`}>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-emerald-400 dark:text-emerald-300">
            Garantie de Sécurité &amp; Confidentialité Locale
          </h4>
          <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Votre clé API est stockée <strong>uniquement dans votre navigateur local</strong> (<code className="px-1 py-0.5 rounded bg-black/20 font-mono text-indigo-400">localStorage</code>). Elle n'est jamais transmise à des tiers ni sauvegardée sur une base de données distante.
          </p>
        </div>
      </div>
    </div>
  );
}

