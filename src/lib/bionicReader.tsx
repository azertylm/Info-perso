import React from "react";

/**
 * Transforms plain text into Bionic Reading elements:
 * Highlighting the first ~40-50% of characters in each word to guide the eye's saccades.
 */
export function formatBionicText(text: string): React.ReactNode {
  if (!text) return text;

  // Split into paragraphs to preserve line structure
  const paragraphs = text.split("\n");

  return paragraphs.map((paragraph, pIdx) => {
    if (!paragraph.trim()) {
      return <div key={pIdx} className="h-4" />;
    }

    // Split words while preserving punctuation and spaces
    const tokens = paragraph.split(/(\s+|[.,;!?:()\[\]"«»]+)/);

    return (
      <p key={pIdx} className="mb-4 leading-relaxed font-sans text-justify">
        {tokens.map((token, tIdx) => {
          // If token is whitespace or punctuation, return as-is
          if (!token || /^\s+$/.test(token) || /^[.,;!?:()\[\]"«»]+$/.test(token)) {
            return <React.Fragment key={tIdx}>{token}</React.Fragment>;
          }

          // If token is very short (1 char), return as-is
          if (token.length <= 1) {
            return <React.Fragment key={tIdx}>{token}</React.Fragment>;
          }

          // Compute fixation point (40-50% of word)
          const fixationLength = Math.ceil(token.length * 0.45);
          const boldPart = token.slice(0, fixationLength);
          const restPart = token.slice(fixationLength);

          return (
            <span key={tIdx} className="inline">
              <strong className="font-black text-current">{boldPart}</strong>
              <span className="opacity-90">{restPart}</span>
            </span>
          );
        })}
      </p>
    );
  });
}

/**
 * Calculates estimated reading time in minutes based on 220 words/minute average
 */
export function calculateReadingTimeMinutes(text: string): { minutes: number; wordCount: number } {
  if (!text) return { minutes: 1, wordCount: 0 };
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return { minutes, wordCount };
}
