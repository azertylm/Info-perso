/**
 * ============================================================================
 * ALPHABETTE - Architecture IA Hybride, Résiliente & Souveraine
 * Éditeur : ALPHABETTE (fondé par Valentin RICHAUD)
 * Hébergement : OVH Cloud (France / Europe - alphabette.fr / alphabette.eu)
 *
 * STRATÉGIE TECHNIQUE D'EXÉCUTION DU MOTEUR IA EN 3 PHASES :
 * 1. Phase 1 (Actuelle - Prototypage & Conception) : Google Gemini API (Google AI Studio)
 * 2. Phase 2 (Production cible - Moteur Local Souverain) : Serveur IA local on-premise
 *    (Ollama / vLLM, modèle open-source Mistral NeMo / Mistral Small, 0€ coût, 0 pistage)
 * 3. Phase 3 (Résilience & Secours Cloud Européen) : Secours transparent et automatique
 *    vers l'API Cloud Mistral (Paris/Europe, https://api.mistral.ai) en cas de panne réseau
 *    locale ou coupure de courant.
 *
 * Design Pattern : Strategy / Provider Pattern avec Orchestrateur Hybride & Fallback Cascade
 * ============================================================================
 */

import { GoogleGenAI } from "@google/genai";

export type AiProviderMode = "gemini" | "hybrid_mistral" | "local" | "mistral";

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
  providerUsed: "local_ollama" | "local_vllm" | "mistral_cloud" | "gemini";
  modelUsed: string;
  latencyMs: number;
  isSovereign: boolean;
  sovereigntyTier: "Local On-Premise" | "Cloud Européen (Mistral)" | "Cloud Prototypage (Gemini)";
  fallbackOccurred: boolean;
  fallbackReason?: string;
  executionChain: Array<{
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
  };
  activeProviderMode: AiProviderMode;
  isConfigured: {
    gemini: boolean;
    mistralCloud: boolean;
    localServer: boolean;
  };
  endpoints: {
    localUrl: string;
    localModel: string;
    mistralCloudModel: string;
    geminiDefaultModel: string;
  };
  localHealth: {
    online: boolean;
    latencyMs?: number;
    detectedEngine?: "ollama" | "vllm" | "offline";
    details?: string;
  };
}

// -----------------------------------------------------------------------------
// Strategy Interface
// -----------------------------------------------------------------------------
interface AiStrategy {
  readonly name: string;
  readonly isSovereign: boolean;
  execute(prompt: string, options: AskAiOptions): Promise<{
    content: string;
    model: string;
    provider: "local_ollama" | "local_vllm" | "mistral_cloud" | "gemini";
  }>;
}

// -----------------------------------------------------------------------------
// Strategy 1: Local Sovereign Server (Ollama / vLLM on-premise)
// -----------------------------------------------------------------------------
class LocalAiStrategy implements AiStrategy {
  readonly name = "Local Sovereign Engine";
  readonly isSovereign = true;

  private get localUrl(): string {
    return (process.env.LOCAL_AI_URL || "http://localhost:11434").replace(/\/+$/, "");
  }

  private get localModel(): string {
    return process.env.LOCAL_AI_MODEL || "mistral-nemo";
  }

  private get timeoutMs(): number {
    const raw = Number(process.env.LOCAL_AI_TIMEOUT_MS);
    return !isNaN(raw) && raw > 0 ? raw : 3500; // Default 3.5 seconds
  }

  async execute(prompt: string, options: AskAiOptions) {
    const messages: ChatMessage[] = [];
    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    if (options.messages && options.messages.length > 0) {
      for (const m of options.messages) {
        if (m.role !== "system" || !options.systemInstruction) {
          messages.push(m);
        }
      }
    } else {
      messages.push({ role: "user", content: prompt });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      // 1. First attempt OpenAI-compatible endpoint (standard in vLLM and modern Ollama /v1)
      const vllmUrl = `${this.localUrl}/v1/chat/completions`;
      try {
        const vllmRes = await fetch(vllmUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer local"
          },
          body: JSON.stringify({
            model: this.localModel,
            messages,
            temperature: options.temperature ?? 0.2,
            max_tokens: options.maxTokens ?? 2048,
            response_format: options.responseFormat === "json" ? { type: "json_object" } : undefined
          }),
          signal: controller.signal
        });

        if (vllmRes.ok) {
          clearTimeout(timeoutId);
          const data = await vllmRes.json();
          const content = data.choices?.[0]?.message?.content || "";
          if (content) {
            return {
              content: content.trim(),
              model: this.localModel,
              provider: "local_vllm" as const
            };
          }
        }
      } catch (e: any) {
        // Fall through to Ollama native API if /v1/chat/completions is not mounted
        if (e.name === "AbortError") throw e;
      }

      // 2. Attempt Ollama native chat endpoint: /api/chat
      const ollamaChatUrl = `${this.localUrl}/api/chat`;
      const ollamaRes = await fetch(ollamaChatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: this.localModel,
          messages,
          stream: false,
          format: options.responseFormat === "json" ? "json" : undefined,
          options: {
            temperature: options.temperature ?? 0.2
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!ollamaRes.ok) {
        throw new Error(`Local Ollama error HTTP ${ollamaRes.status}: ${ollamaRes.statusText}`);
      }

      const data = await ollamaRes.json();
      const content = data.message?.content || "";
      if (!content) {
        throw new Error("Local Ollama returned an empty message payload.");
      }

      return {
        content: content.trim(),
        model: this.localModel,
        provider: "local_ollama" as const
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === "AbortError" || err.message?.includes("aborted");
      const msg = isTimeout
        ? `Timeout local dépassé (${this.timeoutMs}ms)`
        : (err.message || "Serveur local indisponible (ECONNREFUSED/500)");
      throw new Error(`[Sovereign Local Engine Offline] ${msg}`);
    }
  }

  async checkHealth(): Promise<{ online: boolean; latencyMs?: number; detectedEngine?: "ollama" | "vllm" | "offline"; details?: string }> {
    const start = Date.now();
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 1200);

      // Check Ollama tags first
      const res = await fetch(`${this.localUrl}/api/tags`, {
        signal: controller.signal
      }).catch(() => null);

      if (res && res.ok) {
        clearTimeout(tid);
        return {
          online: true,
          latencyMs: Date.now() - start,
          detectedEngine: "ollama",
          details: `Connecté à Ollama local (${this.localModel})`
        };
      }

      // Check vLLM /v1/models
      const vllmCheck = await fetch(`${this.localUrl}/v1/models`, {
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(tid);

      if (vllmCheck && vllmCheck.ok) {
        return {
          online: true,
          latencyMs: Date.now() - start,
          detectedEngine: "vllm",
          details: `Connecté à vLLM local (${this.localModel})`
        };
      }

      return {
        online: false,
        detectedEngine: "offline",
        details: `Aucune réponse de ${this.localUrl}`
      };
    } catch (e: any) {
      return {
        online: false,
        detectedEngine: "offline",
        details: e.message || "Inaccessible"
      };
    }
  }
}

// -----------------------------------------------------------------------------
// Strategy 2: Mistral Cloud EU Strategy (Official Sovereign European Cloud API)
// -----------------------------------------------------------------------------
class MistralCloudStrategy implements AiStrategy {
  readonly name = "Mistral Cloud EU";
  readonly isSovereign = true;

  private get apiKey(): string {
    return process.env.MISTRAL_API_KEY || "";
  }

  private get model(): string {
    return process.env.MISTRAL_CLOUD_MODEL || "mistral-small-latest";
  }

  async execute(prompt: string, options: AskAiOptions) {
    const effectiveKey = options.apiKeyOverride || this.apiKey;
    if (!effectiveKey) {
      throw new Error("Clé MISTRAL_API_KEY manquante sur le serveur ou dans la requête.");
    }

    const messages: ChatMessage[] = [];
    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    if (options.messages && options.messages.length > 0) {
      for (const m of options.messages) {
        if (m.role !== "system" || !options.systemInstruction) {
          messages.push(m);
        }
      }
    } else {
      messages.push({ role: "user", content: prompt });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${effectiveKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options.temperature ?? 0.2,
          max_tokens: options.maxTokens ?? 2048,
          response_format: options.responseFormat === "json" ? { type: "json_object" } : undefined
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Mistral API HTTP ${response.status}: ${errText || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";
      if (!content) {
        throw new Error("Mistral API a renvoyé une réponse vide.");
      }

      return {
        content: content.trim(),
        model: this.model,
        provider: "mistral_cloud" as const
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      throw new Error(`[Mistral Cloud EU Error] ${err.message || err}`);
    }
  }
}

// Helper for retrying transient errors like 503 (high demand spikes) and 429 (rate limits)
async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: any) {
      const errMsg = String(err?.message || err || "");
      const isTransient =
        errMsg.includes("503") ||
        errMsg.includes("UNAVAILABLE") ||
        errMsg.includes("high demand") ||
        errMsg.includes("Spikes in demand") ||
        errMsg.includes("429") ||
        errMsg.includes("RESOURCE_EXHAUSTED");

      if (isTransient && attempt < maxRetries) {
        attempt++;
        const backoffMs = 700 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 400);
        console.warn(`[Gemini Resilient Retry] Code 503/429 detected (tentative ${attempt}/${maxRetries}), pause de ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }
      throw err;
    }
  }
}

// -----------------------------------------------------------------------------
// Strategy 3: Google Gemini API Strategy (Phase 1 Prototypage / Fallback de sécurité)
// -----------------------------------------------------------------------------
class GeminiStrategy implements AiStrategy {
  readonly name = "Google Gemini (Prototypage)";
  readonly isSovereign = false;

  private resolveGeminiModel(requested?: string): string {
    if (!requested) return "gemini-3.8-flash";
    const l = requested.toLowerCase();
    if (l.includes("3.8")) return "gemini-3.8-flash";
    if (l.includes("lite") || l.includes("flash-lite")) return "gemini-3.1-flash-lite";
    if (l.includes("latest") || l.includes("flash-latest")) return "gemini-flash-latest";
    if (l.includes("pro")) return "gemini-3.1-pro-preview";
    if (l.includes("flash")) return "gemini-3.8-flash";
    return "gemini-3.8-flash";
  }

  async execute(prompt: string, options: AskAiOptions) {
    const key = options.apiKeyOverride || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Aucune clé GEMINI_API_KEY n'est configurée sur le serveur.");
    }

    const ai = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: { "User-Agent": "aistudio-alphabette-sovereign" }
      }
    });

    const systemInstruction = options.systemInstruction;
    let contents: any[] = [];

    if (options.messages && options.messages.length > 0) {
      contents = options.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));
    } else {
      contents = [{ role: "user", parts: [{ text: prompt }] }];
    }

    // Official active models ordered by priority with resilience against spikes in demand
    const requestedModel = this.resolveGeminiModel(options.messages?.[0]?.content?.includes("model:") ? undefined : undefined);
    const rawFallbackSequence = [
      requestedModel,
      "gemini-3.8-flash",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest",
      "gemini-3.1-pro-preview"
    ];
    const fallbackSequence = Array.from(new Set(rawFallbackSequence));

    let lastError: any = null;
    let result: any = null;
    let usedModel = "gemini-3.8-flash";

    for (const currentModel of fallbackSequence) {
      try {
        const config: any = {
          systemInstruction,
          temperature: options.temperature ?? 0.2,
          safetySettings: [
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" }
          ]
        };

        if (options.responseFormat === "json") {
          config.responseMimeType = "application/json";
        }

        if (options.enableSearch) {
          config.tools = [{ googleSearch: {} }];
        }

        // Use exponential backoff retry for transient 503/429 demand spikes
        result = await callGeminiWithRetry(() =>
          ai.models.generateContent({
            model: currentModel,
            contents,
            config
          })
        );

        if (result && result.text) {
          usedModel = currentModel;
          break;
        }
      } catch (err: any) {
        lastError = err;
        // If search tool failed or had tool errors, retry immediately without search tool on this model
        if (options.enableSearch) {
          try {
            result = await callGeminiWithRetry(() =>
              ai.models.generateContent({
                model: currentModel,
                contents,
                config: {
                  systemInstruction,
                  temperature: options.temperature ?? 0.2,
                  responseMimeType: options.responseFormat === "json" ? "application/json" : undefined
                }
              })
            );
            if (result && result.text) {
              usedModel = currentModel;
              break;
            }
          } catch (retryErr) {
            lastError = retryErr;
          }
        }
      }
    }

    if (!result || !result.text) {
      throw new Error(`[Gemini Engine Failure] ${lastError?.message || "Toutes les instances Gemini ont échoué suite à une saturation temporaire."}`);
    }

    return {
      content: result.text.trim(),
      model: usedModel,
      provider: "gemini" as const
    };
  }
}

// -----------------------------------------------------------------------------
// Orchestrator Service: Strategy Pattern with Automatic Fallback
// -----------------------------------------------------------------------------
export class AiServiceRouter {
  private localStrategy = new LocalAiStrategy();
  private mistralStrategy = new MistralCloudStrategy();
  private geminiStrategy = new GeminiStrategy();

  /**
   * Determine active mode from environment or runtime override
   */
  getActiveProviderMode(override?: AiProviderMode): AiProviderMode {
    if (override && ["gemini", "hybrid_mistral", "local", "mistral"].includes(override)) {
      return override;
    }
    const envVal = (process.env.AI_PROVIDER || "gemini").toLowerCase().trim() as AiProviderMode;
    if (["gemini", "hybrid_mistral", "local", "mistral"].includes(envVal)) {
      return envVal;
    }
    return "gemini";
  }

  /**
   * Core unified execution method: askAI
   */
  async askAI(prompt: string, options: AskAiOptions = {}): Promise<AiExecutionResult> {
    const startTime = Date.now();
    const mode = this.getActiveProviderMode(options.providerOverride);
    const executionChain: AiExecutionResult["executionChain"] = [];

    // SCENARIO A: Direct Gemini requested (Phase 1 Prototypage)
    if (mode === "gemini") {
      try {
        const res = await this.geminiStrategy.execute(prompt, options);
        const duration = Date.now() - startTime;
        executionChain.push({ target: "Google Gemini", status: "success", latencyMs: duration });

        return {
          content: res.content,
          providerUsed: "gemini",
          modelUsed: res.model,
          latencyMs: duration,
          isSovereign: false,
          sovereigntyTier: "Cloud Prototypage (Gemini)",
          fallbackOccurred: false,
          executionChain
        };
      } catch (geminiErr: any) {
        executionChain.push({
          target: "Google Gemini",
          status: "failed",
          latencyMs: Date.now() - startTime,
          error: geminiErr.message
        });

        // If Gemini failed but Mistral is available, attempt emergency rescue
        if (process.env.MISTRAL_API_KEY) {
          try {
            const mistralRescueStart = Date.now();
            const rescueRes = await this.mistralStrategy.execute(prompt, options);
            const rescueDuration = Date.now() - mistralRescueStart;
            executionChain.push({ target: "Mistral Cloud EU (Secours)", status: "success", latencyMs: rescueDuration });

            return {
              content: rescueRes.content,
              providerUsed: "mistral_cloud",
              modelUsed: rescueRes.model,
              latencyMs: Date.now() - startTime,
              isSovereign: true,
              sovereigntyTier: "Cloud Européen (Mistral)",
              fallbackOccurred: true,
              fallbackReason: `Gemini indisponible (${geminiErr.message}), bascule vers Mistral Cloud`,
              executionChain
            };
          } catch {}
        }
        throw geminiErr;
      }
    }

    // SCENARIO B: Direct Local requested
    if (mode === "local") {
      const localStart = Date.now();
      const res = await this.localStrategy.execute(prompt, options);
      const duration = Date.now() - localStart;
      executionChain.push({ target: "Local Sovereign Engine", status: "success", latencyMs: duration });

      return {
        content: res.content,
        providerUsed: res.provider,
        modelUsed: res.model,
        latencyMs: duration,
        isSovereign: true,
        sovereigntyTier: "Local On-Premise",
        fallbackOccurred: false,
        executionChain
      };
    }

    // SCENARIO C: Direct Mistral Cloud requested
    if (mode === "mistral") {
      const mistralStart = Date.now();
      const res = await this.mistralStrategy.execute(prompt, options);
      const duration = Date.now() - mistralStart;
      executionChain.push({ target: "Mistral Cloud EU", status: "success", latencyMs: duration });

      return {
        content: res.content,
        providerUsed: "mistral_cloud",
        modelUsed: res.model,
        latencyMs: duration,
        isSovereign: true,
        sovereigntyTier: "Cloud Européen (Mistral)",
        fallbackOccurred: false,
        executionChain
      };
    }

    // SCENARIO D: HYBRID MISTRAL (Phase 2 & 3 - Production Cible)
    // 1. First attempt Local Sovereign Engine with fast timeout (3.5s)
    let localError: any = null;
    try {
      const localStart = Date.now();
      const res = await this.localStrategy.execute(prompt, options);
      const duration = Date.now() - localStart;
      executionChain.push({ target: "Local Sovereign Engine (Ollama/vLLM)", status: "success", latencyMs: duration });

      return {
        content: res.content,
        providerUsed: res.provider,
        modelUsed: res.model,
        latencyMs: duration,
        isSovereign: true,
        sovereigntyTier: "Local On-Premise",
        fallbackOccurred: false,
        executionChain
      };
    } catch (err: any) {
      localError = err;
      executionChain.push({
        target: "Local Sovereign Engine (Ollama/vLLM)",
        status: "fallback",
        latencyMs: Date.now() - startTime,
        error: err.message
      });
      console.warn(`[Alphabette AI Router] Le moteur local n'a pas répondu (${err.message}). Bascule automatique transparente vers Mistral Cloud EU...`);
    }

    // 2. Fallback to Mistral Cloud EU (Phase 3 Secours)
    try {
      const mistralStart = Date.now();
      const res = await this.mistralStrategy.execute(prompt, options);
      const mistralDuration = Date.now() - mistralStart;
      executionChain.push({ target: "Mistral Cloud EU (Secours Souverain)", status: "success", latencyMs: mistralDuration });

      return {
        content: res.content,
        providerUsed: "mistral_cloud",
        modelUsed: res.model,
        latencyMs: Date.now() - startTime,
        isSovereign: true,
        sovereigntyTier: "Cloud Européen (Mistral)",
        fallbackOccurred: true,
        fallbackReason: `Serveur local hors-ligne ou délai dépassé : ${localError?.message || "Non joignable"}`,
        executionChain
      };
    } catch (mistralErr: any) {
      executionChain.push({
        target: "Mistral Cloud EU (Secours Souverain)",
        status: "failed",
        latencyMs: Date.now() - startTime,
        error: mistralErr.message
      });
      console.warn(`[Alphabette AI Router] Mistral Cloud a également échoué (${mistralErr.message}). Bascule ultime de secours vers Gemini...`);
    }

    // 3. Ultimate Fallback to Gemini (Ensure 100% application uptime)
    const geminiStart = Date.now();
    const geminiRes = await this.geminiStrategy.execute(prompt, options);
    const geminiDuration = Date.now() - geminiStart;
    executionChain.push({ target: "Google Gemini (Filet de Sécurité)", status: "success", latencyMs: geminiDuration });

    return {
      content: geminiRes.content,
      providerUsed: "gemini",
      modelUsed: geminiRes.model,
      latencyMs: Date.now() - startTime,
      isSovereign: false,
      sovereigntyTier: "Cloud Prototypage (Gemini)",
      fallbackOccurred: true,
      fallbackReason: `Moteur local et Mistral Cloud indisponibles. Rebascule de secours temporaire.`,
      executionChain
    };
  }

  /**
   * Health and Diagnostic Status for UI
   */
  async getStatus(): Promise<AiSystemStatus> {
    const localHealth = await this.localStrategy.checkHealth();

    return {
      ecosystem: {
        publisher: "ALPHABETTE",
        founder: "Valentin RICHAUD",
        domains: ["alphabette.fr", "alphabette.eu"],
        hosting: "OVH Cloud (France / Europe - Infrastructure Souveraine)",
        dataEthics: "0 pistage publicitaire, 0 revente de données personnelles, conformité RGPD stricte"
      },
      activeProviderMode: this.getActiveProviderMode(),
      isConfigured: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        mistralCloud: Boolean(process.env.MISTRAL_API_KEY),
        localServer: localHealth.online
      },
      endpoints: {
        localUrl: process.env.LOCAL_AI_URL || "http://localhost:11434",
        localModel: process.env.LOCAL_AI_MODEL || "mistral-nemo",
        mistralCloudModel: process.env.MISTRAL_CLOUD_MODEL || "mistral-small-latest",
        geminiDefaultModel: "gemini-3.8-flash"
      },
      localHealth
    };
  }
}

export const aiService = new AiServiceRouter();
