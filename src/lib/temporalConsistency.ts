/**
 * Temporal Consistency Utility for InfoPerso
 * 
 * Ensures that whenever articles or syntheses discuss upcoming developments,
 * order backlogs, future projections, delivery schedules, or planning horizons,
 * the years referenced are strictly in the future (relative to the current calendar year)
 * and never in the past (e.g. replacing obsolete "jusqu'en 2025" with "jusqu'en 2027").
 */

export const CURRENT_YEAR = new Date().getFullYear(); // e.g. 2026
export const NEXT_YEAR = CURRENT_YEAR + 1; // e.g. 2027
export const EXTENDED_FUTURE_YEAR = CURRENT_YEAR + 2; // e.g. 2028

/**
 * Sanitizes any text to fix obsolete past-year references in future contexts.
 */
export function fixTemporalConsistency(text: string): string {
  if (!text || typeof text !== "string") return text;

  let cleaned = text;

  // 1. Direct fix for order backlogs & industrial capacities (e.g. Blackwell / TSMC / Goldman Sachs)
  cleaned = cleaned.replace(
    /carnets?\s+de\s+commandes?\s+(?:pleins?\s+)?jusqu'en\s*(202[0-5])/gi,
    `carnets de commandes pleins jusqu'en ${NEXT_YEAR}`
  );
  cleaned = cleaned.replace(
    /commandes?\s+(?:garanties?\s+)?jusqu'en\s*(202[0-5])/gi,
    `commandes jusqu'en ${NEXT_YEAR}`
  );
  cleaned = cleaned.replace(
    /capacit[ée]s?\s+de\s+production\s+(?:réservées?\s+)?jusqu'en\s*(202[0-5])/gi,
    `capacités de production jusqu'en ${NEXT_YEAR}`
  );

  // 2. Generic "jusqu'en 2024 / 2025" in prospective or duration contexts
  cleaned = cleaned.replace(
    /\bjusqu'en\s*(202[0-5])\b/gi,
    `jusqu'en ${NEXT_YEAR}`
  );
  cleaned = cleaned.replace(
    /\bjusqu'[àa]\s+(fin\s+)?(202[0-5])\b/gi,
    (match, fin) => `jusqu'à ${fin || ""}${NEXT_YEAR}`
  );

  // 3. "d'ici (fin / début / mi-) 2024 / 2025"
  cleaned = cleaned.replace(
    /\bd'ici\s+(fin\s+|début\s+|mi-)?(202[0-5])\b/gi,
    (match, prefix) => `d'ici ${prefix || ""}${NEXT_YEAR}`
  );

  // 4. "à l'horizon 2024 / 2025"
  cleaned = cleaned.replace(
    /\bà\s+l'horizon\s*(202[0-5])\b/gi,
    `à l'horizon ${NEXT_YEAR}`
  );

  // 5. Future delivery, forecast, or scheduling verbs + pour 2024 / 2025
  cleaned = cleaned.replace(
    /\b(prévu[es]?|attendu[es]?|programmé[es]?|annoncé[es]?|estimé[es]?|projeté[es]?|planifié[es]?)\s+pour\s+(fin\s+|début\s+|mi-)?(202[0-5])\b/gi,
    (match, verb, prefix) => `${verb} pour ${prefix || ""}${NEXT_YEAR}`
  );

  // 6. Multi-year spans that start in past (e.g. 2024-2025 or 2025-2026)
  cleaned = cleaned.replace(/\b2024-2025\b/g, `${CURRENT_YEAR}-${NEXT_YEAR}`);
  cleaned = cleaned.replace(/\b2025-2026\b/g, `${CURRENT_YEAR}-${NEXT_YEAR}`);

  // 7. "objectifs / perspectives / projections pour 2024 / 2025"
  cleaned = cleaned.replace(
    /\b(objectifs?|perspectives?|projections?|prévisions?|feuille de route)\s+pour\s+(202[0-5])\b/gi,
    (match, noun) => `${noun} pour ${NEXT_YEAR}`
  );

  // 8. "livraison(s) en 2024 / 2025"
  cleaned = cleaned.replace(
    /\b(livraisons?|commercialisation|d[ée]ploiement|mise\s+en\s+service)\s+(?:prévue?s?\s+)?en\s+(202[0-5])\b/gi,
    (match, noun) => `${noun} prévue en ${NEXT_YEAR}`
  );

  return cleaned;
}

/**
 * Sanitizes an entire NewsArticle object ensuring all text fields are temporally sound.
 */
export function sanitizeArticleTemporalConsistency<T extends { title?: string; summary?: string; content?: string }>(
  article: T
): T {
  if (!article) return article;
  return {
    ...article,
    title: article.title ? fixTemporalConsistency(article.title) : article.title,
    summary: article.summary ? fixTemporalConsistency(article.summary) : article.summary,
    content: article.content ? fixTemporalConsistency(article.content) : article.content,
  };
}

/**
 * Prompt instruction block to be appended to all generative and clarifying AI calls.
 */
export function getTemporalPromptDirective(): string {
  return (
    `\n\n🔴 RÈGLE MAJEURE DE COHÉRENCE TEMPORELLE (ANNÉE EN COURS : ${CURRENT_YEAR}) :\n` +
    `- Nous sommes actuellement en ${CURRENT_YEAR}.\n` +
    `- TOUTES LES PROJECTIONS FUTURES, CARNETS DE COMMANDES, HORIZONS, OBJECTIFS ET LIVRAISONS DOIVENT ÊTRE STRICTEMENT POSTÉRIEURES À AUJOURD'HUI (${CURRENT_YEAR}, ${NEXT_YEAR}, ${EXTENDED_FUTURE_YEAR}, 2030...).\n` +
    `- INTERDICTION FORMELLE d'utiliser des dates passées (${CURRENT_YEAR - 2}, ${CURRENT_YEAR - 1}, 2024, 2025) lorsqu'on parle d'engagements ou de prévisions futures (par exemple, NE JAMAIS ÉCRIRE "garantissant des commandes jusqu'en 2025", mais "jusqu'en ${NEXT_YEAR}" ou "${EXTENDED_FUTURE_YEAR}").\n` +
    `- Les seules dates passées autorisées sont celles d'événements historiques déjà achevés (ex: "fondée en 2024", "loi votée en 2023"). Tout horizon ou carnet de commandes futur doit obligatoirement viser ${CURRENT_YEAR}, ${NEXT_YEAR} ou au-delà.`
  );
}
