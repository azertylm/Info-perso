import React, { useState } from "react";
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  Server,
  Gift,
  Clock,
  Layers,
  Cpu
} from "lucide-react";
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
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [testError, setTestError] = useState("");

  // Code Privilège / Invitation en temps réel
  const [inviteCode, setInviteCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  // État de l'essai 7 jours
  const [trialDaysLeft] = useState<number>(() => {
    const trialStarted = localStorage.getItem("alphabette_trial_started_at");
    if (!trialStarted) return 7;
    const elapsedDays = Math.floor((Date.now() - Number(trialStarted)) / (1000 * 60 * 60 * 24));
    return Math.max(0, 7 - elapsedDays);
  });

  const isSobre = displayMode === "sobre";
  const isWarm = displayMode === "warm";
  const isCyber = displayMode === "cyber";
  const isFun = displayMode === "fun";
  const isDark = themeMode === "dark";

  const mistralKey = keys.mistral || "";

  const handleKeyChange = (val: string) => {
    onKeysChange({ ...keys, mistral: val.trim() });
    setTestStatus("idle");
    setTestError("");
  };

  const testMistralKey = async () => {
    if (!mistralKey) {
      setTestStatus("failed");
      setTestError("Veuillez renseigner votre clé API Mistral AI avant de tester.");
      return;
    }

    setTestStatus("testing");
    setTestError("");

    try {
      const { ok, data, error } = await safeFetchJson<{ success?: boolean; error?: string }>("/api/chat/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "mistral",
          apiKey: mistralKey,
          model: "mistral-small-latest"
        })
      });

      if (ok && data?.success) {
        setTestStatus("success");
      } else {
        setTestStatus("failed");
        setTestError(data?.error || error || "Clé Mistral API invalide ou quota épuisé.");
      }
    } catch (err: any) {
      setTestStatus("failed");
      setTestError("Erreur de communication avec le serveur.");
    }
  };

  const clearKey = () => {
    handleKeyChange("");
    setTestStatus("idle");
  };

  const handleVerifyPrivilegeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || codeLoading) return;

    setCodeLoading(true);
    setCodeSuccess(null);
    setCodeError(null);

    try {
      const userEmail = localStorage.getItem("infoperso_user_email") || "";
      const { ok, data, error } = await safeFetchJson<{
        success: boolean;
        message?: string;
        error?: string;
        plan?: string;
      }>("/api/alphabette/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim().toUpperCase(), userEmail })
      });

      if (ok && data?.success) {
        setCodeSuccess(data.message || "Code privilège activé avec succès (1 an d'accès offert) !");
        localStorage.setItem("alphabette_user_plan", data.plan || "bundle_integral");
        localStorage.setItem("alphabette_access_code", inviteCode.trim().toUpperCase());
        setInviteCode("");
      } else {
        setCodeError(data?.error || error || "Code invalide ou déjà consommé.");
      }
    } catch {
      setCodeError("Erreur de liaison avec le hub central alphabette.fr.");
    } finally {
      setCodeLoading(false);
    }
  };

  return (
    <div id="keys-configuration-view" className="space-y-6 max-w-4xl mx-auto">
      {/* En-tête principal : Souveraineté & Exclusivité Mistral AI */}
      <div
        className={`flex flex-col gap-2 border-b pb-5 transition-all duration-300 ${
          isSobre
            ? isDark
              ? "border-zinc-800"
              : "border-zinc-300"
            : isWarm
            ? isDark
              ? "border-amber-800/40 font-serif"
              : "border-amber-900/20 font-serif"
            : isCyber
            ? isDark
              ? "border-cyan-500/40 font-mono"
              : "border-cyan-500/50 font-mono"
            : isFun
            ? "border-black font-sans"
            : isDark
            ? "border-slate-800"
            : "border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2
            className={`text-2xl font-bold flex items-center gap-3 ${
              isSobre
                ? isDark
                  ? "text-white font-extrabold"
                  : "text-zinc-950 font-extrabold"
                : isWarm
                ? isDark
                  ? "text-[#FDF8F0] font-bold"
                  : "text-amber-950 font-bold"
                : isCyber
                ? isDark
                  ? "text-[#00ffcc] font-black"
                  : "text-cyan-950 font-black"
                : isFun
                ? isDark
                  ? "text-white font-black"
                  : "text-black font-black"
                : isDark
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md ${
                isSobre
                  ? isDark
                    ? "bg-zinc-800 text-white"
                    : "bg-zinc-900 text-white"
                  : isWarm
                  ? isDark
                    ? "bg-amber-700 text-white"
                    : "bg-amber-900 text-amber-100"
                  : isCyber
                  ? isDark
                    ? "bg-cyan-950 border border-cyan-400 text-[#00ffcc]"
                    : "bg-cyan-600 text-white"
                  : isFun
                  ? "bg-pink-500 text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  : "bg-gradient-to-tr from-amber-600 via-orange-500 to-indigo-600 text-white"
              }`}
            >
              <Key className="w-5 h-5" />
            </div>
            Accès & Clé API Mistral AI (Exclusivité Souveraine)
          </h2>

          <a
            href="https://console.mistral.ai/api-keys/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isDark
                ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30"
                : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Console Mistral AI ↗</span>
          </a>
        </div>

        <p
          className={`text-sm leading-relaxed ${
            isSobre
              ? isDark
                ? "text-zinc-300"
                : "text-zinc-700"
              : isWarm
              ? isDark
                ? "text-amber-200"
                : "text-amber-900"
              : isCyber
              ? isDark
                ? "text-cyan-300"
                : "text-cyan-900"
              : isFun
              ? isDark
                ? "text-zinc-200 font-semibold"
                : "text-black font-semibold"
              : isDark
              ? "text-slate-300"
              : "text-slate-700"
          }`}
        >
          L'application s'appuie <strong>rigoureusement et exclusivement sur les modèles de Mistral AI</strong>.
          Vos données sont hébergées en France et en Europe (RGPD) et{" "}
          <strong>aucune donnée ni invite n'est réutilisée pour l'entraînement public</strong>.
        </p>
      </div>

      {/* 3 Modes d'Accès Hybrides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mode 1: Essai Gratuit 7 Jours */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              1. Essai Gratuit 7j
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {trialDaysLeft > 0 ? `${trialDaysLeft}j restants` : "Expiré"}
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tout nouvel inscrit bénéficie de 7 jours d'accès complet offerts sur la clé Mistral managée par Alphabette.
          </p>
        </div>

        {/* Mode 2: BYOK (Bring Your Own Key) */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              2. Mode BYOK
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              Clé Perso
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Renseignez ci-dessous votre propre clé API Mistral pour consommer directement votre quota personnel.
          </p>
        </div>

        {/* Mode 3: Mode Managé */}
        <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              3. Mode Managé
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              Alphabette
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Consommation Mistral AI administrée et garantie par Alphabette via la Formule Confort ou le Pass Bouquet.
          </p>
        </div>
      </div>

      {/* Saisie de la Clé API Mistral (BYOK) */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-zinc-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              Clé API Mistral AI (Production Cloud & Prototypage Local)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              API Cloud officielle (https://api.mistral.ai/v1) ou Moteur Local (Ollama / Metal sur Mac)
            </p>
          </div>

          <a
            href="https://console.mistral.ai/api-keys/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 font-semibold"
          >
            <span>Créer une clé API Mistral</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="relative">
          <input
            type={showKey ? "text" : "password"}
            value={mistralKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder="Collez votre clé API Mistral (ex: mk-...). Laisser vide pour utiliser le mode managé / essai..."
            className="w-full bg-zinc-950 border border-zinc-750 focus:border-amber-500 rounded-xl px-4 py-2.5 pr-20 text-xs sm:text-sm text-white font-mono placeholder:text-zinc-500 outline-none transition-colors"
          />

          <div className="absolute right-2 top-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors"
              title={showKey ? "Masquer" : "Afficher"}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {mistralKey && (
              <button
                type="button"
                onClick={clearKey}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors"
                title="Supprimer la clé"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={testMistralKey}
              disabled={testStatus === "testing" || !mistralKey}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer shadow-md"
            >
              {testStatus === "testing" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Vérification Mistral en cours...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Tester la connexion Mistral AI</span>
                </>
              )}
            </button>

            {testStatus === "success" && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Connexion Mistral AI établie avec succès
              </span>
            )}

            {testStatus === "failed" && (
              <span className="flex items-center gap-1.5 text-xs text-rose-400 font-bold bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/30">
                <XCircle className="w-4 h-4 text-rose-400" />
                Échec : {testError || "Clé incorrecte"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Stockage local chiffré dans votre navigateur (Zéro fuite)</span>
          </div>
        </div>
      </div>

      {/* Validation des Codes Privilèges / Amis (Usage Unique) */}
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-zinc-100">
              Code Privilège / Invitation (Usage Unique)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            Vérification en temps réel (POST http://alphabette.fr/api/verify-code)
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Si vous possédez un code d'accès offert par Valentin RICHAUD ou un partenaire d'ALPHABETTE SASU, entrez-le
          ci-dessous pour activer 1 an d'accès complet. Le code est à usage unique et sera désactivé sur le hub dès sa
          validation.
        </p>

        <form onSubmit={handleVerifyPrivilegeCode} className="flex gap-2">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Entrez votre code privilège (ex: AMIS-2026, ALPHABETTE, VALENTIN)..."
            className="flex-1 bg-zinc-950 border border-zinc-750 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono uppercase placeholder:normal-case placeholder:text-zinc-500 outline-none"
          />
          <button
            type="submit"
            disabled={!inviteCode.trim() || codeLoading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            {codeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Activer le code
          </button>
        </form>

        {codeSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{codeSuccess}</span>
          </div>
        )}

        {codeError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{codeError}</span>
          </div>
        )}
      </div>

      {/* Pied de page standardisé obligatoire */}
      <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <a
          href="http://alphabette.fr"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-emerald-400 text-zinc-300 font-medium transition-colors flex items-center gap-1.5"
        >
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Découvrir toutes les applications de la suite sur http://alphabette.fr</span>
        </a>
      </div>
    </div>
  );
}
