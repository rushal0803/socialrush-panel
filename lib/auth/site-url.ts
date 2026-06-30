type HeaderReader = { get(name: string): string | null };

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim() || "";
}

export function normalizeSiteUrl(value: string | null | undefined) {
  const raw = value?.trim().replace(/\/+$/, "");
  if (!raw) return null;

  const withProtocol = /^https?:\/\//i.test(raw)
    ? raw
    : `${/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(raw) ? "http" : "https"}://${raw}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl(options: { headers?: HeaderReader; requestUrl?: string } = {}) {
  const configured = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  if (options.requestUrl) {
    try {
      return new URL(options.requestUrl).origin;
    } catch {
      // Continue to header-derived and environment fallbacks.
    }
  }

  const headerOrigin = normalizeSiteUrl(options.headers?.get("origin"));
  if (headerOrigin) return headerOrigin;

  const forwardedHost = firstHeaderValue(options.headers?.get("x-forwarded-host") ?? null);
  const host = forwardedHost || firstHeaderValue(options.headers?.get("host") ?? null);
  if (host) {
    const forwardedProtocol = firstHeaderValue(options.headers?.get("x-forwarded-proto") ?? null);
    const protocol = forwardedProtocol || (/^(localhost|127\.0\.0\.1)/i.test(host) ? "http" : "https");
    const forwardedOrigin = normalizeSiteUrl(`${protocol}://${host}`);
    if (forwardedOrigin) return forwardedOrigin;
  }

  return process.env.NODE_ENV === "production"
    ? "https://www.getsocialrush.com"
    : "http://localhost:3000";
}

export function absoluteUrl(path: string, siteUrl: string) {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  return new URL(safePath, `${siteUrl}/`).toString();
}
