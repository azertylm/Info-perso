import { NewsArticle } from "../types";

/**
 * Encodes an article into a compact, URL-safe Base64 payload.
 * Supports full UTF-8 encoding (French accents, emojis, punctuation).
 */
export function encodeArticleForShare(art: NewsArticle | any): string {
  try {
    const compact = {
      id: art.id,
      t: art.title || "",
      s: art.source || "InfoPerso",
      c: art.category || "Actualités",
      tm: art.time || "Récemment",
      sc: typeof art.score === "number" ? art.score : 90,
      e: art.emoji || "📰",
      tg: Array.isArray(art.tags) ? art.tags : [],
      sm: art.summary || "",
      cnt: art.content || "",
      ai: art.aiSummaryCustom || undefined,
      f: art.featured ? 1 : 0
    };
    const jsonStr = JSON.stringify(compact);
    const utf8Bytes = new TextEncoder().encode(jsonStr);
    let binary = "";
    const len = utf8Bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(utf8Bytes[i]);
    }
    const base64 = btoa(binary);
    // Convert to URL-safe base64 (no +, /, or = characters)
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  } catch (err) {
    console.error("Error encoding article for share:", err);
    return "";
  }
}

/**
 * Decodes a compact URL-safe Base64 payload back into a complete NewsArticle.
 */
export function decodeArticleFromShare(encoded: string): NewsArticle | null {
  try {
    if (!encoded || typeof encoded !== "string") return null;
    let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const data = JSON.parse(jsonStr);

    if (data && (data.t || data.title)) {
      return {
        id: typeof data.id === "number" ? data.id : Date.now(),
        title: data.t || data.title || "Article Partagé",
        source: data.s || data.source || "Partage InfoPerso",
        category: data.c || data.category || "Actualités",
        time: data.tm || data.time || "Récemment",
        score: typeof data.sc === "number" ? data.sc : (data.score || 95),
        emoji: data.e || data.emoji || "📰",
        tags: Array.isArray(data.tg) ? data.tg : (Array.isArray(data.tags) ? data.tags : ["Partage"]),
        summary: data.sm || data.summary || "",
        content: data.cnt || data.content || "",
        aiSummaryCustom: data.ai || data.aiSummaryCustom,
        featured: data.f === 1 || data.featured === true,
        createdAt: Date.now()
      };
    }
  } catch (err) {
    console.warn("Could not decode shared article payload:", err);
  }
  return null;
}

/**
 * Builds the complete shareable URL with embedded portable article payload.
 */
export function buildShareUrl(article: NewsArticle): string {
  const baseUrl = window.location.origin + window.location.pathname;
  const encoded = encodeArticleForShare(article);
  if (encoded) {
    return `${baseUrl}?article=${article.id}&sdata=${encoded}`;
  }
  return `${baseUrl}?article=${article.id}`;
}

/**
 * Extracts and decodes any shared article from the current window location (search params or hash).
 */
export function getSharedArticleFromUrl(existingArticles: NewsArticle[] = []): NewsArticle | null {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes("?")
      ? window.location.hash.split("?")[1]
      : (window.location.hash.startsWith("#") ? window.location.hash.substring(1) : "");
    const hashParams = new URLSearchParams(hashQuery);

    const sdata = searchParams.get("sdata") || hashParams.get("sdata") || searchParams.get("d") || hashParams.get("d");
    if (sdata) {
      const decoded = decodeArticleFromShare(sdata);
      if (decoded) return decoded;
    }

    const articleIdStr = searchParams.get("article") || hashParams.get("article") || searchParams.get("art") || hashParams.get("art");
    if (articleIdStr) {
      const articleId = parseInt(articleIdStr, 10);
      if (!isNaN(articleId)) {
        const found = existingArticles.find((a) => a.id === articleId);
        if (found) return found;
      }
    }
  } catch (err) {
    console.warn("Error parsing shared article from URL:", err);
  }
  return null;
}
