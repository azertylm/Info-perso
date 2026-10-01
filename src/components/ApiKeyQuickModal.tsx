import React, { useState } from "react";
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sparkles,
  Clipboard,
  X,
  Server
} from "lucide-react";
import { ApiKeys } from "../types";
import { safeFetchJson } from "../lib/apiHelper";

interface ApiKeyQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  keys: ApiKeys;
  onKeysChange: (newKeys: ApiKeys) => void;
  onNotify?: (msg: string) => void;
  displayMode?: "sobre" | "pro" | "warm" | "cyber" | "fun";
  themeMode?: "light" | "dark";
}

export default function ApiKeyQuickModal({
  isOpen,
  onClose,
  keys,
  onKeysChange,
  onNotify,
  displayMode = "pro",
  themeMode = "dark"
}: ApiKeyQuickModalProps) {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(keys.mistral || "");
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "failed">("idle");
  const [testError, setTestError] = useState("");

  // Sync temp key when modal opens or keys prop changes
  React.useEffect(() => {
    if (isOpen) {
      setTempKey(keys.mistral || "");
      setTestStatus("idle");
      setTestError("");
    }
  }, [isOpen, keys.mistral]);

  // Handle ESC key to close
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = themeMode === "dark";
  const hasCustomKey = Boolean(keys.mistral && keys.mistral.trim().length > 0);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setTempKey(text.trim());
        setTestStatus("idle");
        setTestError("");
        if (onNotify) onNotify("📋 Clé collée depuis le presse-papier");
      }
    } catch (_err) {
      if (onNotify) onNotify("⚠️ Impossible de lire le presse-papier. Collez manuellement.");
    }
  };

  const handleSave = () => {
    const trimmed = tempKey.trim();
    onKeysChange({ ...keys, mistral: trimmed });
    if (onNotify) {
      if (trimmed) {
        onNotify("✅ Clé Mistral AI enregistrée avec succès !");
      } else {
        onNotify("⚡ Mode Relais de Secours Automatique activé.");
      }
    }
    onClose();
  };

  const handleClear = () => {
    setTempKey("");
    onKeysChange({ ...keys, mistral: "" });
    setTestStatus("idle");
    setTestError("");
    if (onNotify) onNotify("⚡ Clé effacée. Relais de secours automatique réactivé !");
  };

  const handleTest = async () => {
    const keyToTest = tempKey.trim();
    if (!keyToTest) {
      setTestStatus("failed");
      setTestError("Veuillez d'abord saisir ou coller votre clé API Mistral.");
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
          apiKey: keyToTest,
          model: "mistral-small-latest"
        })
      });

      if (ok && data?.success) {
        setTestStatus("success");
        setTestError("");
        if (onNotify) onNotify("✨ Clé Mistral AI validée avec succès par l'API officielle !");
      } else {
        setTestStatus("failed");
        setTestError(data?.error || error || "Clé invalide ou refusée par Mistral AI.");
      }
    } catch (_err: any) {
      setTestStatus("failed");
      setTestError("Erreur réseau lors de la vérification de la clé.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-xl rounded-2xl shadow-2xl border overflow-hidden flex flex-col transition-all max-h-[90vh] ${
          isDark
            ? "bg-zinc-900 border-zinc-750 text-zinc-100"
            : "bg-white border-zinc-200 text-zinc-900"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b ${
            isDark ? "bg-zinc-950/70 border-zinc-800" : "bg-zinc-50 border-zinc-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Key className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                Clé API Mistral & IA Souveraine
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configuration d'accès et moteur de résilience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-colors"
            title="Fermer la boîte (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* STATUT ACTUEL & SOLUTION DE SECOURS IMMÉDIATE */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              hasCustomKey
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200"
                : "bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-200"
            }`}
          >
            {hasCustomKey ? (
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <Zap className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs sm:text-sm">
              <div className="font-bold flex items-center gap-2">
                <span>
                  {hasCustomKey
                    ? "Clé Mistral Personnelle Active (Mode BYOK)"
                    : "⚡ Relais de Secours Automatique Activé"}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase ${
                    hasCustomKey
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                  }`}
                >
                  {hasCustomKey ? "Personnalisé" : "100% Opérationnel"}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {hasCustomKey
                  ? "Vos synthèses et requêtes IA sont envoyées directement avec votre propre quota officiel Mistral AI."
                  : "L'application fonctionne immédiatement sans aucune coupure ! Si vous n'avez pas de clé Mistral, le serveur prend en charge automatiquement la génération des résumés, synthèses et quiz."}
              </p>
            </div>
          </div>

          {/* CHAMP DE SAISIE DE LA CLÉ */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold flex items-center gap-2">
                <span>Votre clé API Mistral AI (Optionnel)</span>
              </label>
              <button
                type="button"
                onClick={handlePaste}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Coller depuis le presse-papier"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span>Coller la clé</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={tempKey}
                onChange={(e) => {
                  setTempKey(e.target.value);
                  setTestStatus("idle");
                  setTestError("");
                }}
                placeholder="Ex: mistral_sk_... ou collez votre clé ici"
                className={`w-full pl-3.5 pr-20 py-2.5 rounded-xl border text-xs sm:text-sm font-mono transition-all outline-none ${
                  isDark
                    ? "bg-zinc-950 border-zinc-700 text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    : "bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                }`}
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded transition-colors"
                  title={showKey ? "Masquer la clé" : "Afficher la clé"}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                {tempKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempKey("");
                      setTestStatus("idle");
                      setTestError("");
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 rounded transition-colors"
                    title="Effacer la saisie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* MESSAGE D'ÉTAT DU TEST */}
            {testStatus === "testing" && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium pt-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Vérification de la clé auprès des serveurs Mistral AI...</span>
              </div>
            )}

            {testStatus === "success" && (
              <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium pt-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Clé API Mistral valide et immédiatement opérationnelle !</span>
              </div>
            )}

            {testStatus === "failed" && (
              <div className="flex items-start gap-2 text-xs text-rose-500 font-medium pt-1">
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{testError || "Clé invalide ou refusée par Mistral AI."}</span>
              </div>
            )}
          </div>

          {/* BOUTONS D'ACTION RAPIDE */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 cursor-pointer transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              <span>{tempKey.trim() ? "Enregistrer cette clé" : "Valider le mode secours"}</span>
            </button>

            <button
              type="button"
              onClick={handleTest}
              disabled={testStatus === "testing" || !tempKey.trim()}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-750 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              {testStatus === "testing" ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              )}
              <span>Tester la clé</span>
            </button>

            {hasCustomKey && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer transition-all"
                title="Supprimer la clé et revenir au relais de secours"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Effacer la clé</span>
              </button>
            )}
          </div>

          {/* GUIDE EXPRESS : OÙ TROUVER MA CLÉ MISTRAL ? */}
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-2 ${
              isDark ? "bg-zinc-950/50 border-zinc-800/80" : "bg-zinc-50 border-zinc-200"
            }`}
          >
            <div className="font-semibold flex items-center justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                Comment obtenir une clé Mistral gratuite ?
              </span>
              <a
                href="https://console.mistral.ai/api-keys/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline inline-flex items-center gap-1"
              >
                console.mistral.ai ↗
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
              <li>Créez un compte ou connectez-vous sur <strong>console.mistral.ai</strong>.</li>
              <li>Allez dans le menu <strong>API Keys</strong> puis cliquez sur <strong>Create new key</strong>.</li>
              <li>Copiez votre clé et collez-la ci-dessus, puis cliquez sur <strong>Enregistrer</strong>.</li>
            </ol>
            <p className="text-[10px] text-zinc-500 italic pt-1 border-t border-zinc-800/50">
              🔒 Sécurité garantie : votre clé reste stockée localement dans votre navigateur (localStorage). Aucune donnée n'est revendue à des tiers.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
            isDark ? "bg-zinc-950/70 border-zinc-800 text-zinc-400" : "bg-zinc-50 border-zinc-200 text-zinc-600"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">Hébergement souverain OVH France • ALPHABETTE SASU</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg font-bold text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
