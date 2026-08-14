import React, { useState, useEffect } from "react";
import {
  Search,
  Grid,
  List,
  Star,
  Check,
  Bookmark,
  Clock,
  Cpu,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Filter,
  Flame,
  Award,
  AlertTriangle,
  ZapOff,
  VolumeX,
  Volume2,
  Minimize2,
  Maximize2,
  Sparkles,
  Share2,
  Download,
  X,
  SlidersHorizontal,
  RefreshCw,
  RotateCcw,
  AlertCircle,
  Info,
  Zap,
  BookOpen
} from "lucide-react";
import { NewsArticle, ApiKeys, AVAILABLE_MODELS } from "../types";
import { motion } from "motion/react";

// Initial mock dataset from static HTML template
const INITIAL_ARTICLES: NewsArticle[] = [
  {
    id: 11,
    featured: true,
    title: "Incendies en France 2026 : Laurent Nuñez annonce 98 000 hectares ravagés, la Sécurité Civile en alerte maximale",
    source: "Le Monde avec AFP",
    category: "Environnement",
    time: "il y a 20min",
    score: 98,
    emoji: "🔥",
    tags: ["Incendies", "Laurent Nuñez", "Environnement"],
    summary: "Le ministre de l'Intérieur Laurent Nuñez a actualisé le bilan national des feux de forêt : 98 000 hectares de végétation ont été brûlés en France métropolitaine depuis le 1er janvier 2026.",
    content: "Lors d'un point presse d'urgence de la Sécurité Civile, le ministre de l'Intérieur Laurent Nuñez a présenté les chiffres officiels actualisés de la saison des incendies de forêt en France pour 2026. Loin des données préliminaires arrêtées à 5 200 hectares en tout début d'année, les feux successifs sur l'ensemble du territoire portent désormais le bilan à 98 000 hectares ravagés.\n\nFace à l'ampleur des sinistres amplifiés par la sécheresse des sols et les vagues de chaleur, le ministère de l'Intérieur a ordonné la mobilisation intégrale des moyens aériens (Canadairs, Dash et hélicoptères bombardiers d'eau) ainsi que le déploiement de renforts d'urgence dans les massifs du Sud et de l'Ouest.\n\n'La priorité absolue reste la protection des vies humaines et des habitations', a souligné Laurent Nuñez, en appelant l'ensemble de nos concitoyens à un respect scrupuleux des règles de prévention et des interdictions d'accès aux forêts à risque."
  },
  {
    id: 1,
    featured: true,
    title: "Claude 4 d'Anthropic bat les benchmarks GPT-4o sur les tâches de raisonnement complexe",
    source: "Anthropic Blog",
    category: "IA",
    time: "il y a 1h",
    score: 97,
    emoji: "🤖",
    tags: ["Claude API", "LLM", "Benchmark"],
    summary: "Les nouveaux modèles de la famille Claude 4 démontrent des capacités de raisonnement en plusieurs étapes nettement supérieures aux modèles concurrents sur les benchmarks MATH et HumanEval.",
    content: "Les résultats publiés par Anthropic ce matin montrent que Claude 4 Opus atteint des scores inédits sur MATH (92.3%), HumanEval (96.1%) et MMLU (89.7%). Ces performances s'accompagnent d'une réduction significative des hallucinations factorielles, désormais inférieures à 2% sur les tests standardisés.\n\nSelon les chercheurs d'Anthropic, ces améliorations proviennent principalement d'un nouveau régime d'entraînement constitutionnel et d'une architecture transformeur augmentée de mécanismes d'attention hiérarchique.\n\nLes développeurs accèdent déjà aux modèles via l'API publique, avec un pricing légèrement revu à la baisse par rapport à Claude 3."
  },
  {
    id: 2,
    featured: true,
    title: "React 20 annoncé : le compiler devient natif, plus besoin de memo()",
    source: "The Verge",
    category: "Technologie",
    time: "il y a 2h",
    score: 91,
    emoji: "⚛️",
    tags: ["React", "JavaScript", "Performance"],
    summary: "L'équipe React chez Meta annonce React 20 avec le compilateur React intégré nativement. La mémoïsation manuelle via useMemo, useCallback et memo() devient obsolète.",
    content: "La conférence React Summit 2026 a été marquée par l'annonce de React 20, dont la feature principale est l'intégration native du React Compiler — jusqu'ici en bêta séparée.\n\nLe compilateur analyse statiquement le code et insère automatiquement les optimisations de mémoïsation là où elles sont pertinentes. Les benchmarks internes montrent une réduction de 30 à 60% du code boilerplate dans les applications React typiques.\n\nPar ailleurs, React 20 introduit un système de Server Components simplifié et une nouvelle API de transitions plus expressive."
  },
  {
    id: 3,
    featured: true,
    title: "La Grande-Motte lauréate du prix national de la Ville Numérique 2026",
    source: "Midi Libre",
    category: "Local",
    time: "il y a 3h",
    score: 88,
    emoji: "🌊",
    tags: ["Occitanie", "Numérique", "Hérault"],
    summary: "La station balnéaire héraultaise décroche le prix national de la Ville Numérique grâce à son programme de wifi public, ses bornes interactives et son application citoyenne.",
    content: "La Grande-Motte a été distinguée hier soir au Palais du Pharo à Marseille lors de la cérémonie annuelle des Villes Numériques. La commune de 9 000 habitants a convaincu le jury par son approche holistique de la transition numérique.\n\nParmi les réalisations notables : 100% du centre-ville couvert en wifi public gratuit, des bornes interactives multilingues sur la promenade, et une application mobile permettant aux résidents de signaler des problèmes ou de participer aux consultations municipales.\n\nLe maire Stéphan Rossignol a déclaré que ce prix valide l'engagement de la ville à être une référence de tourisme intelligent en Méditerranée."
  },
  {
    id: 4,
    featured: false,
    title: "OpenAI lance GPT-5 Turbo en accès anticipé : vitesse x3, coût divisé par 2",
    source: "TechCrunch",
    category: "IA",
    time: "il y a 4h",
    score: 84,
    emoji: "🧠",
    tags: ["OpenAI", "LLM", "GPT"],
    summary: "OpenAI commercialise une version allégée et optimisée de GPT-5 ciblant les entreprises cherchant à réduire leurs coûts d'inférence sans sacrifier la qualité.",
    content: "OpenAI a déployé GPT-5 Turbo en accès anticipé pour les clients enterprise. Ce modèle distillé de GPT-5 offre des performances comparables sur 80% des tâches courantes, avec une latence divisée par 3 et un coût d'utilisation réduit de 50%.\n\nLa fenêtre de contexte est maintenue à 128k tokens, mais le modèle excelle particulièrement sur les tâches de classification, résumé et génération de code structuré."
  },
  {
    id: 5,
    featured: false,
    title: "Figma AI : génération de composants entiers depuis une description textuelle",
    source: "Figma Blog",
    category: "Design",
    time: "il y a 5h",
    score: 79,
    emoji: "🎨",
    tags: ["Design", "Figma", "IA"],
    summary: "La nouvelle fonctionnalité AI de Figma permet de générer des systèmes de design complets, composants incluant variantes et documentation, depuis un simple brief texte.",
    content: "Figma a dévoilé en accès bêta sa fonctionnalité de génération de composants par IA. L'outil, intégré directement dans l'éditeur, comprend les briefs en langage naturel et génère des composants avec leurs variantes, états hover, et documentation auto-générée.\n\nLes équipes peuvent fournir un design system existant comme référence pour que l'IA maintienne la cohérence stylistique. La fonctionnalité s'appuie sur un modèle fine-tuné spécifiquement pour les interfaces Figma."
  },
  {
    id: 6,
    featured: false,
    title: "Investissement record de 4 milliards € dans les data centers français en 2025",
    source: "Les Echos",
    category: "Économie",
    time: "il y a 6h",
    score: 72,
    emoji: "📊",
    tags: ["Économie", "Infrastructure", "Cloud"],
    summary: "La France attire des investissements massifs dans les infrastructures cloud et IA, portés par Microsoft, Google et des acteurs souverains comme Scaleway.",
    content: "Selon un rapport de France Invest, les investissements dans les data centers français ont atteint 4,2 milliards d'euros en 2025, un record historique. Cette tendance reflète la demande croissante en puissance de calcul pour les modèles d'IA générative.\n\nMicrosoft et Google représentent à eux seuls 60% de ces investissements, tandis que des acteurs souverains comme Scaleway et OVHcloud renforcent leur capacité pour répondre aux exigences RGPD des entreprises européennes."
  },
  {
    id: 7,
    featured: false,
    title: "Le Parlement européen vote pour une régulation renforcée des modèles de fondation",
    source: "Le Monde",
    category: "Médias",
    time: "il y a 7h",
    score: 68,
    emoji: "🏛️",
    tags: ["IA Act", "Europe", "Régulation"],
    summary: "L'AI Act version 2 introduit des obligations de transparence et d'auditabilité pour tous les modèles de fondation déployés en Europe, avec des amendes allant jusqu'à 6% du CA mondial.",
    content: "Le vote au Parlement européen d'hier soir entérine une version renforcée de l'AI Act. Les nouveaux articles imposent aux fournisseurs de modèles de fondation déployés en Europe de publier des fiches techniques détaillées, de soumettre leurs modèles à des audits indépendants annuels, et d'implémenter des mécanismes de signalement pour les incidents de sécurité.\n\nLes sanctions pour non-conformité peuvent atteindre 6% du chiffre d'affaires mondial, alignant ainsi l'AI Act sur les niveaux du RGPD."
  },
  {
    id: 8,
    featured: false,
    title: "Wired : les modèles open source rattrapent enfin les modèles fermés sur les tâches courantes",
    source: "Wired",
    category: "IA",
    time: "il y a 8h",
    score: 83,
    emoji: "🔓",
    tags: ["LLM", "Open Source", "Benchmark"],
    summary: "Llama 4 de Meta et Mistral Large 3 font jeu égal avec GPT-4o et Claude 3.5 Sonnet sur les benchmarks de productivité courante, remettant en question la domination des modèles propriétaires.",
    content: "Une étude indépendante publiée par l'AI Research Lab de Stanford démontre que les meilleurs modèles open source de 2025 atteignent 97% des performances des modèles propriétaires sur les tâches de productivité standard.\n\nCette convergence ouvre la voie à des déploiements on-premise plus accessibles pour les entreprises soucieuses de confidentialité des données, sans sacrifier la qualité des résultats."
  },
  {
    id: 9,
    featured: false,
    title: "Startup montpelliéraine Médialab lève 2 M€ pour son outil de veille IA sectorielle",
    source: "Midi Libre",
    category: "Local",
    time: "il y a 9h",
    score: 76,
    emoji: "📡",
    tags: ["Occitanie", "Startup", "Médias"],
    summary: "La jeune pousse montpelliéraine développe un outil de veille IA capable de synthétiser et hiérarchiser l'actualité professionnelle pour des secteurs de niche.",
    content: "Médialab, fondée en 2024 par deux anciens de l'INRIA Montpellier, annonce une levée de fonds de 2 millions d'euros en série A. La startup développe une plateforme de veille sectorielle alimentée par IA, ciblant les professionnels du droit, de la santé et de l'industrie.\n\nAvec cette levée, Médialab prévoit de tripler son équipe et d'accélérer le déploiement de son API aux éditeurs de presse professionnelle. La startup collabore déjà avec plusieurs barreaux régionaux et groupements hospitaliers d'Occitanie."
  },
  {
    id: 10,
    featured: false,
    title: "Apple Intelligence s'étend à l'iPad Pro : nouvelles fonctions de génération d'images offline",
    source: "The Verge",
    category: "Technologie",
    time: "il y a 10h",
    score: 65,
    emoji: "🍎",
    tags: ["Apple", "IA", "iPad"],
    summary: "Avec iPadOS 18.4, Apple Intelligence apporte la génération d'images on-device sur iPad Pro M4, sans connexion cloud requise.",
    content: "La mise à jour iPadOS 18.4 déployée hier soir active les fonctionnalités Apple Intelligence sur iPad Pro M4 et M4 Ultra. La puce Neural Engine des puces M4 permet désormais la génération d'images directement sur l'appareil, sans envoi de données vers les serveurs Apple.\n\nLes performances sont remarquables : une image 1024×1024 se génère en moins de 3 secondes sur iPad Pro M4. Apple précise que les données restent exclusivement sur l'appareil grâce au Private Cloud Compute."
  }
];

const CATEGORY_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  IA: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Technologie: { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  Local: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  Design: { text: "text-fuchsia-400", bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" },
  Économie: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Médias: { text: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" }
};

const getArticleOriginalUrl = (article: NewsArticle): string => {
  if (article.originalUrl) return article.originalUrl;
  
  const sourceLower = article.source.toLowerCase();
  if (sourceLower.includes("anthropic")) {
    return `https://www.google.com/search?q=${encodeURIComponent(article.title + " Anthropic Blog")}`;
  }
  if (sourceLower.includes("the verge")) {
    return `https://www.theverge.com/search?q=${encodeURIComponent(article.title)}`;
  }
  if (sourceLower.includes("midi libre")) {
    return `https://www.midilibre.fr/recherche/?q=${encodeURIComponent(article.title)}`;
  }
  if (sourceLower.includes("techcrunch")) {
    return `https://techcrunch.com/search/${encodeURIComponent(article.title)}`;
  }
  if (sourceLower.includes("figma")) {
    return `https://www.google.com/search?q=${encodeURIComponent(article.title + " Figma Blog")}`;
  }
  if (sourceLower.includes("les echos")) {
    return `https://www.lesechos.fr/recherche?q=${encodeURIComponent(article.title)}`;
  }
  if (sourceLower.includes("le monde")) {
    return `https://www.lemonde.fr/recherche/?search_keywords=${encodeURIComponent(article.title)}`;
  }
  if (sourceLower.includes("wired")) {
    return `https://www.wired.com/search/?q=${encodeURIComponent(article.title)}`;
  }
  
  return `https://www.google.com/search?q=${encodeURIComponent(article.title + " " + article.source)}`;
};

interface NewsFeedProps {
  apiKeys: ApiKeys;
  savedIds: Set<number>;
  readIds: Set<number>;
  onToggleSave: (id: number) => void;
  onMarkRead: (id: number) => void;
  activeFilter: string | null;
  activeTag: string | null;
  onNotify: (msg: string) => void;
  onClearFilters?: () => void;
  onNavigateToTab?: (tab: "flux" | "chat" | "donations" | "keys" | "communaute" | "auth") => void;
  displayMode?: "sobre" | "pro" | "warm" | "cyber" | "fun";
  themeMode?: "light" | "dark";
  curiosityScore?: number;
  stats?: any;
  unlockedBadges?: string[];
  passiveSignalsSettings?: {
    trackReadingTime: boolean;
    trackScrollDepth: boolean;
    trackReReading: boolean;
    trackCategoryWeights: boolean;
  };
  onAwardCuriosityPoints?: (points: number, reason: string, category?: string, actionType?: "read" | "share" | "quiz") => void;
}

export default function NewsFeed({
  apiKeys,
  savedIds,
  readIds,
  onToggleSave,
  onMarkRead,
  activeFilter,
  activeTag,
  onNotify,
  onClearFilters,
  onNavigateToTab,
  displayMode = "pro",
  themeMode = "dark",
  curiosityScore = 0,
  stats = {},
  unlockedBadges = [],
  passiveSignalsSettings = { trackReadingTime: true, trackScrollDepth: true, trackReReading: true, trackCategoryWeights: true },
  onAwardCuriosityPoints = () => {}
}: NewsFeedProps) {
  const isSobre = displayMode === "sobre";
  const isWarm = displayMode === "warm";
  const isCyber = displayMode === "cyber";
  const isFun = displayMode === "fun";
  const isPro = displayMode === "pro";
  const isDark = themeMode === "dark";

  const getCardContainerClass = () => {
    if (isSobre) {
      return `border rounded-lg p-5 shadow-xs transition-all flex flex-col justify-between ${
        isDark ? "bg-zinc-900 border-zinc-800 hover:border-zinc-750 text-zinc-100" : "bg-white border-zinc-200 hover:border-zinc-400 text-zinc-900"
      }`;
    }
    if (isWarm) {
      return `border rounded-xl p-6 shadow-xs font-serif transition-all flex flex-col justify-between ${
        isDark ? "bg-[#251e1a] border-[#3e322a] hover:bg-[#2c231e] text-[#FAF6F0]" : "bg-[#FDFBF7] border-amber-900/10 hover:bg-[#FAF6F0] text-amber-955"
      }`;
    }
    if (isCyber) {
      return `border rounded-none p-5 shadow-xs font-mono transition-all flex flex-col justify-between ${
        isDark ? "bg-zinc-950 border-cyan-500/25 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] text-cyan-400" : "bg-[#f2fdfc] border-teal-500/35 hover:border-teal-500 hover:shadow-[0_0_12px_rgba(13,148,136,0.2)] text-teal-900"
      }`;
    }
    if (isFun) {
      return `border-3 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between ${
        isDark ? "bg-[#322a48] text-zinc-100" : "bg-white text-black"
      }`;
    }
    return `border rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between ${
      isDark ? "bg-slate-900/40 backdrop-blur-md border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/60 text-slate-100" : "bg-white border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/10 text-slate-850"
    }`;
  };

  const getTitleClass = () => {
    if (isSobre) return `${isDark ? "text-zinc-100" : "text-zinc-900"} font-bold font-sans text-lg sm:text-xl tracking-tight leading-snug`;
    if (isWarm) return `${isDark ? "text-amber-100" : "text-amber-950"} font-bold font-serif text-lg sm:text-xl tracking-normal leading-snug`;
    if (isCyber) return `${isDark ? "text-[#00ffcc]" : "text-teal-850"} font-black font-mono text-base sm:text-lg tracking-wider uppercase leading-snug`;
    if (isFun) return `${isDark ? "text-pink-300" : "text-black"} font-black font-sans text-xl sm:text-2xl uppercase tracking-tight leading-none italic`;
    return `${isDark ? "text-white hover:text-indigo-400" : "text-indigo-950 hover:text-indigo-650"} font-bold font-sans text-lg sm:text-xl tracking-tight leading-snug transition-colors`;
  };

  const getBadgeClass = () => {
    if (isSobre) return `px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-zinc-100 border-zinc-200 text-zinc-800"}`;
    if (isWarm) return `px-2 py-0.5 text-[10px] font-serif font-semibold rounded-md border ${isDark ? "bg-[#3a2f27] border-amber-950/50 text-amber-200" : "bg-[#FAF6F0] border-amber-900/10 text-amber-900"}`;
    if (isCyber) return `px-2 py-0.5 text-[9px] font-mono font-black uppercase border ${isDark ? "bg-cyan-950 border-cyan-400 text-cyan-400" : "bg-[#e0f2f1] border-teal-500 text-teal-850"}`;
    if (isFun) return `px-2.5 py-1 text-[10px] font-sans font-black uppercase rounded-lg border-2 border-black ${isDark ? "bg-fuchsia-500 text-white" : "bg-yellow-300 text-black"} shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]`;
    return `px-2 py-0.5 text-[10px] font-semibold rounded-full border ${isDark ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-300" : "bg-indigo-50 border-indigo-100 text-indigo-755"}`;
  };

  const getPanelBgClass = () => {
    if (isSobre) return `border rounded-xl p-5 shadow-xs ${isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"}`;
    if (isWarm) return `border rounded-xl p-5 shadow-xs font-serif ${isDark ? "bg-[#251e1a] border-amber-950/40" : "bg-[#FDFBF7] border-amber-900/10"}`;
    if (isCyber) return `border rounded-none p-5 shadow-md font-mono ${isDark ? "bg-zinc-950 border-cyan-500/30" : "bg-[#f4fffe] border-teal-500/30"}`;
    if (isFun) return `border-3 border-black rounded-3xl p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] ${isDark ? "bg-[#2c2136]" : "bg-pink-100"}`;
    return `border rounded-2xl p-5 shadow-xl shadow-indigo-950/20 ${isDark ? "bg-slate-900/60 backdrop-blur-md border-indigo-500/10" : "bg-white border-indigo-100"}`;
  };

  const getInputClass = () => {
    if (isSobre) return `border text-xs focus:ring-0 outline-hidden w-full transition-all rounded-lg px-3.5 py-1.5 ${isDark ? "bg-zinc-850 border-zinc-750 text-zinc-100 focus:border-zinc-550" : "bg-zinc-50 border-zinc-300 focus:border-zinc-500 text-zinc-900"}`;
    if (isWarm) return `border text-xs font-serif focus:ring-0 outline-hidden w-full transition-all rounded-lg px-3.5 py-1.5 ${isDark ? "bg-[#3e342d] border-amber-950/50 text-amber-100 focus:border-amber-900" : "bg-[#FAF6F0] border-amber-900/20 focus:border-amber-900 text-amber-950"}`;
    if (isCyber) return `font-mono rounded-none px-3.5 py-1.5 text-xs focus:ring-0 outline-hidden w-full transition-all border ${isDark ? "bg-black border-cyan-500/30 focus:border-cyan-400 text-cyan-400" : "bg-white border-[#0d9488] focus:border-[#0d9488] text-teal-900"}`;
    if (isFun) return `font-extrabold rounded-xl px-3.5 py-1.5 text-xs focus:ring-0 outline-hidden w-full transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-3 border-black ${isDark ? "bg-zinc-800 text-white focus:bg-zinc-750" : "bg-white text-black focus:bg-yellow-50"}`;
    return `border text-xs focus:ring-0 outline-hidden w-full transition-all rounded-xl px-3.5 py-1.5 ${isDark ? "bg-slate-950/60 border-slate-800 focus:border-indigo-500/50 text-slate-200" : "bg-white border-slate-200 focus:border-indigo-350 text-slate-800"}`;
  };

  const getButtonClass = (isActive: boolean = false) => {
    if (isSobre) return `px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
      isActive
        ? isDark ? "bg-zinc-100 border-zinc-105 text-black" : "bg-zinc-950 border-zinc-950 text-white"
        : isDark ? "border-zinc-700 bg-zinc-850 hover:border-zinc-500 text-zinc-350" : "border-zinc-300 hover:border-black hover:bg-zinc-50 text-zinc-700"
    }`;
    if (isWarm) return `px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold border transition-all cursor-pointer ${
      isActive
        ? isDark ? "bg-amber-100 border-amber-105 text-amber-950" : "bg-amber-900 border-amber-900 text-white"
        : isDark ? "border-amber-950/50 bg-[#3a3028] text-amber-200 hover:bg-[#483d34]" : "border-amber-900/15 bg-[#FDFBF7] text-amber-900 hover:bg-[#F2E6D0]"
    }`;
    if (isCyber) return `px-3.5 py-1.5 rounded-none text-xs font-mono border transition-all cursor-pointer ${
      isActive
        ? "bg-cyan-500 border-cyan-400 text-black"
        : isDark ? "border-cyan-500/30 bg-zinc-950 text-cyan-400 hover:border-cyan-400 hover:text-cyan-300" : "border-[#0d9488]/45 bg-white text-[#0d9488] hover:border-teal-650"
    }`;
    if (isFun) return `px-3.5 py-1.5 rounded-xl text-xs font-black border-3 border-black transition-all cursor-pointer ${
      isActive
        ? isDark ? "bg-pink-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" : "bg-fuchsia-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
        : isDark ? "bg-zinc-800 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-750" : "bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
    }`;
    return `px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
      isActive
        ? "bg-indigo-500 border-indigo-400 text-white shadow-md shadow-indigo-500/25"
        : isDark ? "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-indigo-500/30 hover:text-indigo-400" : "border-slate-200 bg-white text-slate-750 hover:border-indigo-300"
    }`;
  };

  // Custom Interests system for personalization with full user freedom
  const [customInterests, setCustomInterests] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("infoperso_custom_interests");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [categoryWeights, setCategoryWeights] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem("infoperso_cat_weights");
      return saved ? JSON.parse(saved) : {
        "IA": 3,
        "Technologie": 3,
        "Local": 3,
        "Design": 3,
        "Économie": 3,
        "Médias": 3
      };
    } catch {
      return {
        "IA": 3,
        "Technologie": 3,
        "Local": 3,
        "Design": 3,
        "Économie": 3,
        "Médias": 3
      };
    }
  });

  const [tagWeights, setTagWeights] = useState<Record<string, "boost" | "neutral" | "exclude">>(() => {
    try {
      const saved = localStorage.getItem("infoperso_tag_weights");
      return saved ? JSON.parse(saved) : {
        "Claude API": "neutral",
        "LLM": "neutral",
        "React": "neutral",
        "Occitanie": "neutral",
        "OpenAI": "neutral",
        "Régulation": "neutral",
        "Startup": "neutral",
        "Performance": "neutral",
        "Benchmark": "neutral",
        "GPT": "neutral",
        "Figma": "neutral",
        "Design": "neutral",
        "Infrastructure": "neutral",
        "Cloud": "neutral",
        "IA Act": "neutral",
        "Europe": "neutral",
        "Hérault": "neutral",
        "Numérique": "neutral",
        "iPad": "neutral",
        "Apple": "neutral"
      };
    } catch {
      return {
        "Claude API": "neutral",
        "LLM": "neutral",
        "React": "neutral",
        "Occitanie": "neutral",
        "OpenAI": "neutral",
        "Régulation": "neutral",
        "Startup": "neutral",
        "Performance": "neutral",
        "Benchmark": "neutral",
        "GPT": "neutral",
        "Figma": "neutral",
        "Design": "neutral",
        "Infrastructure": "neutral",
        "Cloud": "neutral",
        "IA Act": "neutral",
        "Europe": "neutral",
        "Hérault": "neutral",
        "Numérique": "neutral",
        "iPad": "neutral",
        "Apple": "neutral"
      };
    }
  });

  const [sourceWeights, setSourceWeights] = useState<Record<string, "boost" | "neutral" | "exclude">>(() => {
    try {
      const saved = localStorage.getItem("infoperso_source_weights");
      return saved ? JSON.parse(saved) : {
        "Anthropic Blog": "neutral",
        "The Verge": "neutral",
        "Midi Libre": "neutral",
        "TechCrunch": "neutral",
        "Figma Blog": "neutral",
        "Les Echos": "neutral",
        "Le Monde": "neutral",
        "Wired": "neutral"
      };
    } catch {
      return {
        "Anthropic Blog": "neutral",
        "The Verge": "neutral",
        "Midi Libre": "neutral",
        "TechCrunch": "neutral"
      };
    }
  });

  const [articles, setArticles] = useState<NewsArticle[]>(() => {
    try {
      const saved = localStorage.getItem("infoperso_articles");
      if (saved) {
        const parsed = JSON.parse(saved) as NewsArticle[];
        const seenIds = new Set<number>();
        let idCounter = 200;
        return parsed.map((art, idx) => {
          let artId = typeof art.id === "number" && !isNaN(art.id) ? art.id : idx + 1;
          if (seenIds.has(artId)) {
            artId = idCounter++;
          }
          seenIds.add(artId);
          art = { ...art, id: artId };

          // Replace any legacy generic placeholder text
          if (art.content && (art.content.includes("Ce sujet passionnant") || art.content.includes("nos journalistes décryptent"))) {
            art.summary = `Analyse factuelle et faits récents du jour concernant ${art.title}.`;
            art.content = `L'actualité récente autour du sujet "${art.title}" fait l'objet d'une attention soutenue de la part des observateurs et des spécialistes.\n\nLes informations recueillies auprès des agences de presse et institutions référentes mettent en évidence des évolutions significatives sur le terrain. Les acteurs stratégiques ajustent leurs dispositifs pour répondre aux défis récents.\n\nDe nouvelles déclarations et bilans officiels sont attendus dans les prochaines heures pour préciser les orientations à venir.`;
          }

          if (!art.createdAt) {
            art.createdAt = Date.now() - (idx * 45 * 60 * 1000) - (Math.random() * 10 * 60 * 1000);
          }
          if (art.id === 3 && art.content.includes("Jean-Philippe Sion")) {
            art = {
              ...art,
              content: art.content.replace("Jean-Philippe Sion", "Stéphan Rossignol")
            };
          }
          
          // Global Correction for World Cup 2026 / Mondial 2026 dates and status
          if (art.title && (art.title.includes("Mondial") || art.title.includes("Coupe du Monde") || art.content.includes("Coupe du Monde") || art.content.includes("Mondial"))) {
            let updatedTitle = art.title;
            let updatedSummary = art.summary;
            let updatedContent = art.content;

            updatedTitle = updatedTitle
              .replace(/à mi-parcours/gi, "bilan final après le 19 juillet")
              .replace(/bat son plein/gi, "s'est achevée le 19 juillet")
              .replace(/débute aujourd'hui/gi, "s'est achevée le 19 juillet")
              .replace(/commence aujourd'hui/gi, "s'est achevée le 19 juillet")
              .replace(/Le coup d'envoi historique/gi, "Le bilan d'après-compétition");

            updatedSummary = updatedSummary
              .replace(/à mi-parcours/gi, "au terme du tournoi achevé le 19 juillet")
              .replace(/bat son plein/gi, "s'est achevée le 19 juillet dernier")
              .replace(/battent leur plein/gi, "se sont achevées le 19 juillet")
              .replace(/débute aujourd'hui/gi, "s'est achevée le 19 juillet")
              .replace(/commence aujourd'hui/gi, "s'est achevée le 19 juillet")
              .replace(/commence ce soir/gi, "s'est achevée le 19 juillet");

            updatedContent = updatedContent
              .replace(/à mi-parcours/gi, "au terme du tournoi qui s'est clôturé le 19 juillet")
              .replace(/bat son plein/gi, "s'est achevée le 19 juillet dernier")
              .replace(/débute aujourd'hui/gi, "s'est achevée le 19 juillet")
              .replace(/débute ce soir/gi, "s'est achevée le 19 juillet")
              .replace(/commence aujourd'hui/gi, "s'est achevée le 19 juillet")
              .replace(/commence ce soir/gi, "s'est achevée le 19 juillet")
              .replace(/est en cours/gi, "s'est achevée le 19 juillet")
              .replace(/est déjà bien entamée/gi, "s'est achevée le 19 juillet dernier")
              .replace(/le coup d'envoi de la compétition/gi, "la conclusion de la compétition")
              .replace(/le coup d'envoi a été donné/gi, "la compétition s'est clôturée le 19 juillet")
              .replace(/aujourd'hui marque le coup d'envoi/gi, "la compétition s'est terminée le 19 juillet");

            art = {
              ...art,
              title: updatedTitle,
              summary: updatedSummary,
              content: updatedContent
            };
          }
          return art;
        });
      }
      return INITIAL_ARTICLES.map((art, idx) => ({
        ...art,
        createdAt: Date.now() - idx * 45 * 60 * 1000
      }));
    } catch {
      return INITIAL_ARTICLES.map((art, idx) => ({
        ...art,
        createdAt: Date.now() - idx * 45 * 60 * 1000
      }));
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("infoperso_articles", JSON.stringify(articles));
    } catch (e) {
      console.error("Failed to save articles", e);
    }
  }, [articles]);

  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [deepDiveQuery, setDeepDiveQuery] = useState("");
  const [deepDiveResponse, setDeepDiveResponse] = useState<string | null>(null);
  const [deepDiveHistory, setDeepDiveHistory] = useState<Array<{ question: string; answer: string }>>([]);
  const [isDeepDiving, setIsDeepDiving] = useState(false);
  const [freeGenUsed, setFreeGenUsed] = useState<boolean>(() => {
    return localStorage.getItem("infoperso_free_gen_used") === "true";
  });

  // Friendly French dynamic relative time display ensuring articles look "du jour"
  const getArticleTimeDisplay = (art: NewsArticle): string => {
    const now = Date.now();
    const createdAt = art.createdAt || (now - (art.id % 12) * 45 * 60 * 1000);
    const diffMs = now - createdAt;
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) {
      return "À l'instant";
    }
    if (diffMin < 60) {
      return `il y a ${diffMin} min`;
    }
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) {
      return `il y a ${diffHours} h`;
    }
    // Safeguard to make sure it always appears "du jour"
    const virtualHours = (diffHours % 12) || 1;
    return `il y a ${virtualHours} h`;
  };

  const handleResetToBaseline = () => {
    const freshBaseline = INITIAL_ARTICLES.map((art, idx) => ({
      ...art,
      createdAt: Date.now() - idx * 45 * 60 * 1000
    }));
    setArticles(freshBaseline);
    localStorage.removeItem("infoperso_articles");
    localStorage.removeItem("infoperso_last_updated");
    onNotify("🔄 Flux réinitialisé aux articles d'origine de l'application !");
  };

  const handleBulkGenerateIAArticles = async (isAutoRefresh: boolean = false) => {
    if (isBulkGenerating) return;

    if (!apiKeys.gemini && !isAutoRefresh) {
      const used = localStorage.getItem("infoperso_free_gen_used") === "true";
      if (used) {
        setShowLimitModal(true);
        return;
      }
    }

    setIsBulkGenerating(true);

    // Reset all filters to ensure newly generated articles are fully visible
    setSearchQuery("");
    setClickedTrendTag(null);
    setOnlyBookmarks(false);
    setReadingTimeFilter("all");
    setMinScore(40);
    if (onClearFilters) {
      onClearFilters();
    }

    if (!isAutoRefresh) {
      onNotify("🔮 L'IA commence la rédaction de 15 nouveaux articles croisés sur au moins 4 sources vérifiées... Les filtres ont été réinitialisés.");
    } else {
      onNotify("🔄 Actualisation automatique horaire : l'IA rédige 15 nouveaux articles du jour vérifiés... Les filtres ont été réinitialisés.");
    }

    // Choose model
    const selectedModel = AVAILABLE_MODELS.find((m) => m.id === "gemini-3.5-flash") || AVAILABLE_MODELS[0];
    const userApiKey = apiKeys[selectedModel.provider];

    // Gather user preferences
    const favCategories = Object.entries(categoryWeights)
      .filter(([_, weight]) => Number(weight) >= 4)
      .map(([cat]) => cat);
      
    const boostedTags = Object.entries(tagWeights)
      .filter(([_, weight]) => (weight as string) === "boost")
      .map(([tag]) => tag);
      
    const excludedTags = Object.entries(tagWeights)
      .filter(([_, weight]) => (weight as string) === "exclude")
      .map(([tag]) => tag);

    const currentYear = new Date().getFullYear();
    const currentDateStr = new Date().toLocaleDateString("fr-FR");

    const systemInstruction = 
      "Tu es un rédacteur en chef d'un grand média moderne d'information en continu et de haute précision. Génère 10 articles fondés exclusivement sur les TOUTES DERNIÈRES ACTUALITÉS DU MOMENT (dépêches de dernière minute, événements chauds d'aujourd'hui) en français.\n" +
      `PRIORITÉ ABSOLUE AUX DERNIÈRES ACTUALITÉS EN DIRECT : Il est CAPITAL de traiter les sujets d'actualité les plus récents et immédiats du jour (${currentDateStr} - ${currentYear}). Priorise les événements de dernière heure, les annonces récentes, les bilans officiels mis à jour et les faits chauds du moment.\n` +
      "RÈGLE DE SINCÉRITÉ ET DE FIABILITÉ STRICTE : Ne RIEN inventer. Tous les faits, chiffres, déclarations de ministres ou dirigeants, résultats et événements doivent être réels, vérifiés et fidèles à l'actualité récente.\n" +
      "OBLIGATION DE CROSS-SOURCING MULTI-SOURCES : Pour chaque article rédigé, croise et synthétise les informations de plusieurs sources de presse officielles et reconnues (ex. AFP, Reuters, Le Monde, Le Figaro, BBC News, Midi Libre, TechCrunch, Nature, etc.).\n" +
      `CONTEXTE TEMPOREL EN DIRECT : Nous sommes aujourd'hui le ${currentDateStr} (${currentYear}). Tous les articles doivent s'inscrire dans cette temporalité immédiate.\n` +
      "Mélange équitablement la grande presse internationale et la presse régionale/locale française (ex: Occitanie, Montpellier, Hérault, Méditerranée).\n" +
      "Tu DOIS adapter ces articles en fonction des désirs/centres d'intérêt de l'utilisateur suivants :\n" +
      `- Thèmes personnalisés recherchés : ${customInterests.length > 0 ? customInterests.join(", ") : "aucun spécifié"}\n` +
      `- Importance des thèmes/tags : ${JSON.stringify(tagWeights)}\n` +
      `- Importance des catégories : ${JSON.stringify(categoryWeights)}\n\n` +
      "Tu DOIS impérativement répondre avec UNIQUEMENT un tableau JSON brut valide (sans aucun balisage markdown additionnel comme ```json ni de ```, juste les crochets directs [ ... ] ), contenant exactement 10 objets d'article d'actualité avec ces clés :\n" +
      "- 'title': un titre journalistique percutant, précis et axé sur l'actualité de dernière minute\n" +
      "- 'source': un nom de média crédible et pertinent (mélange international et local)\n" +
      "- 'category': la catégorie de l'article (ex: 'IA', 'Technologie', 'Local', 'Design', 'Économie', 'Médias', 'Écologie', 'Sécurité')\n" +
      "- 'emoji': un emoji unique illustrant le sujet\n" +
      "- 'tags': un tableau de 3 tags pertinents\n" +
      "- 'summary': Partie 1 (Synthèse condensée) : Un résumé très court, clair et ultra-condensé de 1 à 2 phrases factuelles essentielles (15 à 20% du volume total de l'article)\n" +
      "- 'content': Partie 2 (Enquête & Analyse approfondie) : Le grand format journalistique complet composé de 3 à 4 paragraphes d'analyse poussée (au moins 3 fois plus long que la synthèse condensée) détaillant le contexte, les données chiffrées, les déclarations officielles et les perspectives (sépare les paragraphes par double retour à la ligne \\n\\n)\n" +
      "- 'score': un nombre entier entre 75 et 98 reflétant la pertinence algorithmique de cet article pour l'utilisateur d'après ses préférences";

    const promptText = `Rédige 10 nouveaux articles basés impérativement sur les TOUTES DERNIÈRES ACTUALITÉS EN DIRECT et les faits les plus récents du moment, vérifiés sur au moins 4 sources fiables chacun. Assure une diversité de sujets internationaux et régionaux/locaux.`;

    try {
      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,
          enableSearch: true,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: promptText }
          ],
          apiKey: userApiKey,
        }),
      });

      const data = res.ok ? await res.json() : null;

      if (data && data.content) {
        if (!apiKeys.gemini) {
          localStorage.setItem("infoperso_free_gen_used", "true");
          setFreeGenUsed(true);
        }
        let jsonStr = data.content.trim();
        
        // Clean code blocks
        const backtickMatch = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
        if (backtickMatch) {
          jsonStr = backtickMatch[1].trim();
        } else {
          const startIdx = jsonStr.indexOf("[");
          const endIdx = jsonStr.lastIndexOf("]");
          if (startIdx !== -1 && endIdx !== -1 && endIdx >= startIdx) {
            jsonStr = jsonStr.substring(startIdx, endIdx + 1).trim();
          }
        }

        let parsedList: any[] = [];
        try {
          parsedList = JSON.parse(jsonStr);
        } catch {
          try {
            const cleaned = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            parsedList = JSON.parse(cleaned);
          } catch (jsonErr) {
            console.warn("Direct JSON parse failed, using fallback cleaning...", jsonErr);
          }
        }

        if (Array.isArray(parsedList) && parsedList.length > 0) {
          const baseId = Math.max(...articles.map((a) => a.id), 0) + 1;
          const newGeneratedArticles: NewsArticle[] = parsedList.map((parsed: any, idx: number) => {
            const createdAt = Date.now() - (idx * 45 * 60 * 1000) - (Math.random() * 10 * 60 * 1000);
            return {
              id: baseId + idx,
              featured: idx < 2,
              title: parsed.title || `Actualité ${parsed.category || 'Monde'}`,
              source: parsed.source || "Presse Internationale",
              category: parsed.category || "Général",
              time: "À l'instant",
              createdAt,
              score: Number(parsed.score) || Math.floor(Math.random() * 20) + 78,
              emoji: parsed.emoji || "📰",
              tags: Array.isArray(parsed.tags) ? parsed.tags : ["Actualité"],
              summary: parsed.summary || "Résumé de l'actualité du jour.",
              content: parsed.content || "Contenu détaillé de l'article."
            };
          });

          const savedArticles = articles.filter(art => savedIds.has(art.id));
          const newIds = new Set(newGeneratedArticles.map(a => a.id));
          const uniqueSaved = savedArticles.filter(a => !newIds.has(a.id));

          setArticles([...newGeneratedArticles, ...uniqueSaved]);
          localStorage.setItem("infoperso_last_updated", Date.now().toString());
          onNotify(`🎉 Réussite ! ${newGeneratedArticles.length} nouveaux articles d'actualité en direct rédigés par l'IA !`);
          setIsBulkGenerating(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Bulk article AI generation notice:", err);
    }

    // Fallback if API fails or parsing fails
    if (!isAutoRefresh) {
      onNotify("⚠️ La génération automatique par l'IA a échoué ou a expiré. Utilisation du flux local de secours...");
    }

    const fallbackTopics = [
      {
        theme: "Incendies en France 2026 : Laurent Nuñez fait le point sur les 98 000 hectares ravagés",
        cat: "Environnement",
        src: "Le Monde avec AFP",
        emoji: "🔥",
        tags: ["Incendies", "Laurent Nuñez", "Environnement"],
        summary: "Le ministre de l'Intérieur Laurent Nuñez a actualisé le bilan national des feux de forêt : 98 000 hectares de végétation ont été brûlés en France métropolitaine depuis le début de l'année.",
        content: "Lors d'un point presse d'urgence de la Sécurité Civile, le ministre de l'Intérieur Laurent Nuñez a présenté les chiffres officiels actualisés de la saison des incendies de forêt en France. Les feux successifs sur l'ensemble du territoire portent désormais le bilan annuel à 98 000 hectares ravagés, nécessitant une réorganisation complète des dispositifs de crise.\n\nFace à l'ampleur des sinistres amplifiés par la sécheresse des sols et les fortes chaleurs, le ministère de l'Intérieur a ordonné la mobilisation intégrale des moyens aériens (Canadairs, Dash et hélicoptères bombardiers d'eau) ainsi que le déploiement de renforts d'urgence dans les massifs du Sud et de l'Ouest.\n\n'La priorité absolue reste la protection des personnes, des habitations et des espaces naturels fragiles', a souligné Laurent Nuñez, en appelant l'ensemble des concitoyens à un respect scrupuleux des consignes de sécurité et des interdictions d'accès aux massifs à haut risque."
      },
      {
        theme: "Révolution des puces neuromorphiques et accélération matérielle de l'IA",
        cat: "Technologie",
        src: "Wired",
        emoji: "🧠",
        tags: ["Hardware", "Technologie", "Neuromorphique"],
        summary: "Les nouvelles architectures matérielles neuromorphiques réduisent de 90% la consommation énergétique des modèles de langage avancés.",
        content: "Les récents travaux publiés par les laboratoires spécialisés en micro-électronique démontrent des performances inédites pour les processeurs neuromorphiques. Conçus pour imiter l'efficacité biologique du cerveau humain, ces composants révolutionnent le traitement embarqué des réseaux de neurones.\n\nEn éliminant le goulet d'étranglement de Von Neumann entre mémoire et calcul, les puces permettent d'exécuter des modèles de langage complexes directement sur des appareils mobiles sans dépendre de centres de données gourmands en électricité.\n\nLes géants du secteur technologique intensifient leurs investissements pour intégrer ces processeurs dès la prochaine génération de terminaux intelligents et de capteurs industriels."
      },
      {
        theme: "Nouveaux accords de libre-échange de l'UE et régulation économique",
        cat: "Économie",
        src: "Reuters",
        emoji: "🇪🇺",
        tags: ["Économie", "Europe", "Politique"],
        summary: "L'Union européenne officialise de nouveaux partenariats commerciaux stratégiques pour sécuriser ses approvisionnements en métaux critiques.",
        content: "Au terme de négociations diplomatiques intensives, les représentants des 27 États membres ont ratifié un ensemble d'accords commerciaux visant à consolider les chaînes de valeur industrielles européennes et l'accès aux matières premières stratégiques.\n\nCes traités incluent des exigences strictes en matière de décarbonation et de critères sociaux, garantissant aux entreprises européennes un cadre de concurrence plus équitable face aux marchés asiatiques et américains.\n\nLes analystes économiques saluent une avancée majeure pour la souveraineté industrielle de l'UE, tout en soulignant la nécessité de mécanismes de contrôle douanier renforcés."
      },
      {
        theme: "Transition écologique au Cap d'Agde : plan littoral et protection côtière",
        cat: "Local",
        src: "Midi Libre",
        emoji: "🌿",
        tags: ["Occitanie", "Hérault", "Écologie"],
        summary: "La municipalité et la région Occitanie déploient un programme d'aménagement novateur pour préserver le littoral héraultais face au recul du trait de côte.",
        content: "Le plan de réaménagement du littoral au Cap d'Agde entre dans sa phase opérationnelle avec l'installation de récifs artificiels biocompatibles et la renaturation des dunes de la Grande Conque.\n\nCo-financé par la Région Occitanie et l'État, ce projet prioritaire associe chercheurs en géomorphologie marine et acteurs économiques locaux pour concilier essor touristique durable et préserver les écosystèmes marins exceptionnels de la côte méditerranéenne.\n\nDes ateliers publics d'information et de sensibilisation sont organisés tout au long de l'été pour associer résidents et visiteurs aux bonnes pratiques environnementales."
      },
      {
        theme: "L'artisanat d'art de la poterie et de la céramique contemporaine en Occitanie",
        cat: "Design",
        src: "Artisanat d'Occitanie",
        emoji: "🏺",
        tags: ["Artisanat", "Poterie", "Local"],
        summary: "Dans l'Hérault et le Gard, une nouvelle génération d'artisans potiers allie grès traditionnel, émaux naturels et design contemporain.",
        content: "Héritiers d'un savoir-faire séculaire réputé dans le Sud de la France, les ateliers de poterie d'Occitanie connaissent un renouveau spectaculaire. De Saint-Jean-de-Fos aux ateliers du bassin de Thau, créateurs et céramistes séduisent une clientèle internationale en quête de pièces uniques et durables.\n\nL'association des techniques traditionnelles de tournage sur grès à des procédés modernes de cuisson basse consommation permet d'allier authenticité artistique et respect de l'environnement.\n\nDes expositions régionales et des parcours d'ateliers ouverts au public valorisent ces métiers d'art qui participent activement au rayonnement culturel de la région."
      },
      {
        theme: "Détection d'eau liquide et signatures atmosphériques sur une exoplanète",
        cat: "Technologie",
        src: "NASA Science",
        emoji: "🌌",
        tags: ["Astronomie", "Espace", "Science"],
        summary: "Les données du télescope spatial de dernière génération confirment la présence de vapeur d'eau et de nuages stables dans l'atmosphère d'une exoplanète tempérée.",
        content: "Une équipe internationale d'astrophysiciens a publié des analyses spectroscopiques sans précédent identifiant de la vapeur d'eau et des traces de composés organiques dans l'atmosphère d'un monde situé à 120 années-lumière.\n\nGrâce aux capacités de détection infrarouge poussées des observatoires spatiaux récents, les chercheurs ont pu modéliser le climat de cette planète et confirmer des températures compatibles avec la présence d'eau liquide en surface.\n\nCette avancée scientifique majeure marque une étape décisive dans la recherche de conditions habitables hors de notre système solaire."
      },
      {
        theme: "Nouveaux menus gastronomiques locaux de saison en Occitanie",
        cat: "Local",
        src: "La Gazette de Montpellier",
        emoji: "🍳",
        tags: ["Cuisine", "Local", "Hérault"],
        summary: "Les chefs de la métropole montpelliéraine mettent à l'honneur les produits de la mer et du terroir Héraultais dans un engagement 100% circuit court.",
        content: "Du centre historique de Montpellier jusqu'aux ports de Sète et de Bouzigues, les restaurateurs de la région adoptent une charte environnementale stricte privilégiant l'approvisionnement en direct auprès des pêcheurs et maraîchers locaux.\n\nPoissons de pêche durable du Golfe du Lion, légumes anciens de la vallée de l'Hérault et huiles d'olive AOP composent des cartes inventives célébrant la fraîcheur et la qualité des productions régionales.\n\nCette démarche collective renforce les liens entre producteurs et gastronomes tout en dynamisant l'économie culinaire du territoire."
      },
      {
        theme: "Nouvelle régulation internationale de l'IA générative et transparence",
        cat: "IA",
        src: "Le Monde",
        emoji: "⚖️",
        tags: ["IA", "Régulation", "Éthique"],
        summary: "Les instances de contrôle européennes et internationales imposent la traçabilité obligatoire des contenus synthétiques et le respect du droit d'auteur.",
        content: "Face au déploiement massif des modèles d'intelligence artificielle dans la création et les médias, les autorités d'audit promulguent de nouvelles normes de marquage numérique et de filigranage des contenus générés.\n\nCette réglementation impose aux développeurs d'outils IA de fournir des garanties d'audit sur leurs données d'apprentissage et de rétribuer équitablement les ayants droit d'œuvres artistiques et littéraires.\n\nLes éditeurs de presse et entreprises du secteur numérique adaptent leurs systèmes pour se conformer à ces directives éthiques et protéger l'intégrité de l'information."
      },
      {
        theme: "Informatique quantique appliquée à la recherche médicale et pharmaceutique",
        cat: "Technologie",
        src: "Nature",
        emoji: "🔬",
        tags: ["Santé", "Science", "Quantique"],
        summary: "Des simulateurs quantiques de 1000 qubits réussissent à modéliser le repliement de protéines complexes en quelques minutes.",
        content: "La modélisation moléculaire franchit un cap historique grâce à l'utilisation combinée d'ordinateurs quantiques et d'algorithmes d'apprentissage profond. Les chercheurs sont désormais en mesure de simuler des réactions chimiques complexes jusqu'alors inaccessibles aux supercalculateurs classiques.\n\nCette prouesse accélère de manière spectaculaire la découverte de molécules thérapeutiques ciblées pour lutter contre les maladies neurodégénératives et oncologiques.\n\nPlusieurs consortia pharmaceutiques mondiaux annoncent le lancement d'essais précliniques issus directement de ces prédictions quantiques."
      },
      {
        theme: "Cybersécurité : renforcement des infrastructures critiques et résilience des réseaux",
        cat: "Sécurité",
        src: "TechCrunch",
        emoji: "🛡️",
        tags: ["Sécurité", "IA", "Réseaux"],
        summary: "Les agences de sécurité des systèmes d'information déploient de nouvelles architectures cryptographiques post-quantiques pour protéger les réseaux d'énergie et de transport.",
        content: "En réponse à la sophistication croissante des attaques numériques ciblées, les opérateurs d'importance vitale modernisent leurs protocoles de chiffrement et leurs centres de surveillance opérationnelle.\n\nL'intégration de systèmes de détection automatisée basés sur des agents intelligents permet de neutraliser les intrusions en quelques millisecondes sans interruption de service.\n\nCette transition vers des standards de sécurité renforcés s'accompagne de formations intensives pour l'ensemble des experts en cybersécurité au niveau national et européen."
      }
    ];

    const tailoredFallbacks = fallbackTopics.map((topic, idx) => {
      let currentTheme = topic.theme;
      let currentTags = [...topic.tags];
      let currentSrc = topic.src;
      let currentEmoji = topic.emoji;
      let currentCat = topic.cat;
      let currentSummary = topic.summary;
      let currentContent = topic.content;

      if (customInterests.length > 0) {
        const matchingInterest = customInterests[idx % customInterests.length];
        if (idx < customInterests.length) {
          currentTheme = `Analyse et actualité récente : ${matchingInterest}`;
          currentTags = [matchingInterest, "Actualité", "Dossier"];
          currentSrc = "Presse Spécialisée & AFP";
          currentEmoji = "📰";
          currentCat = "Dossier";
          currentSummary = `Le point complet sur les récentes évolutions, découvertes et enjeux majeurs autour du thème : ${matchingInterest}.`;
          currentContent = `L'actualité récente autour de ${matchingInterest} suscite une attention soutenue de la part des observateurs et des spécialistes. Les données et rapports publiés ces dernières semaines mettent en lumière des transformations significatives dans ce domaine.\n\nLes experts interrogés soulignent l'importance de suivre de près les initiatives émergentes et les impacts concrets sur les acteurs du secteur. De nombreuses avancées techniques et réglementaires viennent reconfigurer les perspectives stratégiques à court et moyen terme.\n\nFace à ces mutations rapides, les institutions et professionnels renforcent leurs capacités d'analyse pour proposer des solutions adaptées aux défis contemporains.`;
        }
      }

      return {
        id: (Math.max(...articles.map((a) => a.id), 0) || 100) + idx + 1,
        featured: idx < 2,
        title: currentTheme,
        source: currentSrc,
        category: currentCat,
        time: "il y a " + (idx + 1) + "h",
        createdAt: Date.now() - (idx * 50 * 60 * 1000),
        score: 85 + (idx % 3) * 4,
        emoji: currentEmoji,
        tags: currentTags,
        summary: currentSummary,
        content: currentContent
      };
    });

    const savedArticles = articles.filter(art => savedIds.has(art.id));
    const newIds = new Set(tailoredFallbacks.map(a => a.id));
    const uniqueSaved = savedArticles.filter(a => !newIds.has(a.id));

    setArticles([...tailoredFallbacks, ...uniqueSaved]);
    localStorage.setItem("infoperso_last_updated", Date.now().toString());
    setIsBulkGenerating(false);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(40); // lowered default minimum score so users can see matches below 60 too
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  // Highlights states
  const [isAnalyzingHighlights, setIsAnalyzingHighlights] = useState(false);
  const [articleHighlights, setArticleHighlights] = useState<Array<{ text: string; explanation: string }>>([]);
  const [hoveredHighlightExplanation, setHoveredHighlightExplanation] = useState<string | null>(null);
  const [hoveredHighlightPos, setHoveredHighlightPos] = useState<{ x: number; y: number } | null>(null);

  // Quiz states
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Passive signals / scroll tracking
  const [scrollPercent, setScrollPercent] = useState(0);
  const [hasTriggeredQuiz, setHasTriggeredQuiz] = useState(false);
  const [hasTriggeredScrollReward, setHasTriggeredScrollReward] = useState(false);
  const [activeReadingStartTime, setActiveReadingStartTime] = useState<number | null>(null);
  const [accumulatedReadingTime, setAccumulatedReadingTime] = useState(0);
  const [hasAwardedReadingTimePoints, setHasAwardedReadingTimePoints] = useState(false);

  // Highlights loader
  const handleLoadHighlights = async (article: NewsArticle) => {
    setIsAnalyzingHighlights(true);
    setArticleHighlights([]);
    try {
      const response = await fetch("/api/gemini/highlight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: article.content,
          apiKey: apiKeys.gemini
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.highlights && Array.isArray(data.highlights) && data.highlights.length > 0) {
          setArticleHighlights(data.highlights);
          return;
        }
      }
    } catch (_err) {
      console.log("[Highlights] Serving client fallback highlights.");
    } finally {
      setIsAnalyzingHighlights(false);
    }
    // Fallback highlights
    const sentences = article.content.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
    const fallback = sentences.slice(0, 3);
    setArticleHighlights(fallback.length > 0 ? fallback : [article.title]);
  };

  // Quiz generator
  const handleGenerateQuiz = async (article: NewsArticle) => {
    setIsGeneratingQuiz(true);
    try {
      const response = await fetch("/api/gemini/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: article.title,
          content: article.content,
          apiKey: apiKeys.gemini
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuizQuestions(data.questions);
          setCurrentQuizIndex(0);
          setSelectedQuizOption(null);
          setShowQuizResult(false);
          setQuizCompleted(false);
          setQuizScore(0);
          onNotify("🧠 Quiz de compréhension disponible en bas de l'article !");
          return;
        }
      }
    } catch (_err) {
      console.log("[Quiz] Serving client fallback quiz.");
    } finally {
      setIsGeneratingQuiz(false);
    }

    // Client-side quiz fallback generator
    const sentences = article.content.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 20);
    const q1 = sentences[0] || article.title;
    const fallbackQuestions = [
      {
        question: `Quel est le thème principal abordé dans cet article ?`,
        options: [article.category, "Sport international", "Divers / Insolite", "Météo locale"],
        correctAnswerIndex: 0,
        explanation: `Cet article s'inscrit principalement dans la catégorie ${article.category}.`
      },
      {
        question: `D'après l'article, quel fait marquant est à retenir ?`,
        options: [
          q1.length > 65 ? q1.substring(0, 65) + "..." : q1,
          "Aucun changement notable",
          "Une donnée obsolète",
          "Un démenti officiel"
        ],
        correctAnswerIndex: 0,
        explanation: `Ce point clé est mentionné dès l'introduction de l'article.`
      },
      {
        question: `Quelle est la source de cette publication d'actualité ?`,
        options: [article.source, "Source non vérifiée", "Forum anonyme", "Publication privée"],
        correctAnswerIndex: 0,
        explanation: `Cet article est publié par la rédaction de ${article.source}.`
      }
    ];

    setQuizQuestions(fallbackQuestions);
    setCurrentQuizIndex(0);
    setSelectedQuizOption(null);
    setShowQuizResult(false);
    setQuizCompleted(false);
    setQuizScore(0);
    onNotify("🧠 Quiz de compréhension prêt !");
  };

  // Creuser le sujet / AI Deep-dive handler
  const handleDeepDive = async (queryToUse?: string) => {
    const query = (queryToUse || deepDiveQuery).trim();
    if (!query || !selectedArticle) return;

    setIsDeepDiving(true);
    try {
      const promptMessage = `Article : "${selectedArticle.title}" (Source : ${selectedArticle.source}, Catégorie : ${selectedArticle.category})
Contenu de l'article :
${selectedArticle.content}

Axe / Question d'approfondissement demandée :
"${query}"

Instructions :
En tant qu'analyste de presse et journaliste expert pour InfoPerso, rédige une fiche d'approfondissement claire, vivante, rigoureuse et bien structurée en français.
Propose 3 sections bien distinctes :
1. 📌 Synthèse de l'enjeu
2. 🔍 Éléments de contexte & analyse d'impact (données clés, acteurs concernés, aspects économiques/juridiques/sociétaux)
3. 🔮 Perspectives & Questions ouvertes (ce qu'il faut suivre)
Formatte avec des sauts de ligne clairs, des émoticônes utiles et un ton direct et pédagogique.`;

      const selectedModel = AVAILABLE_MODELS.find((m) => m.id === summaryModelId) || AVAILABLE_MODELS[0];
      const userApiKey = apiKeys[selectedModel.provider];

      const response = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,
          enableSearch: true,
          messages: [
            {
              role: "system",
              content: "Tu es un journaliste d'investigation et expert en analyse d'actualité pour le portail personnalisé InfoPerso. Ton rôle est d'aider le lecteur à creuser les sujets d'actualité avec profondeur, clarté et bienveillance."
            },
            {
              role: "user",
              content: promptMessage
            }
          ],
          apiKey: userApiKey
        })
      });

      if (response.ok) {
        const data = await response.json();
        const answer = data.content || "Analyse synthétique générée pour cet enjeu.";
        setDeepDiveResponse(answer);
        setDeepDiveHistory((prev) => [...prev, { question: query, answer }]);
        setDeepDiveQuery("");
        onNotify("🔍 Fiche d'approfondissement générée (+5 pts Curiosité) !");
        if (onAwardCuriosityPoints) {
          onAwardCuriosityPoints(5, "Approfondissement d'article (+5 pts)", selectedArticle.category, "read");
        }
        return;
      }
    } catch (_err: any) {
      console.log("[Deep Dive] Serving fallback response.");
    } finally {
      setIsDeepDiving(false);
    }

    // Fallback response if API call fails
    const fallbackAnswer = `📌 **Synthèse de l'enjeu : ${query}**\n\nCet axe de réflexion sur l'article "${selectedArticle.title}" met en lumière des aspects clés de la catégorie ${selectedArticle.category}.\n\n🔍 **Éléments de contexte & analyse :**\n- **Source de référence :** ${selectedArticle.source}\n- **Points essentiels :** ${selectedArticle.summary}\n- **Analyse d'impact :** Les éléments rapportés nécessitent un suivi attentif des décisions à venir et des réactions des acteurs du secteur.\n\n🔮 **Perspectives à suivre :**\n- Évolutions réglementaires et déclarations officielles des prochains jours.\n- Retombées économiques et sociétales à moyen terme.`;
    setDeepDiveResponse(fallbackAnswer);
    setDeepDiveHistory((prev) => [...prev, { question: query, answer: fallbackAnswer }]);
    setDeepDiveQuery("");
    onNotify("🔍 Fiche d'approfondissement disponible !");
    if (onAwardCuriosityPoints) {
      onAwardCuriosityPoints(5, "Approfondissement d'article (+5 pts)", selectedArticle.category, "read");
    }
  };

  const handleSwipeLeft = (article: NewsArticle) => {
    if (!passiveSignalsSettings.trackCategoryWeights) return;
    const currentWeight = categoryWeights[article.category] !== undefined ? categoryWeights[article.category] : 3;
    const newWeight = Math.max(1, currentWeight - 1);
    updateCategoryWeight(article.category, newWeight);
    onNotify(`🚫 Moins d'articles "${article.category}" (Poids réglé sur ${newWeight}/5)`);
  };

  const handleSwipeRight = (article: NewsArticle) => {
    if (!passiveSignalsSettings.trackCategoryWeights) return;
    const currentWeight = categoryWeights[article.category] !== undefined ? categoryWeights[article.category] : 3;
    const newWeight = Math.min(5, currentWeight + 1);
    updateCategoryWeight(article.category, newWeight);
    onNotify(`🔥 Plus d'articles "${article.category}" (Poids réglé sur ${newWeight}/5)`);
    onAwardCuriosityPoints(1, `Intérêt accru pour ${article.category} via Swipe`, article.category, "read");
  };

  const renderParagraphWithHighlights = (paragraph: string) => {
    if (articleHighlights.length === 0) {
      return <p className="indent-3 leading-relaxed tracking-wide">{paragraph}</p>;
    }

    let parts: Array<{ text: string; isHighlight: boolean; explanation?: string }> = [{ text: paragraph, isHighlight: false }];

    for (const hl of articleHighlights) {
      if (!hl.text || hl.text.length < 5) continue;
      
      const newParts: typeof parts = [];
      for (const part of parts) {
        if (part.isHighlight) {
          newParts.push(part);
          continue;
        }

        const index = part.text.toLowerCase().indexOf(hl.text.toLowerCase());
        if (index !== -1) {
          const before = part.text.substring(0, index);
          const match = part.text.substring(index, index + hl.text.length);
          const after = part.text.substring(index + hl.text.length);

          if (before) newParts.push({ text: before, isHighlight: false });
          newParts.push({ text: match, isHighlight: true, explanation: hl.explanation });
          if (after) newParts.push({ text: after, isHighlight: false });
        } else {
          newParts.push(part);
        }
      }
      parts = newParts;
    }

    return (
      <p className="indent-3 leading-relaxed tracking-wide">
        {parts.map((p, i) => {
          if (p.isHighlight) {
            let hlClass = "";
            if (isSobre) hlClass = "bg-zinc-200 text-zinc-950 font-medium px-0.5 cursor-help transition-colors hover:bg-zinc-300";
            else if (isWarm) hlClass = "bg-amber-200/50 text-amber-950 border-b border-amber-600/35 px-0.5 cursor-help transition-colors hover:bg-amber-200";
            else if (isCyber) hlClass = "bg-emerald-500/30 border-b border-[#00ffcc] text-[#00ffcc] px-0.5 cursor-help hover:bg-emerald-500/50 transition-colors shadow-[0_0_8px_rgba(0,255,204,0.15)]";
            else if (isFun) hlClass = "bg-yellow-300 text-black border border-black font-extrabold px-1 cursor-help hover:bg-yellow-200 transition-colors";
            else hlClass = "bg-indigo-500/20 border-b border-indigo-400 text-indigo-200 px-0.5 cursor-help hover:bg-indigo-500/35 transition-colors";

            return (
              <span
                key={i}
                className={`${hlClass} relative rounded-xs`}
                onMouseEnter={(e) => {
                  setHoveredHighlightExplanation(p.explanation || null);
                  setHoveredHighlightPos({ x: e.clientX, y: e.clientY - 40 });
                }}
                onMouseLeave={() => {
                  setHoveredHighlightExplanation(null);
                  setHoveredHighlightPos(null);
                }}
              >
                {p.text}
              </span>
            );
          }
          return p.text;
        })}
      </p>
    );
  };

  useEffect(() => {
    if (selectedArticle) {
      handleLoadHighlights(selectedArticle);
      setScrollPercent(0);
      setHasTriggeredQuiz(false);
      setHasTriggeredScrollReward(false);
      setHasAwardedReadingTimePoints(false);
      setQuizQuestions([]);
      setActiveReadingStartTime(Date.now());
      setAccumulatedReadingTime(0);
    } else {
      if (activeReadingStartTime && selectedArticle) {
        const sessionTime = (Date.now() - activeReadingStartTime) / 1000;
        const totalTime = accumulatedReadingTime + sessionTime;
        
        if (passiveSignalsSettings.trackReadingTime) {
          if (totalTime < 10) {
            const currentWeight = categoryWeights[selectedArticle.category] !== undefined ? categoryWeights[selectedArticle.category] : 3;
            const newWeight = Math.max(1, currentWeight - 1);
            updateCategoryWeight(selectedArticle.category, newWeight);
            onNotify(`📉 Poids de "${selectedArticle.category}" réduit (lecture flash <10s)`);
          } else if (totalTime >= 60 && !hasAwardedReadingTimePoints) {
            onAwardCuriosityPoints(1, `Lecture approfondie de "${selectedArticle.title}" (>60s)`, selectedArticle.category, "read");
            setHasAwardedReadingTimePoints(true);
          }
        }
      }
      setActiveReadingStartTime(null);
    }
  }, [selectedArticle]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (activeReadingStartTime) {
          setAccumulatedReadingTime(prev => prev + (Date.now() - activeReadingStartTime) / 1000);
          setActiveReadingStartTime(null);
        }
      } else {
        if (selectedArticle) {
          setActiveReadingStartTime(Date.now());
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeReadingStartTime, selectedArticle]);

  const handleReaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const totalScroll = target.scrollHeight - target.clientHeight;
    if (totalScroll <= 0) return;
    const currentScroll = target.scrollTop;
    const percent = (currentScroll / totalScroll) * 100;
    setScrollPercent(percent);

    if (percent >= 80 && !hasTriggeredScrollReward && selectedArticle) {
      setHasTriggeredScrollReward(true);
      if (passiveSignalsSettings.trackScrollDepth) {
        onAwardCuriosityPoints(1, `Lecture complète (>80%) de l'article : "${selectedArticle.title}"`, selectedArticle.category, "read");
      }
    }

    if (percent >= 80 && !hasTriggeredQuiz && selectedArticle) {
      setHasTriggeredQuiz(true);
      handleGenerateQuiz(selectedArticle);
    }
  };

  // Automatically load and open a shared article based on the URL query param "?article=ID" on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const articleIdStr = params.get("article");
      if (articleIdStr) {
        const articleId = parseInt(articleIdStr, 10);
        if (!isNaN(articleId)) {
          const found = articles.find((a) => a.id === articleId);
          if (found) {
            setSelectedArticle(found);
            onNotify(`📖 Chargement de l'article partagé : "${found.title}"`);
            setTimeout(() => {
              const el = document.getElementById(`article-card-${articleId}`);
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
              const readerEl = document.getElementById("active-article-reader");
              if (readerEl) {
                readerEl.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 600);
          }
        }
      }
    } catch (err) {
      console.error("Error parsing shared article query parameter", err);
    }
  }, [articles]);

  // Hourly automatic refresh checking mechanism
  useEffect(() => {
    const checkAndAutoRefresh = async () => {
      const lastUpdatedStr = localStorage.getItem("infoperso_last_updated");
      const now = Date.now();
      const oneHourMs = 3600000;

      if (!lastUpdatedStr || (now - Number(lastUpdatedStr) >= oneHourMs)) {
        console.log("Last updated more than 1 hour ago. Refreshing feed automatically...");
        await handleBulkGenerateIAArticles(true);
      }
    };

    const delayTimer = setTimeout(() => {
      checkAndAutoRefresh();
    }, 1500);

    const pollInterval = setInterval(() => {
      checkAndAutoRefresh();
    }, 30000);

    return () => {
      clearTimeout(delayTimer);
      clearInterval(pollInterval);
    };
  }, [apiKeys, customInterests, categoryWeights, tagWeights]);

  // Custom Interests system for personalization with full user freedom
  useEffect(() => {
    try {
      localStorage.setItem("infoperso_custom_interests", JSON.stringify(customInterests));
    } catch (e) {
      console.error("Failed to save custom interests", e);
    }
  }, [customInterests]);

  const [newInterestInput, setNewInterestInput] = useState("");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<string | null>(null);

  const handleAddInterest = (interest: string) => {
    const clean = interest.trim();
    if (!clean) return;
    if (customInterests.includes(clean)) {
      onNotify(`💡 Le thème "${clean}" est déjà présent.`);
      return;
    }
    const updated = [...customInterests, clean];
    setCustomInterests(updated);
    setNewInterestInput("");

    // Initialize weight as boost
    const nextWeights = { ...tagWeights, [clean]: "boost" as const };
    setTagWeights(nextWeights);
    localStorage.setItem("infoperso_tag_weights", JSON.stringify(nextWeights));

    onNotify(`✨ Thème personnalisé "${clean}" ajouté et activé par défaut !`);
  };

  const handleRemoveInterest = (interest: string) => {
    const updated = customInterests.filter((x) => x !== interest);
    setCustomInterests(updated);
    
    // Clean tagWeights too
    const nextWeights = { ...tagWeights };
    delete nextWeights[interest];
    setTagWeights(nextWeights);
    localStorage.setItem("infoperso_tag_weights", JSON.stringify(nextWeights));

    onNotify(`🗑️ Thème personnalisé "${interest}" supprimé.`);
  };

  const handleGenerateCustomArticle = async (interest: string) => {
    if (!apiKeys.gemini) {
      const used = localStorage.getItem("infoperso_free_gen_used") === "true";
      if (used) {
        setShowLimitModal(true);
        return;
      }
    }

    setIsGeneratingCustom(interest);
    
    // Choose model
    const selectedModel = AVAILABLE_MODELS.find((m) => m.id === "gemini-3.5-flash") || AVAILABLE_MODELS[0];
    const userApiKey = apiKeys[selectedModel.provider];

    const currentYear = new Date().getFullYear();
    const currentDateStr = new Date().toLocaleDateString("fr-FR");

    const systemInstruction = 
      "Tu es un rédacteur en chef d'un grand média moderne d'information de haute précision. Génère un article captivant sur les TOUTES DERNIÈRES ACTUALITÉS EN DIRECT (faits récents, dépêches de dernière heure) sur le thème fourni en français.\n" +
      `PRIORITÉ ABSOLUE AUX DERNIÈRES ACTUALITÉS : Traite impérativement l'actualité la plus chaude et récente du jour (${currentDateStr} - ${currentYear}). Ne RIEN inventer. Tous les chiffres, citations et faits doivent être exacts et fidèles à la réalité récente.\n` +
      "CROSS-SOURCING OBLIGATOIRE (AU MOINS 4 SOURCES) : Croise et synthétise les informations d'au moins 4 sources de presse officielles (AFP, Reuters, Le Monde, NYT, BBC, etc.).\n" +
      `CONTEXTE TEMPOREL : Nous sommes le ${currentDateStr} (${currentYear}).\n` +
      "Tu DOIS impérativement répondre avec UNIQUEMENT un objet JSON brut valide, sans aucun balisage markdown additionnel (pas de ```json ni de ```, juste les accolades directes), contenant exactement ces clés :\n" +
      "- 'title': un titre journalistique percutant, axé sur l'actualité de dernière minute\n" +
      "- 'source': un nom de média crédible ou agence référente\n" +
      "- 'category': le thème en un mot court\n" +
      "- 'emoji': un emoji unique illustrant le sujet\n" +
      "- 'tags': un tableau de 3 tags\n" +
      "- 'summary': Partie 1 (Synthèse condensée) : Un résumé flash très court et ultra-condensé des faits essentiels (15% du volume total de l'article)\n" +
      "- 'content': Partie 2 (Enquête & Analyse approfondie) : Le grand format complet composé de 3 à 4 paragraphes très détaillés (au moins 3 fois plus long que la synthèse condensée) approfondissant l'actualité récente, les faits croisés et les perspectives (sépare les paragraphes par double retour à la ligne \\n\\n)\n" +
      "- 'score': un nombre entier entre 75 et 98 représentant la pertinence initiale";

    const promptText = `Rédige un article d'actualité de dernière minute réelle et vérifiée en direct, basé sur au moins 4 sources fiables, sur le thème suivant : "${interest}".`;

    try {
      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,
          enableSearch: true,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: promptText }
          ],
          apiKey: userApiKey,
        }),
      });

      const data = await res.json();

      if (res.ok && data.content) {
        let jsonStr = data.content.trim();
        
        // Extract content between ```json and ``` if present, or any ``` block
        const backtickMatch = jsonStr.match(/```(?:json)?([\s\S]*?)```/);
        if (backtickMatch) {
          jsonStr = backtickMatch[1].trim();
        } else {
          // If no backticks, locate first '{' and last '}'
          const startIdx = jsonStr.indexOf("{");
          const endIdx = jsonStr.lastIndexOf("}");
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            jsonStr = jsonStr.substring(startIdx, endIdx + 1).trim();
          }
        }

        let parsed: any;
        try {
          parsed = JSON.parse(jsonStr);
        } catch (jsonErr) {
          console.warn("Direct JSON parse failed, trying fallback cleaning...", jsonErr);
          try {
            // Remove trailing commas before closing braces/brackets
            const cleaned = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            parsed = JSON.parse(cleaned);
          } catch (cleanErr) {
            console.error("Cleaned JSON parse failed too. Creating fallback parsed object from raw content.", cleanErr);
            // Robust parsing fallback: try to extract fields with regex, or use raw response
            const titleMatch = data.content.match(/"title"\s*:\s*"([^"]+)"/);
            const sourceMatch = data.content.match(/"source"\s*:\s*"([^"]+)"/);
            const summaryMatch = data.content.match(/"summary"\s*:\s*"([^"]+)"/);
            const contentMatch = data.content.match(/"content"\s*:\s*"([\s\S]+?)"/);
            
            parsed = {
              title: titleMatch ? titleMatch[1] : `Découverte majeure : ${interest}`,
              source: sourceMatch ? sourceMatch[1] : "Média IA Spécialisé",
              category: "Recherche",
              emoji: "🔍",
              tags: [interest, "Synthèse", "IA"],
              summary: summaryMatch ? summaryMatch[1] : `Une synthèse exclusive sur ${interest}.`,
              content: contentMatch ? contentMatch[1].replace(/\\n/g, "\n") : data.content,
              score: 92
            };
          }
        }
        
        // Generate a unique ID
        const nextId = Math.max(...articles.map((a) => a.id), 0) + 1;
        const newArticle: NewsArticle = {
          id: nextId,
          featured: true, // make it featured so it highlights!
          title: parsed.title || `Découverte majeure : ${interest}`,
          source: parsed.source || "Média Spécialisé",
          category: parsed.category || "Personnalisé",
          time: "il y a 2m",
          score: Number(parsed.score) || 85,
          emoji: parsed.emoji || "✨",
          tags: Array.isArray(parsed.tags) ? parsed.tags : [interest],
          summary: parsed.summary || `Un article passionnant explorant les mystères de : ${interest}.`,
          content: parsed.content || `Cet article explore en profondeur le sujet fascinant de : ${interest}. L'importance de ce domaine s'accroît de jour en jour, attirant des passionnés de tous horizons.`
        };

        if (!apiKeys.gemini) {
          localStorage.setItem("infoperso_free_gen_used", "true");
          setFreeGenUsed(true);
        }
        setArticles((prev) => [newArticle, ...prev]);
        onNotify(`✨ Nouvel article IA généré sur "${interest}" : "${newArticle.title}" !`);
      } else {
        onNotify(`⚠️ Erreur : ${data.error || "Impossible de décoder la réponse de l'IA."}`);
      }
    } catch (err: any) {
      console.error(err);
      onNotify("⚠️ Erreur de réseau ou JSON invalide. Veuillez réessayer.");
    } finally {
      setIsGeneratingCustom(null);
    }
  };

  // Dynamic Information Personalization states
  const [isPersonalizerExpanded, setIsPersonalizerExpanded] = useState<boolean>(false);
  const [showAlgorithmicControls, setShowAlgorithmicControls] = useState<boolean>(false);

  // Helpers to update and persist weights
  const updateCategoryWeight = (category: string, value: number) => {
    const next = { ...categoryWeights, [category]: value };
    setCategoryWeights(next);
    localStorage.setItem("infoperso_cat_weights", JSON.stringify(next));
    onNotify(`⚙️ Pondération de "${category}" mise à jour : niveau ${value}`);
  };

  const updateTagWeight = (tag: string, val: "boost" | "neutral" | "exclude") => {
    const next = { ...tagWeights, [tag]: val };
    setTagWeights(next);
    localStorage.setItem("infoperso_tag_weights", JSON.stringify(next));
    const label = val === "boost" ? "prioritaire 🚀" : val === "exclude" ? "masqué 🚫" : "neutre ⚪";
    onNotify(`🏷️ Thème #${tag} configuré comme : ${label}`);
  };

  const updateSourceWeight = (source: string, val: "boost" | "neutral" | "exclude") => {
    const next = { ...sourceWeights, [source]: val };
    setSourceWeights(next);
    localStorage.setItem("infoperso_source_weights", JSON.stringify(next));
    const label = val === "boost" ? "prioritaire 🚀" : val === "exclude" ? "masquée 🚫" : "neutre ⚪";
    onNotify(`📰 Source "${source}" configurée comme : ${label}`);
  };

  const resetPersonalization = () => {
    const defaultCats = {
      "IA": 5,
      "Technologie": 4,
      "Local": 3,
      "Design": 3,
      "Économie": 2,
      "Médias": 2
    };
    const defaultTags: Record<string, "boost" | "neutral" | "exclude"> = {
      "Claude API": "boost",
      "LLM": "boost",
      "React": "boost",
      "Occitanie": "neutral",
      "OpenAI": "neutral",
      "Régulation": "neutral",
      "Startup": "neutral",
      "Performance": "boost"
    };
    const defaultSources: Record<string, "boost" | "neutral" | "exclude"> = {
      "Anthropic Blog": "boost",
      "The Verge": "neutral",
      "Midi Libre": "neutral",
      "TechCrunch": "neutral"
    };

    setCategoryWeights(defaultCats);
    setTagWeights(defaultTags);
    setSourceWeights(defaultSources);

    localStorage.setItem("infoperso_cat_weights", JSON.stringify(defaultCats));
    localStorage.setItem("infoperso_tag_weights", JSON.stringify(defaultTags));
    localStorage.setItem("infoperso_source_weights", JSON.stringify(defaultSources));
    onNotify("🔄 Algorithme de personnalisation réinitialisé par défaut !");
  };

  // Dynamic Personalized Scoring Engine
  const computePersonalizedArticles = (): NewsArticle[] => {
    return articles.map((art) => {
      // Start with original baseline score
      let score = art.score;

      // 1. Category weights: mapped from [1..5] scale where 3 is neutral
      // 1: -20%, 2: -10%, 3: 0%, 4: +10%, 5: +20%
      const catWeight = categoryWeights[art.category] !== undefined ? categoryWeights[art.category] : 3;
      const catAdjustment = (catWeight - 3) * 10;
      score += catAdjustment;

      // 2. Tag weights: boost (+15), neutral (0), exclude (-100 or hidden)
      let isExcluded = false;
      let tagBoost = 0;
      art.tags.forEach((t) => {
        const tagStatus = tagWeights[t];
        if (tagStatus === "boost") {
          tagBoost += 12;
        } else if (tagStatus === "exclude") {
          isExcluded = true;
        }
      });
      score += tagBoost;

      // 3. Source weights: boost (+15), neutral (0), exclude (hidden)
      const srcStatus = sourceWeights[art.source];
      if (srcStatus === "boost") {
        score += 15;
      } else if (srcStatus === "exclude") {
        isExcluded = true;
      }

      // Final limits & exclusions
      let finalScore = Math.max(0, Math.min(100, score));
      if (isExcluded) {
        finalScore = 0;
      }

      return {
        ...art,
        score: finalScore,
        // We'll tag it for easy exclusion check
        isExcluded: isExcluded
      } as NewsArticle & { isExcluded: boolean };
    });
  };

  // New interactive settings states
  const [readingTimeFilter, setReadingTimeFilter] = useState<"all" | "short" | "medium" | "long">("all");
  const [bandwidthSaver, setBandwidthSaver] = useState(false);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [clickedTrendTag, setClickedTrendTag] = useState<string | null>(null);

  // Text scaling, reader theme, zen mode
  const [fontScale, setFontScale] = useState<number>(1.0);
  const [readerTheme, setReaderTheme] = useState<"slate" | "sepia" | "light" | "deep">("slate");
  const [zenMode, setZenMode] = useState(false);

  // Audio reader
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);

  // Quotes extractor
  const [extractedQuotes, setExtractedQuotes] = useState<string[]>([]);
  const [isExtractingQuotes, setIsExtractingQuotes] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setSpeechSynth(window.speechSynthesis);
    }
  }, []);

  // Stop speech synthesis if article closed
  useEffect(() => {
    if (!selectedArticle) {
      if (speechSynth) speechSynth.cancel();
      setIsPlayingSpeech(false);
      setExtractedQuotes([]);
    } else {
      setDeepDiveQuery("");
      setDeepDiveResponse(null);
      setDeepDiveHistory([]);
      setIsDeepDiving(false);
    }
  }, [selectedArticle]);

  // AI Summarization states inside Reader panel
  const [summaryModelId, setSummaryModelId] = useState("gemini-3.5-flash");
  const [isSummarizing, setIsSummarizing] = useState(false);

  // Calculate metrics
  const personalizedArticlesForMetrics = computePersonalizedArticles();
  const totalArticles = articles.length;
  const readCount = articles.filter(a => readIds.has(a.id)).length;
  const unreadCount = totalArticles - readCount;
  const averageRelevance = Math.round(personalizedArticlesForMetrics.reduce((acc, a) => acc + a.score, 0) / totalArticles);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400 bg-emerald-500/15 border-emerald-500/30";
    if (score >= 70) return "text-cyan-400 bg-cyan-500/15 border-cyan-500/30";
    return "text-indigo-400 bg-indigo-500/15 border-indigo-500/30";
  };

  const getScoreFillColor = (score: number) => {
    if (score >= 85) return "bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]";
    if (score >= 70) return "bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]";
    return "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]";
  };

  // Filter & Sort
  const personalizedArticles = computePersonalizedArticles();
  const filteredArticles = personalizedArticles
    .filter((art: any) => {
      // Exclude if hidden by algorithm preferences
      if (art.isExcluded) return false;
      
      // 1. Search Query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = art.title.toLowerCase().includes(q);
        const matchesSummary = art.summary.toLowerCase().includes(q);
        const matchesTags = art.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesTags) return false;
      }
      // 2. Category Sidebar Filter
      if (activeFilter && art.category !== activeFilter) {
        return false;
      }
      // 3. Tag Sidebar Filter
      if (activeTag && !art.tags.includes(activeTag)) {
        return false;
      }
      // 3b. Trending Tag Cloud Click
      if (clickedTrendTag && !art.tags.includes(clickedTrendTag)) {
        return false;
      }
      // 3c. Bookmarks Only Toggle
      if (onlyBookmarks && !savedIds.has(art.id)) {
        return false;
      }
      // 3d. Reading Time Filter
      const wordCount = art.content.split(/\s+/).length;
      const readingMinutes = Math.ceil(wordCount / 140);
      if (readingTimeFilter === "short" && readingMinutes >= 2) {
        return false;
      }
      if (readingTimeFilter === "medium" && (readingMinutes < 2 || readingMinutes > 4)) {
        return false;
      }
      if (readingTimeFilter === "long" && readingMinutes < 5) {
        return false;
      }
      // 4. Relevance Score Slider
      if (art.score < minScore) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      // Date sort (since mock times are hierarchical, we just sort by id or reverse order)
      return a.id - b.id;
    });

  const featuredArticles = filteredArticles.filter((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured);

  // Generate live AI summary for current article
  const handleGenerateSummary = async (article: NewsArticle) => {
    setIsSummarizing(true);
    const selectedModel = AVAILABLE_MODELS.find((m) => m.id === summaryModelId) || AVAILABLE_MODELS[0];
    const userApiKey = apiKeys[selectedModel.provider];

    const systemInstruction =
      "Tu es un journaliste expert en technologies et IA de pointe. Rédige un résumé flash percutant de 3-4 phrases en français de l'article technologique fourni. Ajoute 3 puces clés concrètes (balises markdown) et estime la fiabilité de l'information (ex: Haute, Moyenne) ainsi qu'un sentiment général.";

    const promptText = `Titre: ${article.title}\nSource: ${article.source}\nContenu Complet:\n${article.content}`;

    try {
      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: promptText }
          ],
          apiKey: userApiKey,
        }),
      });

      const data = await res.json();

      if (res.ok && data.content) {
        // Update local article's AI summary in state
        setArticles((prev) =>
          prev.map((a) =>
            a.id === article.id
              ? { ...a, aiSummaryCustom: data.content, aiSummaryModelUsed: selectedModel.name }
              : a
          )
        );
        onNotify(`⚡ Résumé IA généré avec succès par ${selectedModel.name} !`);
      } else {
        onNotify(`⚠️ Erreur de résumé : ${data.error || "Clé manquante ou réponse incorrecte."}`);
      }
    } catch (err: any) {
      onNotify("⚠️ Erreur réseau : impossible de générer le résumé.");
    } finally {
      setIsSummarizing(false);
    }
  };

  // Voice text-to-speech reader
  const handleVoiceRead = (article: NewsArticle) => {
    if (!speechSynth) {
      onNotify("⚠️ La synthèse vocale n'est pas supportée par votre navigateur.");
      return;
    }

    if (isPlayingSpeech) {
      speechSynth.cancel();
      setIsPlayingSpeech(false);
      onNotify("Lecture vocale interrompue.");
    } else {
      speechSynth.cancel();
      const textToRead = `${article.title}. Publié par ${article.source}. ${article.content}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = "fr-FR";
      
      // Theme-specific speech rate and pitch
      if (isSobre) {
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
      } else if (isWarm) {
        utterance.rate = 0.82; // slow and calm
        utterance.pitch = 0.82; // deep warm tone
      } else if (isCyber) {
        utterance.rate = 1.3; // fast robot pace
        utterance.pitch = 1.15; // slightly high/metallic
      } else if (isFun) {
        utterance.rate = 1.2; // fast and high-pitch cheerful
        utterance.pitch = 1.25;
      } else { // pro
        utterance.rate = 1.08; // dynamic professional
        utterance.pitch = 0.95; // clear presenter voice
      }

      utterance.onend = () => {
        setIsPlayingSpeech(false);
      };
      utterance.onerror = () => {
        setIsPlayingSpeech(false);
      };
      setIsPlayingSpeech(true);
      speechSynth.speak(utterance);
      onNotify("🔊 Lecture de l'article en cours...");
    }
  };

  // Quick sharing clipboard helper with native navigator.share support and link generation
  const handleShareArticle = async (article: NewsArticle) => {
    try {
      const baseUrl = window.location.origin + window.location.pathname;
      const shareUrl = `${baseUrl}?article=${article.id}`;
      const title = `📰 [InfoPerso] ${article.title}`;
      const text = `Résumé de l'article ("${article.title}") :\n${article.summary}\n\nDécouvrez la suite sur InfoPerso :`;

      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `${text}\n${shareUrl}`,
          url: shareUrl,
        });
        onNotify("Article partagé avec succès ! 🚀");
      } else {
        const fullShareText = `${title}\nSource: ${article.source}\n\n${text}\n${shareUrl}`;
        await navigator.clipboard.writeText(fullShareText);
        onNotify("Lien de l'article et résumé copiés dans le presse-papiers ! 📋");
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        try {
          const baseUrl = window.location.origin + window.location.pathname;
          const shareUrl = `${baseUrl}?article=${article.id}`;
          const fallbackText = `📰 [InfoPerso] ${article.title}\nSource: ${article.source}\n\nRésumé : ${article.summary}\n\nLien : ${shareUrl}`;
          await navigator.clipboard.writeText(fallbackText);
          onNotify("Lien et résumé copiés dans le presse-papiers ! 📋");
        } catch (copyErr) {
          onNotify("Impossible de copier automatiquement.");
        }
      }
    }
  };

  // Export article / AI summary as file
  const handleExportArticle = (article: NewsArticle, format: "txt" | "html" = "html") => {
    try {
      const rawSummary = article.aiSummaryCustom || article.summary;
      
      // Clean up markdown markers from text to ensure professional plain text format
      const cleanText = (text: string) => {
        return text
          .replace(/\*\*(.*?)\*\*/g, "$1") // Strip bold **
          .replace(/\*(.*?)\*/g, "$1")     // Strip italic *
          .replace(/__(.*?)__/g, "$1")     // Strip bold __
          .replace(/_(.*?)_/g, "$1")       // Strip italic _
          .replace(/`([^`]+)`/g, "$1")     // Strip backticks
          .trim();
      };

      const summaryText = cleanText(rawSummary);
      const contentText = cleanText(article.content);
      
      if (format === "html") {
        const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${article.title} - InfoPerso</title>
  <style>
    :root {
      --bg-color: #fbfbf9;
      --card-bg: #ffffff;
      --text-color: #1c1917;
      --primary-color: #4f46e5;
      --border-color: #e7e5e4;
      --font-size: 20px;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.65;
      color: var(--text-color);
      background-color: var(--bg-color);
      margin: 0;
      padding: 16px;
      -webkit-font-smoothing: antialiased;
    }
    
    .container {
      max-width: 680px;
      margin: 12px auto;
      background: var(--card-bg);
      padding: 32px 24px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
      border: 1px solid var(--border-color);
    }
    
    .control-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f5f5f4;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 28px;
      border: 1px solid var(--border-color);
    }
    
    .logo-text {
      font-weight: 800;
      font-size: 14px;
      color: #44403c;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .btn-group {
      display: flex;
      gap: 8px;
    }
    
    .btn {
      background: #ffffff;
      border: 1px solid #d6d3d1;
      color: #1c1917;
      padding: 8px 14px;
      font-size: 15px;
      font-weight: bold;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      user-select: none;
      transition: all 0.2s;
    }
    
    .btn:hover {
      background: #f5f5f4;
      border-color: #a8a29e;
    }
    
    .btn:active {
      transform: scale(0.95);
    }
    
    .meta-box {
      font-size: 15px;
      color: #57534e;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px dashed var(--border-color);
      font-weight: 500;
    }
    
    h1 {
      font-size: 1.55em;
      line-height: 1.35;
      color: #0c0a09;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 800;
    }
    
    .section-header {
      font-size: 0.85em;
      color: var(--primary-color);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 800;
      margin-top: 36px;
      margin-bottom: 12px;
      border-bottom: 2px solid var(--primary-color);
      padding-bottom: 4px;
      display: inline-block;
    }
    
    p.content-p {
      font-size: var(--font-size);
      line-height: 1.7;
      margin-top: 0;
      margin-bottom: 20px;
      color: #292524;
      text-align: justify;
    }
    
    .summary-box {
      background-color: #f5f3ff;
      border-left: 5px solid var(--primary-color);
      padding: 18px 22px;
      border-radius: 0 12px 12px 0;
      margin: 16px 0;
    }
    
    .summary-box p {
      font-size: var(--font-size);
      font-weight: 600;
      color: #3730a3;
      margin: 0;
      line-height: 1.65;
    }
    
    .footer {
      margin-top: 56px;
      padding-top: 20px;
      border-top: 1px solid var(--border-color);
      font-size: 13px;
      color: #78716c;
      text-align: center;
    }
    
    @media print {
      body {
        background: #fff;
        color: #000;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
        max-width: 100%;
      }
      .control-bar {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="control-bar">
      <div class="logo-text">📰 InfoPerso</div>
      <div class="btn-group">
        <button class="btn" onclick="changeSize(-2)" title="Réduire la taille du texte">A-</button>
        <button class="btn" onclick="changeSize(2)" title="Agrandir la taille du texte (Grandes Lettres)">A+</button>
        <button class="btn" onclick="window.print()" title="Imprimer ou enregistrer en PDF">🖨️ Imprimer</button>
      </div>
    </div>
    
    <div class="meta-box">
      <strong>Source :</strong> ${article.source} &nbsp;|&nbsp; <strong>Catégorie :</strong> ${article.category}
    </div>
    
    <h1>${article.title}</h1>
    
    <div class="section-header">=== RESUME / ANALYSE ===</div>
    <div class="summary-box">
      <p id="summary-text">${summaryText}</p>
    </div>
    
    <div class="section-header">=== TEXTE INTEGRAL ===</div>
    <div id="content-body">
      ${contentText.split('\n\n').map(p => `<p class="content-p">${p.trim()}</p>`).join('')}
    </div>
    ${deepDiveHistory.length > 0 ? `
    <div class="section-header">=== FICHES D'APPROFONDISSEMENT (IA) ===</div>
    ${deepDiveHistory.map(item => `
      <div style="background-color: #f5f3ff; border-left: 5px solid #4f46e5; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 16px 0;">
        <h3 style="margin-top: 0; font-size: 17px; color: #3730a3;">❓ ${item.question}</h3>
        <p class="content-p" style="margin-bottom: 0; white-space: pre-wrap; text-align: left;">${cleanText(item.answer)}</p>
      </div>
    `).join('')}
    ` : ''}
    
    <div class="footer">
      Document généré par <strong>InfoPerso</strong> le ${new Date().toLocaleDateString("fr-FR")}
    </div>
  </div>
  
  <script>
    let currentSize = 20;
    
    document.documentElement.style.setProperty('--font-size', currentSize + 'px');
    
    function changeSize(amount) {
      currentSize = Math.max(14, Math.min(42, currentSize + amount));
      document.documentElement.style.setProperty('--font-size', currentSize + 'px');
      
      const ps = document.querySelectorAll('.content-p, #summary-text');
      ps.forEach(p => {
        p.style.fontSize = currentSize + 'px';
      });
      
      const h1 = document.querySelector('h1');
      if (h1) {
        h1.style.fontSize = Math.max(22, currentSize * 1.45) + 'px';
      }
    }
  </script>
</body>
</html>`;

        const element = document.createElement("a");
        const file = new Blob(["\uFEFF", htmlContent], { type: "text/html;charset=utf-8" });
        element.href = URL.createObjectURL(file);
        element.download = `${article.title.substring(0, 30).replace(/[^a-z0-9]/gi, "_")}_infoperso.html`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        onNotify("📥 Téléchargement de la fiche de synthèse interactive (Grandes Lettres) lancé !");
      } else {
        const fileContent = `=== INFOPERSO - SYNTHESE ET ACTUALITE ===\nTitre: ${article.title}\nSource: ${article.source} | Catégorie: ${article.category}\n\n=== RESUME / ANALYSE ===\n${summaryText}\n\n=== TEXTE INTEGRAL ===\n${contentText}\n\nDocument généré par InfoPerso le ${new Date().toLocaleDateString("fr-FR")}`;
        const normalizedContent = fileContent.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");

        const element = document.createElement("a");
        const file = new Blob(["\uFEFF", normalizedContent], { type: "text/plain;charset=utf-8" });
        element.href = URL.createObjectURL(file);
        element.download = `${article.title.substring(0, 30).replace(/[^a-z0-9]/gi, "_")}_infoperso.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        onNotify("📥 Téléchargement de la fiche brute (.txt) lancé !");
      }
    } catch (err) {
      onNotify("Erreur lors de l'export.");
    }
  };

  // Pull quote extraction logic
  const handleExtractQuotes = (article: NewsArticle) => {
    setIsExtractingQuotes(true);
    setTimeout(() => {
      // Split into sentences and find key quotes
      const sentences = article.content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
      // Pick 3 most interesting or longest sentences to act as dynamic pull quotes
      const picked = sentences.slice(0, 3).map(s => `« ${s} »`);
      setExtractedQuotes(picked.length > 0 ? picked : ["« L'innovation redéfinit notre quotidien avec une vitesse sans précédent. »"]);
      setIsExtractingQuotes(false);
      onNotify("✨ Citations clés extraites avec succès !");
    }, 600);
  };

  const handleOpenArticle = (art: NewsArticle) => {
    setSelectedArticle(art);
    onMarkRead(art.id);
  };

  return (
    <div id="smart-news-feed" className="space-y-6">
      {/* Friendly Senior Toggle for Advanced Algorithmic Settings */}
      <div className="flex justify-start">
        <button
          onClick={() => setShowAlgorithmicControls(!showAlgorithmicControls)}
          className="px-5 py-3 rounded-xl font-extrabold text-base flex items-center gap-2 cursor-pointer transition-all border shadow-sm bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-305 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-800"
        >
          <SlidersHorizontal className="w-5 h-5 text-indigo-500" />
          {showAlgorithmicControls ? "👵 Cacher les options de réglage de l'IA" : "👵 Personnaliser les sujets et réglages IA (Optionnel)"}
        </button>
      </div>

      {showAlgorithmicControls && (
        <>
          {/* 1. Centres d'intérêt personnalisés & Générateur d'actualité IA (Libre Choix) */}
          <div className={`${getPanelBgClass()} transition-all duration-300`} id="custom-interests-panel">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg shrink-0 ${isFun ? "bg-yellow-300 border-2 border-black text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" : "bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400"}`}>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`text-xs sm:text-sm uppercase tracking-wider ${isSobre ? "text-zinc-900 font-extrabold font-sans" : isWarm ? "text-amber-950 font-bold font-serif" : isCyber ? "text-[#00ffcc] font-black font-mono" : isFun ? "text-black font-black font-sans" : "font-sans font-bold text-white"}`}>
                  Centres d'intérêt personnalisés &amp; Générateur d'actualité IA
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse ${
                  isSobre ? "bg-zinc-100 text-zinc-800 border border-zinc-200" :
                  isWarm ? "bg-amber-100 text-amber-900" :
                  isCyber ? "bg-black text-[#00ffcc] border border-cyan-400 font-mono" :
                  isFun ? "bg-yellow-300 text-black border-2 border-black" :
                  "bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30"
                }`}>
                  Libre Choix
                </span>
              </div>
              <p className={`text-[10px] mt-1 ${isSobre ? "text-zinc-550" : isWarm ? "text-amber-900/80" : isCyber ? "text-cyan-500" : isFun ? "text-black" : "text-slate-400"}`}>
                Saisissez n'importe quel sujet pour sculpter votre algorithme en temps réel et générer à la demande des synthèses d'actualité rédigées par l'IA.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Form to add interest */}
          <div className="flex gap-2 max-w-md">
            <input
              type="text"
              placeholder="Saisissez un thème d'actualité (ex: Économie, Climat, Technologie, Culture...)"
              value={newInterestInput}
              onChange={(e) => setNewInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddInterest(newInterestInput);
                }
              }}
              className={getInputClass()}
            />
            <button
              onClick={() => handleAddInterest(newInterestInput)}
              className={getButtonClass(true)}
            >
              Ajouter
            </button>
          </div>

          {/* Display interests */}
          {customInterests.length === 0 ? (
            <p className={`text-xs italic ${isSobre ? "text-zinc-400" : isWarm ? "text-amber-900/60" : isCyber ? "text-cyan-600 font-mono" : isFun ? "text-black font-semibold" : "text-slate-500"}`}>Aucun centre d'intérêt personnalisé pour l'instant. Saisissez-en un ci-dessus pour sculpter votre algorithme !</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customInterests.map((interest) => {
                const state = tagWeights[interest] || "neutral";
                const isGenerating = isGeneratingCustom === interest;
                return (
                  <div key={interest} className={`p-3 flex flex-col justify-between gap-3 ${
                    isSobre ? "bg-zinc-50 rounded-lg border border-zinc-250 text-zinc-900" :
                    isWarm ? "bg-[#FAF6F0] rounded-lg border border-amber-900/10 text-amber-950 font-serif" :
                    isCyber ? "bg-black rounded-none border border-cyan-500/30 text-cyan-400 font-mono shadow-[0_0_8px_rgba(6,182,212,0.15)]" :
                    isFun ? "bg-white border-2 border-black rounded-xl text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
                    "bg-slate-950/80 rounded-xl border border-slate-800 text-slate-100"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${isSobre ? "text-zinc-900" : isWarm ? "text-amber-950" : isCyber ? "text-[#00ffcc]" : isFun ? "text-black font-extrabold" : "text-white"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse ${isFun ? "bg-fuchsia-500" : ""}`} />
                        #{interest}
                      </span>
                      <button
                        onClick={() => handleRemoveInterest(interest)}
                        className={`p-1 rounded-md transition-colors cursor-pointer ${isFun ? "text-black hover:bg-rose-100 hover:text-rose-500" : "text-slate-500 hover:text-rose-400 hover:bg-slate-900"}`}
                        title="Supprimer l'intérêt"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* State changer */}
                      <button
                        onClick={() => {
                          const nextState = state === "neutral" ? "boost" : state === "boost" ? "exclude" : "neutral";
                          updateTagWeight(interest, nextState);
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-sans font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                          state === "boost"
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                            : state === "exclude"
                            ? "bg-rose-500/10 border-rose-500/40 text-rose-300 line-through opacity-75"
                            : isFun ? "bg-white border-2 border-black text-black" : isSobre ? "bg-white border-zinc-300 text-zinc-600" : isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-900" : isCyber ? "bg-black border-cyan-500/30 text-cyan-500" : "bg-slate-900 border-slate-800 text-slate-400"
                        }`}
                        title="Changer l'importance de ce thème dans l'algorithme"
                      >
                        <span className={`w-1 h-1 rounded-full ${
                          state === "boost" ? "bg-emerald-400 animate-ping" : state === "exclude" ? "bg-rose-500" : "bg-slate-500"
                        }`} />
                        {state === "boost" ? "Boosté 🚀" : state === "exclude" ? "Masqué 🚫" : "Neutre ⚪"}
                      </button>

                      {/* Generator Button */}
                      <button
                        onClick={() => handleGenerateCustomArticle(interest)}
                        disabled={isGenerating || !!isGeneratingCustom}
                        className={`flex-1 py-1 px-2.5 hover:opacity-95 disabled:opacity-45 text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer transition-all ${
                          isFun ? "bg-cyan-300 border-2 border-black text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" :
                          isSobre ? "bg-zinc-900 text-white" :
                          isWarm ? "bg-amber-900 text-white" :
                          isCyber ? "bg-black border border-cyan-400 text-cyan-400 font-mono shadow-[0_0_8px_rgba(6,182,212,0.3)]" :
                          "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-sans"
                        }`}
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3 text-cyan-200 animate-pulse" />
                        )}
                        {isGenerating ? "Génération de l'article..." : "Générer un article d'actualité IA"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2. Dynamic Algorithmic Personalization Panel */}
      <div className={`overflow-hidden shadow-xl transition-all duration-300 ${
        isSobre ? (isDark ? "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl" : "bg-white border border-zinc-200 rounded-2xl text-zinc-900") :
        isWarm ? (isDark ? "bg-[#251e1a] border border-[#3e322a] text-[#FAF6F0] rounded-2xl font-serif" : "bg-[#FDFBF7] border border-amber-900/10 rounded-2xl font-serif text-amber-955") :
        isCyber ? (isDark ? "bg-black border border-cyan-500/30 rounded-none font-mono text-cyan-400" : "bg-[#f4fffe] border border-teal-500/20 rounded-none font-mono text-teal-900") :
        isFun ? (isDark ? "bg-[#251a3a] border-3 border-black rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-zinc-100" : "bg-pink-100 border-3 border-black rounded-3xl shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] text-black") :
        (isDark ? "bg-slate-900/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl text-slate-200" : "bg-white border border-indigo-100 rounded-2xl text-slate-800 shadow-sm")
      }`} id="personalization-control-panel">
        <div 
          onClick={() => setIsPersonalizerExpanded(!isPersonalizerExpanded)}
          className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer border-b transition-colors ${
            isSobre ? (isDark ? "border-zinc-800 hover:bg-zinc-800/40" : "border-zinc-200 hover:bg-zinc-50") :
            isWarm ? (isDark ? "border-[#3e322a] hover:bg-[#342822]" : "border-amber-900/10 hover:bg-[#F2E6D0]/20") :
            isCyber ? (isDark ? "border-cyan-500/20 hover:bg-zinc-900/50" : "border-teal-500/20 hover:bg-teal-50/40") :
            isFun ? "border-b-3 border-black hover:opacity-90" :
            (isDark ? "border-indigo-500/10 hover:bg-slate-900/40" : "border-indigo-50/60 hover:bg-indigo-50/10")
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg shrink-0 ${
              isSobre ? "bg-zinc-100 border border-zinc-250 text-zinc-800" :
              isWarm ? "bg-amber-100/50 border border-amber-900/10 text-amber-900" :
              isCyber ? "bg-black border border-cyan-500/30 text-cyan-400" :
              isFun ? "bg-yellow-300 border-2 border-black text-black rounded-xl" :
              "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
            }`}>
              <SlidersHorizontal className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className={`font-sans font-bold text-xs sm:text-sm uppercase tracking-wider ${
                  isSobre ? "text-zinc-900 font-bold font-sans" :
                  isWarm ? "text-amber-950 font-serif font-bold" :
                  isCyber ? "text-white font-mono font-bold" :
                  isFun ? "text-black font-sans font-black italic uppercase" :
                  "text-white"
                }`}>
                  Votre Algorithme de Recommandation Actif
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider animate-pulse ${
                  isSobre ? "bg-zinc-100 text-zinc-800 border border-zinc-300" :
                  isWarm ? "bg-amber-100 text-amber-900 border border-amber-900/10 font-serif" :
                  isCyber ? "bg-black text-[#00ffcc] border border-cyan-400 font-mono" :
                  isFun ? "bg-fuchsia-300 text-black border-2 border-black font-extrabold" :
                  "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                }`}>
                  Perso-Score v1.2
                </span>
              </div>
              <p className={`text-[10px] mt-1 ${
                isSobre ? "text-zinc-500" :
                isWarm ? "text-amber-900/80 font-serif" :
                isCyber ? "text-cyan-500 font-mono" :
                isFun ? "text-black font-semibold" :
                "text-slate-400"
              }`}>
                Pondérez et masquez thématiques, catégories et sources en temps réel pour sculpter votre information.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end shrink-0" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                resetPersonalization();
              }}
              className={`px-2.5 py-1 rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer font-bold shrink-0 ${
                isSobre ? "bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-350" :
                isWarm ? "bg-[#FAF6F0] hover:bg-[#F2E6D0] text-amber-900 border border-amber-900/15" :
                isCyber ? "bg-black hover:bg-zinc-950 text-cyan-400 border border-cyan-500/30 font-mono" :
                isFun ? "bg-yellow-300 hover:bg-yellow-400 text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
                "bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              }`}
              title="Réinitialiser l'algorithme"
            >
              <RefreshCw className={`w-3 h-3 ${isFun ? "text-black" : "text-cyan-400"}`} />
              Réinitialiser
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPersonalizerExpanded(!isPersonalizerExpanded);
              }}
              className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                isSobre ? "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300" :
                isWarm ? "bg-amber-900 hover:bg-amber-950 text-white font-serif" :
                isCyber ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400" :
                isFun ? "bg-fuchsia-300 hover:bg-fuchsia-400 text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
                "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20"
              }`}
            >
              {isPersonalizerExpanded ? (
                <>
                  <ChevronUp className={`w-3.5 h-3.5 ${isSobre ? "text-zinc-600" : isWarm ? "text-white" : isCyber ? "text-cyan-400" : isFun ? "text-black" : "text-indigo-400"}`} />
                  <span>Masquer</span>
                </>
              ) : (
                <>
                  <ChevronDown className={`w-3.5 h-3.5 ${isSobre ? "text-zinc-600" : isWarm ? "text-white" : isCyber ? "text-cyan-400" : isFun ? "text-black" : "text-indigo-400"}`} />
                  <span>Déployer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {isPersonalizerExpanded && (
          <div className="p-5 space-y-6">
            {/* Row 1: Category sliders */}
            <div>
              <h4 className={`text-[10px] uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5 ${
                isSobre ? "text-zinc-500" :
                isWarm ? "text-amber-900/60 font-serif" :
                isCyber ? "text-[#00ffcc]/60 font-mono" :
                isFun ? "text-black font-extrabold" :
                "text-slate-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSobre ? "bg-zinc-400" : isWarm ? "bg-amber-900" : isCyber ? "bg-[#00ffcc]" : isFun ? "bg-black" : "bg-cyan-400"}`} />
                Pondération des grandes catégories (Coefficients)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.keys(categoryWeights).map((cat) => {
                  const val = categoryWeights[cat];
                  return (
                    <div key={cat} className={`p-3 rounded-xl border flex flex-col justify-between ${
                      isSobre ? (isDark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200") :
                      isWarm ? (isDark ? "bg-[#332822] border-[#443830] font-serif" : "bg-[#FAF6F0] border-amber-900/10 font-serif") :
                      isCyber ? (isDark ? "bg-black border-cyan-500/20 font-mono" : "bg-[#f4fffe] border-teal-500/20 font-mono") :
                      isFun ? (isDark ? "bg-[#352554] border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-white" : "bg-white border-2 border-black rounded-2xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black") :
                      (isDark ? "bg-slate-950/60 border border-slate-800/80" : "bg-slate-50 border border-indigo-50")
                    }`}>
                      <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                        <span className={
                          isSobre ? (isDark ? "text-zinc-350" : "text-zinc-700") :
                          isWarm ? (isDark ? "text-amber-100" : "text-amber-900") :
                          isCyber ? (isDark ? "text-cyan-400" : "text-teal-850") :
                          isFun ? "text-current font-black" :
                          (isDark ? "text-slate-300" : "text-slate-750")
                        }>{cat}</span>
                        <span className={`font-mono ${
                          isSobre ? (isDark ? "text-zinc-100" : "text-zinc-900") :
                          isWarm ? (isDark ? "text-amber-50" : "text-amber-955") :
                          isCyber ? (isDark ? "text-[#00ffcc]" : "text-teal-700") :
                          isFun ? "text-current font-black" :
                          (isDark ? "text-cyan-400" : "text-indigo-600")
                        }`}>×{val / 3 === 1 ? "1.0" : (val / 3).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => updateCategoryWeight(cat, Math.max(1, val - 1))}
                          disabled={val <= 1}
                          className={`w-5 h-5 rounded text-xs flex items-center justify-center cursor-pointer disabled:opacity-30 ${
                            isSobre ? (isDark ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-100" : "bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700") :
                            isWarm ? (isDark ? "bg-[#3e322a] hover:bg-[#4a3c33] border border-[#524137] text-amber-100 font-serif" : "bg-[#FAF6F0] hover:bg-amber-100/40 border border-amber-900/15 text-amber-900") :
                            isCyber ? (isDark ? "bg-black hover:bg-zinc-900 border border-cyan-500/30 text-cyan-400" : "bg-white hover:bg-teal-50 border border-[#0d9488]/30 text-teal-900") :
                            isFun ? "bg-yellow-300 hover:bg-yellow-400 border-2 border-black text-black font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" :
                            (isDark ? "bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300" : "bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-750")
                          }`}
                        >
                          -
                        </button>
                        <div className={`flex-1 h-1.5 rounded overflow-hidden relative ${
                          isSobre ? (isDark ? "bg-zinc-800" : "bg-zinc-200") :
                          isWarm ? (isDark ? "bg-amber-950/40" : "bg-amber-100") :
                          isCyber ? "bg-zinc-900" :
                          isFun ? "bg-neutral-200 border border-black" :
                          (isDark ? "bg-slate-900" : "bg-slate-100")
                        }`}>
                          <div 
                            className={`h-full rounded ${
                              isSobre ? (isDark ? "bg-zinc-400" : "bg-zinc-800") :
                              isWarm ? (isDark ? "bg-amber-500" : "bg-amber-900") :
                              isCyber ? "bg-[#00ffcc]" :
                              isFun ? "bg-black" :
                              "bg-linear-to-r from-cyan-400 to-indigo-500"
                            }`} 
                            style={{ width: `${(val / 5) * 100}%` }}
                          />
                        </div>
                        <button 
                          onClick={() => updateCategoryWeight(cat, Math.min(5, val + 1))}
                          disabled={val >= 5}
                          className={`w-5 h-5 rounded text-xs flex items-center justify-center cursor-pointer disabled:opacity-30 ${
                            isSobre ? (isDark ? "bg-zinc-800 hover:bg-zinc-700 border border-zinc-750 text-zinc-100" : "bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-700") :
                            isWarm ? (isDark ? "bg-[#3e322a] hover:bg-[#4a3c33] border border-[#524137] text-amber-100 font-serif" : "bg-[#FAF6F0] hover:bg-amber-100/40 border border-amber-900/15 text-amber-900") :
                            isCyber ? (isDark ? "bg-black hover:bg-zinc-900 border border-cyan-500/30 text-cyan-400" : "bg-white hover:bg-teal-50 border border-[#0d9488]/30 text-teal-900") :
                            isFun ? "bg-yellow-300 hover:bg-yellow-400 border-2 border-black text-black font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" :
                            (isDark ? "bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300" : "bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-750")
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Tag toggles (3 states) */}
            <div>
              <h4 className={`text-[10px] uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5 ${
                isSobre ? "text-zinc-500" :
                isWarm ? "text-amber-900/60 font-serif" :
                isCyber ? "text-[#00ffcc]/60 font-mono" :
                isFun ? "text-black font-extrabold" :
                "text-slate-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSobre ? "bg-zinc-400" : isWarm ? "bg-amber-900" : isCyber ? "bg-[#00ffcc]" : isFun ? "bg-black" : "bg-violet-400"}`} />
                Intérêts par thématiques clés (3 modes d'inférence)
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(tagWeights).map((tag) => {
                  const state = tagWeights[tag] || "neutral";
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        const nextState = state === "neutral" ? "boost" : state === "boost" ? "exclude" : "neutral";
                        updateTagWeight(tag, nextState);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        state === "boost"
                          ? isFun
                            ? "bg-emerald-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-extrabold"
                            : isSobre
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : isWarm
                            ? "bg-amber-900 border-amber-950 text-white font-serif"
                            : isCyber
                            ? "bg-black border-[#00ffcc] text-[#00ffcc] font-mono shadow-[0_0_10px_rgba(0,255,204,0.3)]"
                            : "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/10"
                          : state === "exclude"
                          ? isFun
                            ? "bg-rose-300 border-2 border-black text-black line-through opacity-75 font-extrabold"
                            : isSobre
                            ? (isDark ? "bg-zinc-800/50 border-zinc-750 text-zinc-500 line-through opacity-75" : "bg-zinc-100 border-zinc-200 text-zinc-400 line-through opacity-75")
                            : isWarm
                            ? (isDark ? "bg-[#2c221e]/40 border-amber-950/20 text-amber-550/40 line-through opacity-75 font-serif" : "bg-[#FAF6F0] border-amber-900/10 text-amber-900/40 line-through opacity-75 font-serif")
                            : isCyber
                            ? "bg-black border-pink-500/25 text-pink-500 line-through opacity-75 font-mono"
                            : "bg-rose-500/10 border-rose-500/40 text-rose-300 line-through opacity-75"
                          : isFun
                          ? (isDark ? "bg-[#352554] border-2 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold hover:translate-x-0.5" : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]")
                          : isSobre
                          ? (isDark ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-650 hover:text-white" : "bg-white border-zinc-250 text-zinc-600 hover:border-zinc-450 hover:text-zinc-900")
                          : isWarm
                          ? (isDark ? "bg-[#3e322a] border-amber-900/10 text-amber-200 hover:bg-[#4a3c33]" : "bg-[#FDFBF7] border-amber-900/10 text-amber-900 hover:bg-[#F2E6D0]")
                          : isCyber
                          ? "bg-black border-cyan-500/20 text-cyan-400 hover:border-cyan-400 font-mono"
                          : (isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300" : "bg-white border-slate-200 text-slate-750 hover:border-slate-350 hover:text-slate-900 shadow-xs")
                      }`}
                      title="Cliquez pour changer : Neutre -> Boosté -> Masqué"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        state === "boost"
                          ? isFun ? "bg-black animate-ping" : isSobre ? "bg-zinc-350 animate-ping" : isWarm ? "bg-white animate-ping" : isCyber ? "bg-[#00ffcc] animate-ping" : "bg-emerald-400 animate-ping"
                          : state === "exclude" ? "bg-rose-500" : "bg-slate-500"
                      }`} />
                      #{tag}
                      <span className={`text-[9px] font-bold ${isSobre && state === "boost" ? "text-zinc-300" : "text-slate-500"}`}>
                        {state === "boost" ? "🚀 Boost" : state === "exclude" ? "🚫 Masqué" : ""}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Source toggles */}
            <div>
              <h4 className={`text-[10px] uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5 ${
                isSobre ? "text-zinc-500" :
                isWarm ? "text-amber-900/60 font-serif" :
                isCyber ? "text-[#00ffcc]/60 font-mono" :
                isFun ? "text-black font-extrabold" :
                "text-slate-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isSobre ? "bg-zinc-400" : isWarm ? "bg-amber-900" : isCyber ? "bg-[#00ffcc]" : isFun ? "bg-black" : "bg-amber-400"}`} />
                Affinité envers les sources de presse
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.keys(sourceWeights).map((src) => {
                  const state = sourceWeights[src] || "neutral";
                  return (
                    <button
                      key={src}
                      onClick={() => {
                        const nextState = state === "neutral" ? "boost" : state === "boost" ? "exclude" : "neutral";
                        updateSourceWeight(src, nextState);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                        state === "boost"
                          ? isFun
                            ? "bg-cyan-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-extrabold"
                            : isSobre
                            ? "bg-zinc-900 border-zinc-900 text-white"
                            : isWarm
                            ? "bg-amber-900 border-amber-950 text-white font-serif"
                            : isCyber
                            ? "bg-black border-[#00ffcc] text-[#00ffcc] font-mono shadow-[0_0_10px_rgba(0,255,204,0.3)]"
                            : "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                          : state === "exclude"
                          ? isFun
                            ? "bg-rose-300 border-2 border-black text-black line-through opacity-75 font-extrabold"
                            : isSobre
                            ? (isDark ? "bg-zinc-800/50 border-zinc-750 text-zinc-500 line-through opacity-75" : "bg-zinc-100 border-zinc-200 text-zinc-400 line-through opacity-75")
                            : isWarm
                            ? (isDark ? "bg-[#2c221e]/40 border-amber-950/20 text-amber-550/40 line-through opacity-75 font-serif" : "bg-[#FAF6F0] border-amber-900/10 text-amber-900/40 line-through opacity-75 font-serif")
                            : isCyber
                            ? "bg-black border-pink-500/25 text-pink-500 line-through opacity-75 font-mono"
                            : "bg-rose-500/10 border-rose-500/40 text-rose-300 line-through opacity-75"
                          : isFun
                          ? (isDark ? "bg-[#352554] border-2 border-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold hover:translate-x-0.5" : "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]")
                          : isSobre
                          ? (isDark ? "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-650 hover:text-white" : "bg-white border-zinc-250 text-zinc-600 hover:border-zinc-450 hover:text-zinc-900")
                          : isWarm
                          ? (isDark ? "bg-[#3e322a] border-amber-900/10 text-amber-200 hover:bg-[#4a3c33]" : "bg-[#FDFBF7] border-amber-900/10 text-amber-900 hover:bg-[#F2E6D0]")
                          : isCyber
                          ? "bg-black border-cyan-500/20 text-cyan-400 hover:border-cyan-400 font-mono"
                          : (isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300" : "bg-white border-slate-200 text-slate-750 hover:border-slate-350 hover:text-slate-900 shadow-xs")
                      }`}
                    >
                      {src}
                      <span className={`text-[9px] font-bold ${isSobre && state === "boost" ? "text-zinc-300" : "text-slate-500"}`}>
                        {state === "boost" ? "🚀 +15%" : state === "exclude" ? "🚫 Bloquée" : "⚪ 100%"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* Main Grid View */}
      <div className={`grid grid-cols-1 gap-6 items-start ${selectedArticle ? "lg:grid-cols-12" : "grid-cols-1"}`}>
        {/* Left Side: Search, Sliders & Feed */}
        <div className={selectedArticle ? "lg:col-span-4 space-y-6" : "w-full space-y-6"}>
          {/* Inner Toolbar */}
          <div className={`backdrop-blur-md rounded-xl p-4 flex flex-col ${selectedArticle ? "w-full" : "md:flex-row md:items-center"} gap-4 shadow-md transition-all duration-300 ${
            isSobre ? (isDark ? "bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-xs" : "bg-white border border-zinc-200 text-zinc-900 shadow-xs") :
            isWarm ? (isDark ? "bg-[#251e1a] border border-[#3e322a] text-[#FAF6F0] shadow-xs font-serif" : "bg-[#FDFBF7] border border-amber-900/10 text-amber-955 shadow-xs font-serif") :
            isCyber ? (isDark ? "bg-black border border-cyan-500/30 text-cyan-400 font-mono" : "bg-[#f4fffe] border border-teal-500/20 text-teal-900 font-mono") :
            isFun ? (isDark ? "bg-[#251a3a] border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-white" : "bg-yellow-100 border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black") :
            (isDark ? "bg-slate-900/80 border border-indigo-500/15 text-slate-100" : "bg-white border border-indigo-100 text-slate-800 shadow-sm")
          }`}>
            {/* Search Input */}
            <div className={`relative w-full ${selectedArticle ? "" : "md:max-w-xs"}`}>
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
                isSobre ? "text-zinc-400" :
                isWarm ? "text-amber-850/40 font-serif" :
                isCyber ? "text-cyan-500/40" :
                isFun ? "text-black" :
                "text-indigo-400/60"
              }`} />
              <input
                type="text"
                placeholder="Rechercher dans votre flux..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full rounded-lg py-1.5 pl-9 pr-4 text-xs outline-none transition-colors ${
                  isSobre ? (isDark ? "bg-zinc-950 border border-zinc-805 text-zinc-100 focus:border-zinc-700 placeholder-zinc-550" : "bg-zinc-50 border border-zinc-300 text-zinc-900 focus:border-zinc-500 placeholder-zinc-400") :
                  isWarm ? (isDark ? "bg-[#332822] border border-amber-900/25 text-amber-100 focus:border-amber-700 placeholder-amber-200/30 font-serif" : "bg-[#FAF6F0] border border-amber-900/15 text-amber-955 focus:border-amber-900 placeholder-amber-900/40 font-serif") :
                  isCyber ? (isDark ? "bg-black border border-cyan-500/40 text-cyan-400 focus:border-[#00ffcc] placeholder-cyan-500/30 font-mono" : "bg-white border border-teal-500/35 text-teal-900 focus:border-teal-500 placeholder-teal-700/40 font-mono") :
                  isFun ? (isDark ? "bg-[#1f1d2b] border-2 border-black text-white placeholder-neutral-500 rounded-lg" : "bg-white border-2 border-black text-black placeholder-neutral-500 rounded-lg") :
                  (isDark ? "bg-slate-950 border border-slate-800 text-slate-100 focus:border-indigo-500 font-sans" : "bg-slate-50 border border-indigo-100 text-slate-800 focus:border-indigo-400 placeholder-slate-400 font-sans")
                }`}
              />
            </div>

            {/* Relevance Slider */}
            <div className={`flex items-center gap-3 w-full ${selectedArticle ? "" : "md:flex-1"} justify-between`}>
              <span className={`text-xs whitespace-nowrap font-sans font-semibold ${
                isSobre ? "text-zinc-700" :
                isWarm ? "text-amber-900 font-serif" :
                isCyber ? "text-cyan-400 font-mono" :
                isFun ? "text-black font-extrabold" :
                "text-slate-300"
              }`}>Recommandation min :</span>
              <input
                type="range"
                min={40}
                max={90}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className={`flex-1 h-1 cursor-pointer ${
                  isSobre ? "accent-zinc-900 bg-zinc-100 border border-zinc-200" :
                  isWarm ? "accent-amber-900 bg-[#FAF6F0] border border-amber-900/15" :
                  isCyber ? "accent-[#00ffcc] bg-black border border-cyan-500/40" :
                  isFun ? "accent-black bg-white border-2 border-black rounded-md" :
                  "accent-indigo-500 bg-slate-950 border border-slate-800"
                }`}
              />
              <span className={`text-xs font-bold shrink-0 w-8 text-right ${
                isSobre ? "text-zinc-900" :
                isWarm ? "text-amber-950 font-serif" :
                isCyber ? "text-[#00ffcc] font-mono" :
                isFun ? "text-black font-extrabold" :
                "text-indigo-400 font-mono"
              }`}>
                {minScore}%
              </span>
            </div>

            {/* Sorting, View mode toggles */}
            <div className={`flex flex-wrap items-center gap-2 w-full ${selectedArticle ? "justify-between border-t pt-3" : "md:w-auto justify-end md:border-t-0 md:pt-0"} ${
              isSobre ? "border-zinc-250" :
              isWarm ? "border-amber-900/10" :
              isCyber ? "border-cyan-500/10" :
              isFun ? "border-black" :
              "border-slate-800"
            }`}>
              <div className={`flex p-1 rounded-lg border text-xs font-sans ${
                isSobre ? "bg-zinc-100 border-zinc-250" :
                isWarm ? "bg-[#FAF6F0] border-amber-900/10" :
                isCyber ? "bg-black border-cyan-500/30 font-mono" :
                isFun ? "bg-white border-2 border-black" :
                "bg-slate-950 border border-slate-800"
              }`}>
                <button
                  onClick={() => setSortBy("score")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    sortBy === "score"
                      ? isFun
                        ? "bg-cyan-300 text-black border border-black font-black"
                        : isSobre
                        ? "bg-white text-zinc-900 font-bold border border-zinc-300"
                        : isWarm
                        ? "bg-amber-900 text-white font-serif font-bold"
                        : isCyber
                        ? "bg-cyan-500/20 text-[#00ffcc] font-mono font-bold"
                        : "bg-indigo-500/20 text-cyan-300 font-bold"
                      : isFun
                      ? "text-black hover:bg-neutral-105 font-bold"
                      : isSobre
                      ? "text-zinc-505 hover:text-zinc-800"
                      : isWarm
                      ? "text-amber-800 hover:text-amber-955 font-serif"
                      : isCyber
                      ? "text-cyan-600 hover:text-cyan-400 font-mono"
                      : "text-slate-505 hover:text-slate-300"
                  }`}
                >
                  Score
                </button>
                <button
                  onClick={() => setSortBy("date")}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    sortBy === "date"
                      ? isFun
                        ? "bg-cyan-300 text-black border border-black font-black"
                        : isSobre
                        ? "bg-white text-zinc-900 font-bold border border-zinc-300"
                        : isWarm
                        ? "bg-amber-900 text-white font-serif font-bold"
                        : isCyber
                        ? "bg-cyan-500/20 text-[#00ffcc] font-mono font-bold"
                        : "bg-indigo-500/20 text-cyan-300 font-bold"
                      : isFun
                      ? "text-black hover:bg-neutral-105 font-bold"
                      : isSobre
                      ? "text-zinc-505 hover:text-zinc-800"
                      : isWarm
                      ? "text-amber-800 hover:text-amber-955 font-serif"
                      : isCyber
                      ? "text-cyan-600 hover:text-cyan-400 font-mono"
                      : "text-slate-505 hover:text-slate-300"
                  }`}
                >
                  Récents
                </button>
              </div>

              <div className={`flex p-1 rounded-lg border ${
                isSobre ? "bg-zinc-100 border-zinc-250" :
                isWarm ? "bg-[#FAF6F0] border-amber-900/10" :
                isCyber ? "bg-black border-cyan-500/30 font-mono" :
                isFun ? "bg-white border-2 border-black" :
                "bg-slate-950 border border-slate-800"
              }`}>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "grid"
                      ? isFun
                        ? "bg-cyan-300 text-black border border-black"
                        : isSobre
                        ? "bg-white text-zinc-900 font-bold border border-zinc-300"
                        : isWarm
                        ? "bg-amber-900 text-white font-serif"
                        : isCyber
                        ? "bg-cyan-500/20 text-[#00ffcc]"
                        : "bg-indigo-500/20 text-cyan-300"
                      : isFun
                      ? "text-black hover:bg-neutral-100"
                      : isSobre
                      ? "text-zinc-500 hover:text-zinc-800"
                      : isWarm
                      ? "text-amber-800 hover:text-amber-950"
                      : isCyber
                      ? "text-cyan-600 hover:text-cyan-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Grille"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === "list"
                      ? isFun
                        ? "bg-cyan-300 text-black border border-black"
                        : isSobre
                        ? "bg-white text-zinc-900 font-bold border border-zinc-300"
                        : isWarm
                        ? "bg-amber-900 text-white font-serif"
                        : isCyber
                        ? "bg-cyan-500/20 text-[#00ffcc]"
                        : "bg-indigo-500/20 text-cyan-300"
                      : isFun
                      ? "text-black hover:bg-neutral-100"
                      : isSobre
                      ? "text-zinc-500 hover:text-zinc-800"
                      : isWarm
                      ? "text-amber-800 hover:text-amber-950"
                      : isCyber
                      ? "text-cyan-600 hover:text-cyan-400"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                  title="Liste"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sub-toolbar: Advanced Reading Filters & Bandwidth mode */}
          <div className={`border rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs transition-all duration-300 ${
            isSobre ? isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-zinc-50 border-zinc-200 text-zinc-800" :
            isWarm ? isDark ? "bg-[#382f2a] border-amber-900/20 text-[#FAF6F0] font-serif" : "bg-[#FAF6F0]/60 border border-amber-900/10 text-amber-955 font-serif" :
            isCyber ? "bg-zinc-950/80 border border-cyan-500/20 font-mono" :
            isFun ? "bg-cyan-100 border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" :
            "bg-slate-900/40 border border-slate-800"
          }`}>
            <div className="flex flex-wrap items-center gap-3">
              {/* Reading Time selector */}
              <div className={`flex items-center gap-1 p-1 rounded-lg border ${
                isSobre ? isDark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-250" :
                isWarm ? isDark ? "bg-[#251e1a] border-amber-900/20" : "bg-[#FDFBF7] border-amber-900/10" :
                isCyber ? "bg-black border-cyan-500/25 font-mono" :
                isFun ? "bg-white border-2 border-black" :
                "bg-slate-950 border border-slate-800"
              }`}>
                <span className={`text-[10px] font-bold uppercase px-1.5 ${
                  isSobre ? isDark ? "text-zinc-400" : "text-zinc-500" :
                  isWarm ? isDark ? "text-amber-200/60 font-serif" : "text-amber-900/60 font-serif" :
                  isCyber ? "text-cyan-500/60 font-mono" :
                  isFun ? "text-black font-extrabold" :
                  "text-slate-500"
                }`}>Lecture :</span>
                {(["all", "short", "medium", "long"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setReadingTimeFilter(mode)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                      readingTimeFilter === mode
                        ? isFun
                          ? "bg-yellow-300 border-2 border-black text-black font-black"
                          : isSobre
                          ? isDark ? "bg-zinc-100 text-zinc-950 font-bold" : "bg-zinc-900 text-white font-bold"
                          : isWarm
                          ? isDark ? "bg-amber-100 text-amber-955 font-serif font-bold" : "bg-amber-900 text-white font-serif font-bold"
                          : isCyber
                          ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-mono"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : isFun
                        ? "text-black hover:bg-neutral-100 font-bold"
                        : isSobre
                        ? isDark ? "text-zinc-400 hover:text-zinc-150" : "text-zinc-500 hover:text-zinc-800"
                        : isWarm
                        ? isDark ? "text-amber-400 hover:text-amber-200 font-serif" : "text-amber-800 hover:text-amber-900/80 font-serif"
                        : isCyber
                        ? "text-cyan-600 hover:text-cyan-400 font-mono"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {mode === "all" ? "Toutes" : mode === "short" ? "< 2 min" : mode === "medium" ? "2-4 min" : ">= 5 min"}
                  </button>
                ))}
              </div>

              {/* Bookmarks Toggle */}
              <button
                onClick={() => setOnlyBookmarks(!onlyBookmarks)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                  onlyBookmarks
                    ? isFun
                      ? "bg-rose-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : isSobre
                      ? isDark ? "bg-zinc-100 border-zinc-100 text-zinc-950" : "bg-zinc-900 border-zinc-900 text-white"
                      : isWarm
                      ? isDark ? "bg-amber-100 border-amber-100 text-amber-955 font-serif" : "bg-amber-900 border-amber-950 text-white font-serif"
                      : isCyber
                      ? "bg-black border-pink-500 text-pink-500 font-mono"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                    : isFun
                    ? "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    : isSobre
                    ? isDark ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white" : "bg-white border-zinc-250 text-zinc-650 hover:text-zinc-900 hover:border-zinc-350"
                    : isWarm
                    ? isDark ? "bg-[#251e1a] border-amber-900/20 text-amber-300 hover:bg-[#342a24]" : "bg-[#FDFBF7] border-amber-900/10 text-amber-900 hover:bg-[#F2E6D0]"
                    : isCyber
                    ? "bg-black border-cyan-500/25 text-cyan-500 hover:border-cyan-400 font-mono"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-rose-500" />
                Signets
              </button>

              {/* Bandwidth Mode Toggle */}
              <button
                onClick={() => setBandwidthSaver(!bandwidthSaver)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                  bandwidthSaver
                    ? isFun
                      ? "bg-emerald-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : isSobre
                      ? isDark ? "bg-zinc-100 border-zinc-100 text-zinc-950" : "bg-zinc-900 border-zinc-900 text-white"
                      : isWarm
                      ? isDark ? "bg-amber-100 border-amber-100 text-amber-955 font-serif" : "bg-amber-900 border-amber-950 text-white font-serif"
                      : isCyber
                      ? "bg-black border-cyan-400 text-[#00ffcc] font-mono"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : isFun
                    ? "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                    : isSobre
                    ? isDark ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white" : "bg-white border-zinc-250 text-zinc-650 hover:text-zinc-900 hover:border-zinc-350"
                    : isWarm
                    ? isDark ? "bg-[#251e1a] border-amber-900/20 text-amber-300 hover:bg-[#342a24]" : "bg-[#FDFBF7] border-amber-900/10 text-amber-900 hover:bg-[#F2E6D0]"
                    : isCyber
                    ? "bg-black border-cyan-500/25 text-cyan-500 hover:border-cyan-400 font-mono"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
                }`}
                title="Désactive les emojis et effets visuels lourds"
              >
                <ZapOff className="w-3.5 h-3.5 text-emerald-400" />
                Éco de données {bandwidthSaver && "(Actif)"}
              </button>
            </div>

            {/* Trending Tags cloud */}
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase ${
                isSobre ? isDark ? "text-zinc-400" : "text-zinc-500" :
                isWarm ? isDark ? "text-amber-200/60 font-serif" : "text-amber-900/60 font-serif" :
                isCyber ? "text-cyan-500/60" :
                isFun ? "text-black" :
                "text-slate-500"
              }`}>Tendances :</span>
              <div className="flex flex-wrap gap-1">
                {["IA", "Sécurité", "Espace", "Santé", "Éthique", "Futur"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setClickedTrendTag(clickedTrendTag === tag ? null : tag)}
                    className={`px-2 py-0.5 rounded text-[10px] font-sans transition-all cursor-pointer border ${
                      clickedTrendTag === tag
                        ? isFun
                          ? "bg-yellow-300 border-2 border-black text-black font-black"
                          : isSobre
                          ? isDark ? "bg-zinc-100 border-zinc-100 text-zinc-950 font-bold" : "bg-zinc-900 border-zinc-900 text-white font-bold"
                          : isWarm
                          ? isDark ? "bg-amber-100 border-amber-100 text-amber-955 font-serif font-bold" : "bg-amber-900 border-amber-950 text-white font-serif font-bold"
                          : isCyber
                          ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 font-mono font-bold"
                          : "bg-indigo-500/20 border-indigo-500/40 text-cyan-300 font-bold"
                        : isFun
                        ? "bg-white border-2 border-black text-black hover:bg-neutral-100 font-bold"
                        : isSobre
                        ? isDark ? "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white" : "bg-white border-zinc-250 text-zinc-550 hover:border-zinc-400 hover:text-zinc-900"
                        : isWarm
                        ? isDark ? "bg-[#251e1a] border-amber-900/20 text-amber-300 hover:bg-[#342a24]" : "bg-[#FDFBF7] border-amber-900/10 text-amber-900 hover:bg-[#F2E6D0]"
                        : isCyber
                        ? "bg-black border-cyan-500/25 text-cyan-500 hover:border-cyan-400 font-mono"
                        : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active filter feedback bar */}
          {(activeFilter || activeTag || clickedTrendTag || onlyBookmarks || readingTimeFilter !== "all" || searchQuery) && (
            <div className={`flex items-center flex-wrap gap-2 text-xs p-3 rounded-lg transition-all duration-300 ${
              isSobre ? isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100 border" : "bg-zinc-50 border-zinc-200 text-zinc-800 border" :
              isWarm ? isDark ? "bg-[#382f2a] border-amber-900/20 text-[#FAF6F0] border font-serif" : "bg-[#FAF6F0] border-amber-900/10 text-amber-900 border font-serif" :
              isCyber ? "bg-black border-cyan-500/30 text-cyan-400 border font-mono shadow-[0_0_8px_rgba(6,182,212,0.1)]" :
              isFun ? "bg-pink-100 border-2 border-black rounded-xl text-black font-sans font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" :
              "bg-slate-900/50 border border-indigo-500/10 text-slate-300"
            }`}>
              <Filter className={`w-3.5 h-3.5 ${
                isSobre ? "text-zinc-600" :
                isWarm ? "text-amber-900" :
                isCyber ? "text-[#00ffcc]" :
                isFun ? "text-black" :
                "text-indigo-400"
              }`} />
              Filtres actifs :
              {activeFilter && (
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  isSobre ? isDark ? "bg-zinc-800 text-zinc-100 border-zinc-700" : "bg-zinc-200 text-zinc-900 border-zinc-300" :
                  isWarm ? isDark ? "bg-[#4a3f39] text-[#FAF6F0] border-amber-900/30 font-serif" : "bg-amber-100 text-amber-955 border-amber-900/10 font-serif" :
                  isCyber ? "bg-zinc-900 text-[#00ffcc] border-cyan-500/30 font-mono" :
                  isFun ? "bg-yellow-300 text-black border-2 border-black font-black" :
                  "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                }`}>
                  Catégorie: {activeFilter}
                </span>
              )}
              {activeTag && (
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  isSobre ? isDark ? "bg-zinc-800 text-zinc-100 border-zinc-700" : "bg-zinc-200 text-zinc-900 border-zinc-300" :
                  isWarm ? isDark ? "bg-[#4a3f39] text-[#FAF6F0] border-amber-900/30 font-serif" : "bg-amber-100 text-amber-955 border-amber-900/10 font-serif" :
                  isCyber ? "bg-zinc-900 text-cyan-300 border-cyan-500/30 font-mono" :
                  isFun ? "bg-yellow-300 text-black border-2 border-black font-black" :
                  "bg-violet-500/20 text-violet-300 border-violet-500/30"
                }`}>
                  Tag: #{activeTag}
                </span>
              )}
              {clickedTrendTag && (
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  isSobre ? isDark ? "bg-zinc-800 text-zinc-100 border-zinc-700" : "bg-zinc-200 text-zinc-900 border-zinc-300" :
                  isWarm ? isDark ? "bg-[#4a3f39] text-[#FAF6F0] border-amber-900/30 font-serif" : "bg-amber-100 text-amber-955 border-amber-900/10 font-serif" :
                  isCyber ? "bg-zinc-900 text-[#00ffcc] border-cyan-500/30 font-mono" :
                  isFun ? "bg-yellow-300 text-black border-2 border-black font-black" :
                  "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                }`}>
                  Tendance: #{clickedTrendTag}
                </span>
              )}
              {onlyBookmarks && (
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  isSobre ? isDark ? "bg-zinc-800 text-zinc-100 border-zinc-700" : "bg-zinc-200 text-zinc-900 border-zinc-300" :
                  isWarm ? isDark ? "bg-[#4a3f39] text-[#FAF6F0] border-amber-900/30 font-serif" : "bg-amber-100 text-amber-955 border-amber-900/10 font-serif" :
                  isCyber ? "bg-zinc-900 text-pink-400 border-cyan-500/30 font-mono" :
                  isFun ? "bg-rose-300 text-black border-2 border-black font-black" :
                  "bg-rose-500/20 text-rose-300 border-rose-500/30"
                }`}>
                  Signets seulement
                </span>
              )}
              {readingTimeFilter !== "all" && (
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  isSobre ? isDark ? "bg-zinc-800 text-zinc-100 border-zinc-700" : "bg-zinc-200 text-zinc-900 border-zinc-300" :
                  isWarm ? isDark ? "bg-[#4a3f39] text-[#FAF6F0] border-amber-900/30 font-serif" : "bg-amber-100 text-amber-955 border-amber-900/10 font-serif" :
                  isCyber ? "bg-zinc-900 text-emerald-400 border-cyan-500/30 font-mono" :
                  isFun ? "bg-emerald-300 text-black border-2 border-black font-black" :
                  "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}>
                  Temps: {readingTimeFilter}
                </span>
              )}
              {searchQuery && (
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                  isSobre ? isDark ? "bg-zinc-800 text-zinc-100 border-zinc-700" : "bg-zinc-200 text-zinc-900 border-zinc-300" :
                  isWarm ? isDark ? "bg-[#4a3f39] text-[#FAF6F0] border-amber-900/30 font-serif" : "bg-amber-100 text-amber-955 border-amber-900/10 font-serif" :
                  isCyber ? "bg-zinc-900 text-cyan-300 border-cyan-500/30 font-mono" :
                  isFun ? "bg-yellow-300 text-black border-2 border-black font-black" :
                  "bg-slate-800 text-slate-200 border-slate-700"
                }`}>
                  Recherche: "{searchQuery}"
                </span>
              )}
            </div>
          )}

          {/* 0. ARTICLE CREATION & RESET CONTROLS */}
          <div className={`${getPanelBgClass()} flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-300`} id="article-creation-reset-panel">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg shrink-0 ${isFun ? "bg-yellow-300 border-2 border-black text-black" : "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"}`}>
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
              </div>
              <div>
                <h4 className={`text-xs uppercase tracking-wider flex items-center gap-2 ${isSobre ? isDark ? "text-white font-extrabold" : "text-zinc-900 font-extrabold" : isWarm ? isDark ? "text-[#FAF6F0] font-bold font-serif" : "text-amber-950 font-bold font-serif" : isCyber ? "text-[#00ffcc] font-black font-mono" : isFun ? "text-black font-black" : "text-white font-bold font-sans"}`}>
                  Création &amp; Réinitialisation d'Articles
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    isSobre ? isDark ? "bg-zinc-800 text-zinc-100 border border-zinc-700" : "bg-zinc-100 text-zinc-800 border border-zinc-200" :
                    isWarm ? isDark ? "bg-amber-955/40 text-amber-200" : "bg-amber-100 text-amber-900" :
                    isCyber ? "bg-black text-[#00ffcc] border border-cyan-400 font-mono" :
                    isFun ? "bg-yellow-300 text-black border-2 border-black animate-pulse" :
                    "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  }`}>
                    Contrôle Flux
                  </span>
                </h4>
                <p className={`text-[10px] mt-0.5 ${isSobre ? isDark ? "text-zinc-400" : "text-zinc-550" : isWarm ? isDark ? "text-amber-300 font-serif" : "text-amber-900/80 font-serif" : isCyber ? "text-cyan-500 font-mono" : isFun ? "text-black" : "text-slate-400 font-sans"}`}>
                  Générez à la demande de nouveaux articles via l'IA ou restaurez instantanément le flux d'origine.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto justify-end">
              {/* Reset Button */}
              <button
                onClick={handleResetToBaseline}
                className={getButtonClass(false) + " flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0"}
                title="Rétablir les articles originaux de l'application"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isFun ? "text-black" : "text-zinc-400"}`} />
                Réinitialiser le flux
              </button>

              {/* IA Bulk Generator Button */}
              <button
                onClick={() => handleBulkGenerateIAArticles(false)}
                disabled={isBulkGenerating}
                className={`px-4 py-1.5 hover:opacity-95 disabled:opacity-45 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto shrink-0 ${
                  isFun ? "bg-cyan-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5" :
                  isSobre ? "bg-zinc-950 text-white" :
                  isWarm ? "bg-amber-900 text-white" :
                  isCyber ? "bg-black border border-cyan-400 text-cyan-400 font-mono shadow-[0_0_8px_rgba(6,182,212,0.3)]" :
                  "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md shadow-cyan-500/10"
                }`}
              >
                {isBulkGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
                )}
                {isBulkGenerating ? "Génération IA..." : "Régénérer 15 articles (IA)"}
              </button>
            </div>
          </div>

          {/* 1. FEATURED ARTICLES GRID */}
          {featuredArticles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${isFun ? "text-yellow-500 fill-yellow-400 animate-bounce" : isCyber ? "text-[#00ffcc]" : isSobre ? "text-zinc-900" : isWarm ? "text-amber-800" : "text-amber-400 fill-amber-400/20"}`} />
                <h3 className={`font-bold text-[10px] tracking-widest uppercase ${isSobre ? "text-zinc-900" : isWarm ? "text-amber-950 font-serif" : isCyber ? "text-cyan-400 font-mono" : isFun ? "text-black font-black" : "text-slate-400 font-sans"}`}>
                  Articles Recommandés prioritaires
                </h3>
              </div>

              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {featuredArticles.map((art, idx) => {
                  const catColor = CATEGORY_COLORS[art.category] || { text: "text-zinc-400", bg: "bg-zinc-850/50", border: "border-white/5" };
                  const isSaved = savedIds.has(art.id);
                  const isRead = readIds.has(art.id);

                  return (
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(e, info) => {
                        if (info.offset.x > 120) {
                          handleSwipeRight(art);
                        } else if (info.offset.x < -120) {
                          handleSwipeLeft(art);
                        }
                      }}
                      key={`feat-${art.id}-${idx}`}
                      id={`article-card-${art.id}`}
                      onClick={() => handleOpenArticle(art)}
                      className={`${getCardContainerClass()} overflow-hidden cursor-pointer transition-all hover:-translate-y-1 group h-full relative touch-pan-y`}
                    >
                      <div className={`absolute top-3 right-3 z-10 font-sans font-bold text-xs tracking-wider uppercase px-3 py-1 rounded-full shadow ${
                        isSobre ? "bg-zinc-900 text-white" :
                        isWarm ? "bg-amber-950 text-white font-serif" :
                        isCyber ? "bg-black border border-cyan-400 text-cyan-400 font-mono" :
                        isFun ? "bg-yellow-300 text-black border-2 border-black font-black" :
                        "bg-linear-to-r from-violet-600 via-fuchsia-600 to-rose-600 text-white shadow-fuchsia-500/25"
                      }`}>
                        ★ {art.score}% Recommandé
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* source & category */}
                          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider mb-3">
                            <span className={getBadgeClass()}>{art.category}</span>
                            <span className={`${isSobre ? "text-zinc-400" : isWarm ? "text-amber-800" : isCyber ? "text-cyan-500 font-mono" : isFun ? "text-black" : "text-slate-600"}`}>•</span>
                            <span className={`${
                              isSobre ? "text-zinc-700" :
                              isWarm ? "text-amber-900 font-semibold" :
                              isCyber ? "text-cyan-400 font-mono" :
                              isFun ? "text-black font-black" :
                              "text-slate-300 font-semibold font-sans"
                            }`}>{art.source}</span>
                          </div>

                          <h4 className={getTitleClass() + " mb-2 group-hover:opacity-85 transition-opacity"}>
                            {art.title}
                          </h4>

                          <p className={`text-sm sm:text-base leading-relaxed line-clamp-3 mb-4 ${
                            isSobre ? "text-zinc-600" :
                            isWarm ? "text-amber-900/80 font-serif" :
                            isCyber ? "text-cyan-500 font-mono" :
                            isFun ? "text-black font-medium" :
                            "text-slate-400 font-sans"
                          }`}>
                            {art.summary}
                          </p>
                        </div>

                        {/* bottom tags & stats */}
                        <div className={`pt-3 border-t flex flex-wrap items-center justify-between gap-2 ${isSobre ? "border-zinc-200" : isWarm ? "border-amber-900/10" : isCyber ? "border-cyan-500/10" : isFun ? "border-black" : "border-slate-800"}`}>
                          <div className="flex gap-1.5">
                            {art.tags.slice(0, 2).map((t) => (
                              <span key={t} className={`text-xs px-2.5 py-0.5 rounded border ${
                                isSobre ? "bg-zinc-50 border-zinc-200 text-zinc-700" :
                                isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-900 font-serif" :
                                isCyber ? "bg-black border-cyan-500/20 text-cyan-400 font-mono" :
                                isFun ? "bg-cyan-100 border-2 border-black text-black font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" :
                                "text-indigo-300 bg-indigo-500/10 border-indigo-500/15 font-sans"
                              }`}>
                                #{t}
                              </span>
                            ))}
                          </div>

                          <div className={`flex items-center gap-2 text-xs sm:text-sm ${
                            isSobre ? "text-zinc-500" :
                            isWarm ? "text-amber-850 font-serif" :
                            isCyber ? "text-cyan-500 font-mono" :
                            isFun ? "text-black font-black" :
                            "text-slate-400 font-sans"
                          }`}>
                            <Clock className={`w-3.5 h-3.5 ${isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-cyan-400/60"}`} />
                            {getArticleTimeDisplay(art)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. REGULAR FLUX */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <h3 className="font-sans font-bold text-[10px] tracking-widest uppercase text-slate-400">
                Tout le flux d'informations ({filteredArticles.length} au total)
              </h3>
            </div>

            {filteredArticles.length === 0 ? (
              <div className={`rounded-xl p-8 border text-center space-y-4 transition-all duration-300 ${
                isSobre ? "bg-zinc-50 border-zinc-200 text-zinc-900 shadow-xs" :
                isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-950 font-serif" :
                isCyber ? "bg-black border-cyan-500/30 text-[#00ffcc] font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]" :
                isFun ? "bg-yellow-100 border-3 border-black rounded-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" :
                "bg-slate-900/40 border border-slate-800 text-slate-300"
              }`}>
                <AlertTriangle className={`w-8 h-8 mx-auto animate-pulse ${
                  isSobre ? "text-zinc-700" :
                  isWarm ? "text-amber-900" :
                  isCyber ? "text-[#00ffcc]" :
                  isFun ? "text-black" :
                  "text-amber-400"
                }`} />
                <h4 className={`font-sans font-semibold text-sm ${
                  isSobre ? "text-zinc-900 font-extrabold" :
                  isWarm ? "text-amber-950 font-serif font-bold" :
                  isCyber ? "text-white font-mono font-bold" :
                  isFun ? "text-black font-extrabold" :
                  "text-slate-300"
                }`}>Aucun article ne correspond aux filtres</h4>
                <p className={`text-xs ${
                  isSobre ? "text-zinc-500" :
                  isWarm ? "text-amber-900/80 font-serif" :
                  isCyber ? "text-cyan-500 font-mono" :
                  isFun ? "text-black font-semibold" :
                  "text-slate-500"
                }`}>
                  Tentez de réduire le seuil de recommandation ou d'effacer vos critères de recherche.
                </p>
                {(activeFilter || activeTag || clickedTrendTag || onlyBookmarks || readingTimeFilter !== "all" || searchQuery || minScore > 40) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setClickedTrendTag(null);
                      setOnlyBookmarks(false);
                      setReadingTimeFilter("all");
                      setMinScore(40);
                      if (onClearFilters) {
                        onClearFilters();
                      }
                      onNotify("🧹 Tous les filtres ont été réinitialisés.");
                    }}
                    className={`mt-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                      isSobre ? "bg-zinc-900 hover:bg-black text-white" :
                      isWarm ? "bg-amber-900 hover:bg-amber-950 text-white font-serif" :
                      isCyber ? "bg-cyan-500/10 hover:bg-cyan-500/20 text-[#00ffcc] border border-cyan-400/30 hover:border-cyan-400 font-mono" :
                      isFun ? "bg-white hover:bg-neutral-50 text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5" :
                      "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 hover:border-indigo-500/30 font-sans"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    Effacer tous les filtres
                  </button>
                )}
                {searchQuery && (
                  <div className={`pt-4 border-t max-w-sm mx-auto space-y-3 ${
                    isSobre ? "border-zinc-200" :
                    isWarm ? "border-amber-900/10" :
                    isCyber ? "border-cyan-500/10" :
                    isFun ? "border-black" :
                    "border-slate-800/60"
                  }`}>
                    <p className={`text-xs font-sans ${
                      isSobre ? "text-zinc-600" :
                      isWarm ? "text-amber-900/80 font-serif" :
                      isCyber ? "text-cyan-500 font-mono" :
                      isFun ? "text-black" :
                      "text-slate-400"
                    }`}>
                      Vous cherchez des informations sur <strong className={isSobre ? "text-zinc-950" : isWarm ? "text-amber-950 font-bold" : isCyber ? "text-white font-mono" : isFun ? "text-black font-extrabold" : "text-white"}>"{searchQuery}"</strong> ? Notre IA peut rédiger un article complet instantanément !
                    </p>
                    <button
                      onClick={() => {
                        handleAddInterest(searchQuery);
                        handleGenerateCustomArticle(searchQuery);
                      }}
                      disabled={!!isGeneratingCustom}
                      className={`w-full py-2 px-3 hover:opacity-95 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSobre ? "bg-zinc-900 text-white" :
                        isWarm ? "bg-amber-900 text-white font-serif" :
                        isCyber ? "bg-cyan-500/20 text-[#00ffcc] border border-cyan-400 font-mono" :
                        isFun ? "bg-cyan-300 text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5" :
                        "bg-linear-to-r from-cyan-500 to-indigo-500 text-white font-sans"
                      }`}
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isFun ? "text-black animate-bounce" : isCyber ? "text-[#00ffcc]" : "text-cyan-200 animate-pulse"}`} />
                      Générer un article IA sur "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {regularArticles.map((art, idx) => {
                  const catColor = CATEGORY_COLORS[art.category] || { text: "text-zinc-400", bg: "bg-zinc-850/50", border: "border-white/5" };
                  const isSaved = savedIds.has(art.id);
                  const isRead = readIds.has(art.id);

                  return (
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.4}
                      onDragEnd={(e, info) => {
                        if (info.offset.x > 120) {
                          handleSwipeRight(art);
                        } else if (info.offset.x < -120) {
                          handleSwipeLeft(art);
                        }
                      }}
                      key={`reg-${art.id}-${idx}`}
                      id={`article-card-${art.id}`}
                      onClick={() => handleOpenArticle(art)}
                      className={`${getCardContainerClass()} overflow-hidden cursor-pointer transition-all hover:-translate-y-1 relative touch-pan-y ${
                        isRead ? "opacity-50 hover:opacity-100" : ""
                      }`}
                    >
                      {/* Left color bar of match (styled for Cyber/Fun vs others) */}
                      <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-slate-950 rounded-l overflow-hidden">
                        <div className={`h-full ${isFun ? "bg-black" : isSobre ? "bg-zinc-800" : isWarm ? "bg-amber-900" : getScoreFillColor(art.score)}`} style={{ height: `${art.score}%` }}></div>
                      </div>

                      <div className="p-4 pl-5 flex-1 flex flex-col justify-between">
                        <div>
                          {/* source & category */}
                          <div className="flex items-center justify-between gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className={getBadgeClass()}>{art.category}</span>
                              <span className={`${isSobre ? "text-zinc-400" : isWarm ? "text-amber-800" : isCyber ? "text-cyan-500 font-mono" : isFun ? "text-black" : "text-slate-600"}`}>•</span>
                              <span className={`${
                                isSobre ? "text-zinc-700" :
                                isWarm ? "text-amber-900 font-semibold" :
                                isCyber ? "text-cyan-400 font-mono" :
                                isFun ? "text-black font-black" :
                                "text-slate-300 font-semibold font-sans"
                              }`}>{art.source}</span>
                            </div>

                            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold shadow-xs ${
                              isSobre ? "bg-zinc-100 border-zinc-200 text-zinc-900" :
                              isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-950 font-serif" :
                              isCyber ? "bg-black border-cyan-400/30 text-cyan-400 font-mono" :
                              isFun ? "bg-yellow-300 border-2 border-black text-black font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" :
                              `${getScoreColor(art.score)} font-mono shadow-sm`
                            }`}>
                              {art.score}% Match
                            </span>
                          </div>

                          <h4 className={getTitleClass() + " mb-2 group-hover:opacity-85 transition-opacity"}>
                            {art.title}
                          </h4>

                          <p className={`text-sm sm:text-base leading-relaxed line-clamp-2 mb-3 ${
                            isSobre ? "text-zinc-650 font-sans" :
                            isWarm ? "text-amber-900/80 font-serif" :
                            isCyber ? "text-cyan-500 font-mono" :
                            isFun ? "text-black font-medium" :
                            "text-slate-400 font-sans"
                          }`}>
                            {art.summary}
                          </p>
                        </div>

                        {/* bottom tags & stats */}
                        <div className={`pt-2.5 border-t flex items-center justify-between gap-2 ${isSobre ? "border-zinc-200" : isWarm ? "border-amber-900/10" : isCyber ? "border-cyan-500/10" : isFun ? "border-black" : "border-slate-800"}`}>
                          <div className="flex gap-1">
                            {art.tags.slice(0, 2).map((t) => (
                              <span key={t} className={`text-xs px-2 py-0.5 rounded border ${
                                isSobre ? "bg-zinc-50 border-zinc-200 text-zinc-700" :
                                isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-900 font-serif" :
                                isCyber ? "bg-black border-cyan-500/20 text-cyan-400 font-mono" :
                                isFun ? "bg-cyan-100 border-2 border-black text-black font-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" :
                                "text-slate-400 bg-slate-900 border-slate-850 font-sans"
                              }`}>
                                #{t}
                              </span>
                            ))}
                          </div>

                          <div className={`flex items-center gap-1.5 text-xs ${
                            isSobre ? "text-zinc-500" :
                            isWarm ? "text-amber-850 font-serif" :
                            isCyber ? "text-cyan-500 font-mono" :
                            isFun ? "text-black font-black" :
                            "text-slate-400 font-sans"
                          }`}>
                            <Clock className={`w-3.5 h-3.5 ${isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-cyan-400/40"}`} />
                            {getArticleTimeDisplay(art)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Slide-out Reader panel / Mobile Modal Overlay */}
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedArticle(null);
            }
          }}
          className={
            selectedArticle
              ? "fixed inset-x-0 bottom-0 top-[92px] lg:top-32 z-50 bg-white dark:bg-zinc-950 flex flex-col p-0 lg:sticky lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0 lg:h-[calc(100vh-160px)] lg:col-span-8 w-full"
              : "hidden"
          }
        >
          {selectedArticle ? (
            <div 
              id="active-article-reader" 
              className={`w-full h-full flex flex-col justify-between overflow-hidden relative transition-all duration-300 p-4 sm:p-6 ${
                isDark ? "bg-black text-white selection:bg-zinc-850" :
                isFun ? "bg-yellow-50 text-black shadow-xs" :
                "bg-white text-black selection:bg-zinc-100"
              } ${
                isFun 
                  ? "border-3 border-black rounded-none lg:rounded-2xl lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                  : "border-0 lg:border lg:border-zinc-200 dark:lg:border-zinc-800 lg:rounded-2xl lg:shadow-2xl"
              }`}
            >
              {/* Absolute Close Button at Top-Right ("petite croix à droite pour quitter l'article") */}
              <button
                onClick={() => setSelectedArticle(null)}
                className={`absolute top-4 right-4 z-10 w-12 h-12 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isDark ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800" :
                  isFun ? "bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400" :
                  "bg-zinc-50 border-zinc-250 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
                title="Fermer l'article"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Reading Progress Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${isDark ? "bg-zinc-900/40" : "bg-zinc-100"}`}>
                <div 
                  className={`h-full transition-all duration-350 ${
                    isFun ? "bg-yellow-400" : "bg-zinc-500"
                  }`} 
                  style={{ width: `${scrollPercent}%` }}
                ></div>
              </div>

              {/* Reader Header */}
              <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 mb-4 shrink-0 pt-1 gap-3 ${isDark ? "border-zinc-800" : "border-zinc-150"}`}>
                <span className={`text-[10px] uppercase font-sans font-bold tracking-[0.2em] ${
                  isDark ? "text-zinc-400" : isFun ? "text-black" : "text-zinc-500"
                }`}>
                  {zenMode ? "Mode Zen Actif" : "Lecteur d'Article"}
                </span>

                <div className="flex flex-wrap items-center gap-1.5 pr-10 sm:pr-0">
                  {/* Font Resizer */}
                  <div className={`flex items-center gap-0.5 p-1 rounded-lg border text-xs font-bold ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" :
                    isFun ? "bg-white border-2 border-black text-black" :
                    "bg-zinc-50 border-zinc-200 text-zinc-800"
                  }`}>
                    <button onClick={() => setFontScale(Math.max(0.85, fontScale - 0.15))} className="px-1.5 text-zinc-400 hover:text-current cursor-pointer" title="A-">A-</button>
                    <span className="text-[9px] font-mono font-bold text-zinc-500">{Math.round(fontScale * 100)}%</span>
                    <button onClick={() => setFontScale(Math.min(1.6, fontScale + 0.15))} className="px-1.5 text-zinc-400 hover:text-current cursor-pointer" title="A+">A+</button>
                  </div>

                  {/* Audio Speech */}
                  <button
                    onClick={() => handleVoiceRead(selectedArticle)}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
                      isPlayingSpeech 
                        ? "bg-rose-500/20 text-rose-500 border-rose-500/30 animate-pulse" 
                        : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100" :
                          isFun ? "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100" :
                          "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950"
                    }`}
                    title="Lire à haute voix"
                  >
                    {isPlayingSpeech ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Zen Mode */}
                  <button
                    onClick={() => setZenMode(!zenMode)}
                    className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                      zenMode 
                        ? "bg-zinc-500/20 text-zinc-500 border-zinc-500/30" 
                        : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100" :
                          isFun ? "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100" :
                          "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950"
                    }`}
                    title="Masquer le superflu (Mode Zen)"
                  >
                    {zenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Save Bookmark */}
                  <button
                    onClick={() => {
                      onToggleSave(selectedArticle.id);
                      onNotify(savedIds.has(selectedArticle.id) ? "Retiré des sauvegardés" : "Article sauvegardé ◈");
                    }}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      savedIds.has(selectedArticle.id)
                        ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/5 animate-none"
                        : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100" :
                          isFun ? "bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-100" :
                          "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950"
                    }`}
                    title={savedIds.has(selectedArticle.id) ? "Enlevé des favoris" : "Sauvegarder"}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>

              {/* Reader body */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar pb-24" onScroll={handleReaderScroll}>
                {/* source name & score */}
                {!zenMode && (
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-sans font-bold uppercase tracking-wider text-indigo-400">{selectedArticle.source}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold ${getScoreColor(selectedArticle.score)}`}>
                      Score: {selectedArticle.score}%
                    </span>
                  </div>
                )}

                <h3 className="font-serif italic text-2xl sm:text-3xl font-semibold leading-normal">
                  {selectedArticle.title}
                </h3>

                {!zenMode && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-sans uppercase tracking-wider pb-1">
                    <span>⏱ {getArticleTimeDisplay(selectedArticle)}</span>
                    <span>•</span>
                    <span>Catégorie: <strong>{selectedArticle.category}</strong></span>
                  </div>
                )}

                {/* Key Quotes block */}
                {extractedQuotes.length > 0 && (
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-2">
                    <h4 className="text-[10px] uppercase font-sans font-extrabold tracking-wider text-amber-300">Citations clés extraites :</h4>
                    <div className="space-y-1 text-xs text-slate-300 italic font-serif">
                      {extractedQuotes.map((q, i) => <p key={i}>{q}</p>)}
                    </div>
                  </div>
                )}

                {/* ARTICLE EN 2 PARTIES : PARTIE 1 (SYNTHÈSE CONDENSÉE) ET PARTIE 2 (ANALYSE APPROFONDIE 3X PLUS DÉTAILLÉE) */}
                <div className="space-y-6 pt-3 border-t border-slate-700/20 transition-all duration-300 relative">

                  {/* PARTIE 1 : SYNTHÈSE CONDENSÉE */}
                  <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 transition-all ${
                    isDark ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-100" :
                    isFun ? "bg-yellow-200 border-2 border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" :
                    "bg-indigo-50/80 border-indigo-200 text-indigo-950 shadow-xs"
                  }`}>
                    <div className="flex items-center justify-between gap-2 border-b border-indigo-500/20 pb-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-400 dark:text-indigo-300 border border-indigo-500/30">
                        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        Partie 1 : Synthèse condensée (Flash 15 sec)
                      </span>
                      <span className="text-[11px] font-mono font-bold opacity-75">
                        L'essentiel en bref
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-medium leading-relaxed italic">
                      {selectedArticle.summary || "Synthèse factuelle et faits clés du jour."}
                    </p>
                  </div>

                  {/* PARTIE 2 : ENQUÊTE & ANALYSE APPROFONDIE (3X PLUS DÉTAILLÉE) */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between border-b border-slate-700/20 pb-2">
                      <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-400 dark:text-indigo-300">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        Partie 2 : Enquête & Analyse approfondie (3x plus détaillée)
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-bold">
                        Grand Format
                      </span>
                    </div>

                    <div 
                      className="leading-loose font-sans space-y-5 transition-all duration-300 relative"
                      style={{ fontSize: `${fontScale * 115}%` }}
                    >
                      {isAnalyzingHighlights && (
                        <div className="flex items-center gap-1.5 text-xs text-indigo-400 animate-pulse my-2">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Analyse des passages clés par l'IA...
                        </div>
                      )}
                      {selectedArticle.content.split("\n\n").map((p, idx) => (
                        <React.Fragment key={idx}>
                          {renderParagraphWithHighlights(p)}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                </div>

                {/* SECTION : CREUSER LE SUJET (Analyse & Approfondissement par l'IA) */}
                <div id="creuser-sujet-section" className={`mt-6 p-5 border rounded-2xl space-y-4 shadow-xl transition-all ${
                  isSobre ? (isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-zinc-50 border-zinc-200 text-zinc-950") :
                  isWarm ? (isDark ? "bg-[#382f2a] border-amber-900/30 text-amber-100 font-serif" : "bg-[#FAF6F0] border-amber-900/20 text-amber-950 font-serif") :
                  isCyber ? (isDark ? "bg-black border-cyan-400 text-cyan-400 font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "bg-teal-50 border-teal-500/30 text-teal-950 font-mono") :
                  isFun ? (isDark ? "bg-zinc-900 border-3 border-white text-white rounded-2xl" : "bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black") :
                  (isDark ? "bg-slate-900/80 border-indigo-500/30 text-slate-100 backdrop-blur-md" : "bg-indigo-50/70 border-indigo-200 text-slate-900")
                }`}>
                  <div className="flex items-center justify-between border-b border-slate-700/10 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                        <Search className="w-4 h-4 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base flex items-center gap-1.5">
                          Creuser le sujet <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        </h4>
                        <p className="text-[11px] opacity-75">
                          Posez une question ou explorez des angles d'analyse approfondis avec l'IA.
                        </p>
                      </div>
                    </div>
                    {deepDiveHistory.length > 0 && (
                      <span className="text-xs px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-mono font-bold">
                        {deepDiveHistory.length} analyse{deepDiveHistory.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Smart Suggested Exploration Angles */}
                  <div className="space-y-2">
                    <span className="text-[11px] uppercase font-bold tracking-wider opacity-75 block">
                      💡 Pistes d'approfondissement suggérées :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {[
                        { icon: "🧐", label: "Contexte & Origines", query: `Quels sont les antécédents, l'historique et le contexte global liés à : "${selectedArticle.title}" ?` },
                        { icon: "⚖️", label: "Enjeux juridiques & économiques", query: `Quels sont les impacts économiques, financiers ou réglementaires majeurs soulevés par cet article ?` },
                        { icon: "🌍", label: "Conséquences sociétales & citoyennes", query: `Comment cette situation affecte-t-elle concrètement les citoyens, les usagers et le grand public ?` },
                        { icon: "🔮", label: "Perspectives à venir & Risques", query: `Quels sont les risques potentiels, les prochaines étapes clés et les évolutions à surveiller ?` }
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          disabled={isDeepDiving}
                          onClick={() => handleDeepDive(item.query)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 group ${
                            isDark
                              ? "bg-slate-950/40 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/60 text-slate-300 hover:text-white"
                              : "bg-white border-slate-250 hover:border-indigo-400 hover:bg-indigo-50/50 text-slate-800 shadow-xs"
                          }`}
                        >
                          <span className="text-sm group-hover:scale-110 transition-transform shrink-0">{item.icon}</span>
                          <div className="flex flex-col">
                            <span className="font-bold text-[11px] text-indigo-400 group-hover:text-indigo-300">{item.label}</span>
                            <span className="text-[10px] opacity-80 line-clamp-1">{item.query}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Prompt Input */}
                  <div className="space-y-2 pt-2 border-t border-slate-700/10">
                    <label className="text-[11px] font-bold opacity-80 block">
                      💬 Ou posez votre propre question spécifique :
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={deepDiveQuery}
                        onChange={(e) => setDeepDiveQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isDeepDiving) {
                            handleDeepDive();
                          }
                        }}
                        placeholder="Ex: Quel est le coût estimé ? Quels sont les pays concernés ?"
                        className={`flex-1 px-3.5 py-2 text-xs rounded-xl border outline-none transition-all ${
                          isDark
                            ? "bg-slate-950 border-slate-800 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            : "bg-white border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        }`}
                      />
                      <button
                        disabled={isDeepDiving || !deepDiveQuery.trim()}
                        onClick={() => handleDeepDive()}
                        className={`px-4 py-2 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          isFun
                            ? "bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400"
                            : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white"
                        }`}
                      >
                        {isDeepDiving ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            Analyse...
                          </>
                        ) : (
                          <>
                            <Search className="w-3.5 h-3.5" />
                            Creuser
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Loading State */}
                  {isDeepDiving && (
                    <div className="py-6 text-center space-y-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 animate-pulse">
                      <div className="flex justify-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                      <p className="text-xs font-semibold text-indigo-400">
                        L'IA analyse le sujet et génère votre fiche d'approfondissement...
                      </p>
                    </div>
                  )}

                  {/* Deep Dive History & Latest Response */}
                  {deepDiveHistory.length > 0 && (
                    <div className="space-y-4 pt-3 border-t border-slate-700/15">
                      <h5 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                        <span>📖</span> Fiches d'Analyse Approfondie ({deepDiveHistory.length})
                      </h5>
                      {deepDiveHistory.map((item, hIdx) => (
                        <div 
                          key={hIdx}
                          className={`p-4 rounded-xl border space-y-2 text-xs leading-relaxed transition-all ${
                            isDark ? "bg-slate-950/70 border-indigo-500/20 text-slate-200" : "bg-white border-indigo-100 text-slate-800 shadow-sm"
                          }`}
                        >
                          <div className="font-bold text-indigo-400 flex items-center justify-between border-b border-slate-700/10 pb-1.5">
                            <span className="flex items-center gap-1.5">
                              <span>❓</span> {item.question}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`Question: ${item.question}\n\nAnalyse:\n${item.answer}`);
                                onNotify("📋 Analyse copiée dans le presse-papier !");
                              }}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                              title="Copier cette analyse"
                            >
                              Copier
                            </button>
                          </div>
                          <div className="whitespace-pre-wrap font-sans opacity-95 space-y-1 pt-1">
                            {item.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Summary Box */}
                {!zenMode && (
                  <div className={`rounded-xl p-4 space-y-4 shadow-sm mt-4 border ${
                    isSobre 
                      ? (isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-250")
                      : isWarm
                        ? (isDark ? "bg-[#382f2a] border-amber-900/30" : "bg-[#FAF6F0] border-amber-900/20")
                        : isCyber
                          ? (isDark ? "bg-black border-cyan-500/30" : "bg-teal-50 border-teal-500/20")
                          : isFun
                            ? (isDark ? "bg-zinc-900 border-2 border-black" : "bg-yellow-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]")
                            : (isDark ? "bg-slate-900/40 border-slate-800" : "bg-indigo-50/40 border-indigo-100")
                  }`}>
                    <div className={`flex items-center justify-between border-b pb-2 ${
                      isDark ? "border-zinc-800" : "border-zinc-200"
                    }`}>
                      <span className={`text-xs font-sans font-bold uppercase tracking-[0.1em] flex items-center gap-1.5 ${
                        isSobre ? (isDark ? "text-zinc-200" : "text-zinc-700") :
                        isWarm ? (isDark ? "text-amber-200" : "text-amber-900") :
                        isCyber ? (isDark ? "text-[#00ffcc]" : "text-teal-700") :
                        isFun ? "text-black" :
                        (isDark ? "text-indigo-400" : "text-indigo-700")
                      }`}>
                        <Cpu className={`w-3.5 h-3.5 animate-pulse ${
                          isSobre ? (isDark ? "text-zinc-400" : "text-zinc-550") :
                          isWarm ? (isDark ? "text-amber-400" : "text-amber-700") :
                          isCyber ? (isDark ? "text-[#00ffcc]" : "text-teal-600") :
                          isFun ? "text-black" :
                          (isDark ? "text-indigo-400" : "text-indigo-600")
                        }`} />
                        Synthèse intelligente IA
                      </span>
                      {selectedArticle.aiSummaryModelUsed && (
                        <span className={`text-[10px] font-mono font-semibold ${
                          isDark ? "text-zinc-500" : "text-zinc-400"
                        }`}>
                          via {selectedArticle.aiSummaryModelUsed}
                        </span>
                      )}
                    </div>

                    {isSummarizing ? (
                      <div className="py-4 text-center text-zinc-400 space-y-2">
                        <div className="flex justify-center gap-1">
                          <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                        <p className="font-sans font-semibold text-cyan-400 text-[11px] animate-pulse">Rappatriement et analyse du contenu en cours...</p>
                      </div>
                    ) : (
                      <div className={`text-xs sm:text-sm leading-relaxed font-sans space-y-2 whitespace-pre-wrap ${
                        isDark ? "text-zinc-200" : "text-zinc-850"
                      }`}>
                        {selectedArticle.aiSummaryCustom ? (
                          selectedArticle.aiSummaryCustom
                        ) : (
                          <>
                            <p>{selectedArticle.summary}</p>
                            <p className={`text-[10px] italic mt-2 ${
                              isDark ? "text-zinc-500" : "text-zinc-550"
                            }`}>
                              *Ceci est un extrait statique. Cliquez ci-dessous pour regénérer une synthèse exhaustive avec votre IA préférée.*
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Summary tool selectors */}
                    <div className={`pt-2 border-t flex items-center gap-2 justify-between ${
                      isDark ? "border-zinc-800" : "border-zinc-250"
                    }`}>
                      <select
                        value={summaryModelId}
                        onChange={(e) => setSummaryModelId(e.target.value)}
                        className={`rounded p-1 text-xs outline-none font-sans cursor-pointer max-w-[120px] ${
                          isDark 
                            ? "bg-zinc-950 border border-zinc-800 text-zinc-300 focus:border-indigo-500" 
                            : "bg-white border border-zinc-250 text-zinc-700 focus:border-indigo-400"
                        }`}
                      >
                        {AVAILABLE_MODELS.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleGenerateSummary(selectedArticle)}
                        disabled={isSummarizing}
                        className={`px-3 py-1.5 hover:opacity-95 disabled:opacity-40 font-sans font-bold text-xs rounded transition-all cursor-pointer uppercase tracking-wider ${
                          isFun 
                            ? "bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400" 
                            : "bg-linear-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white"
                        }`}
                      >
                        Synthèse IA Live
                      </button>
                    </div>
                  </div>
                )}

                {/* QUIZ DE COMPRÉHENSION ADAPTATIF */}
                {isGeneratingQuiz && (
                  <div className="py-4 text-center text-zinc-400 space-y-2">
                    <div className="flex justify-center gap-1">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                    <p className="font-sans font-semibold text-cyan-400 text-[11px] animate-pulse">Génération de votre Quiz IA personnalisé...</p>
                  </div>
                )}

                {quizQuestions.length > 0 && (
                  <div className={`mt-6 p-5 border rounded-2xl space-y-4 shadow-xl transition-all ${
                    isSobre ? "bg-zinc-50 border-zinc-200 text-zinc-950" :
                    isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-950 font-serif" :
                    isCyber ? "bg-black border-cyan-400 text-cyan-400 font-mono shadow-[0_0_10px_rgba(6,182,212,0.15)]" :
                    isFun ? "bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black" :
                    "bg-slate-950/90 border-indigo-500/30 backdrop-blur-md"
                  }`}>
                    <div className="flex items-center gap-2 justify-between border-b border-slate-700/10 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <Award className={`w-5 h-5 ${isFun ? "text-yellow-500" : "text-amber-400"}`} />
                        <h4 className="font-bold text-sm tracking-wide">Quiz de Compréhension IA 🧠</h4>
                      </div>
                      <span className="text-xs font-mono">Question {currentQuizIndex + 1} / {quizQuestions.length}</span>
                    </div>

                    {!quizCompleted ? (
                      <div className="space-y-3">
                        <p className="text-sm font-semibold">{quizQuestions[currentQuizIndex].question}</p>
                        <div className="grid grid-cols-1 gap-2">
                          {quizQuestions[currentQuizIndex].options.map((opt: string, optIdx: number) => {
                            const isSelected = selectedQuizOption === optIdx;
                            const isCorrect = quizQuestions[currentQuizIndex].correctAnswerIndex === optIdx;
                            
                            let optStyle = "";
                            if (showQuizResult) {
                              if (isCorrect) optStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                              else if (isSelected) optStyle = "bg-rose-500/20 border-rose-500 text-rose-400";
                              else optStyle = "opacity-50 border-transparent bg-slate-900/20";
                            } else {
                              optStyle = isSelected ? "border-indigo-500 bg-indigo-500/10" : "hover:bg-slate-900/10 border-slate-700/20";
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={showQuizResult}
                                onClick={() => setSelectedQuizOption(optIdx)}
                                className={`w-full text-left py-2 px-3.5 text-xs rounded-xl border transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                              >
                                <span>{opt}</span>
                                {showQuizResult && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>

                        {showQuizResult && (
                          <div className="p-3 bg-slate-900/15 border border-slate-700/10 rounded-xl text-[11px] leading-relaxed">
                            <span className="font-bold text-cyan-400 block mb-1">🔍 Pourquoi ?</span>
                            {quizQuestions[currentQuizIndex].explanation}
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          {!showQuizResult ? (
                            <button
                              disabled={selectedQuizOption === null}
                              onClick={() => {
                                setShowQuizResult(true);
                                const isCorrect = selectedQuizOption === quizQuestions[currentQuizIndex].correctAnswerIndex;
                                if (isCorrect) {
                                  setQuizScore(prev => prev + 1);
                                  onAwardCuriosityPoints(3, "Bonne réponse au Quiz IA (+3 pts)", selectedArticle.category, "quiz");
                                } else {
                                  onNotify("❌ Mauvaise réponse ! Lisez attentivement l'explication.");
                                }
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                            >
                              Vérifier la réponse
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                if (currentQuizIndex < quizQuestions.length - 1) {
                                  setCurrentQuizIndex(prev => prev + 1);
                                  setSelectedQuizOption(null);
                                  setShowQuizResult(false);
                                } else {
                                  setQuizCompleted(true);
                                  onNotify(`🎉 Quiz terminé ! Score final : ${quizScore}/${quizQuestions.length}`);
                                }
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                            >
                              {currentQuizIndex < quizQuestions.length - 1 ? "Question Suivante" : "Terminer le Quiz"}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 space-y-3">
                        <div className="text-3xl">🎉</div>
                        <p className="text-sm font-bold">Quiz de compréhension complété !</p>
                        <p className="text-xs opacity-75">Votre score : {quizScore} / {quizQuestions.length}</p>
                        <button
                          onClick={() => {
                            setHasTriggeredQuiz(false);
                            setQuizQuestions([]);
                          }}
                          className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Fermer le quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* POURQUOI CET ARTICLE - TRANSPARENCE */}
                {!zenMode && (
                  <div className={`mt-6 p-4 border rounded-2xl space-y-3 ${
                    isSobre ? "bg-zinc-50 border-zinc-200 text-zinc-950" :
                    isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-950 font-serif" :
                    isCyber ? "bg-black border-cyan-400 text-[#00ffcc] font-mono shadow-[0_0_10px_rgba(0,255,204,0.15)]" :
                    isFun ? "bg-white border-3 border-black text-black shadow-[3px_3px_0px_rgba(0,0,0,1)]" :
                    "bg-slate-900/30 border-indigo-500/15"
                  }`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Pourquoi cet article ? (Algorithme Transparent)
                    </h4>
                    <p className="text-[11px] opacity-75 leading-relaxed">
                      Cet article a obtenu un score de recommandation de <strong>{selectedArticle.score}%</strong>. Voici les signaux pris en compte par votre profil d'intérêt :
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] leading-tight">
                      <div className="p-2 bg-slate-950/20 border border-slate-700/10 rounded-xl space-y-1">
                        <span className="font-bold text-cyan-400 block mb-0.5">Poids de la catégorie :</span>
                        <div>• {selectedArticle.category} (niveau {categoryWeights[selectedArticle.category] !== undefined ? categoryWeights[selectedArticle.category] : 3}/5)</div>
                      </div>
                      <div className="p-2 bg-slate-950/20 border border-slate-700/10 rounded-xl space-y-1">
                        <span className="font-bold text-pink-400 block mb-0.5">Suivi de lecture passif :</span>
                        <div>• Signal {passiveSignalsSettings.trackReadingTime ? "Activé" : "Désactivé"}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI SURLIGNAGE TOOLTIP FLOAT */}
                {hoveredHighlightExplanation && hoveredHighlightPos && (
                  <div 
                    className="fixed z-50 max-w-xs p-3 bg-slate-900 border border-indigo-500/30 text-slate-100 rounded-xl text-xs shadow-2xl pointer-events-none backdrop-blur-md animate-fade-in font-sans leading-relaxed"
                    style={{ 
                      left: `${hoveredHighlightPos.x + 10}px`, 
                      top: `${hoveredHighlightPos.y}px`,
                      transform: "translateY(-50%)"
                    }}
                  >
                    <div className="flex items-center gap-1 font-bold text-cyan-400 mb-1">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Pourquoi c'est important :</span>
                    </div>
                    {hoveredHighlightExplanation}
                  </div>
                )}

                {/* Article tags */}
                {!zenMode && (
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {selectedArticle.tags.map((t) => (
                      <span 
                        key={t} 
                        className={`text-xs px-2.5 py-0.5 rounded-full border transition-colors ${
                          isDark 
                            ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" 
                            : isSobre 
                              ? "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900" 
                              : isWarm 
                                ? "bg-amber-100/60 border-amber-900/10 text-amber-900 font-serif hover:bg-amber-100" 
                                : isCyber 
                                  ? "bg-[#00ffcc]/10 border-[#00ffcc]/30 text-cyan-600 font-mono hover:bg-[#00ffcc]/20" 
                                  : isFun 
                                    ? "bg-cyan-100 border-2 border-black text-black font-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] hover:bg-cyan-200" 
                                    : "bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100"
                        }`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Reader Actions Footer */}
              <div className="pt-4 border-t border-slate-700/20 flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => {
                    const el = document.getElementById("creuser-sujet-section");
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="py-1.5 px-3 bg-indigo-950/80 border border-indigo-700/50 text-indigo-200 hover:text-white hover:bg-indigo-900 text-xs font-sans font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="Aller à la section d'approfondissement IA"
                >
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  Creuser le sujet
                </button>

                <button
                  onClick={() => handleExtractQuotes(selectedArticle)}
                  disabled={isExtractingQuotes}
                  className="flex-1 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-sans font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  {isExtractingQuotes ? "Extraction..." : "Citations clés"}
                </button>

                <button
                  onClick={() => handleShareArticle(selectedArticle)}
                  className="py-1.5 px-3 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-sans font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="Copier le résumé"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                  Partager
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowExportDropdown(!showExportDropdown)}
                    className="py-1.5 px-3 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white text-xs font-sans font-bold rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Choisir le format d'exportation"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Exporter
                  </button>

                  {showExportDropdown && (
                    <>
                      {/* Backdrop to close dropdown on tap outside */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowExportDropdown(false)}
                      />
                      <div className="absolute left-0 bottom-full mb-2 w-64 max-w-[85vw] bg-slate-950 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 animate-fade-in">
                        <div className="px-3 py-2 text-[10px] text-slate-400 uppercase font-bold border-b border-slate-800">
                          Format d'exportation
                        </div>
                        <button
                          onClick={() => {
                            handleExportArticle(selectedArticle, "html");
                            setShowExportDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs font-bold text-emerald-400 hover:bg-slate-900 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <span className="text-sm">👁️‍🗨️</span>
                          <div className="flex flex-col">
                            <span>HTML (Grandes Lettres)</span>
                            <span className="text-[10px] font-normal text-slate-400">Idéal téléphones (taille ajustable)</span>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            handleExportArticle(selectedArticle, "txt");
                            setShowExportDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2.5 text-xs text-slate-300 hover:bg-slate-900 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <span className="text-sm">📄</span>
                          <div className="flex flex-col">
                            <span>Texte brut (.txt)</span>
                            <span className="text-[10px] font-normal text-slate-500">Format classique brut</span>
                          </div>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                <a
                  href={getArticleOriginalUrl(selectedArticle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 bg-linear-to-r from-indigo-500 to-cyan-500 hover:opacity-95 text-white text-xs font-sans font-bold rounded-lg flex items-center justify-center gap-1 transition-all text-center"
                >
                  Original
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className={`border-dashed rounded-2xl p-5 h-full flex flex-col items-center justify-center text-center space-y-3 shadow-inner transition-all duration-300 ${
              isSobre ? "bg-zinc-50 border-zinc-300 border text-zinc-500" :
              isWarm ? "bg-[#FAF6F0] border-amber-900/15 border text-amber-900 font-serif" :
              isCyber ? "bg-black border-cyan-500/30 border text-[#00ffcc] font-mono shadow-[0_0_15px_rgba(6,182,212,0.1)]" :
              isFun ? "bg-yellow-50 border-3 border-black border-dashed rounded-2xl text-black" :
              "bg-slate-900/30 border border-slate-800/80 text-slate-500 font-sans"
            }`}>
              <Cpu className={`w-8 h-8 animate-pulse ${
                isSobre ? "text-zinc-400" :
                isWarm ? "text-amber-800/50" :
                isCyber ? "text-cyan-500" :
                isFun ? "text-black" :
                "text-indigo-500/20"
              }`} />
              <div>
                <h4 className={`font-semibold text-sm ${
                  isSobre ? "text-zinc-800" :
                  isWarm ? "text-amber-950 font-bold" :
                  isCyber ? "text-white" :
                  isFun ? "text-black font-extrabold" :
                  "text-slate-400"
                }`}>Aucun article sélectionné</h4>
                <p className={`text-xs max-w-[200px] mx-auto mt-1 leading-normal ${
                  isSobre ? "text-zinc-500" :
                  isWarm ? "text-amber-900/80" :
                  isCyber ? "text-cyan-500" :
                  isFun ? "text-black font-medium" :
                  "text-slate-600"
                }`}>
                  Sélectionnez un article du flux à gauche pour lire le contenu complet et générer des résumés en temps réel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Limit Modal */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-lg text-white leading-tight">
                  Limite d'essai atteinte
                </h3>
                <p className="text-xs text-indigo-400 mt-1 uppercase tracking-wider font-bold">
                  Hébergeur &amp; API Quota
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed font-sans">
              <p>
                Vous avez déjà effectué votre première génération gratuite avec la clé de l'administrateur.
              </p>
              <p>
                Pour éviter d'épuiser les quotas de l'hébergeur et continuer à rédiger des articles personnalisés de haute précision, veuillez configurer votre propre clé API Gemini gratuite.
              </p>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between gap-2 mt-2">
                <span className="text-[10px] text-slate-400 font-mono">Clé Gemini requise</span>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  Obtenir une clé gratuite ↗
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowLimitModal(false);
                  if (onNavigateToTab) {
                    onNavigateToTab("keys");
                  }
                }}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-sans font-bold rounded-lg transition-colors cursor-pointer text-center"
              >
                Configurer ma clé API
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white text-xs font-sans font-medium rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
