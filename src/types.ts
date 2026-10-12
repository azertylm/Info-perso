export type Provider = "gemini" | "mistral" | "local" | "openai" | "anthropic" | "deepseek" | "grok" | "kimi";

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
  grok: string;
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

export interface ArticleKeyFigure {
  label: string;
  value: string;
  detail?: string;
}

export interface ArticleStrategicAnalysis {
  actorsInvolved?: string[];
  marketImpact?: string;
  privacyCompliance?: string;
  nextMilestone?: string;
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
  imageUrl?: string;
  read?: boolean;
  aiSummaryCustom?: string;
  aiSummaryModelUsed?: string;
  originalUrl?: string;
  createdAt?: number;
  isCustomGenerated?: boolean;
  isSerendipitous?: boolean;
  isLive?: boolean;
  isNewTop20?: boolean;
  isLatestGeneration?: boolean;
  rawRssLink?: string;

  // Enrichissements informatifs directs
  keyFigures?: ArticleKeyFigure[];
  keyTakeaways?: string[];
  strategicAnalysis?: ArticleStrategicAnalysis;
}

export type DiscoveryMode = "focus" | "balanced" | "serendipity";

export interface NaturalRadarProfile {
  id: string;
  query: string;
  extractedKeywords: string[];
  extractedCategories: string[];
  createdAt: number;
  active: boolean;
}

export interface RssFeedSource {
  id: string;
  title: string;
  url: string;
  category: string;
  icon?: string;
  isActive: boolean;
  itemCount?: number;
  lastFetched?: number;
}

export interface PerspectiveAnalysis {
  factualConsensus: string[];
  economicAngle: string;
  politicalAngle: string;
  societalAngle: string;
  polarizationLevel: "Faible" | "Modéré" | "Élevé";
  controversyPoints: string[];
}

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  badge?: string;
  isMilestone?: boolean;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Types Suite ALPHABETTE Hub & Tarifs Dynamiques
export interface AlphabettePricingItem {
  id: string;
  name: string;
  priceYearly: number;
  currency: string;
  period: string;
  mistralManaged: boolean;
  description: string;
}

export interface AlphabetteSuiteConfig {
  appName: string;
  hubUrl: string;
  pricing: {
    individual: {
      autonomousByok: AlphabettePricingItem;
      comfortManaged: AlphabettePricingItem;
    };
    bundle: {
      bundleByok: AlphabettePricingItem;
      bundleIntegral: AlphabettePricingItem;
    };
  };
  trialDays: number;
  promotions: {
    active: boolean;
    bannerText: string;
    discountPercent: number;
  };
  compliance: {
    rgpd: string;
    privacy: string;
    exclusiveProvider: string;
    localServer: string;
  };
}

// Modèles IA de l'écosystème ALPHABETTE (Palier offert Google Gen AI + BYOK multi-fournisseurs)
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite (Palier Offert Inclus)",
    provider: "gemini",
    description: "Modèle Google Gen AI ultra-rapide de dernière génération pour le palier offert (20 req/j essai, puis 5 req/j). Recherche Google Grounding temps réel incluse.",
    contextWindow: "1M tokens",
    strength: "Actualités en direct, vitesse fulgurante & synthèse",
  },
  {
    id: "mistral-small-latest",
    name: "Mistral Small (Souverain Cloud EU)",
    provider: "mistral",
    description: "Modèle souverain européen rapide & économique. Fonctionne avec votre clé BYOK ou le relais managé.",
    contextWindow: "32k tokens",
    strength: "Souveraineté RGPD, rapidité & esprit critique",
  },
  {
    id: "mistral-large-latest",
    name: "Mistral Large (Cloud EU)",
    provider: "mistral",
    description: "Fleuron de l'IA européenne : raisonnement complexe, esprit critique et précision linguistique optimale.",
    contextWindow: "128k tokens",
    strength: "Raisonnement avancé & synthèse souveraine",
  },
  {
    id: "open-mistral-nemo",
    name: "Mistral NeMo 12B (Cloud EU)",
    provider: "mistral",
    description: "Modèle open-weight développé avec NVIDIA, offrant une excellente efficacité et concision.",
    contextWindow: "128k tokens",
    strength: "Efficacité & polyvalence B2B",
  },
  {
    id: "deepseek-chat",
    name: "DeepSeek V3 (BYOK)",
    provider: "deepseek",
    description: "Modèle ultra-performant à coût minime avec votre propre clé API DeepSeek au prix coûtant.",
    contextWindow: "64k tokens",
    strength: "Économie maximale & pertinence analytique",
  },
  {
    id: "grok-2-latest",
    name: "xAI Grok 2 (BYOK)",
    provider: "grok",
    description: "Modèle Grok par xAI pour un esprit vif, des analyses sans filtre et l'accès direct aux tendances.",
    contextWindow: "128k tokens",
    strength: "Analyse percutante & débat contradictoire",
  },
  {
    id: "claude-3-5-haiku-latest",
    name: "Claude 3.5 Haiku (BYOK)",
    provider: "anthropic",
    description: "Précision éditoriale et style littéraire remarquable avec votre propre clé Anthropic.",
    contextWindow: "200k tokens",
    strength: "Élégance de rédaction & rigueur éthique",
  },
  {
    id: "gpt-4o-mini",
    name: "OpenAI GPT-4o Mini (BYOK)",
    provider: "openai",
    description: "Traitement multitâche et rapidité avec votre propre clé API OpenAI au prix coûtant.",
    contextWindow: "128k tokens",
    strength: "Polyvalence universelle",
  },
  {
    id: "local-mistral",
    name: "Moteur Local (Ollama / Metal Mac)",
    provider: "local",
    description: "Exécution 100% on-premise hors-ligne via Ollama ou Metal sur Mac. Zéro coût, zéro transfert hors de votre machine.",
    contextWindow: "32k tokens",
    strength: "100% Hors-ligne & Confidentialité totale",
  },
];
