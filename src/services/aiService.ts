/**
 * ============================================================================
 * ALPHABETTE - Client AI Service Abstraction (Exclusivité Mistral AI)
 * Éditeur : ALPHABETTE SASU (fondé par Valentin RICHAUD)
 * Rôle : Couche d'abstraction unifiée pour les composants de l'application
 * Conformité : Hébergement France / Europe, RGPD strict, zéro revente de données.
 * ============================================================================
 */

export type AiProviderMode = "hybrid_mistral" | "local" | "mistral";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AskAiOptions {
  systemInstruction?: string;
  messages?: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: "text" | "json";
  providerOverride?: AiProviderMode;
  enableSearch?: boolean;
  apiKeyOverride?: string;
}

export interface AiExecutionResult {
  content: string;
  providerUsed: "local_ollama" | "local_vllm" | "mistral_cloud" | "sovereign_synthesizer";
  modelUsed: string;
  latencyMs: number;
  isSovereign: boolean;
  sovereigntyTier: "Local On-Premise (Metal/Mac)" | "Cloud Européen (Mistral)" | "Moteur Résilient Autonome";
  fallbackOccurred: boolean;
  fallbackReason?: string;
  executionChain?: Array<{
    target: string;
    status: "success" | "fallback" | "failed";
    latencyMs: number;
    error?: string;
  }>;
}

export interface AiSystemStatus {
  ecosystem: {
    publisher: string;
    founder: string;
    domains: string[];
    hosting: string;
    dataEthics: string;
    exclusiveProvider: string;
  };
  activeProviderMode: AiProviderMode;
  isConfigured: {
    mistralCloud: boolean;
    localServer: boolean;
    byokSupported: boolean;
  };
  endpoints: {
    localUrl: string;
    localModel: string;
    mistralCloudModel: string;
  };
  localHealth: {
    online: boolean;
    latencyMs?: number;
    detectedEngine?: "ollama" | "vllm" | "offline";
    details?: string;
  };
}

const RUNTIME_PROVIDER_KEY = "alphabette_runtime_ai_provider";

/**
 * Get client-side preferred provider override (stored in localStorage)
 */
export function getStoredAiProvider(): AiProviderMode {
  try {
    const saved = localStorage.getItem(RUNTIME_PROVIDER_KEY) as AiProviderMode;
    if (["hybrid_mistral", "local", "mistral"].includes(saved)) {
      return saved;
    }
  } catch {}
  return "hybrid_mistral";
}

/**
 * Set client-side preferred provider override
 */
export function setStoredAiProvider(provider: AiProviderMode): void {
  try {
    localStorage.setItem(RUNTIME_PROVIDER_KEY, provider);
  } catch {}
}

/**
 * Retrieve user's BYOK Mistral API key from local storage if available
 */
export function getStoredMistralKey(): string {
  try {
    // 1. Direct key
    const direct = localStorage.getItem("alphabette_mistral_api_key");
    if (direct) return direct.trim();

    // 2. infoperso_keys object
    const rawKeys = localStorage.getItem("infoperso_keys");
    if (rawKeys) {
      const parsed = JSON.parse(rawKeys);
      if (parsed.mistral) return String(parsed.mistral).trim();
    }
  } catch {}
  return "";
}

/**
 * Unified Client API: askAI
 * Le code métier appelle cette fonction unifiée sans dépendre d'un fournisseur tiers.
 */
export async function askAI(prompt: string, options: AskAiOptions = {}): Promise<AiExecutionResult> {
  const providerOverride = options.providerOverride || getStoredAiProvider();
  const apiKeyOverride = options.apiKeyOverride || getStoredMistralKey();

  const response = await fetch("/api/ai/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt,
      ...options,
      apiKeyOverride: apiKeyOverride || undefined,
      providerOverride
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `Erreur serveur IA (HTTP ${response.status})`);
  }

  const result: AiExecutionResult = await response.json();
  return result;
}

/**
 * Unified Client API for conversational chat
 */
export async function chatAI(messages: ChatMessage[], options: Omit<AskAiOptions, "messages"> = {}): Promise<AiExecutionResult> {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
  return askAI(lastUserMsg, {
    ...options,
    messages
  });
}

/**
 * Fetch live system status of the AI ecosystem
 */
export async function fetchAiStatus(): Promise<AiSystemStatus> {
  const res = await fetch("/api/ai/status");
  if (!res.ok) {
    throw new Error(`Impossible de vérifier l'état du moteur IA (${res.status})`);
  }
  return res.json();
}
