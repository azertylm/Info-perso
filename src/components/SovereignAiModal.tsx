import React, { useState, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  Server,
  Cloud,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Lock,
  ArrowRight,
  ExternalLink,
  X,
  Play,
  Clock,
  Layers
} from "lucide-react";
import {
  AiProviderMode,
  AiSystemStatus,
  AiExecutionResult,
  fetchAiStatus,
  getStoredAiProvider,
  setStoredAiProvider,
  askAI
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
  const [status, setStatus] = useState<AiSystemStatus | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AiProviderMode>(getStoredAiProvider());
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [testResult, setTestResult] = useState<AiExecutionResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const loadStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const data = await fetchAiStatus();
      setStatus(data);
    } catch (e: any) {
      console.warn("Status error:", e);
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
        gemini: "Mode Phase 1 activé : Google Gemini (Prototypage)",
        hybrid_mistral: "Mode Cible activé : Hybride Souverain (Local Ollama/vLLM + Secours Mistral Cloud EU)",
        local: "Mode 100% Local On-Premise activé",
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
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-start justify-between gap-3 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                  Architecture IA Hybride & Souveraine
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
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[calc(85vh-140px)] overflow-y-auto text-xs sm:text-sm">
          {/* Stratégie en 3 phases */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Stratégie d'exécution en 3 phases
              </span>
              <button
                onClick={loadStatus}
                disabled={isLoadingStatus}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingStatus ? "animate-spin" : ""}`} />
                Actualiser état
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {/* Phase 1 */}
              <div
                onClick={() => handleSelectProvider("gemini")}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                  selectedProvider === "gemini"
                    ? "bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/40"
                    : isDark
                    ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Phase 1 • Actuelle
                  </span>
                  {selectedProvider === "gemini" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </div>
                <div className="font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-amber-400" />
                  Google Gemini
                </div>
                <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                  Prototypage & Conception rapide via Google AI Studio pour valider l'UX et la logique métier.
                </p>
                <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Actif par défaut en dev
                </div>
              </div>

              {/* Phase 2 & 3: Hybride Souverain */}
              <div
                onClick={() => handleSelectProvider("hybrid_mistral")}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative md:col-span-2 ${
                  selectedProvider === "hybrid_mistral"
                    ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40"
                    : isDark
                    ? "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Phase 2 & 3 • Production Cible
                  </span>
                  {selectedProvider === "hybrid_mistral" && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
                <div className="font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  Hybride Résilient : Local + Secours Mistral Cloud EU
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-[11px]">
                    <div className="font-semibold text-emerald-300 flex items-center gap-1">
                      <Server className="w-3 h-3" />
                      1. Priorité Locale
                    </div>
                    <p className="text-zinc-400 mt-0.5">
                      Serveur on-premise (Ollama/vLLM, Mistral NeMo). Coût d'inférence 0€, 100% privé.
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-zinc-800 text-[11px]">
                    <div className="font-semibold text-cyan-300 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      2. Secours Transparent
                    </div>
                    <p className="text-zinc-400 mt-0.5">
                      Bascule auto vers Mistral Cloud (Paris) si timeout 3.5s ou panne réseau locale.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* État matériel en direct */}
          <div className="p-3 sm:p-4 rounded-xl border border-zinc-800 bg-black/40 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Server className="w-4 h-4 text-cyan-400" />
              Sonde de disponibilité des moteurs
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              {/* Local */}
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-300">Serveur Local</span>
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
                  <span className="font-semibold text-zinc-300">Mistral Cloud EU</span>
                  <span className={`w-2 h-2 rounded-full ${status?.isConfigured?.mistralCloud ? "bg-emerald-400" : "bg-amber-400"}`} />
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {status?.isConfigured?.mistralCloud ? "Clé API active" : "Optionnel (Secours)"}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Hébergé en France (Paris)
                </div>
              </div>

              {/* Gemini */}
              <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-zinc-300">Google Gemini</span>
                  <span className={`w-2 h-2 rounded-full ${status?.isConfigured?.gemini ? "bg-emerald-400" : "bg-rose-400"}`} />
                </div>
                <div className="text-[11px] text-zinc-400 font-mono">
                  {status?.isConfigured?.gemini ? "Connecté (AI Studio)" : "Non injecté"}
                </div>
                <div className="text-[10px] text-zinc-500 mt-0.5">
                  Phase 1 Conception
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
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Test en cours...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Lancer un prompt test</span>
                  </>
                )}
              </button>
            </div>

            {testError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div>
                  <strong>Erreur lors du test :</strong> {testError}
                </div>
              </div>
            )}

            {testResult && (
              <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-200">Moteur ayant répondu :</span>
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {testResult.modelUsed}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-400 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {testResult.latencyMs} ms
                    </span>
                    <span className={`flex items-center gap-1 ${testResult.isSovereign ? "text-emerald-400" : "text-amber-400"}`}>
                      <Shield className="w-3 h-3" />
                      {testResult.sovereigntyTier}
                    </span>
                  </div>
                </div>

                {testResult.fallbackOccurred && (
                  <div className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                    ⚠️ <strong>Bascule transparente effectuée :</strong> {testResult.fallbackReason}
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-black/50 text-zinc-300 font-mono text-[11px] leading-relaxed">
                  "{testResult.content}"
                </div>

                {testResult.executionChain && testResult.executionChain.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                      Détail de la cascade :
                    </span>
                    <div className="space-y-1">
                      {testResult.executionChain.map((step, idx) => (
                        <div
                          key={`step-${idx}`}
                          className="text-[10px] font-mono flex items-center justify-between px-2 py-1 rounded bg-zinc-950 border border-zinc-850"
                        >
                          <span className="text-zinc-300">{step.target}</span>
                          <span
                            className={
                              step.status === "success"
                                ? "text-emerald-400"
                                : step.status === "fallback"
                                ? "text-amber-400"
                                : "text-rose-400"
                            }
                          >
                            {step.status.toUpperCase()} ({step.latencyMs}ms)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Engagement Éthique ALPHABETTE */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-200">
              <Lock className="w-4 h-4 text-emerald-400" />
              Charte Éthique & Souveraine ALPHABETTE
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Toutes les applications de la suite ALPHABETTE sont garanties <strong>sans pistage publicitaire</strong>,
              sans revente de données personnelles à des tiers, et hébergées sur l'infrastructure européenne <strong>OVH</strong>.
              Le passage au moteur local souverain garantit une confidentialité totale de vos requêtes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="text-[11px] text-zinc-500">
            Fournisseur actif : <strong className="text-zinc-300">{selectedProvider}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
