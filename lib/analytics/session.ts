/** Correlate concurrent first-page analytics beacons before the HTTP-only cookie arrives. */
const PENDING_SESSION_KEY = "sr_analytics_pending_session_v1";
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidAnalyticsSessionId(value: unknown): value is string {
  return typeof value === "string" && UUID_V4.test(value);
}

/** A valid server cookie always wins over a browser-supplied correlation token. */
export function resolveAnalyticsSessionId(
  cookieValue: string | undefined,
  clientValue: unknown,
  generate: () => string,
): string {
  if (isValidAnalyticsSessionId(cookieValue)) return cookieValue;
  if (isValidAnalyticsSessionId(clientValue)) return clientValue;
  return generate();
}

/** Keep one first-request token per tab even if sessionStorage is blocked. */
export function createClientAnalyticsSessionIdProvider() {
  let cached: string | undefined;
  return (storage: Pick<Storage, "getItem" | "setItem"> | null, generate: () => string): string => {
    if (cached) return cached;
    try {
      const stored = storage?.getItem(PENDING_SESSION_KEY);
      if (isValidAnalyticsSessionId(stored)) {
        cached = stored;
        return stored;
      }
    } catch {
      // Private browsing may prevent storage reads.
    }

    const generated = generate();
    if (!isValidAnalyticsSessionId(generated)) throw new Error("Invalid analytics session token");
    cached = generated;
    try {
      storage?.setItem(PENDING_SESSION_KEY, generated);
    } catch {
      // Use the document-local token when storage writes are blocked.
    }
    return generated;
  };
}

const getDocumentAnalyticsSessionId = createClientAnalyticsSessionIdProvider();

export function getBrowserAnalyticsSessionId(): string | undefined {
  if (typeof window === "undefined" || typeof window.crypto?.randomUUID !== "function") return undefined;
  let storage: Storage | null = null;
  try {
    storage = window.sessionStorage;
  } catch {
    // Storage availability must never block analytics or navigation.
  }
  try {
    return getDocumentAnalyticsSessionId(storage, () => window.crypto.randomUUID());
  } catch {
    // The server can still issue its existing random HTTP-only cookie.
    return undefined;
  }
}
