import React, { useState } from "react";
import {
  Key,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  X,
  Server
} from "lucide-react";
import { ApiKeys, Provider } from "../types";
import { safeFetchJson } from "../lib/apiHelper";

interface ApiKeyTrousseauModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: ApiKeys;
  onKeysChange: (newKeys: ApiKeys) => void;
  onNotify: (msg: string) => void;
  themeMode?: "light" | "dark";
}

interface ProviderConsoleInfo {
  provider: Provider;
  name: string;
  url: string;
  placeholder: string;
  docText: string;
  pricingNote: string;
  iconText: string;
}

const PROVIDER_CONSOLES: ProviderConsoleInfo[] = [
  {
    provider: "mistral",
    name: "Mistral AI",
    url: "https://console.mistral.ai/",
    placeholder: "mis_...",
    docText: "Console La Plateforme Mistral AI",
    pricingNote: "~0,0002 € / 1k tokens (Souveraineté européenne RGPD)",
    iconText: "🇪🇺"
  },
  {
    provider: "gemini",
    name: "Google Gemini",
    url: "https://aistudio.google.com/app/apikey",
    placeholder: "AIzaSy...",
    docText: "Console Google AI Studio",
    pricingNote: "Palier généreux gratuit puis prix coûtant Google Cloud",
    iconText: "⚡"
  },
  {
    provider: "openai",
    name: "OpenAI (GPT-4o)",
    url: "https://platform.openai.com/api-keys",
    placeholder: "sk-proj-...",
    docText: "Console Développeur OpenAI",
    pricingNote: "Facturation directe au prix coûtant OpenAI",
    iconText: "🧠"
  },
  {
    provider: "anthropic",
    name: "Anthropic (Claude)",
    url: "https://console.anthropic.com/",
    placeholder: "sk-ant-...",
    docText: "Console Anthropic Claude",
    pricingNote: "Facturation directe au prix coûtant Anthropic",
    iconText: "✍️"
  },
  {
    provider: "deepseek",
    name: "DeepSeek",
    url: "https://platform.deepseek.com/",
    placeholder: "sk-...",
    docText: "Console Développeur DeepSeek",
    pricingNote: "Ultra-économique (~0,0001 € / requête)",
    iconText: "🚀"
  },
  {
    provider: "grok",
    name: "xAI (Grok)",
    url: "https://console.x.ai/",
    placeholder: "xai-...",
    docText: "Console Développeur xAI",
    pricingNote: "Facturation directe au prix coûtant xAI",
    iconText: "🛸"
  }
];

export default function ApiKeyTrousseauModal({
  isOpen,
  onClose,
  keys,
  onKeysChange,
  onNotify,
  themeMode = "dark"
}: ApiKeyTrousseauModalProps) {
  const [localKeys, setLocalKeys] = useState<ApiKeys>({ ...keys });
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; msg: string }>>({});

  if (!isOpen) return null;

  const isDark = themeMode === "dark";

  const toggleVisibility = (prov: string) => {
    setVisibleKeys((prev) => ({ ...prev, [prov]: !prev[prov] }));
  };

  const handleKeyChange = (provider: Provider, val: string) => {
    const updated = { ...localKeys, [provider]: val.trim() };
    setLocalKeys(updated);
    setTestResults((prev) => {
      const copy = { ...prev };
      delete copy[provider];
      return copy;
    });
  };

  const handleSaveAll = () => {
    onKeysChange(localKeys);
    localStorage.setItem("infoperso_api_keys", JSON.stringify(localKeys));
    onNotify("🔑 Trousseau de clés API enregistré avec succès dans votre espace souverain !");
    onClose();
  };

  const testKey = async (providerInfo: ProviderConsoleInfo) => {
    const prov = providerInfo.provider;
    const keyVal = (localKeys as any)[prov] || "";
    if (!keyVal) {
      setTestResults((prev) => ({
        ...prev,
        [prov]: { success: false, msg: "Veuillez d'abord saisir une clé pour ce fournisseur." }
      }));
      return;
    }

    setTestingProvider(prov);
    setTestResults((prev) => {
      const copy = { ...prev };
      delete copy[prov];
      return copy;
    });

    try {
      const { ok, data, error } = await safeFetchJson<{ success?: boolean; error?: string }>("/api/chat/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: prov,
          apiKey: keyVal
        })
      });

      if (ok && data?.success) {
        setTestResults((prev) => ({
          ...prev,
          [prov]: { success: true, msg: "Clé API validée avec succès !" }
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [prov]: { success: false, msg: data?.error || error || "Clé invalide ou refusée par le fournisseur." }
        }));
      }
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [prov]: { success: false, msg: "Erreur de connexion au relais de test." }
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden transition-all ${
          isDark
            ? "bg-slate-900 border-indigo-500/30 text-white shadow-indigo-950/40"
            : "bg-white border-indigo-200 text-slate-900 shadow-xl"
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Key className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2 text-indigo-300">
                Trousseau API & Mode BYOK
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Espace Abonné
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Enregistrez vos clés API personnelles pour bénéficier de requêtes illimitées.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice of At-Cost Billing */}
        <div className="px-4 sm:px-6 pt-4 shrink-0">
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
              isDark ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300" : "bg-emerald-50 border-emerald-300 text-emerald-900"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-relaxed">
              <span className="font-bold block">Principe Éthique : Facturation au prix coûtant direct</span>
              <span>
                Alphabette SASU ne prélève <strong>aucune marge ni commission intermédiaire</strong> sur vos tokens.
                Chaque requête est exécutée directement avec votre clé API personnelle et facturée au prix coûtant
                strict par le fournisseur d'IA de votre choix.
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable list of provider forms */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {PROVIDER_CONSOLES.map((info) => {
            const prov = info.provider;
            const currentVal = (localKeys as any)[prov] || "";
            const isVisible = visibleKeys[prov];
            const isTesting = testingProvider === prov;
            const result = testResults[prov];

            return (
              <div
                key={prov}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                  isDark
                    ? "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    : "bg-slate-50 border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{info.iconText}</span>
                    <span className="text-sm font-bold">{info.name}</span>
                    <span className="text-[11px] text-zinc-400 hidden sm:inline">
                      • {info.pricingNote}
                    </span>
                  </div>

                  {/* Direct clickable console link */}
                  <a
                    href={info.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium shrink-0"
                  >
                    <span>{info.docText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={isVisible ? "text" : "password"}
                      value={currentVal}
                      onChange={(e) => handleKeyChange(prov, e.target.value)}
                      placeholder={info.placeholder}
                      className={`w-full py-2 pl-3 pr-9 rounded-lg text-xs font-mono border focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all ${
                        isDark
                          ? "bg-slate-900 border-zinc-800 text-white placeholder-zinc-600"
                          : "bg-white border-zinc-300 text-slate-900 placeholder-zinc-400"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => toggleVisibility(prov)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => testKey(info)}
                    disabled={isTesting || !currentVal}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-zinc-300 border-zinc-700"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300"
                    }`}
                  >
                    {isTesting ? (
                      <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
                    ) : (
                      <Key className="w-3 h-3 text-indigo-400" />
                    )}
                    <span>Tester</span>
                  </button>
                </div>

                {/* Test Feedback */}
                {result && (
                  <div
                    className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${
                      result.success ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{result.msg}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-indigo-500/20 bg-slate-950/60 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Chiffrement et stockage local sécurisé (zéro revente)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-zinc-300 border-zinc-700"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300"
              }`}
            >
              Annuler
            </button>
            <button
              onClick={handleSaveAll}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Enregistrer le Trousseau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
