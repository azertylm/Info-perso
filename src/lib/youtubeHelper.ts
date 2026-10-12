import { NewsArticle } from "../types";

export type YouTubeFilterType = "this_week" | "recent" | "reportage" | "live";

export interface YouTubeFilterOption {
  id: YouTubeFilterType;
  label: string;
  shortLabel: string;
  description: string;
  spParam: string;
  querySuffix: string;
  badge: string;
}

export const YOUTUBE_FILTER_OPTIONS: YouTubeFilterOption[] = [
  {
    id: "this_week",
    label: "Actu du moment (Cette semaine)",
    shortLabel: "Cette semaine",
    description: "Vidéos et reportages publiés cette semaine sur le sujet",
    spParam: "CAESAggD", // YouTube filter: Upload date: This week
    querySuffix: "actualité reportage",
    badge: "🔥 Du moment",
  },
  {
    id: "recent",
    label: "Les plus récentes (Temps réel)",
    shortLabel: "Dernières vidéos",
    description: "Classées par date de mise en ligne (plus récentes d'abord)",
    spParam: "CAISAhAB", // YouTube filter: Sort by Upload Date
    querySuffix: "actualité dernière minute",
    badge: "⏱️ Récentes",
  },
  {
    id: "reportage",
    label: "Grands reportages & analyses",
    shortLabel: "Reportages",
    description: "Enquêtes, documentaires et analyses approfondies récentes",
    spParam: "CAESAggE", // YouTube filter: Upload date: This month
    querySuffix: "reportage enquête décryptage",
    badge: "📺 Reportage",
  },
  {
    id: "live",
    label: "Directs & chaînes info en continu",
    shortLabel: "En direct",
    description: "Flux et émissions d'information en direct sur le thème",
    spParam: "CAMSAkAB", // YouTube filter: Live / En direct
    querySuffix: "direct live info",
    badge: "🔴 Live",
  },
];

export interface ArticleLike {
  title: string;
  tags?: string[];
  source?: string;
}

// French and common stopwords to filter out from search queries
const YOUTUBE_STOPWORDS = new Set([
  "le", "la", "les", "l", "un", "une", "des", "du", "de", "d", "au", "aux",
  "ce", "cet", "cette", "ces", "mon", "ton", "son", "notre", "votre", "leur",
  "qui", "que", "quoi", "dont", "où", "dans", "sur", "sous", "par", "pour",
  "vers", "avec", "sans", "chez", "sur", "en", "et", "ou", "mais", "donc",
  "or", "ni", "car", "est", "sont", "a", "ont", "fait", "font", "apres",
  "après", "avant", "pendant", "face", "contre", "selon", "comme", "tout",
  "tous", "toute", "toutes", "plus", "moins", "tres", "très", "bien", "aussi",
  "encore", "déjà", "deja", "ses", "sa", "son", "nos", "vos", "leurs", "se",
  "ne", "pas", "y", "en", "il", "ils", "elle", "elles", "on", "nous", "vous"
]);

/**
 * Extrait un résumé percutant de 4 mots MAXIMUM pour la recherche YouTube.
 * Évite la dilution d'algorithme et garantit que YouTube retourne toujours les reportages vidéo ciblés.
 */
export function extractTopicalKeywords(article: ArticleLike): string {
  if (!article || !article.title) return "";

  let title = article.title;

  // 1. Nettoyage des préfixes éditoriaux (ex: "Guerre en Ukraine :", "Exclusif -", "En direct :")
  title = title.replace(
    /^([A-Za-zÀ-ÿ0-9\s'’-]+?)\s*[:|–—]\s*(?=[A-Za-zÀ-ÿ])/u,
    (match, prefix) => {
      const lower = prefix.trim().toLowerCase();
      if (
        lower.includes("direct") ||
        lower.includes("alerte") ||
        lower.includes("flash") ||
        lower.includes("exclusif") ||
        lower.includes("analyse") ||
        lower.includes("pourquoi") ||
        lower.includes("comment") ||
        lower.includes("voici")
      ) {
        return "";
      }
      return `${prefix} `;
    }
  );

  // 2. Supprimer guillemets et caractères spéciaux
  title = title
    .replace(/[«»""''„”]/g, " ")
    .replace(/[#@$%^*_+=\[\]{}|\\<>~`]/g, " ")
    .replace(/[.,;:!?/()\-–—]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 3. Supprimer expressions journalistiques parasites
  title = title
    .replace(/\b(pourquoi|comment|voici ce que|ce qu'il faut savoir|ce qu'il faut retenir|ce que l'on sait)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // 4. Si un tag spécifique pertinent existe (ex: "Dikkenek", "Ariane 6", "Meta"), s'en servir en priorité
  const meaningfulTags = (article.tags || []).filter(t => {
    const tl = t.trim().toLowerCase();
    return tl !== "actualité" && tl !== "direct live" && tl !== "nouveau" && tl !== "fil info" && tl.length > 2;
  });

  // Découper les mots du titre
  const rawWords = title.split(/\s+/).map(w => w.trim()).filter(w => w.length > 1);

  // Filtrer les mots porteurs de sens (retrait des stopwords français)
  const significantWords = rawWords.filter(w => !YOUTUBE_STOPWORDS.has(w.toLowerCase()));

  // Construire une liste de 4 mots maximum
  let selectedWords: string[] = [];

  if (significantWords.length >= 2) {
    selectedWords = significantWords.slice(0, 4);
  } else if (rawWords.length > 0) {
    selectedWords = rawWords.slice(0, 4);
  }

  // Si on a moins de 3 mots et qu'on a un tag riche qui n'y est pas déjà, on peut l'intégrer en respectant le max de 4 mots
  if (selectedWords.length < 4 && meaningfulTags.length > 0) {
    const candidateTagWords = meaningfulTags[0].split(/\s+/).filter(w => w.length > 1);
    for (const tw of candidateTagWords) {
      if (selectedWords.length >= 4) break;
      if (!selectedWords.some(sw => sw.toLowerCase() === tw.toLowerCase())) {
        selectedWords.push(tw);
      }
    }
  }

  // Garantie absolue : STRICTEMENT 4 mots maximum
  return selectedWords.slice(0, 4).join(" ").trim();
}

/**
 * Construit l'URL YouTube optimisée : 4 mots clés maximum pour une recherche directe infaillible.
 */
export function getYouTubeSearchUrl(
  article: ArticleLike,
  filterType: YouTubeFilterType = "this_week"
): string {
  if (!article) return "https://www.youtube.com";

  // Résumé en 4 mots maximum du sujet
  const topicalQuery = extractTopicalKeywords(article);

  const option = YOUTUBE_FILTER_OPTIONS.find(o => o.id === filterType) || YOUTUBE_FILTER_OPTIONS[0];

  // Requête épurée : 4 mots clés du sujet + le filtre YouTube natif via le paramètre &sp
  const fullSearchQuery = topicalQuery || "actualité";

  let url = `https://www.youtube.com/results?search_query=${encodeURIComponent(fullSearchQuery)}`;

  // Paramètre sp de YouTube pour filtrer par date ou pertinence
  if (option.spParam) {
    url += `&sp=${option.spParam}`;
  }

  return url;
}
