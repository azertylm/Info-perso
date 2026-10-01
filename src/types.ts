export type Provider = "mistral" | "local" | "gemini" | "openai" | "anthropic" | "deepseek" | "kimi";

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

// Modèles Mistral AI exclusifs conformes aux instructions souveraines ALPHABETTE
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: "mistral-small-latest",
    name: "Mistral Small (Secours Actif Inclus)",
    provider: "mistral",
    description: "Modèle souverain européen rapide & économique. Fonctionne avec votre clé BYOK ou le relais de secours managé inclus.",
    contextWindow: "32k tokens",
    strength: "Souveraineté RGPD, rapidité & synthèse",
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
    id: "codestral-latest",
    name: "Codestral (Mistral AI)",
    provider: "mistral",
    description: "Spécialisé dans la logique, les structures de données strictes et les calculs de rentabilité.",
    contextWindow: "256k tokens",
    strength: "Raisonnement logique & structuration",
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
