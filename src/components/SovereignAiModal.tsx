import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCw,
  RefreshCw,
  X,
  Layers,
  Cpu,
  Lock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Info
} from "lucide-react";
import {
  AiProviderMode,
  AiExecutionResult,
  AiSystemStatus,
  askAI,
  fetchAiStatus,
  getStoredAiProvider,
  setStoredAiProvider
} from "../services/aiService";

interface SovereignAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string) => void;
  isDark?: boolean;
}

export default function SovereignAiModal({
  isOpen,
  onClose,
  onNotify,
  isDark = true
}: SovereignAiModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<AiProviderMode>(getStoredAiProvider());
  const [status, setStatus] = useState<AiSystemStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  // Diagnostic execution test
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<AiExecutionResult | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await fetchAiStatus();
      setStatus(data);
    } catch {
      // Ignorer si serveur local offline
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      setSelectedProvider(getStoredAiProvider());
      setTestResult(null);
      setTestError(null);
    }
  }, [isOpen]);

  const handleSelectProvider = (mode: AiProviderMode) => {
    setSelectedProvider(mode);
    setStoredAiProvider(mode);
    if (onNotify) {
      const labels: Record<AiProviderMode, string> = {
        hybrid_mistral: "Mode Hybride activé : Local Ollama/Metal sur Mac + Mistral Cloud EU",
        local: "Mode 100% Local On-Premise activé (Ollama / Metal sur Mac)",
        mistral: "Mode Mistral Cloud EU (Paris) activé"
      };
      onNotify(`🛡️ ${labels[mode]}`);
    }
  };

  const handleRunDiagnosticTest = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResult(null);
    try {
      const result = await askAI("Résume en une phrase l'importance d'une IA souveraine et éthique.", {
        temperature: 0.2,
        providerOverride: selectedProvider
      });
      setTestResult(result);
      if (onNotify) {
        onNotify(`✅ Réponse reçue en ${result.latencyMs}ms via ${result.modelUsed} (${result.sovereigntyTier})`);
      }
    } catch (err: any) {
      setTestError(err.message || "Erreur de communication avec le routeur IA");
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div
        className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden my-auto transition-all ${
          isDark
            ? "bg-zinc-950 border-zinc-800 text-zinc-100"
            : "bg-white border-zinc-250 text-zinc-900"
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-start justify-between gap-3 bg-gradient-to-r from-emerald-950/40 via-indigo-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  Architecture IA 100% Souveraine (Mistral AI)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  ALPHABETTE
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Fondé par <strong className="text-zinc-200">Valentin RICHAUD</strong> • Hébergement souverain OVH (alphabette.fr / alphabette.eu)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[calc(85vh-140px)] overflow-y-auto text-xs sm:text-sm">
          {/* Stratégie en 3 modes souverains */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Modes d'exécution souverains Mistral AI
              </span>
              <button
                onClick={loadStatus}
                disabled={isLoadingStatus}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? "animate-spin" : ""}`} />
                Actualiser état
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Mode Hybride */}
              <div
                onClick={() => handleSelectProvider("hybrid_mistral")}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                  selectedProvider === "hybrid_mistral"
                    ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40"
                    : isDark
                    ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Recommandé
                  </span>
                  {selectedProvider === "hybrid_mistral" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  Hybride Résilient
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Tente le serveur local (Ollama/Metal) puis bascule automatiquement sur Mistral Cloud EU avec clé BYOK ou managée.
                </p>
                <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Par défaut (Zéro quota crash)
                </div>
              </div>

              {/* Mode 100% Local */}
              <div
                onClick={() => handleSelectProvider("local")}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                  selectedProvider === "local"
                    ? "bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/40"
                    : isDark
                    ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                    On-Premise
                  </span>
                  {selectedProvider === "local" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </div>
                <div className="font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  Local Ollama / Mac
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Exécution 100% sur votre machine via Ollama ou Metal (modèle mistral-nemo). Zéro coût, 100% privé.
                </p>
                <div className="mt-2 text-[10px] font-mono text-zinc-500">
                  ollama run mistral-nemo
                </div>
              </div>

              {/* Mode Mistral Cloud Direct */}
              <div
                onClick={() => handleSelectProvider("mistral")}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                  selectedProvider === "mistral"
                    ? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40"
                    : isDark
                    ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Paris / UE
                  </span>
                  {selectedProvider === "mistral" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </div>
                <div className="font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Mistral Cloud EU
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  API officielle Mistral AI (France). Modèle mistral-small ou mistral-large avec clé BYOK ou managée.
                </p>
                <div className="mt-2 text-[10px] font-mono text-zinc-500">
                  api.mistral.ai/v1
                </div>
              </div>
            </div>
          </div>

          {/* État matériel en direct */}
          <div className="p-3 sm:p-4 rounded-xl border border-zinc-800 bg-black/40 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-emerald-400" />
              Sonde de disponibilité des moteurs souverains
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {/* Local */}
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-300">Serveur Local (Ollama/Metal)</span>
                  <span className={`w-2 h-2 rounded-full ${status?.localHealth?.online ? "bg-emerald-400" : "bg-zinc-600"}`} />
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {status?.localHealth?.online
                    ? `En ligne (${status.localHealth.latencyMs}ms)`
                    : "En attente de connexion"}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  {status?.endpoints?.localUrl || "http://localhost:11434"}
                </div>
              </div>

              {/* Mistral Cloud */}
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-300">Mistral Cloud EU (Paris)</span>
                  <span className={`w-2 h-2 rounded-full ${status?.isConfigured?.mistralCloud ? "bg-emerald-400" : "bg-amber-400"}`} />
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {status?.isConfigured?.mistralCloud ? "Clé API active" : "Support BYOK & Managé"}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Hébergé en France (Paris) • RGPD Strict
                </div>
              </div>
            </div>
          </div>

          {/* Testeur de routeur IA */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Play className="w-4 h-4 text-emerald-400" />
                Tester la chaîne d'exécution en direct
              </span>
              <button
                onClick={handleRunDiagnosticTest}
                disabled={isTesting}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Inférence en cours...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Lancer test ({selectedProvider})</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {testResult.sovereigntyTier}
                  </span>
                  <span className="font-mono text-zinc-400 text-[11px]">
                    Modèle : {testResult.modelUsed} • {testResult.latencyMs}ms
                  </span>
                </div>
                <p className="text-zinc-200 text-xs italic bg-black/40 p-2.5 rounded-lg border border-zinc-800">
                  « {testResult.content} »
                </p>
              </div>
            )}

            {testError && (
              <div className="p-3 rounded-xl border border-rose-500/40 bg-rose-950/20 flex items-start gap-2 text-xs text-rose-300">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{testError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer avec lien standardisé obligatoire */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <a
            href="http://alphabette.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-emerald-400 text-zinc-300 font-medium transition-colors flex items-center gap-1.5"
          >
            <span>Découvrir toutes les applications de la suite sur http://alphabette.fr</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
