/**
 * Safe fetch utility that gracefully handles JSON parsing, network errors,
 * and unexpected HTML responses (like Vite SPA fallbacks or server error pages).
 */

export interface SafeFetchResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

export async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<SafeFetchResult<T>> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get("content-type") || "";
    let data: any = null;
    let errorMessage: string | undefined;

    if (contentType.includes("application/json")) {
      try {
        data = await res.json();
      } catch (jsonErr: any) {
        errorMessage = jsonErr?.message || "Erreur de décodage JSON";
      }
    } else {
      const rawText = await res.text();
      const trimmed = rawText.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try {
          data = JSON.parse(trimmed);
        } catch {
          errorMessage = trimmed.slice(0, 100);
        }
      } else {
        // Returned HTML (e.g. <!doctype html> from SPA fallback or error page)
        errorMessage = `Réponse serveur inattendue (statut ${res.status})`;
      }
    }

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        error: data?.error || errorMessage || `Erreur serveur (${res.status})`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message || "Erreur réseau de communication",
    };
  }
}
