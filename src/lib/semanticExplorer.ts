import { NewsArticle } from "../types";

export interface ThematicPack {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  isCustom?: boolean;
}

export interface RelatedWord {
  word: string;
  count: number;
  isDirectTag: boolean;
  relationship: string;
}

// 1. Semantic ontology map: relationships between core domains and sub-concepts
export const SEMANTIC_RELATION_MAP: Record<string, { related: string[]; description: string }> = {
  // IA & Tech
  "ia": {
    related: ["LLM", "Claude API", "Benchmark", "Régulation", "OpenAI", "Nvidia", "Emploi", "Puces", "Éthique", "Robotique", "DeepSeek", "Santé"],
    description: "Modèles d'intelligence artificielle, réseaux neuronaux et transformation numérique"
  },
  "llm": {
    related: ["Claude API", "Benchmark", "IA", "Raisonnement", "OpenAI", "DeepSeek", "Tokens", "Génération"],
    description: "Grands modèles de langage et architectures génératives"
  },
  "claude api": {
    related: ["Anthropic", "Benchmark", "LLM", "IA", "Raisonnement", "Développeurs"],
    description: "Écosystème Claude et modèles de raisonnement Anthropic"
  },
  "benchmark": {
    related: ["LLM", "Claude API", "IA", "Performance", "Évaluation", "Puces"],
    description: "Comparatifs de performance et tests standardisés"
  },
  "technologie": {
    related: ["IA", "Cybersécurité", "Puces", "Logiciels", "Startups", "Cloud", "Télécoms"],
    description: "Innovations technologiques et industrie numérique"
  },
  "régulation": {
    related: ["Europe", "Législation", "RGPD", "IA", "Concurrence", "Gafam", "Bruxelles", "Amendes"],
    description: "Encadrement juridique, conformité et régulation des marchés"
  },
  "puces": {
    related: ["Nvidia", "Semi-conducteurs", "IA", "Taïwan", "Hardware", "Supercalculateurs"],
    description: "Semi-conducteurs et composants matériels haute performance"
  },

  // Environnement & Climat
  "environnement": {
    related: ["Incendies", "Climat", "Sécheresse", "Énergie", "Forêts", "Biodiversité", "Transition", "Nucléaire"],
    description: "Écosystèmes naturels, dérèglement climatique et politiques environnementales"
  },
  "incendies": {
    related: ["Laurent Nuñez", "Sécurité Civile", "Environnement", "Sécheresse", "Canadair", "Forêts", "Climat"],
    description: "Feux de forêts, feux de végétation et secours d'urgence"
  },
  "climat": {
    related: ["Environnement", "Transition", "Énergie", "CO2", "Sécheresse", "Réchauffement", "Accords de Paris"],
    description: "Évolution globale des températures et atténuation climatique"
  },
  "énergie": {
    related: ["Nucléaire", "Renouvelable", "Électricité", "Hydrogène", "Batteries", "Pétrole", "Environnement"],
    description: "Production, distribution et transition énergétique"
  },
  "nucléaire": {
    related: ["Énergie", "EPR", "Électricité", "Décarbonation", "Souveraineté", "Déchets"],
    description: "Énergie atomique, réacteurs et indépendance électrique"
  },

  // Géopolitique & Monde
  "europe": {
    related: ["Union Européenne", "Régulation", "Défense", "Économie", "Bruxelles", "France", "OTAN", "Diplomatie"],
    description: "Politique européenne, institutions et géostratégie continentale"
  },
  "international": {
    related: ["Géopolitique", "Guerre", "Diplomatie", "Défense", "OTAN", "États-Unis", "Chine", "Moyen-Orient"],
    description: "Relations internationales et équilibres géopolitiques mondiaux"
  },
  "défense": {
    related: ["Armement", "OTAN", "Sécurité", "Guerre", "Europe", "Souveraineté", "Armée"],
    description: "Sécurité nationale, budgets militaires et alliances stratégiques"
  },

  // Économie & Marchés
  "économie": {
    related: ["Inflation", "Emploi", "Bourse", "Croissance", "Entreprises", "Banques", "Fiscalité"],
    description: "Marchés financiers, conjoncture économique et finances publiques"
  },
  "startups": {
    related: ["Tech", "Levées de fonds", "IA", "Innovation", "Venture Capital", "Licornes"],
    description: "Jeunes pousses innovantes et investissements technologiques"
  },
  "emploi": {
    related: ["Économie", "Salaires", "IA", "Recrutement", "Formation", "Télétravail"],
    description: "Marché du travail, compétences d'avenir et mutations professionnelles"
  },

  // Art, Culture & Pop Culture
  "culture": {
    related: ["Cinéma", "Pop Culture", "Musées", "Théâtre", "Littérature", "Musique", "Patrimoine", "Dikkenek", "Expositions"],
    description: "Actualité culturelle, beaux-arts, cinéma culte, patrimoine et scènes vivantes"
  },
  "cinéma": {
    related: ["Pop Culture", "Dikkenek", "Films", "Festivals", "Culture", "Acteurs", "Réalisateurs", "Bruxelles"],
    description: "Cinéma d'auteur, comédies cultes, tournages et célébrations cinématographiques"
  },
  "pop culture": {
    related: ["Cinéma", "Dikkenek", "BD", "Musique", "Séries", "Culture", "Culte", "Festivals"],
    description: "Phénomènes populaires, répliques cultes, œuvres intergénérationnelles et humour"
  },
  "dikkenek": {
    related: ["Cinéma", "Pop Culture", "Bruxelles", "Belgique", "Culture", "Comédie", "Humour"],
    description: "Comédie culte d'Olivier Van Hoofstadt, carjacking de Claudy Focan et célébration des 20 ans"
  },
  "musées": {
    related: ["Expositions", "Patrimoine", "Beaux-Arts", "Peinture", "Culture", "Histoire", "Rétrospective"],
    description: "Musées nationaux, chefs-d'œuvre, expositions temporaires et histoire de l'art"
  },
  "théâtre": {
    related: ["Spectacle", "Scène", "Humour", "Culture", "Comédie", "Opéra", "Avignon"],
    description: "Arts de la scène, dramaturgie contemporaine, pièces classiques et spectacle vivant"
  },
  "littérature": {
    related: ["BD", "Livres", "Romans", "Culture", "Auteurs", "Prix Littéraires", "Édition"],
    description: "Grands romans, bande dessinée franco-belge, essais et actualité littéraire"
  },
  "musique": {
    related: ["Concert", "Rock", "Légendes", "Vinyles", "Culture", "Festivals", "Albums"],
    description: "Scènes musicales, enregistrements cultes, vinyles et tournées historiques"
  },

  // Science & Espace
  "science": {
    related: ["Espace", "Médecine", "Physique", "Recherche", "Astronomie", "Biologie"],
    description: "Découvertes fondamentales et recherche scientifique"
  },
  "espace": {
    related: ["SpaceX", "NASA", "Satellites", "Lune", "Mars", "James Webb", "ESA"],
    description: "Exploration spatiale, lanceurs et astrophysique"
  }
};

// 2. Curated Built-in Thematic Packs
export const DEFAULT_THEMATIC_PACKS: ThematicPack[] = [
  {
    id: "pack_tech_ia",
    name: "Tech, IA & Futur",
    emoji: "🤖",
    description: "Intelligence Artificielle, LLM, puces et ruptures technologiques",
    tags: ["IA", "Claude API", "LLM", "Benchmark", "Technologie"]
  },
  {
    id: "pack_geopolitique",
    name: "Géopolitique & Monde",
    emoji: "🌍",
    description: "Équilibres mondiaux, relations internationales, Europe et défense",
    tags: ["International", "Europe", "Défense", "Politique"]
  },
  {
    id: "pack_climat",
    name: "Transition & Climat",
    emoji: "🌿",
    description: "Environnement, feux, transition énergétique et écologie",
    tags: ["Environnement", "Incendies", "Climat", "Énergie"]
  },
  {
    id: "pack_eco",
    name: "Économie & Industrie",
    emoji: "📈",
    description: "Marchés, entreprises, emploi, investissements et mutations",
    tags: ["Économie", "Startups", "Emploi", "Technologie"]
  },
  {
    id: "pack_science",
    name: "Science & Espace",
    emoji: "🔬",
    description: "Grandes découvertes, recherche fondamentale et cosmos",
    tags: ["Science", "Espace", "Recherche"]
  },
  {
    id: "pack_culture_arts",
    name: "Art, Culture & Pop Culture",
    emoji: "🎭",
    description: "Cinéma culte, Dikkenek, musées & patrimoine, spectacle vivant, BD et musique",
    tags: ["Culture", "Cinéma", "Pop Culture", "Dikkenek", "Musées", "Théâtre", "Littérature", "Musique"]
  }
];

// Helper to normalize strings for comparison
export function normalizeKeyword(word: string): string {
  return word
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^#/, "");
}

/**
 * Returns all unique tags existing in the current articles feed
 * along with their count of articles.
 */
export function getTagsWithCounts(articles: NewsArticle[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const art of articles) {
    if (art.tags && Array.isArray(art.tags)) {
      for (const tag of art.tags) {
        const trimmed = tag.trim();
        if (trimmed) {
          counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
        }
      }
    }
  }
  return counts;
}

/**
 * Given a chain of chosen keywords (semantic trail), computes the next relevant words to propose:
 * 1. Co-occurrence analysis in actual feed articles (tags appearing in articles that match current trail)
 * 2. Semantic ontology graph expansion based on the latest clicked word
 * 3. Deduplication and ranking by relevance & available article count
 */
export function getNextSuggestedWords(
  articles: NewsArticle[],
  currentTrail: string[],
  allKnownTags: string[]
): RelatedWord[] {
  if (currentTrail.length === 0) {
    // If trail is empty, propose the top frequent tags + root topics
    const counts = getTagsWithCounts(articles);
    const sorted = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    return sorted.map(([tag, count]) => ({
      word: tag,
      count,
      isDirectTag: true,
      relationship: "Tendance générale"
    }));
  }

  const latestWord = currentTrail[currentTrail.length - 1];
  const normLatest = normalizeKeyword(latestWord);

  // 1. Articles that match ANY or ALL of the current trail
  const matchingArticles = articles.filter(art => {
    const artText = `${art.title} ${art.summary} ${art.content || ""} ${(art.tags || []).join(" ")}`.toLowerCase();
    return currentTrail.every(step => {
      const normStep = normalizeKeyword(step);
      return (art.tags || []).some(t => normalizeKeyword(t).includes(normStep)) || artText.includes(normStep);
    });
  });

  // Fallback to latest word match if intersection is too narrow
  const baseArticles = matchingArticles.length > 0 ? matchingArticles : articles.filter(art => {
    const artText = `${art.title} ${art.summary} ${(art.tags || []).join(" ")}`.toLowerCase();
    return (art.tags || []).some(t => normalizeKeyword(t).includes(normLatest)) || artText.includes(normLatest);
  });

  // 2. Co-occurring tags count in base articles
  const coOccurringCounts = new Map<string, number>();
  for (const art of baseArticles) {
    for (const tag of art.tags || []) {
      const normTag = normalizeKeyword(tag);
      // Skip if already in current trail
      if (currentTrail.some(step => normalizeKeyword(step) === normTag)) continue;
      coOccurringCounts.set(tag, (coOccurringCounts.get(tag) || 0) + 1);
    }
  }

  // 3. Semantic graph related words for the latest word
  let semanticCandidates: string[] = [];
  for (const [key, val] of Object.entries(SEMANTIC_RELATION_MAP)) {
    if (normLatest.includes(key) || key.includes(normLatest)) {
      semanticCandidates.push(...val.related);
    }
  }

  // Also check if any known tag in the feed matches the semantic candidates
  const results: Map<string, RelatedWord> = new Map();

  // Add co-occurring tags first (they guarantee matching articles!)
  for (const [tag, count] of coOccurringCounts.entries()) {
    results.set(normalizeKeyword(tag), {
      word: tag,
      count,
      isDirectTag: true,
      relationship: `Associé dans ${count} article${count > 1 ? "s" : ""}`
    });
  }

  // Add semantic candidates if not present
  for (const semWord of semanticCandidates) {
    const norm = normalizeKeyword(semWord);
    if (currentTrail.some(step => normalizeKeyword(step) === norm)) continue;

    if (!results.has(norm)) {
      // Find if this semantic word matches any tag in all articles
      const directMatch = allKnownTags.find(t => normalizeKeyword(t) === norm);
      const articleCount = directMatch
        ? articles.filter(a => (a.tags || []).includes(directMatch)).length
        : articles.filter(a => `${a.title} ${a.summary}`.toLowerCase().includes(norm)).length;

      results.set(norm, {
        word: directMatch || semWord,
        count: articleCount,
        isDirectTag: !!directMatch,
        relationship: `Rebond thématique lié à ${latestWord}`
      });
    }
  }

  // Return sorted: direct co-occurring tags with article count > 0 first, then others
  return Array.from(results.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.word.localeCompare(b.word);
    })
    .slice(0, 14);
}

/**
 * Groups tags into distinct human-readable thematic rubriques
 */
export function groupTagsByRubrique(tags: string[]): Record<string, string[]> {
  const rubriques: Record<string, string[]> = {
    "🎭 Art, Culture & Pop Culture": [],
    "💻 Tech, IA & Digital": [],
    "🌍 Géopolitique & Monde": [],
    "🌿 Climat, Énergie & Planète": [],
    "📈 Économie & Entreprises": [],
    "⚖️ Société, France & Politique": [],
    "✨ Autres sujets": []
  };

  for (const tag of tags) {
    const norm = normalizeKeyword(tag);
    if (
      norm.includes("cultur") ||
      norm.includes("cine") ||
      norm.includes("film") ||
      norm.includes("dikkenek") ||
      norm.includes("musee") ||
      norm.includes("expo") ||
      norm.includes("theatre") ||
      norm.includes("spectacle") ||
      norm.includes("litterature") ||
      norm.includes("livre") ||
      norm.includes("bd") ||
      norm.includes("musique") ||
      norm.includes("concert") ||
      norm.includes("patrimoine") ||
      norm.includes("pop") ||
      norm.includes("art")
    ) {
      rubriques["🎭 Art, Culture & Pop Culture"].push(tag);
    } else if (
      norm.includes("ia") ||
      norm.includes("tech") ||
      norm.includes("claude") ||
      norm.includes("llm") ||
      norm.includes("benchmark") ||
      norm.includes("puce") ||
      norm.includes("logiciel") ||
      norm.includes("nvidia")
    ) {
      rubriques["💻 Tech, IA & Digital"].push(tag);
    } else if (
      norm.includes("international") ||
      norm.includes("europe") ||
      norm.includes("guerre") ||
      norm.includes("defense") ||
      norm.includes("otan") ||
      norm.includes("diplomatie") ||
      norm.includes("monde")
    ) {
      rubriques["🌍 Géopolitique & Monde"].push(tag);
    } else if (
      norm.includes("environ") ||
      norm.includes("incendie") ||
      norm.includes("climat") ||
      norm.includes("energie") ||
      norm.includes("foret") ||
      norm.includes("ecol") ||
      norm.includes("nucleaire")
    ) {
      rubriques["🌿 Climat, Énergie & Planète"].push(tag);
    } else if (
      norm.includes("eco") ||
      norm.includes("bourse") ||
      norm.includes("startup") ||
      norm.includes("finance") ||
      norm.includes("emploi") ||
      norm.includes("marche")
    ) {
      rubriques["📈 Économie & Entreprises"].push(tag);
    } else if (
      norm.includes("polit") ||
      norm.includes("france") ||
      norm.includes("loi") ||
      norm.includes("securite") ||
      norm.includes("justice") ||
      norm.includes("nunez") ||
      norm.includes("societe")
    ) {
      rubriques["⚖️ Société, France & Politique"].push(tag);
    } else {
      rubriques["✨ Autres sujets"].push(tag);
    }
  }

  // Remove empty groups
  const filtered: Record<string, string[]> = {};
  for (const [key, list] of Object.entries(rubriques)) {
    if (list.length > 0) {
      filtered[key] = list;
    }
  }
  return filtered;
}
