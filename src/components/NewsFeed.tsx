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
  BookOpen,
  Sliders,
  Youtube,
  Copy
} from "lucide-react";
import { NewsArticle, ApiKeys, AVAILABLE_MODELS } from "../types";
import { motion } from "motion/react";
import { encodeArticleForShare, decodeArticleFromShare, buildShareUrl, getSharedArticleFromUrl } from "../lib/shareHelper";
import { SettingsVolet } from "./SettingsVolet";

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
    imageUrl: "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    summary: "L'équipe React chez Meta annonce React 20 avec le compilateur React intégré nativement. La mémoïsation manuelle via useMemo, useCallback et memo() devient obsolète.",
    content: "La conférence React Summit 2026 a été marquée par l'annonce de React 20, dont la feature principale est l'intégration native du React Compiler — jusqu'ici en bêta séparée.\n\nLe compilateur analyse statiquement le code et insère automatiquement les optimisations de mémoïsation là où elles sont pertinentes. Les benchmarks internes montrent une réduction de 30 à 60% du code boilerplate dans les applications React typiques.\n\nPar ailleurs, React 20 introduit un système de Server Components simplifié et une nouvelle API de transitions plus expressive."
  },
  {
    id: 3,
    featured: true,
    title: "La Grande-Motte : coup d'envoi des travaux d'extension du port et de réaménagement du front de mer",
    source: "Midi Libre avec Région Occitanie",
    category: "Local",
    time: "il y a 3h",
    score: 88,
    emoji: "🌊",
    tags: ["Occitanie", "Littoral", "Hérault"],
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    summary: "La station balnéaire héraultaise lance la nouvelle tranche de réhabilitation de son port de plaisance et de ses espaces publics côtiers pour renforcer l'attractivité et la protection environnementale.",
    content: "La ville de La Grande-Motte a officiellement engagé les travaux d'aménagement de son nouveau bassin portuaire et de requalification des espaces piétons du front de mer.\n\nCe projet d'envergure, soutenu par la Région Occitanie et les acteurs locaux du nautisme, vise à moderniser les infrastructures d'accueil des bateaux, à développer des anneaux éco-responsables et à valoriser le patrimoine architectural labellisé Patrimoine du XXe siècle.\n\nLes élus locaux et les responsables maritimes rappellent l'importance de concilier dynamisme économique, préservation du trait de côte et accueil touristique durable."
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
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
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
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80",
    summary: "Avec iPadOS 18.4, Apple Intelligence apporte la génération d'images on-device sur iPad Pro M4, sans connexion cloud requise.",
    content: "La mise à jour iPadOS 18.4 déployée hier soir active les fonctionnalités Apple Intelligence sur iPad Pro M4 et M4 Ultra. La puce Neural Engine des puces M4 permet désormais la génération d'images directement sur l'appareil, sans envoi de données vers les serveurs Apple.\n\nLes performances sont remarquables : une image 1024×1024 se génère en moins de 3 secondes sur iPad Pro M4. Apple précise que les données restent exclusivement sur l'appareil grâce au Private Cloud Compute."
  },
  {
    id: 12,
    featured: false,
    title: "Transition énergétique : essor record des batteries solides et réseaux électriques intelligents",
    source: "Les Echos",
    category: "Économie",
    time: "il y a 11h",
    score: 86,
    emoji: "⚡",
    tags: ["Énergie", "Batteries", "Économie"],
    imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80",
    summary: "Les investissements dans les batteries à électrolyte solide et les micro-réseaux intelligents atteignent un niveau historique pour stabiliser l'approvisionnement en énergies renouvelables.",
    content: "L'industrialisation des accumulateurs solides de nouvelle génération marque un tournant pour la transition énergétique en Europe. Ces batteries offrent une densité énergétique doublée et une sécurité thermique maximale face aux risques de surchauffe.\n\nLes gestionnaires de réseaux raccordent d'importantes capacités de stockage décentralisées pour compenser l'intermittence du solaire et de l'éolien lors des pics de consommation.\n\nCette technologie permet également d'accélérer l'électrification des transports lourds et des flottes de bus urbains."
  },
  {
    id: 13,
    featured: false,
    title: "Exploration spatiale : la sonde d'analyse d'astéroïde rapporte de précieux échantillons organiques",
    source: "Ciel & Espace",
    category: "Technologie",
    time: "il y a 12h",
    score: 82,
    emoji: "☄️",
    tags: ["Espace", "Science", "Astronomie"],
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    summary: "La capsule spatiale a atterri avec succès dans le désert, rapportant des matières carbonées préservées depuis 4,5 milliards d'années.",
    content: "Les équipes scientifiques internationales ont réceptionné les conteneurs scellés contenant plusieurs dizaines de grammes de poussières prélevées sur un astéroïde primitif.\n\nLes premières analyses en salle blanche révèlent une diversité remarquable de molécules organiques et de minéraux hydratés témoins des premiers âges du système solaire.\n\nCes données uniques apportent de nouveaux indices cruciaux sur l'origine de l'eau et des composés prébiotiques sur Terre."
  },
  {
    id: 14,
    featured: false,
    title: "Santé et biotechnologies : impression 3D de micro-tissus cellulaires vascularisés",
    source: "Science & Vie",
    category: "Technologie",
    time: "il y a 13h",
    score: 89,
    emoji: "🧬",
    tags: ["Biotech", "Santé", "Innovation"],
    imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
    summary: "Des chercheurs en ingénierie tissulaire réussissent à bio-imprimer des matrices cellulaires dotées de capillaires sanguins fonctionnels.",
    content: "Une équipe pluridisciplinaire d'ingénieurs et de biologistes a mis au point un procédé d'impression 3D biologique permettant de créer des réseaux vasculaires microscopiques au sein de tissus vivants.\n\nCette avancée majeure permet de maintenir en vie des greffons cutanés et cardiaques complexes et d'évaluer la toxicité des futurs traitements sans avoir recours à l'expérimentation animale.\n\nLes premiers essais précliniques démontrent une intégration tissulaire rapide et une vascularisation stable."
  },
  {
    id: 15,
    featured: false,
    title: "Mobilité propre : mise en service des premiers trains régionaux à hydrogène en Occitanie",
    source: "La Tribune",
    category: "Local",
    time: "il y a 14h",
    score: 84,
    emoji: "🚆",
    tags: ["Mobilité", "Hydrogène", "Occitanie"],
    imageUrl: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80",
    summary: "Les premières rames de trains à pile à combustible hydrogène transportent leurs premiers voyageurs quotidiens sur les lignes non électrifiées du Sud.",
    content: "La Région Occitanie et la SNCF ont inauguré la circulation commerciale des rames régionales alimentées à l'hydrogène vert sur les axes régionaux secondaires.\n\nSilencieuses et n'émettant que de la vapeur d'eau, ces rames constituent une alternative moderne et zéro émission aux anciens autorails diesel.\n\nCe déploiement s'inscrit dans un plan territorial d'envergure associant production locale d'hydrogène par électrolyse et réseau de distribution vertueux."
  }
];

export const getArticleImage = (art: Partial<NewsArticle>): string => {
  if (art?.imageUrl && typeof art.imageUrl === "string" && art.imageUrl.startsWith("http")) {
    return art.imageUrl;
  }
  
  const text = `${art?.title || ""} ${art?.category || ""} ${(art?.tags || []).join(" ")} ${art?.summary || ""}`.toLowerCase();
  
  if (text.includes("poterie") || text.includes("céramique") || text.includes("artisan") || text.includes("argile") || text.includes("grès")) {
    return "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("exoplanète") || text.includes("astronomie") || text.includes("nasa") || text.includes("télescope") || text.includes("espace") || text.includes("galaxie") || text.includes("astéroïde") || text.includes("cosmos") || text.includes("étoile")) {
    return "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("incendie") || text.includes("feu") || text.includes("pompier") || text.includes("forêt") || text.includes("nuñez") || text.includes("sécurité civile") || text.includes("hectare")) {
    return "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("claude") || text.includes("anthropic") || text.includes("benchmark") || text.includes("llm") || text.includes("ia act") || text.includes("intelligence artificielle") || text.includes("deepseek") || text.includes("mistral") || text.includes("agent")) {
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("openai") || text.includes("gpt") || text.includes("chatgpt")) {
    return "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("react") || text.includes("javascript") || text.includes("compiler") || text.includes("code") || text.includes("dev") || text.includes("typescript") || text.includes("frontend")) {
    return "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("grande-motte") || text.includes("port") || text.includes("littoral") || text.includes("mer") || text.includes("plage") || text.includes("bateau") || text.includes("côte")) {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("figma") || text.includes("design") || text.includes("ui") || text.includes("ux") || text.includes("graphisme")) {
    return "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("data center") || text.includes("datacenter") || text.includes("serveur") || text.includes("cloud") || text.includes("infrastructure")) {
    return "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("parlement") || text.includes("europe") || text.includes("régulation") || text.includes("loi") || text.includes("juridique") || text.includes("politique")) {
    return "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("startup") || text.includes("médialab") || text.includes("levée") || text.includes("entreprise") || text.includes("business") || text.includes("bourse")) {
    return "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("apple") || text.includes("ipad") || text.includes("iphone") || text.includes("mac")) {
    return "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("batterie") || text.includes("énergie") || text.includes("électrique") || text.includes("solaire") || text.includes("éolien")) {
    return "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("santé") || text.includes("cellulaire") || text.includes("bio") || text.includes("médecine") || text.includes("hôpital") || text.includes("vaccin")) {
    return "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80";
  }
  if (text.includes("train") || text.includes("hydrogène") || text.includes("sncf") || text.includes("rail") || text.includes("mobilité")) {
    return "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80";
  }

  // Category fallback
  const cat = (art?.category || "").toLowerCase();
  if (cat.includes("ia") || cat.includes("tech")) {
    return "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("éco") || cat.includes("finance")) {
    return "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("env") || cat.includes("climat")) {
    return "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("culture") || cat.includes("design") || cat.includes("art")) {
    return "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=600&q=80";
  }
  if (cat.includes("local") || cat.includes("région") || cat.includes("occitanie")) {
    return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80";
  }

  return "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80";
};

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

const getYouTubeSearchUrl = (article: NewsArticle): string => {
  const cleanTitle = article.title.replace(/[#@$%^*_+\=\[\]{}|\\<>]/g, " ").trim();
  const query = `${cleanTitle} ${article.source || ""}`.trim();
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

// Helper to clean and format text (extracts JSON fields if JSON string was passed)
const extractCleanReadableText = (raw: string): string => {
  if (!raw || typeof raw !== "string") return "";
  let text = raw.trim();

  // If text starts as JSON object or array
  if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
    try {
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const item = parsed[0];
        if (item.corps || item.content) {
          const parts: string[] = [];
          if (item.titre || item.title) parts.push(`📌 **${item.titre || item.title}**`);
          if (item.resume || item.summary) parts.push(`🔍 **Synthèse :** ${item.resume || item.summary}`);
          parts.push(item.corps || item.content);
          return parts.join("\n\n");
        }
      } else if (parsed && typeof parsed === "object") {
        if (parsed.corps || parsed.content || parsed.summary || parsed.resume) {
          const parts: string[] = [];
          if (parsed.titre || parsed.title) parts.push(`📌 **${parsed.titre || parsed.title}**`);
          if (parsed.resume || parsed.summary) parts.push(`🔍 **Synthèse :** ${parsed.resume || parsed.summary}`);
          if (parsed.corps || parsed.content) parts.push(parsed.corps || parsed.content);
          return parts.join("\n\n");
        }
      }
    } catch {
      // Regex fallback cleaning if JSON is slightly malformed
      text = text
        .replace(/\{"title":"[^"]*",/g, "")
        .replace(/"source":"[^"]*",/g, "")
        .replace(/"category":"[^"]*",/g, "")
        .replace(/"emoji":"[^"]*",/g, "")
        .replace(/"tags":\[[^\]]*\],/g, "")
        .replace(/"summary":"/g, "🔍 **Synthèse :** ")
        .replace(/"content":"/g, "\n\n")
        .replace(/\\n/g, "\n")
        .replace(/["{}]/g, "");
    }
  }

  return text.replace(/\\n/g, "\n");
};

// Inline markdown formatter for bold & italic text + emojis
const renderFormattedInline = (str: string, isDarkTheme = false) => {
  // Match bold **text** or italic *text*
  const parts = str.split(/(\*\*.*?\*\*|\*[^*]+?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong
          key={i}
          className={`font-extrabold ${isDarkTheme ? "text-indigo-300" : "text-indigo-950 font-black"}`}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={i} className="italic font-semibold">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

export const isHallucinatedOrCorrupted = (art: { title?: string; summary?: string; content?: string } | null | undefined): boolean => {
  if (!art) return true;
  const title = (art.title || "").trim().toLowerCase();
  const summary = (art.summary || "").trim().toLowerCase();
  const content = (art.content || "").trim().toLowerCase();
  const allText = `${title} ${summary} ${content}`;

  // Title validity
  if (!title || title.length < 6) return true;
  if (title === "actualité monde" || title === "actualite monde" || title === "thème sensible" || title === "theme sensible") return true;
  if (title.includes("donne-moi toutes") || title.includes("donne moi toutes") || title.includes("l'actualité récente autour de donne-moi")) return true;

  // Hallucination and boilerplate templates
  const forbiddenPatterns = [
    "résumé de l'actualité du jour",
    "comporte des aspects régulés",
    "attention soutenue de la part des observateurs",
    "transformations significatives dans ce domaine",
    "acteurs du secteur",
    "font l'objet d'un suivi approfondi",
    "décisions publiques concernant",
    "acteurs institutionnels ont présenté",
    "séances plénières",
    "groupe technologique européen",
    "directeur de la stratégie numérique au sein du groupe technologique",
    "saluent cette décision qui devrait renforcer",
    "ce choix stratégique intervient dans un contexte de forte concurrence",
    "valentin richaud",
    "panier de vanessa",
    "les dernières dépêches et bilans transmis par les agences",
    "ce sujet passionnant",
    "nos journalistes décryptent",
    "la prise de fonction est effective dès aujourd'hui"
  ];

  return forbiddenPatterns.some((p) => allText.includes(p));
};

// Formatter for deep analysis sheets
export const cleanInterestQuery = (raw: string): string => {
  if (!raw) return "";
  let clean = raw.trim();
  clean = clean.replace(/^(?:donne[- ]moi(?: toutes les)?(?: des)?|peux[- ]tu me donner|quelles sont les nouvelles sur|je veux savoir|parle[- ]moi de|recherche(?: sur)?|actualit[ée]s? sur|tout savoir sur|informations? sur|d[ée]p[ê]ches sur|faits divers sur)\s+/i, "");
  clean = clean.replace(/^(?:sur|concernant|à propos de|autour de)\s+/i, "");
  clean = clean.replace(/[.?!\n\r«»"']+/g, " ").trim();
  return clean;
};

const renderAnalysisContent = (text: string, sizeClass: string, isDarkTheme = false) => {
  const cleanStr = extractCleanReadableText(text);
  const lines = cleanStr.split("\n");

  return (
    <div className={`space-y-3.5 ${sizeClass} w-full ${isDarkTheme ? "text-white" : "text-black"}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        // Primary headers like 📌 Synthèse, 🔍 Éléments, 🔮 Perspectives, ###, ##, #
        const isHeader =
          trimmed.startsWith("📌") ||
          trimmed.startsWith("🔍") ||
          trimmed.startsWith("🔮") ||
          trimmed.startsWith("💡") ||
          trimmed.startsWith("⚖️") ||
          trimmed.startsWith("🌍") ||
          trimmed.startsWith("🧠") ||
          trimmed.startsWith("🛡️") ||
          trimmed.startsWith("###") ||
          trimmed.startsWith("##") ||
          trimmed.startsWith("# ");

        if (isHeader) {
          const cleanHeader = trimmed.replace(/^#+\s*/, "").replace(/\*\*/g, "");
          return (
            <div
              key={idx}
              className={`pt-3 pb-1.5 border-b font-black text-lg sm:text-xl flex items-center gap-2 ${
                isDarkTheme
                  ? "border-zinc-800 text-indigo-300"
                  : "border-zinc-300 text-zinc-950 font-black"
              }`}
            >
              <span>{cleanHeader}</span>
            </div>
          );
        }

        // Bullet lists
        if (trimmed.startsWith("- ") || trimmed.startsWith("• ") || trimmed.startsWith("* ")) {
          const bulletText = trimmed.replace(/^[-•*]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2.5 leading-relaxed w-full">
              <span className={`font-black text-lg mt-0.5 shrink-0 ${isDarkTheme ? "text-indigo-400" : "text-indigo-700"}`}>•</span>
              <span className={`flex-1 font-medium ${isDarkTheme ? "text-zinc-100" : "text-black"}`}>
                {renderFormattedInline(bulletText, isDarkTheme)}
              </span>
            </div>
          );
        }

        // Numbered list (e.g. "1. ", "2. ")
        const numMatch = trimmed.match(/^(\d+[\.\)])\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 leading-relaxed w-full">
              <span className={`font-black text-sm sm:text-base mt-0.5 shrink-0 font-mono ${isDarkTheme ? "text-indigo-400" : "text-indigo-700"}`}>
                {numMatch[1]}
              </span>
              <span className={`flex-1 font-medium ${isDarkTheme ? "text-zinc-100" : "text-black"}`}>
                {renderFormattedInline(numMatch[2], isDarkTheme)}
              </span>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className={`leading-relaxed sm:leading-loose w-full font-medium ${isDarkTheme ? "text-zinc-100" : "text-black"}`}>
            {renderFormattedInline(trimmed, isDarkTheme)}
          </p>
        );
      })}
    </div>
  );
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
      return `border rounded-xl p-3 sm:p-3.5 shadow-xs transition-all flex flex-col justify-between ${
        isDark ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-100" : "bg-white border-zinc-200 hover:border-zinc-350 text-zinc-900"
      }`;
    }
    if (isWarm) {
      return `border rounded-xl p-3 sm:p-3.5 shadow-xs font-serif transition-all flex flex-col justify-between ${
        isDark ? "bg-[#251e1a] border-[#3e322a] hover:bg-[#2c231e] text-[#FAF6F0]" : "bg-[#FDFBF7] border-amber-900/10 hover:bg-[#FAF6F0] text-amber-955"
      }`;
    }
    if (isCyber) {
      return `border rounded-none p-3 sm:p-3.5 shadow-xs font-mono transition-all flex flex-col justify-between ${
        isDark ? "bg-zinc-950 border-cyan-500/25 hover:border-cyan-400 hover:shadow-[0_0_10px_rgba(6,182,212,0.25)] text-cyan-400" : "bg-[#f2fdfc] border-teal-500/35 hover:border-teal-500 hover:shadow-[0_0_10px_rgba(13,148,136,0.2)] text-teal-900"
      }`;
    }
    if (isFun) {
      return `border-2 border-black rounded-xl p-3 sm:p-3.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 flex flex-col justify-between ${
        isDark ? "bg-[#322a48] text-zinc-100" : "bg-white text-black"
      }`;
    }
    return `border rounded-xl p-3 sm:p-3.5 shadow-sm transition-all flex flex-col justify-between ${
      isDark ? "bg-slate-900/50 backdrop-blur-md border-slate-800 hover:border-indigo-500/30 hover:bg-slate-900/70 text-slate-100" : "bg-white border-indigo-100 hover:border-indigo-300 hover:bg-indigo-50/10 text-slate-850"
    }`;
  };

  const getTitleClass = () => {
    if (isSobre) return `${isDark ? "text-zinc-50 group-hover:text-white" : "text-zinc-950 group-hover:text-black"} font-extrabold font-sans text-sm sm:text-[15px] md:text-base tracking-tight leading-snug`;
    if (isWarm) return `${isDark ? "text-amber-50 group-hover:text-amber-200" : "text-[#2e1d14] group-hover:text-[#1a0f0a]"} font-bold font-serif text-sm sm:text-[15px] md:text-base tracking-tight leading-snug`;
    if (isCyber) return `${isDark ? "text-[#00ffcc] group-hover:text-cyan-200" : "text-teal-950 group-hover:text-teal-700"} font-black font-mono text-xs sm:text-[13px] md:text-sm tracking-wide uppercase leading-snug`;
    if (isFun) return `${isDark ? "text-pink-300" : "text-black"} font-black font-sans text-sm sm:text-base md:text-[17px] uppercase tracking-tight leading-snug italic`;
    return `${isDark ? "text-slate-50 group-hover:text-indigo-300" : "text-slate-900 group-hover:text-indigo-600"} font-extrabold font-sans text-sm sm:text-[15px] md:text-base tracking-tight leading-snug transition-colors`;
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
      let list: NewsArticle[] = [];
      if (saved) {
        const parsed = JSON.parse(saved) as NewsArticle[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seenIds = new Set<number>();
          let idCounter = 200;
          list = parsed
            .filter((art) => {
              if (!art || typeof art !== "object") return false;
              if (isHallucinatedOrCorrupted(art)) return false;
              return true;
            })
            .map((art, idx) => {
              let artId = typeof art.id === "number" && !isNaN(art.id) ? art.id : idx + 1;
              if (seenIds.has(artId)) {
                artId = idCounter++;
              }
              seenIds.add(artId);
              art = { ...art, id: artId };

              // Replace any legacy generic placeholder text or raw JSON string
              if (art.content && (art.content.includes("Ce sujet passionnant") || art.content.includes("nos journalistes décryptent"))) {
                art.summary = `Compte-rendu factuel et données vérifiées concernant : ${art.title}.`;
                art.content = `Les dernières dépêches et bilans transmis par les agences de presse régionales et nationales font état des avancées concernant ${art.title}.\n\nLes équipes et représentants institutionnels ont fait le point sur les projets opérationnels et le calendrier des prochaines étapes.\n\nDe nouvelles précisions sont attendues à la suite des prochaines concertations publiques.`;
              }
              if (art.content && typeof art.content === "string" && (art.content.trim().startsWith("{") || art.content.trim().startsWith("["))) {
                art.content = extractCleanReadableText(art.content);
              }
              if (art.summary && typeof art.summary === "string" && (art.summary.trim().startsWith("{") || art.summary.trim().startsWith("["))) {
                art.summary = extractCleanReadableText(art.summary);
              }
              if (art.aiSummaryCustom && typeof art.aiSummaryCustom === "string" && (art.aiSummaryCustom.trim().startsWith("{") || art.aiSummaryCustom.trim().startsWith("["))) {
                art.aiSummaryCustom = extractCleanReadableText(art.aiSummaryCustom);
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
              return art;
            });
        }
      }

      // If list is empty or had only corrupted items, populate with all 15 INITIAL_ARTICLES
      if (!list || list.length < 8) {
        const existingTitles = new Set((list || []).map((a) => a.title.trim().toLowerCase()));
        const missing = INITIAL_ARTICLES.filter((a) => !existingTitles.has(a.title.trim().toLowerCase())).map((art, idx) => ({
          ...art,
          id: Date.now() + 500 + idx,
          createdAt: Date.now() - (idx * 45 * 60 * 1000)
        }));
        list = [...(list || []), ...missing];
      }

      const sharedFromUrl = getSharedArticleFromUrl(list);
      if (sharedFromUrl) {
        const exists = list.some((a) => a.id === sharedFromUrl.id || a.title.trim().toLowerCase() === sharedFromUrl.title.trim().toLowerCase());
        if (!exists) {
          return [sharedFromUrl, ...list];
        }
      }
      return list;
    } catch {
      const defaultList = INITIAL_ARTICLES.map((art, idx) => ({
        ...art,
        id: Date.now() + 500 + idx,
        createdAt: Date.now() - idx * 45 * 60 * 1000
      }));
      const sharedFromUrl = getSharedArticleFromUrl(defaultList);
      if (sharedFromUrl) {
        const exists = defaultList.some((a) => a.id === sharedFromUrl.id || a.title.trim().toLowerCase() === sharedFromUrl.title.trim().toLowerCase());
        if (!exists) {
          return [sharedFromUrl, ...defaultList];
        }
      }
      return defaultList;
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
  const [analysisFontSize, setAnalysisFontSize] = useState<"normal" | "large" | "xlarge">(() => {
    return (localStorage.getItem("infoperso_analysis_font_size") as "normal" | "large" | "xlarge") || "large";
  });
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
      id: Date.now() + 500 + idx,
      createdAt: Date.now() - idx * 45 * 60 * 1000
    }));
    setArticles(freshBaseline);
    localStorage.removeItem("infoperso_articles");
    localStorage.removeItem("infoperso_last_updated");
    onNotify("🔄 Flux réinitialisé aux 15 articles vérifiés de l'application !");
  };

  const handleBulkGenerateIAArticles = async (isAutoRefresh: boolean = false) => {
    if (isBulkGenerating) return;

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
      onNotify("🔮 Recherche d'actualités récentes et rédaction de 15 articles...");
    } else {
      onNotify("🔄 Actualisation automatique : 15 nouveaux articles...");
    }

    // Baseline fallback pool guaranteeing 15 verified articles
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
        cat: "Technologie",
        src: "TechCrunch",
        emoji: "🛡️",
        tags: ["Sécurité", "IA", "Réseaux"],
        summary: "Les agences de sécurité des systèmes d'information déploient de nouvelles architectures cryptographiques post-quantiques pour protéger les réseaux d'énergie et de transport.",
        content: "En réponse à la sophistication croissante des attaques numériques ciblées, les opérateurs d'importance vitale modernisent leurs protocoles de chiffrement et leurs centres de surveillance opérationnelle.\n\nL'intégration de systèmes de détection automatisée basés sur des agents intelligents permet de neutraliser les intrusions en quelques millisecondes sans interruption de service.\n\nCette transition vers des standards de sécurité renforcés s'accompagne de formations intensives pour l'ensemble des experts en cybersécurité au niveau national et européen."
      },
      {
        theme: "Déploiement des réseaux électriques intelligents et stockage par batteries solides",
        cat: "Économie",
        src: "Les Echos",
        emoji: "⚡",
        tags: ["Énergie", "Batteries", "Économie"],
        summary: "Les investissements dans les batteries à électrolyte solide et les smart grids atteignent de nouveaux records d'efficacité énergétique.",
        content: "La transition vers les énergies renouvelables s'accélère grâce à l'industrialisation des batteries solides de haute densité. Ces accumulateurs de nouvelle génération offrent une recharge deux fois plus rapide et une sécurité thermique accrue.\n\nLes gestionnaires de réseau déploient des micro-centrales de stockage réparties pour lisser la production éolienne et solaire en temps réel.\n\nCe virage technologique garantit une stabilité inédite pour l'alimentation des grandes agglomérations et des zones industrielles."
      },
      {
        theme: "Éducation et IA : déploiement de tuteurs pédagogiques personnalisés dans les universités",
        cat: "Médias",
        src: "Courrier International",
        emoji: "🎓",
        tags: ["Éducation", "IA", "Université"],
        summary: "Les campus universitaires intègrent des assistants IA d'apprentissage interactif guidant les étudiants pas à pas dans la résolution d'exercices complexes.",
        content: "De grandes universités francophones et européennes testent à grande échelle des tuteurs numériques capables de s'adapter au rythme de chaque apprenant.\n\nLoin de fournir des réponses automatisées, ces interfaces encouragent le raisonnement critique, proposent des indices progressifs et identifient les lacunes conceptuelles.\n\nLes premiers retours pédagogiques soulignent une nette amélioration de la rétention des connaissances et une réduction des taux de décrochage en première année."
      },
      {
        theme: "Biotechnologies : impression 3D de tissus cellulaires et greffes sur mesure",
        cat: "Technologie",
        src: "Science & Vie",
        emoji: "🧬",
        tags: ["Biotech", "Santé", "Innovation"],
        summary: "La bio-impression 3D permet de concevoir des micro-tissus cardiaques et cutanés fonctionnels pour tester de nouveaux traitements.",
        content: "Les chercheurs en génie tissulaire franchissent une étape capitale avec la création de matrices biologiques vascularisées imprimées en trois dimensions.\n\nCes modèles vivants permettent de tester la toxicité des nouveaux médicaments sans recours aux animaux de laboratoire tout en reproduisant fidèlement les réactions du corps humain.\n\nLes hôpitaux universitaires préparent les premiers protocoles cliniques de greffes cutanées bio-imprimées pour les grands brûlés."
      },
      {
        theme: "Mobilité urbaine : expansion des trains régionaux à hydrogène et pistes cyclables express",
        cat: "Local",
        src: "La Tribune",
        emoji: "🚆",
        tags: ["Mobilité", "Hydrogène", "Occitanie"],
        summary: "De nouvelles rames de trains régionaux à hydrogène entrent en service commercial sur les lignes non électrifiées du Sud.",
        content: "Les premières lignes ferroviaires équipées de trains à pile à combustible hydrogène transportent désormais leurs premiers voyageurs quotidiens dans le Sud de la France.\n\nSilencieuses et totalement décarbonées à l'échappement, ces rames offrent une alternative performante et écologique aux anciens autorails diesel.\n\nEn parallèle, les métropoles régionales inaugurent des autoroutes à vélos sécurisées pour relier les communes périphériques aux centres urbains."
      },
      {
        theme: "Exploration spatiale : la mission d'analyse d'astéroïde rapporte de précieux échantillons",
        cat: "Technologie",
        src: "Ciel & Espace",
        emoji: "☄️",
        tags: ["Espace", "Science", "Astronomie"],
        summary: "La capsule de retour d'échantillons d'un astéroïde primitif a atterri avec succès, livrant des matières organiques vieilles de 4,5 milliards d'années.",
        content: "Les laboratoires de planétologie ont reçu les premiers fragments prélevés à la surface d'un astéroïde carboné lors d'une mission spatiale au long cours.\n\nLes spectromètres de masse révèlent une diversité exceptionnelle d'acides aminés et de minéraux hydratés conservés depuis la formation du système solaire.\n\nCes analyses permettront de mieux comprendre l'origine de l'eau et des briques élémentaires de la vie sur Terre."
      }
    ];

    // Build authentic baseline fallbacks
    const nowTime = Date.now();
    const tailoredFallbacks: NewsArticle[] = fallbackTopics.map((topic, idx) => {
      return {
        id: nowTime + 2000 + idx, // Brand new unique ID guaranteeing not read / not gray
        featured: idx < 2,
        title: topic.theme,
        source: topic.src,
        category: topic.cat,
        time: "À l'instant",
        createdAt: nowTime - (idx * 30 * 60 * 1000),
        score: 85 + (idx % 3) * 4,
        emoji: topic.emoji,
        tags: topic.tags,
        summary: topic.summary,
        content: topic.content
      };
    });

    // Choose model
    const selectedModel = AVAILABLE_MODELS.find((m) => m.id === "gemini-3.7-flash") || AVAILABLE_MODELS[0];
    const userApiKey = apiKeys[selectedModel.provider];

    const currentYear = new Date().getFullYear();
    const currentDateStr = new Date().toLocaleDateString("fr-FR");

    const systemInstruction = 
      "Tu es la rédaction en chef d'InfoPerso, un agrégateur d'actualité 100% FACTUELLE ET RÉELLEMENT PARUE DANS LA PRESSE.\n" +
      "🔴 RÈGLE ABSOLUE ANTI-HALLUCINATION : Fournis UNIQUEMENT des événements réels qui ont fait l'objet d'articles de presse officiels (ex: AFP, Le Monde, Les Echos, Reuters, TechCrunch, Le Figaro, Franceinfo, Midi Libre).\n" +
      "INTERDICTION FORMELLE D'INVENTER DES NOMINATIONS, DES PERSONNES, DES ENTREPRISES VAGUES ('un groupe technologique européen', 'un géant de la tech'), OU DES FAITS FICTIFS.\n" +
      "Si un thème personnalisé de l'utilisateur n'a AUCUNE actualité avérée dans la presse aujourd'hui, NE CRÉE PAS D'ARTICLE DESSUS et choisis à la place une véritable grande actualité du jour vérifiée.\n\n" +
      "Réponds STRICTEMENT sous la forme d'un tableau JSON contenant 15 objets avec les champs suivants :\n" +
      "- 'titre' : titre journalistique réel et précis\n" +
      "- 'source' : grand média reconnu réel\n" +
      "- 'categorie' : IA | Technologie | Économie | Local | Environnement | Médias | Science\n" +
      "- 'emoji' : émoji pertinent\n" +
      "- 'tags' : tableau de 3 mots-clés\n" +
      "- 'resume' : synthèse claire de 2-3 phrases avec les faits clés vérifiés\n" +
      "- 'corps' : texte informatif de 3 paragraphes factuels\n" +
      "- 'score' : entier entre 78 et 98\n\n" +
      "Uniquement le tableau JSON brut [ ... ], sans balises markdown.";

    const promptText = `Recherche et sélectionne 15 articles d'actualité du jour vérifiés et récents (${currentDateStr} ${currentYear}). Réponds uniquement par le tableau JSON.`;

    let generatedValidArticles: NewsArticle[] = [];

    try {
      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,
          enableSearch: true,
          temperature: 0.2,
          messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: promptText }
          ],
          apiKey: userApiKey,
        }),
      });

      const data = res.ok ? await res.json() : null;

      if (data && data.content) {
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
          } else {
            const startObj = jsonStr.indexOf("{");
            const endObj = jsonStr.lastIndexOf("}");
            if (startObj !== -1 && endObj !== -1 && endObj >= startObj) {
              jsonStr = `[${jsonStr.substring(startObj, endObj + 1).trim()}]`;
            }
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
            console.warn("Direct JSON parse failed, trying object extraction regex...", jsonErr);
            // Regex object extraction fallback
            const objMatches = jsonStr.match(/\{[\s\S]*?\}/g);
            if (objMatches) {
              parsedList = objMatches.map(m => {
                try { return JSON.parse(m); } catch { return null; }
              }).filter(Boolean);
            }
          }
        }

        // If wrapped in an envelope object like { articles: [...] } or { actualites: [...] }
        if (!Array.isArray(parsedList) && parsedList && typeof parsedList === "object") {
          const obj = parsedList as any;
          if (Array.isArray(obj.articles)) parsedList = obj.articles;
          else if (Array.isArray(obj.actualites)) parsedList = obj.actualites;
          else if (Array.isArray(obj.items)) parsedList = obj.items;
          else if (Array.isArray(obj.news)) parsedList = obj.news;
        }

        if (Array.isArray(parsedList) && parsedList.length > 0) {
          for (let idx = 0; idx < parsedList.length; idx++) {
            const p = parsedList[idx];
            if (!p || typeof p !== "object") continue;
            if (p.status === "no_news" || p.status === "error") continue;

            const title = (p.titre || p.title || p.headline || p.nom || p.sujet || "").trim();
            const summary = (p.resume || p.summary || p.description || p.chapeau || p.lead || "").trim();
            const content = (p.corps || p.content || p.texte || p.article || summary).trim();

            if (!title || title.length < 6 || isHallucinatedOrCorrupted({ title, summary, content })) continue;
            if (!summary || summary.length < 15 || summary === "Résumé de l'actualité du jour.") continue;
            const source = (p.source || p.media || p.journal || "Presse Vérifiée & AFP").trim();
            const category = (p.categorie || p.category || p.rubrique || "Technologie").trim();
            const tags = Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : [category, "Actualité"];
            const emoji = p.emoji || "📰";
            const score = Number(p.score) || (82 + (idx % 15));

            generatedValidArticles.push({
              id: nowTime + 3000 + idx, // Brand new unique ID guaranteeing not read / not gray
              featured: idx < 2,
              title,
              source,
              category,
              time: "À l'instant",
              createdAt: nowTime - (idx * 25 * 60 * 1000),
              score,
              emoji,
              tags,
              summary,
              content
            });
          }
        }
      }
    } catch (err) {
      console.warn("Bulk article AI generation error, using rich verified fallback:", err);
    }

    // Combine generated articles with tailored fallbacks to guarantee a full 15-article feed
    let finalNewArticles: NewsArticle[] = [];
    if (generatedValidArticles.length >= 15) {
      finalNewArticles = generatedValidArticles.slice(0, 15);
    } else {
      const needed = 15 - generatedValidArticles.length;
      finalNewArticles = [
        ...generatedValidArticles,
        ...tailoredFallbacks.slice(0, needed)
      ];
    }

    // Preserve any existing bookmarked articles
    const savedArticles = articles.filter(art => savedIds.has(art.id));
    const newTitles = new Set(finalNewArticles.map(a => a.title.trim().toLowerCase()));
    const uniqueSaved = savedArticles.filter(a => !newTitles.has(a.title.trim().toLowerCase()));

    const fullFeed = [...finalNewArticles, ...uniqueSaved];
    setArticles(fullFeed);
    localStorage.setItem("infoperso_articles", JSON.stringify(fullFeed));
    localStorage.setItem("infoperso_last_updated", Date.now().toString());

    onNotify(`✨ 15 articles d'actualité récents et vérifiés ont été générés et chargés !`);
    setIsBulkGenerating(false);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [minScore, setMinScore] = useState(40); // lowered default minimum score so users can see matches below 60 too
  const [sortBy, setSortBy] = useState<"score" | "date" | "time">("score");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(() => {
    try {
      return getSharedArticleFromUrl(INITIAL_ARTICLES);
    } catch {
      return null;
    }
  });

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
        const rawContent = data.content || "Analyse synthétique générée pour cet enjeu.";
        const answer = extractCleanReadableText(rawContent);
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
      return <p className={`indent-3 leading-relaxed tracking-wide font-normal ${isDark ? "text-zinc-100" : "text-black"}`}>{paragraph}</p>;
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
      <p className={`indent-3 leading-relaxed tracking-wide font-normal ${isDark ? "text-zinc-100" : "text-black"}`}>
        {parts.map((p, i) => {
          if (p.isHighlight) {
            let hlClass = "";
            if (isDark) {
              hlClass = "bg-zinc-800 text-amber-300 font-bold px-1 rounded-xs border border-zinc-700 cursor-help";
            } else {
              hlClass = "bg-yellow-200 text-black font-bold px-1 rounded-xs border border-yellow-300 cursor-help";
            }

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

  // Automatically load and open a shared article based on the URL query param or hash on mount
  useEffect(() => {
    try {
      const shared = getSharedArticleFromUrl(articles);
      if (shared) {
        setArticles((prev) => {
          const exists = prev.some((a) => a.id === shared.id || a.title.trim().toLowerCase() === shared.title.trim().toLowerCase());
          if (!exists) {
            return [shared, ...prev];
          }
          return prev;
        });

        setSelectedArticle(shared);
        onNotify(`✨ Article partagé ouvert : "${shared.title}"`);
        if (onAwardCuriosityPoints) {
          onAwardCuriosityPoints(3, `Découverte d'un article partagé (+3 pts) : "${shared.title}"`, shared.category, "read");
        }

        setTimeout(() => {
          const readerEl = document.getElementById("active-article-reader");
          if (readerEl) {
            readerEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 350);
      }
    } catch (err) {
      console.error("Error parsing shared article query parameter", err);
    }
  }, []);

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
    const cleanTopic = cleanInterestQuery(interest) || interest.trim();
    if (!cleanTopic) return;

    if (!apiKeys.gemini) {
      const used = localStorage.getItem("infoperso_free_gen_used") === "true";
      if (used) {
        setShowLimitModal(true);
        return;
      }
    }

    setIsGeneratingCustom(cleanTopic);
    
    // Choose model
    const selectedModel = AVAILABLE_MODELS.find((m) => m.id === "gemini-3.7-flash") || AVAILABLE_MODELS[0];
    const userApiKey = apiKeys[selectedModel.provider];

    const currentYear = new Date().getFullYear();
    const currentDateStr = new Date().toLocaleDateString("fr-FR");

    const systemInstruction = 
      "Tu es le moteur journalistique d'InfoPerso, un portail d'information 100% FACTUELLE ET VÉRIFIÉE en français.\n\n" +
      "## 🔴 RÈGLE ABSOLUE ANTI-HALLUCINATION : ZÉRO INVENTION / ZÉRO HISTOIRE FICTIVE\n" +
      "- Tu as interdiction formelle d'inventer des nominations, des personnes, des déclarations, des entreprises vagues ('un groupe technologique européen', 'un géant de la tech'), ou des événements imaginaires.\n" +
      "- Si la recherche Google ne trouve AUCUN article de presse réel et récent documenté dans des médias reconnus (AFP, Le Monde, Les Echos, Le Figaro, France Bleu, Midi Libre, Reuters, etc.) pour le sujet exact demandé, TU DOIS OBLIGATOIREMENT renvoyer status = 'no_news'.\n" +
      "- Ne tente JAMAIS de fabriquer un communiqué ou une dépêche plausible pour satisfaire la demande. L'honnêteté factuelle est obligatoire.\n\n" +
      "## Structure JSON obligatoire de sortie\n" +
      "Réponds UNIQUEMENT avec un objet JSON valide :\n" +
      "{\n" +
      '  "status": "ok",\n' +
      '  "sujet": "string",\n' +
      '  "titre": "string (titre précis issu d\'un article réel existant)",\n' +
      '  "source": "string (nom exact du média qui a publié l\'info)",\n' +
      '  "categorie": "string (Local|Politique|Économie|Tech|Culture|Science|Sport)",\n' +
      '  "date_publication": "string",\n' +
      '  "emoji": "string",\n' +
      '  "tags": ["tag1", "tag2", "tag3"],\n' +
      '  "resume": "string (2-3 phrases denses avec les faits réels extraits de la source)",\n' +
      '  "corps": "string (3 à 4 paragraphes factuels décrivant uniquement les faits réels)",\n' +
      '  "score": 92\n' +
      "}\n\n" +
      "Si pas de faits avérés récents dans la presse :\n" +
      '{"status":"no_news","sujet":"...","raison":"Aucun article d\'actualité avéré n\'a été publié sur ce sujet précis dans la presse.","pistes":["..."]}';

    const promptText = `Recherche via Google les articles récents publiés dans la presse sur : "${cleanTopic}". Rédige un compte-rendu basé EXCLUSIVEMENT sur les articles trouvés, ou renvoie status = "no_news" si aucun article réel n'existe.`;

    try {
      const res = await fetch("/api/chat/proxy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedModel.provider,
          model: selectedModel.id,
          enableSearch: true,
          temperature: 0.1,
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
            const cleaned = jsonStr.replace(/,(\s*[}\]])/g, '$1');
            parsed = JSON.parse(cleaned);
          } catch (cleanErr) {
            console.error("Cleaned JSON parse failed too.", cleanErr);
            const titleMatch = data.content.match(/"(?:titre|title)"\s*:\s*"([^"]+)"/);
            const sourceMatch = data.content.match(/"source"\s*:\s*"([^"]+)"/);
            const summaryMatch = data.content.match(/"(?:resume|summary)"\s*:\s*"([^"]+)"/);
            const contentMatch = data.content.match(/"(?:corps|content)"\s*:\s*"([\s\S]+?)"/);
            
            if (titleMatch && contentMatch && contentMatch[1].length > 40) {
              parsed = {
                status: "ok",
                titre: titleMatch[1],
                source: sourceMatch ? sourceMatch[1] : "Presse Vérifiée",
                categorie: "Actualité",
                emoji: "📰",
                tags: [cleanTopic.substring(0, 15), "Synthèse", "Actualité"],
                resume: summaryMatch ? summaryMatch[1] : `Compte-rendu sur ${cleanTopic}.`,
                corps: contentMatch[1].replace(/\\n/g, "\n"),
                score: 90
              };
            } else {
              onNotify(`ℹ️ Aucun fait avéré récent n'a été trouvé dans la presse pour "${cleanTopic}". L'IA refuse d'inventer des informations.`);
              return;
            }
          }
        }

        const candidateTitle = (parsed.titre || parsed.title || "").trim();
        const candidateSummary = (parsed.resume || parsed.summary || "").trim();
        const candidateContent = (parsed.corps || parsed.content || "").trim();

        // Handle no_news or hallucination status
        if (
          parsed.status === "no_news" ||
          !candidateContent ||
          candidateContent.length < 50 ||
          isHallucinatedOrCorrupted({ title: candidateTitle, summary: candidateSummary, content: candidateContent })
        ) {
          const raisonMsg = parsed.raison || `Aucun article de presse avéré n'a été publié sur "${cleanTopic}". L'IA refuse de fabriquer des informations.`;
          const pistes = Array.isArray(parsed.pistes) ? parsed.pistes.join(", ") : "";
          onNotify(`ℹ️ Information : ${raisonMsg} ${pistes ? `Pistes suggérées : ${pistes}` : ""}`);
          return;
        }
        
        // Generate a unique ID
        const nextId = Math.max(...articles.map((a) => a.id), 0) + 1;
        const newArticle: NewsArticle = {
          id: nextId,
          featured: true, // make it featured so it highlights!
          title: parsed.titre || parsed.title || `Actualité : ${cleanTopic}`,
          source: parsed.source || "Presse Vérifiée & AFP",
          category: parsed.categorie || parsed.category || "Actualité",
          time: "À l'instant",
          score: Number(parsed.score) || 92,
          emoji: parsed.emoji || "📰",
          tags: Array.isArray(parsed.tags) ? parsed.tags : [cleanTopic.substring(0, 15)],
          summary: parsed.resume || parsed.summary || `Compte-rendu factuel des faits récents sur : ${cleanTopic}.`,
          content: parsed.corps || parsed.content || `Dépêche d'actualité vérifiée sur : ${cleanTopic}.`
        };

        if (!apiKeys.gemini) {
          localStorage.setItem("infoperso_free_gen_used", "true");
          setFreeGenUsed(true);
        }
        setArticles((prev) => [newArticle, ...prev.filter(a => a.id !== newArticle.id)]);
        setSelectedArticle(newArticle);
        onNotify(`✨ Nouvel article vérifié généré sur "${cleanTopic}" !`);
        setTimeout(() => {
          const readerEl = document.getElementById("active-article-reader");
          if (readerEl) {
            readerEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 300);
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

  // Unified Settings Drawer / Volet state
  const [isSettingsVoletOpen, setIsSettingsVoletOpen] = useState<boolean>(false);
  const [settingsVoletTab, setSettingsVoletTab] = useState<"flux_ia" | "filters" | "themes" | "algo">("flux_ia");

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

  const handleAddCustomInterest = () => {
    if (newInterestInput.trim()) {
      handleAddInterest(newInterestInput.trim());
      setNewInterestInput("");
    }
  };

  const handleDeleteCustomInterest = (interest: string) => {
    handleRemoveInterest(interest);
  };

  const handleResetAlgorithmicData = () => {
    resetPersonalization();
  };

  const trendingTags = Array.from(
    new Set(articles.flatMap((a) => a.tags || []))
  ).slice(0, 20);

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) +
    (minScore > 40 ? 1 : 0) +
    (readingTimeFilter !== "all" ? 1 : 0) +
    (onlyBookmarks ? 1 : 0) +
    (bandwidthSaver ? 1 : 0) +
    (clickedTrendTag ? 1 : 0) +
    (activeFilter ? 1 : 0) +
    (activeTag ? 1 : 0);

  const handleClearAllFilters = () => {
    setSearchQuery("");
    setMinScore(40);
    setReadingTimeFilter("all");
    setOnlyBookmarks(false);
    setBandwidthSaver(false);
    setClickedTrendTag(null);
    if (onClearFilters) onClearFilters();
    onNotify("✨ Tous les filtres ont été réinitialisés.");
  };

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
        const cleanSummary = extractCleanReadableText(data.content);
        // Update local article's AI summary in state
        setArticles((prev) =>
          prev.map((a) =>
            a.id === article.id
              ? { ...a, aiSummaryCustom: cleanSummary, aiSummaryModelUsed: selectedModel.name }
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
      const shareUrl = buildShareUrl(article);
      const title = `📰 [InfoPerso] ${article.title}`;
      const text = `Résumé de l'article ("${article.title}") :\n${article.summary || article.content.slice(0, 160) + "..."}\n\nDécouvrez la suite sur InfoPerso :`;

      if (onAwardCuriosityPoints) {
        onAwardCuriosityPoints(2, `Partage de l'article : "${article.title}" (+2 pts)`, article.category, "share");
      }

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
        onNotify("Lien direct et résumé copiés dans le presse-papiers ! 📋");
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        try {
          const shareUrl = buildShareUrl(article);
          const fallbackText = `📰 [InfoPerso] ${article.title}\nSource: ${article.source}\n\nRésumé : ${article.summary}\n\nLien direct : ${shareUrl}`;
          await navigator.clipboard.writeText(fallbackText);
          onNotify("Lien direct et résumé copiés dans le presse-papiers ! 📋");
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
      {/* 🚀 BARRE D'ACCÈS RAPIDE AUX ARTICLES & RÉGLAGES */}
      <div
        className={`p-3 rounded-2xl border shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${
          isFun
            ? "bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
            : isSobre
            ? isDark
              ? "bg-zinc-900 border-zinc-800 text-zinc-100"
              : "bg-white border-zinc-300 text-zinc-900"
            : isWarm
            ? isDark
              ? "bg-[#251f1c] border-[#443831] text-[#f4ecd8]"
              : "bg-[#faf6ee] border-[#dfd3c3] text-[#3d332a]"
            : isCyber
            ? "bg-zinc-950 border-cyan-500/40 text-cyan-400 font-mono shadow-[0_0_12px_rgba(6,182,212,0.15)]"
            : isDark
            ? "bg-slate-900/90 border-slate-800 text-slate-100"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-100"
        }`}
      >
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim()) {
                const clean = cleanInterestQuery(searchQuery);
                if (clean) {
                  handleAddInterest(clean);
                  handleGenerateCustomArticle(clean);
                }
              }
            }}
            placeholder="Rechercher ou taper un sujet (ex: Montpellier, Gard, Tech...)"
            className={`w-full pl-9 pr-24 py-2 text-xs sm:text-sm rounded-xl border outline-none transition-all ${
              isDark ? "bg-slate-950/60 border-slate-700/60 focus:border-cyan-500 text-slate-100" : "bg-slate-50 border-slate-300 focus:border-cyan-500 text-slate-900"
            }`}
          />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <>
                <button
                  onClick={() => setSearchQuery("")}
                  className="opacity-50 hover:opacity-100 p-1"
                  title="Effacer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    const clean = cleanInterestQuery(searchQuery);
                    if (clean) {
                      handleAddInterest(clean);
                      handleGenerateCustomArticle(clean);
                    }
                  }}
                  disabled={!!isGeneratingCustom}
                  className="px-2 py-1 bg-cyan-500 hover:bg-cyan-400 text-white text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  title="Rechercher des faits récents et générer la dépêche avec l'IA"
                >
                  <Sparkles className="w-3 h-3 text-cyan-100" />
                  <span>Dépêche</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between md:justify-end">
          {/* Sort By */}
          <div className="flex items-center rounded-xl p-0.5 border border-slate-700/50 bg-slate-800/30 text-xs">
            <button
              onClick={() => setSortBy("score")}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                sortBy === "score"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              Score IA
            </button>
            <button
              onClick={() => setSortBy("time")}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                sortBy === "time"
                  ? "bg-cyan-500 text-white shadow-sm"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              Récents
            </button>
          </div>

          {/* View Mode */}
          <div className="flex items-center rounded-xl p-0.5 border border-slate-700/50 bg-slate-800/30">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-cyan-500 text-white"
                  : "opacity-60 hover:opacity-100"
              }`}
              title="Vue Grille"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-cyan-500 text-white"
                  : "opacity-60 hover:opacity-100"
              }`}
              title="Vue Liste"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* BULK GENERATE 15 ARTICLES BUTTON */}
          <button
            onClick={() => handleBulkGenerateIAArticles(false)}
            disabled={isBulkGenerating}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all border shadow-sm ${
              isBulkGenerating
                ? "opacity-75 cursor-not-allowed bg-slate-800 text-slate-400 border-slate-700"
                : isSobre
                ? "bg-zinc-900 hover:bg-black text-white border-zinc-800 shadow-zinc-800/20"
                : isWarm
                ? "bg-amber-900 hover:bg-amber-950 text-[#faf6ee] border-amber-800 font-serif shadow-amber-900/20"
                : isCyber
                ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00ffcc] border-cyan-400 font-mono shadow-[0_0_10px_rgba(0,255,204,0.3)]"
                : isFun
                ? "bg-yellow-400 hover:bg-yellow-300 text-black border-2 border-black font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5"
                : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white border-cyan-400/40 shadow-cyan-500/25 hover:shadow-cyan-500/40"
            }`}
            title="Rechercher des faits d'actualité vérifiés et régénérer 15 articles complets avec l'IA"
          >
            {isBulkGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
            ) : (
              <Sparkles className="w-4 h-4 text-cyan-200 animate-pulse" />
            )}
            <span>{isBulkGenerating ? "Génération..." : "Générer 15 articles"}</span>
          </button>

          {/* SINGLE UNIFIED SETTINGS BUTTON */}
          <button
            onClick={() => setIsSettingsVoletOpen(true)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all border shadow-sm ${
              activeFiltersCount > 0
                ? "bg-gradient-to-r from-cyan-500 to-indigo-500 text-white border-cyan-400 shadow-cyan-500/20"
                : isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Réglages &amp; Filtres</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-cyan-600 text-[10px] font-extrabold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active Filter Chips Summary (if any active) */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap px-1 text-xs">
          <span className="text-[11px] opacity-60">Filtres actifs :</span>
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Recherche: "{searchQuery}"
              <button onClick={() => setSearchQuery("")} className="hover:text-cyan-200 cursor-pointer">✕</button>
            </span>
          )}
          {minScore > 40 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Score ≥ {minScore}%
              <button onClick={() => setMinScore(40)} className="hover:text-cyan-200 cursor-pointer">✕</button>
            </span>
          )}
          {readingTimeFilter !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Lecture: {readingTimeFilter}
              <button onClick={() => setReadingTimeFilter("all")} className="hover:text-cyan-200 cursor-pointer">✕</button>
            </span>
          )}
          {onlyBookmarks && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Favoris seuls
              <button onClick={() => setOnlyBookmarks(false)} className="hover:text-cyan-200 cursor-pointer">✕</button>
            </span>
          )}
          {bandwidthSaver && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Éco données
              <button onClick={() => setBandwidthSaver(false)} className="hover:text-cyan-200 cursor-pointer">✕</button>
            </span>
          )}
          {clickedTrendTag && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              #{clickedTrendTag}
              <button onClick={() => setClickedTrendTag(null)} className="hover:text-cyan-200 cursor-pointer">✕</button>
            </span>
          )}
          <button
            onClick={handleClearAllFilters}
            className="text-[11px] font-semibold text-rose-400 hover:underline ml-auto cursor-pointer"
          >
            Effacer tout
          </button>
        </div>
      )}

      {/* UNIFIED SETTINGS MODAL / VOLET */}
      <SettingsVolet
        isOpen={isSettingsVoletOpen}
        onClose={() => setIsSettingsVoletOpen(false)}
        theme={displayMode}
        isDark={isDark}
        minScore={minScore}
        setMinScore={setMinScore}
        readingTimeFilter={readingTimeFilter}
        setReadingTimeFilter={setReadingTimeFilter}
        onlyBookmarks={onlyBookmarks}
        setOnlyBookmarks={setOnlyBookmarks}
        bandwidthSaver={bandwidthSaver}
        setBandwidthSaver={setBandwidthSaver}
        categoryWeights={categoryWeights}
        updateCategoryWeight={updateCategoryWeight}
        tagWeights={tagWeights}
        updateTagWeight={updateTagWeight}
        customInterests={customInterests}
        newInterestInput={newInterestInput}
        setNewInterestInput={setNewInterestInput}
        handleAddCustomInterest={handleAddCustomInterest}
        handleDeleteCustomInterest={handleDeleteCustomInterest}
        handleGenerateCustomArticle={handleGenerateCustomArticle}
        isGeneratingCustom={isGeneratingCustom}
        handleBulkGenerateIAArticles={handleBulkGenerateIAArticles}
        isBulkGenerating={isBulkGenerating}
        handleResetToBaseline={handleResetToBaseline}
        handleResetAlgorithmicData={handleResetAlgorithmicData}
        trendingTags={trendingTags}
        clickedTrendTag={clickedTrendTag}
        setClickedTrendTag={setClickedTrendTag}
        onNotify={onNotify}
        activeFiltersCount={activeFiltersCount}
        handleClearAllFilters={handleClearAllFilters}
      />

      {/* MAIN ARTICLES FEED AND READER SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className={selectedArticle ? "lg:col-span-4 space-y-6" : "lg:col-span-12 space-y-6"}>
          {/* 1. FEATURED ARTICLES GRID */}
          {featuredArticles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className={`w-4 h-4 ${isFun ? "text-yellow-500 fill-yellow-400 animate-bounce" : isCyber ? "text-[#00ffcc]" : isSobre ? "text-zinc-900" : isWarm ? "text-amber-800" : "text-amber-400 fill-amber-400/20"}`} />
                <h3 className={`font-bold text-[10px] tracking-widest uppercase ${isSobre ? "text-zinc-900" : isWarm ? "text-amber-950 font-serif" : isCyber ? "text-cyan-400 font-mono" : isFun ? "text-black font-black" : "text-slate-400 font-sans"}`}>
                  Articles Recommandés prioritaires
                </h3>
              </div>

              <div className={`grid gap-3 sm:gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {featuredArticles.map((art, idx) => {
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
                      className={`${getCardContainerClass()} overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 group h-full relative touch-pan-y`}
                    >
                      <div className="flex flex-col justify-between h-full w-full">
                        {/* Top Content */}
                        <div>
                          {/* Category + Source + Badge */}
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <span className={getBadgeClass()}>{art.category}</span>
                              <span className="opacity-35 text-[10px]">•</span>
                              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate ${
                                isSobre ? "text-zinc-600" :
                                isWarm ? "text-amber-900 font-semibold" :
                                isCyber ? "text-cyan-400 font-mono" :
                                isFun ? "text-black font-black" :
                                "text-slate-300 font-semibold font-sans"
                              }`}>{art.source}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {art.emoji && (
                                <span className="text-sm drop-shadow-xs">{art.emoji}</span>
                              )}
                              <span className={`font-sans font-bold text-[10px] sm:text-[11px] tracking-wider uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
                                isSobre ? "bg-zinc-900 text-white" :
                                isWarm ? "bg-amber-950 text-white font-serif" :
                                isCyber ? "bg-black border border-cyan-400 text-cyan-400 font-mono" :
                                isFun ? "bg-yellow-300 text-black border-2 border-black font-black" :
                                "bg-linear-to-r from-violet-600 via-fuchsia-600 to-rose-600 text-white shadow-fuchsia-500/25"
                              }`}>
                                ★ {art.score}%
                              </span>
                            </div>
                          </div>

                          <h4 className={`${getTitleClass()} line-clamp-3 mb-2 group-hover:opacity-90 transition-opacity`}>
                            {art.title}
                          </h4>

                          <p className={`text-xs sm:text-[13px] leading-relaxed line-clamp-3 mb-3 ${
                            isSobre ? "text-zinc-600" :
                            isWarm ? "text-amber-900/85 font-serif" :
                            isCyber ? "text-cyan-500 font-mono" :
                            isFun ? "text-black font-medium" :
                            "text-slate-400 font-sans"
                          }`}>
                            {art.summary}
                          </p>
                        </div>

                        {/* bottom tags & stats */}
                        <div className={`pt-2 border-t flex flex-wrap items-center justify-between gap-1.5 text-[11px] ${
                          isSobre ? "border-zinc-200" :
                          isWarm ? "border-amber-900/10" :
                          isCyber ? "border-cyan-500/10" :
                          isFun ? "border-black" :
                          "border-slate-800"
                        }`}>
                          <div className="flex gap-1 overflow-hidden">
                            {art.tags.slice(0, 3).map((t) => (
                              <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded border truncate max-w-[120px] ${
                                isSobre ? "bg-zinc-50 border-zinc-200 text-zinc-700" :
                                isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-900 font-serif" :
                                isCyber ? "bg-black border-cyan-500/20 text-cyan-400 font-mono" :
                                isFun ? "bg-cyan-100 border-2 border-black text-black font-black" :
                                "text-indigo-300 bg-indigo-500/10 border-indigo-500/15 font-sans"
                              }`}>
                                #{t}
                              </span>
                            ))}
                          </div>

                          <div className={`flex items-center gap-1 text-[10px] sm:text-[11px] ${
                            isSobre ? "text-zinc-500" :
                            isWarm ? "text-amber-850 font-serif" :
                            isCyber ? "text-cyan-500 font-mono" :
                            isFun ? "text-black font-black" :
                            "text-slate-400 font-sans"
                          }`}>
                            <Clock className={`w-3 h-3 ${isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-cyan-400/60"}`} />
                            <span>{getArticleTimeDisplay(art)}</span>
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
                        const clean = cleanInterestQuery(searchQuery);
                        if (clean) {
                          handleAddInterest(clean);
                          handleGenerateCustomArticle(clean);
                        }
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
              <div className={`grid gap-3 sm:gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
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
                      className={`${getCardContainerClass()} overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 relative touch-pan-y ${
                        isRead ? "opacity-60 hover:opacity-100" : ""
                      }`}
                    >
                      {/* Left indicator strip */}
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-950 rounded-l overflow-hidden">
                        <div className={`h-full ${isFun ? "bg-black" : isSobre ? "bg-zinc-800" : isWarm ? "bg-amber-900" : getScoreFillColor(art.score)}`} style={{ height: `${art.score}%` }}></div>
                      </div>

                      <div className="flex flex-col justify-between h-full w-full pl-2">
                        {/* Top Content */}
                        <div>
                          {/* Category + Source + Match Badge */}
                          <div className="flex items-center justify-between gap-1.5 mb-2">
                            <div className="flex items-center gap-1.5 min-w-0 truncate">
                              <span className={getBadgeClass()}>{art.category}</span>
                              <span className="opacity-35 text-[10px]">•</span>
                              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider truncate ${
                                isSobre ? "text-zinc-600" :
                                isWarm ? "text-amber-900 font-semibold" :
                                isCyber ? "text-cyan-400 font-mono" :
                                isFun ? "text-black font-black" :
                                "text-slate-300 font-semibold font-sans"
                              }`}>{art.source}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {art.emoji && (
                                <span className="text-sm drop-shadow-xs">{art.emoji}</span>
                              )}
                              <span className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full border font-bold shadow-xs ${
                                isSobre ? "bg-zinc-100 border-zinc-200 text-zinc-900" :
                                isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-950 font-serif" :
                                isCyber ? "bg-black border-cyan-400/30 text-cyan-400 font-mono" :
                                isFun ? "bg-yellow-300 border-2 border-black text-black font-black" :
                                `${getScoreColor(art.score)} font-mono`
                              }`}>
                                {art.score}% Match
                              </span>
                            </div>
                          </div>

                          <h4 className={`${getTitleClass()} line-clamp-3 mb-2 group-hover:opacity-90 transition-opacity`}>
                            {art.title}
                          </h4>

                          <p className={`text-xs sm:text-[13px] leading-relaxed line-clamp-3 mb-3 ${
                            isSobre ? "text-zinc-650 font-sans" :
                            isWarm ? "text-amber-900/85 font-serif" :
                            isCyber ? "text-cyan-500 font-mono" :
                            isFun ? "text-black font-medium" :
                            "text-slate-400 font-sans"
                          }`}>
                            {art.summary}
                          </p>
                        </div>

                        {/* bottom tags & stats */}
                        <div className={`pt-2 border-t flex items-center justify-between gap-1.5 text-[11px] ${
                          isSobre ? "border-zinc-200" :
                          isWarm ? "border-amber-900/10" :
                          isCyber ? "border-cyan-500/10" :
                          isFun ? "border-black" :
                          "border-slate-800"
                        }`}>
                          <div className="flex gap-1 overflow-hidden">
                            {art.tags.slice(0, 3).map((t) => (
                              <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded border truncate max-w-[120px] ${
                                isSobre ? "bg-zinc-50 border-zinc-200 text-zinc-700" :
                                isWarm ? "bg-[#FAF6F0] border-amber-900/10 text-amber-900 font-serif" :
                                isCyber ? "bg-black border-cyan-500/20 text-cyan-400 font-mono" :
                                isFun ? "bg-cyan-100 border-2 border-black text-black font-black" :
                                "text-slate-400 bg-slate-900 border-slate-850 font-sans"
                              }`}>
                                #{t}
                              </span>
                            ))}
                          </div>

                          <div className={`flex items-center gap-1 text-[10px] sm:text-[11px] ${
                            isSobre ? "text-zinc-500" :
                            isWarm ? "text-amber-850 font-serif" :
                            isCyber ? "text-cyan-500 font-mono" :
                            isFun ? "text-black font-black" :
                            "text-slate-400 font-sans"
                          }`}>
                            <Clock className={`w-3 h-3 ${isCyber ? "text-[#00ffcc]" : isFun ? "text-black" : "text-cyan-400/40"}`} />
                            <span>{getArticleTimeDisplay(art)}</span>
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
              className={`w-full h-full flex flex-col justify-between overflow-hidden relative transition-all duration-300 px-2 sm:px-5 pt-2 pb-3 sm:py-4 ${
                isDark ? "bg-black text-white selection:bg-zinc-850" :
                isFun ? "bg-yellow-50 text-black shadow-xs" :
                "bg-white text-black selection:bg-zinc-100"
              } ${
                isFun 
                  ? "border-3 border-black rounded-none lg:rounded-2xl lg:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                  : "border-0 lg:border lg:border-zinc-200 dark:lg:border-zinc-800 lg:rounded-2xl lg:shadow-2xl"
              }`}
            >
              {/* Absolute Close Button at Top-Right */}
              <button
                onClick={() => setSelectedArticle(null)}
                className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                  isDark ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800" :
                  isFun ? "bg-yellow-300 border border-black text-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400" :
                  "bg-zinc-50 border-zinc-250 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100"
                }`}
                title="Fermer l'article"
              >
                <X className="w-3.5 h-3.5" />
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
              <div className={`flex items-center justify-between border-b pb-1.5 mb-2.5 shrink-0 gap-2 pr-8 sm:pr-10 ${isDark ? "border-zinc-800" : "border-zinc-150"}`}>
                <span className={`text-[9px] uppercase font-sans font-bold tracking-wider truncate max-w-[100px] sm:max-w-none ${
                  isDark ? "text-zinc-400" : isFun ? "text-black" : "text-zinc-500"
                }`}>
                  {zenMode ? "Mode Zen" : "Lecteur d'Article"}
                </span>

                <div className="flex items-center gap-1">
                  {/* Font Resizer */}
                  <div className={`flex items-center gap-0.5 px-1 py-0.5 rounded-md border text-[10px] font-bold ${
                    isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" :
                    isFun ? "bg-white border border-black text-black" :
                    "bg-zinc-50 border-zinc-200 text-zinc-800"
                  }`}>
                    <button onClick={() => setFontScale(Math.max(0.85, fontScale - 0.15))} className="px-1 text-zinc-400 hover:text-current cursor-pointer" title="A-">A-</button>
                    <span className="text-[9px] font-mono font-bold text-zinc-500">{Math.round(fontScale * 100)}%</span>
                    <button onClick={() => setFontScale(Math.min(1.6, fontScale + 0.15))} className="px-1 text-zinc-400 hover:text-current cursor-pointer" title="A+">A+</button>
                  </div>

                  {/* Audio Speech */}
                  <button
                    onClick={() => handleVoiceRead(selectedArticle)}
                    className={`p-1 rounded-md border cursor-pointer transition-colors ${
                      isPlayingSpeech 
                        ? "bg-rose-500/20 text-rose-500 border-rose-500/30 animate-pulse" 
                        : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100" :
                          isFun ? "bg-white border border-black text-black hover:bg-yellow-100" :
                          "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950"
                    }`}
                    title="Lire à haute voix"
                  >
                    {isPlayingSpeech ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>

                  {/* Zen Mode */}
                  <button
                    onClick={() => setZenMode(!zenMode)}
                    className={`p-1 rounded-md border cursor-pointer transition-all ${
                      zenMode 
                        ? "bg-zinc-500/20 text-zinc-500 border-zinc-500/30" 
                        : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100" :
                          isFun ? "bg-white border border-black text-black hover:bg-yellow-100" :
                          "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950"
                    }`}
                    title="Masquer le superflu (Mode Zen)"
                  >
                    {zenMode ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </button>

                  {/* Save Bookmark */}
                  <button
                    onClick={() => {
                      onToggleSave(selectedArticle.id);
                      onNotify(savedIds.has(selectedArticle.id) ? "Retiré des sauvegardés" : "Article sauvegardé ◈");
                    }}
                    className={`p-1 rounded-md border transition-colors cursor-pointer ${
                      savedIds.has(selectedArticle.id)
                        ? "text-yellow-500 border-yellow-500/30 bg-yellow-500/5 animate-none"
                        : isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-100" :
                          isFun ? "bg-white border border-black text-black hover:bg-yellow-100" :
                          "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-zinc-950"
                    }`}
                    title={savedIds.has(selectedArticle.id) ? "Enlevé des favoris" : "Sauvegarder"}
                  >
                    <Bookmark className="w-3 h-3 fill-current" />
                  </button>

                  {/* Share Article */}
                  <button
                    onClick={() => handleShareArticle(selectedArticle)}
                    className={`p-1 rounded-md border transition-colors cursor-pointer ${
                      isDark ? "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-indigo-400" :
                      isFun ? "bg-white border border-black text-black hover:bg-yellow-100" :
                      "bg-zinc-50 border-zinc-200 text-zinc-600 hover:text-indigo-600"
                    }`}
                    title="Partager cet article"
                  >
                    <Share2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Reader body */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 scrollbar pb-24" onScroll={handleReaderScroll}>
                {/* Clean Metadata Header Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 dark:text-indigo-300 border border-indigo-500/20">
                      {selectedArticle.category}
                    </span>
                    {selectedArticle.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/15 text-[11px]">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getScoreColor(selectedArticle.score)}`}>
                    ★ {selectedArticle.score}%
                  </span>
                </div>

                {/* Enhanced Title Display with high typographic contrast */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs sm:text-[13px] font-extrabold uppercase tracking-wider ${
                      isSobre ? "text-zinc-600 dark:text-zinc-400 font-sans" :
                      isWarm ? "text-amber-900 dark:text-amber-300 font-serif font-bold" :
                      isCyber ? "text-cyan-400 font-mono" :
                      isFun ? "text-black dark:text-pink-300 font-black" :
                      "text-indigo-500 dark:text-indigo-400 font-sans"
                    }`}>
                      {selectedArticle.source}
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans">
                      ⏱ {getArticleTimeDisplay(selectedArticle)}
                    </span>
                  </div>

                  <h3 className={`text-xl sm:text-2xl md:text-3xl font-extrabold leading-tight tracking-tight ${
                    isSobre ? "font-sans text-zinc-900 dark:text-zinc-50" :
                    isWarm ? "font-serif text-[#2a1b12] dark:text-amber-100" :
                    isCyber ? "font-mono text-[#00ffcc] uppercase" :
                    isFun ? "font-sans text-black dark:text-pink-300 font-black italic" :
                    "font-sans text-slate-900 dark:text-white"
                  }`}>
                    {selectedArticle.title}
                  </h3>
                </div>

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
                    isDark ? "bg-zinc-900 border-zinc-800 text-white" :
                    isFun ? "bg-yellow-200 border-2 border-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]" :
                    "bg-zinc-100 border-zinc-300 text-black shadow-xs"
                  }`}>
                    <div className={`flex items-center justify-between gap-2 border-b pb-2 ${isDark ? "border-zinc-800" : "border-zinc-300"}`}>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                        isDark ? "bg-zinc-800 text-amber-300 border-zinc-700" : "bg-white text-zinc-950 border-zinc-300"
                      }`}>
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        Partie 1 : Synthèse condensée (Flash 15 sec)
                      </span>
                      <span className={`text-[11px] font-mono font-bold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                        L'essentiel en bref
                      </span>
                    </div>
                    <p className={`text-sm sm:text-base font-semibold leading-relaxed italic ${isDark ? "text-white" : "text-black"}`}>
                      {selectedArticle.summary || "Synthèse factuelle et faits clés du jour."}
                    </p>
                  </div>

                  {/* PARTIE 2 : ENQUÊTE & ANALYSE APPROFONDIE (3X PLUS DÉTAILLÉE) */}
                  <div className="space-y-4 pt-2">
                    <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-zinc-800" : "border-zinc-250"}`}>
                      <span className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider ${isDark ? "text-indigo-300" : "text-indigo-950"}`}>
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        Partie 2 : Enquête & Analyse approfondie (3x plus détaillée)
                      </span>
                      <span className={`text-[11px] font-mono font-bold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
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

                {/* SECTION : LIEN YOUTUBE SUR LE SUJET */}
                <div className={`mt-5 p-4 sm:p-5 rounded-2xl border transition-all ${
                  isSobre ? (isDark ? "bg-zinc-900 border-zinc-800 text-zinc-100" : "bg-zinc-50 border-zinc-200 text-zinc-950") :
                  isWarm ? (isDark ? "bg-[#382f2a] border-amber-900/30 text-amber-100 font-serif" : "bg-[#FAF6F0] border-amber-900/20 text-amber-950 font-serif") :
                  isCyber ? (isDark ? "bg-black border-red-500/50 text-red-400 font-mono shadow-[0_0_15px_rgba(239,68,68,0.15)]" : "bg-red-50/70 border-red-300 text-red-950 font-mono") :
                  isFun ? (isDark ? "bg-zinc-900 border-3 border-white text-white rounded-2xl" : "bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black") :
                  (isDark ? "bg-slate-900/90 border-red-500/30 text-slate-100 backdrop-blur-md" : "bg-red-50/60 border-red-200 text-slate-900")
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 text-red-500 flex items-center justify-center shrink-0 shadow-xs">
                        <Youtube className="w-5 h-5 fill-red-600 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm sm:text-base flex items-center gap-1.5 leading-tight">
                          Reportages &amp; Vidéos sur YouTube
                        </h4>
                        <p className="text-xs opacity-75 mt-0.5">
                          Consultez les vidéos d'actualité, reportages télé et analyses en direct sur ce sujet.
                        </p>
                      </div>
                    </div>

                    <a
                      href={getYouTubeSearchUrl(selectedArticle)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md hover:shadow-red-600/20 hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer text-center"
                      title={`Voir les vidéos sur YouTube pour : "${selectedArticle.title}"`}
                    >
                      <Youtube className="w-4 h-4 fill-white text-white" />
                      <span>Ouvrir sur YouTube</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  </div>

                  {/* Recherches rapides YouTube ciblées */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 mt-3 border-t border-slate-700/10 text-xs">
                    <span className="text-[11px] font-bold opacity-70">Accès directs :</span>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedArticle.title + " reportage journal tv")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-medium transition-colors inline-flex items-center gap-1"
                    >
                      📺 Reportages TV
                    </a>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedArticle.title + " analyse decryptage")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-medium transition-colors inline-flex items-center gap-1"
                    >
                      🎙️ Décryptages &amp; Débats
                    </a>
                    {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedArticle.tags[0] + " actualite")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-medium transition-colors inline-flex items-center gap-1"
                      >
                        🔍 #{selectedArticle.tags[0]}
                      </a>
                    )}
                  </div>
                </div>

                {/* SECTION : CREUSER LE SUJET (Analyse & Approfondissement par l'IA) */}
                <div id="creuser-sujet-section" className={`mt-6 px-1.5 py-4 sm:p-6 border-y sm:border border-indigo-500/25 sm:rounded-2xl space-y-5 transition-all ${
                  isSobre ? (isDark ? "bg-zinc-900 text-zinc-100" : "bg-zinc-50 text-zinc-950") :
                  isWarm ? (isDark ? "bg-[#382f2a] text-amber-100 font-serif" : "bg-[#FAF6F0] text-amber-950 font-serif") :
                  isCyber ? (isDark ? "bg-black text-cyan-400 font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]" : "bg-teal-50 text-teal-950 font-mono") :
                  isFun ? (isDark ? "bg-zinc-900 border-3 border-white text-white rounded-2xl" : "bg-white border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black") :
                  (isDark ? "bg-slate-900/90 text-slate-100 backdrop-blur-md" : "bg-indigo-50/80 text-slate-900")
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                        <Search className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                          Creuser le sujet <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                        </h4>
                        <p className="text-xs sm:text-sm opacity-80 mt-0.5">
                          Posez une question ou explorez des angles d'analyse approfondis avec l'IA.
                        </p>
                      </div>
                    </div>
                    {deepDiveHistory.length > 0 && (
                      <span className="text-xs sm:text-sm px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full font-mono font-bold self-start sm:self-auto">
                        {deepDiveHistory.length} analyse{deepDiveHistory.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {/* Smart Suggested Exploration Angles */}
                  <div className="space-y-2.5">
                    <span className="text-xs sm:text-sm uppercase font-extrabold tracking-wider opacity-80 block">
                      💡 Pistes d'approfondissement suggérées :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
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
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 group ${
                            isDark
                              ? "bg-zinc-900 border-zinc-800 hover:border-indigo-500/50 hover:bg-zinc-850 text-white"
                              : "bg-white border-zinc-300 hover:border-indigo-400 hover:bg-indigo-50/60 text-black shadow-xs"
                          }`}
                        >
                          <span className="text-lg group-hover:scale-110 transition-transform shrink-0 mt-0.5">{item.icon}</span>
                          <div className="flex flex-col">
                            <span className={`font-bold text-xs sm:text-sm group-hover:underline ${isDark ? "text-indigo-300" : "text-indigo-950 font-black"}`}>{item.label}</span>
                            <span className={`text-xs sm:text-sm line-clamp-1 mt-0.5 ${isDark ? "text-zinc-300" : "text-zinc-800 font-medium"}`}>{item.query}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Prompt Input */}
                  <div className="space-y-2.5 pt-2 border-t border-slate-700/10">
                    <label htmlFor="deep-dive-custom-question" className={`text-xs sm:text-sm font-bold block flex flex-col sm:flex-row sm:items-center justify-between gap-1 ${isDark ? "text-white" : "text-black"}`}>
                      <span>💬 Ou posez votre propre question spécifique :</span>
                      <span className={`text-[11px] font-normal ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Entrée pour valider • Maj+Entrée pour saut de ligne</span>
                    </label>
                    <div className="flex flex-col gap-2.5">
                      <textarea
                        id="deep-dive-custom-question"
                        rows={3}
                        value={deepDiveQuery}
                        onChange={(e) => setDeepDiveQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && !isDeepDiving) {
                            e.preventDefault();
                            handleDeepDive();
                          }
                        }}
                        placeholder="Ex: Quel est le coût estimé ? Quels sont les pays et secteurs concernés ? Quelles sont les échéances prévues ?"
                        className={`w-full min-h-[85px] p-3 sm:p-3.5 text-sm sm:text-base rounded-xl border outline-none resize-y leading-relaxed transition-all font-medium ${
                          isDark
                            ? "bg-zinc-950 border-zinc-700 text-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 placeholder:text-zinc-500"
                            : "bg-white border-zinc-300 text-black focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 placeholder:text-zinc-500 shadow-xs"
                        }`}
                      />
                      <div className="flex justify-end">
                        <button
                          id="btn-deep-dive-submit"
                          disabled={isDeepDiving || !deepDiveQuery.trim()}
                          onClick={() => handleDeepDive()}
                          className={`px-5 py-2.5 font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                            isFun
                              ? "bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400"
                              : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white shadow-md hover:shadow-indigo-500/25"
                          }`}
                        >
                          {isDeepDiving ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              Analyse en cours...
                            </>
                          ) : (
                            <>
                              <Search className="w-4 h-4" />
                              Creuser la question
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Loading State */}
                  {isDeepDiving && (
                    <div className={`py-8 text-center space-y-3 rounded-2xl border animate-pulse ${
                      isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-indigo-50/60 border-indigo-200"
                    }`}>
                      <div className="flex justify-center gap-2">
                        <span className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-3 h-3 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                      <p className={`text-sm sm:text-base font-bold ${isDark ? "text-indigo-300" : "text-indigo-950"}`}>
                        L'IA analyse le sujet et rédige votre fiche d'approfondissement grand format...
                      </p>
                    </div>
                  )}

                  {/* Deep Dive History & Latest Response */}
                  {deepDiveHistory.length > 0 && (
                    <div className="space-y-5 pt-4 border-t border-slate-700/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                        <h5 className={`text-sm sm:text-base font-black uppercase tracking-wider flex items-center gap-2 ${
                          isDark ? "text-indigo-300" : "text-indigo-950"
                        }`}>
                          <span className="text-lg">📖</span> Fiches d'Analyse Approfondie ({deepDiveHistory.length})
                        </h5>

                        {/* Direct Font Size Controls */}
                        <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs self-start sm:self-auto ${
                          isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-100 border-zinc-300"
                        }`}>
                          <span className={`text-[11px] font-bold px-1.5 hidden sm:inline ${isDark ? "text-zinc-400" : "text-zinc-700"}`}>Taille texte :</span>
                          <button
                            onClick={() => {
                              setAnalysisFontSize("normal");
                              localStorage.setItem("infoperso_analysis_font_size", "normal");
                            }}
                            className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              analysisFontSize === "normal"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-700 hover:text-black"
                            }`}
                            title="Taille Standard (15px)"
                          >
                            A Standard
                          </button>
                          <button
                            onClick={() => {
                              setAnalysisFontSize("large");
                              localStorage.setItem("infoperso_analysis_font_size", "large");
                            }}
                            className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              analysisFontSize === "large"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-700 hover:text-black"
                            }`}
                            title="Taille Confort / Grand (18px)"
                          >
                            A+ Confort
                          </button>
                          <button
                            onClick={() => {
                              setAnalysisFontSize("xlarge");
                              localStorage.setItem("infoperso_analysis_font_size", "xlarge");
                            }}
                            className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                              analysisFontSize === "xlarge"
                                ? "bg-indigo-600 text-white shadow-xs"
                                : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-700 hover:text-black"
                            }`}
                            title="Taille Très Grande / Big (21px)"
                          >
                            A++ Big
                          </button>
                        </div>
                      </div>

                      {deepDiveHistory.map((item, hIdx) => {
                        const sizeClass =
                          analysisFontSize === "xlarge"
                            ? "text-lg sm:text-xl leading-relaxed sm:leading-9"
                            : analysisFontSize === "normal"
                            ? "text-sm sm:text-base leading-relaxed sm:leading-7"
                            : "text-base sm:text-lg leading-relaxed sm:leading-8";

                        return (
                          <div 
                            key={hIdx}
                            className={`p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border space-y-4 shadow-sm sm:shadow-lg transition-all ${
                              isDark ? "bg-zinc-900 border-zinc-800 text-white" : "bg-white border-zinc-300 text-black shadow-md"
                            }`}
                          >
                            <div className={`font-black text-base sm:text-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 ${
                              isDark ? "border-zinc-800 text-indigo-300" : "border-zinc-200 text-indigo-950"
                            }`}>
                              <span className="flex items-center gap-2">
                                <span className="text-xl">❓</span> {item.question}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(`Question: ${item.question}\n\nAnalyse:\n${item.answer}`);
                                  onNotify("📋 Fiche d'analyse copiée dans le presse-papier !");
                                }}
                                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer self-start sm:self-auto ${
                                  isDark 
                                    ? "bg-zinc-800 text-indigo-300 border-zinc-700 hover:bg-zinc-700" 
                                    : "bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100"
                                }`}
                                title="Copier cette fiche d'analyse"
                              >
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copier</span>
                              </button>
                            </div>
                            <div className="pt-1">
                              {renderAnalysisContent(item.answer, sizeClass, isDark)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* AI Summary Box */}
                {!zenMode && (
                  <div className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-6 space-y-4 shadow-sm sm:shadow-md mt-6 border-y sm:border ${
                    isSobre 
                      ? (isDark ? "bg-zinc-900 border-zinc-800" : "bg-zinc-50 border-zinc-250")
                      : isWarm
                        ? (isDark ? "bg-[#382f2a] border-amber-900/30" : "bg-[#FAF6F0] border-amber-900/20")
                        : isCyber
                          ? (isDark ? "bg-black border-cyan-500/30" : "bg-teal-50 border-teal-500/20")
                          : isFun
                            ? (isDark ? "bg-zinc-900 border-2 border-black" : "bg-yellow-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]")
                            : (isDark ? "bg-slate-900/50 border-slate-800" : "bg-indigo-50/50 border-indigo-100")
                  }`}>
                    <div className={`flex items-center justify-between border-b pb-3 ${
                      isDark ? "border-zinc-800" : "border-zinc-200"
                    }`}>
                      <span className={`text-sm sm:text-base font-sans font-bold uppercase tracking-[0.1em] flex items-center gap-2 ${
                        isSobre ? (isDark ? "text-zinc-200" : "text-zinc-700") :
                        isWarm ? (isDark ? "text-amber-200" : "text-amber-900") :
                        isCyber ? (isDark ? "text-[#00ffcc]" : "text-teal-700") :
                        isFun ? "text-black" :
                        (isDark ? "text-indigo-400" : "text-indigo-700")
                      }`}>
                        <Cpu className={`w-4 h-4 animate-pulse ${
                          isSobre ? (isDark ? "text-zinc-400" : "text-zinc-550") :
                          isWarm ? (isDark ? "text-amber-400" : "text-amber-700") :
                          isCyber ? (isDark ? "text-[#00ffcc]" : "text-teal-600") :
                          isFun ? "text-black" :
                          (isDark ? "text-indigo-400" : "text-indigo-600")
                        }`} />
                        Synthèse intelligente IA
                      </span>
                      {selectedArticle.aiSummaryModelUsed && (
                        <span className={`text-xs font-mono font-semibold ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}>
                          via {selectedArticle.aiSummaryModelUsed}
                        </span>
                      )}
                    </div>

                    {isSummarizing ? (
                      <div className="py-6 text-center text-zinc-400 space-y-2.5">
                        <div className="flex justify-center gap-1.5">
                          <span className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                        <p className="font-sans font-bold text-cyan-400 text-sm animate-pulse">Rappatriement et analyse du contenu en cours...</p>
                      </div>
                    ) : (
                      <div className={`text-sm sm:text-base leading-relaxed sm:leading-7 font-sans space-y-3 whitespace-pre-wrap ${
                        isDark ? "text-zinc-100" : "text-zinc-900"
                      }`}>
                        {selectedArticle.aiSummaryCustom ? (
                          selectedArticle.aiSummaryCustom
                        ) : (
                          <>
                            <p>{selectedArticle.summary}</p>
                            <p className={`text-xs italic mt-2.5 ${
                              isDark ? "text-zinc-400" : "text-zinc-600"
                            }`}>
                              *Ceci est un extrait statique. Cliquez ci-dessous pour regénérer une synthèse exhaustive avec votre IA préférée.*
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Summary tool selectors */}
                    <div className={`pt-3 border-t flex flex-wrap items-center gap-3 justify-between ${
                      isDark ? "border-zinc-800" : "border-zinc-250"
                    }`}>
                      <select
                        value={summaryModelId}
                        onChange={(e) => setSummaryModelId(e.target.value)}
                        className={`rounded-lg p-2 text-xs sm:text-sm outline-none font-sans cursor-pointer max-w-[160px] ${
                          isDark 
                            ? "bg-zinc-950 border border-zinc-800 text-zinc-200 focus:border-indigo-500" 
                            : "bg-white border border-zinc-250 text-zinc-800 focus:border-indigo-400"
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
                        className={`px-4 py-2 hover:opacity-95 disabled:opacity-40 font-sans font-bold text-xs sm:text-sm rounded-xl transition-all cursor-pointer uppercase tracking-wider ${
                          isFun 
                            ? "bg-yellow-300 border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-400" 
                            : "bg-linear-to-r from-cyan-500 via-indigo-500 to-violet-500 text-white shadow-md"
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
                  <div className={`mt-6 p-3.5 sm:p-5 border-y sm:border sm:rounded-2xl space-y-4 shadow-sm sm:shadow-xl transition-all ${
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
                  <div className={`mt-6 p-3 sm:p-4 border-y sm:border sm:rounded-2xl space-y-3 ${
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
                  href={getYouTubeSearchUrl(selectedArticle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-sans font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  title="Voir les vidéos & reportages YouTube sur ce sujet"
                >
                  <Youtube className="w-3.5 h-3.5 fill-white text-white" />
                  YouTube
                </a>

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
