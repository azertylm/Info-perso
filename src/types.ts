export type Provider = "gemini" | "openai" | "anthropic" | "mistral" | "deepseek" | "kimi";

export interface ModelConfig {
  id: string;
  name: string;
  provider: Provider;
  description: string;
  contextWindow: string;
  strength: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  model?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
  };
  isReasoning?: boolean; // For DeepSeek reasoner
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  provider: Provider;
  model: string;
  updatedAt: string;
}

export interface ApiKeys {
  gemini: string;
  openai: string;
  anthropic: string;
  mistral: string;
  deepseek: string;
  kimi: string;
}

export interface RibInfo {
  bankName: string;
  accountHolder: string;
  iban: string;
  bic: string;
  bankCode: string;
  branchCode: string;
  accountNumber: string;
  ribKey: string;
}

export interface CommunityComment {
  id: string;
  articleId: string;
  authorName: string;
  authorEmail: string;
  authorUid: string;
  content: string;
  createdAt: any;
  likes: number;
}

export interface ActivityLog {
  id: string;
  type: "info" | "success" | "warn" | "community";
  message: string;
  time: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  source: string;
  category: string;
  time: string;
  score: number;
  emoji: string;
  tags: string[];
  summary: string;
  content: string;
  featured: boolean;
  read?: boolean;
  aiSummaryCustom?: string;
  aiSummaryModelUsed?: string;
  originalUrl?: string;
  createdAt?: number;
}

// Full Available Models definition
export const AVAILABLE_MODELS: ModelConfig[] = [
  // Gemini
  {
    id: "gemini-3.5-flash",
    name: "Gemini 3.5 Flash",
    provider: "gemini",
    description: "Le modèle par excellence pour les tâches rapides, la synthèse et le chat courant.",
    contextWindow: "1M tokens",
    strength: "Vitesse et de l'analyse en temps réel",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash-Lite",
    provider: "gemini",
    description: "Un modèle extrêmement rapide et économe pour des résumés instantanés.",
    contextWindow: "1M tokens",
    strength: "Latence minimale et légèreté",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash (Latest)",
    provider: "gemini",
    description: "Le modèle d'actualité standard pour une polyvalence accrue.",
    contextWindow: "1M tokens",
    strength: "Traitement multitâche fluide",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro (Preview)",
    provider: "gemini",
    description: "Le modèle le plus performant pour le raisonnement complexe et l'analyse approfondie.",
    contextWindow: "2M tokens",
    strength: "Raisonnement avancé et précision",
  },
];
