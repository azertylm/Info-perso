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

/**
 * Extracts a concise, high-yield search query focused on the core subject of the news article.
 * Eliminates clickbait wording, sensationalist lead-ins, and filler text to ensure YouTube's
 * search algorithm accurately surfaces current, timely news reports.
 */
export function extractTopicalKeywords(article: ArticleLike): string {
  if (!article || !article.title) return "";

  let title = article.title;

  // 1. Remove editorial headers (e.g. "Guerre en Ukraine :", "Exclusif -", "En direct :")
  title = title.replace(
    /^([A-Za-zÀ-ÿ0-9\s'’-]+?)\s*[:|–—]\s*(?=[A-Za-zÀ-ÿ])/u,
    (match, prefix) => {
      // Keep prefix if it's already a clean subject (e.g. "SpaceX", "Gaza", "Budget")
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

  // 2. Strip quotes and special characters
  title = title
    .replace(/[«»""''„”]/g, " ")
    .replace(/[#@$%^*_+=\[\]{}|\\<>~`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 3. Remove common journalistic stop expressions
  title = title
    .replace(/\b(pourquoi|comment|voici ce que|ce qu'il faut savoir|ce qu'il faut retenir|ce que l'on sait)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  // 4. Limit to the most pertinent subject terms (maximum 7 key words) to avoid query dilution on YouTube
  const words = title.split(" ").filter(w => w.trim().length > 1);
  const coreSubject = words.slice(0, 7).join(" ");

  // 5. Append key tag if available and not already in subject
  let tagContext = "";
  if (article.tags && article.tags.length > 0) {
    const firstTag = article.tags[0];
    if (firstTag && !coreSubject.toLowerCase().includes(firstTag.toLowerCase())) {
      tagContext = ` ${firstTag}`;
    }
  }

  return `${coreSubject}${tagContext}`.trim();
}

/**
 * Builds an optimized YouTube URL that strictly targets current news and recent reports.
 */
export function getYouTubeSearchUrl(
  article: ArticleLike,
  filterType: YouTubeFilterType = "this_week"
): string {
  if (!article) return "https://www.youtube.com";

  const topicalQuery = extractTopicalKeywords(article);
  const currentYear = new Date().getFullYear(); // e.g. 2025 or 2026

  const option = YOUTUBE_FILTER_OPTIONS.find(o => o.id === filterType) || YOUTUBE_FILTER_OPTIONS[0];

  // Combine core topic with temporal and current-events anchors
  const fullSearchQuery = `${topicalQuery} ${option.querySuffix} ${currentYear}`.trim();

  let url = `https://www.youtube.com/results?search_query=${encodeURIComponent(fullSearchQuery)}`;

  // Apply YouTube's search parameter to enforce upload date / recency / live status
  if (option.spParam) {
    url += `&sp=${option.spParam}`;
  }

  return url;
}
