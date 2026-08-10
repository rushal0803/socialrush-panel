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

function getRequestOrigin(options: { headers?: HeaderReader; requestUrl?: string }) {
  if (options.requestUrl) {
    try {
      return new URL(options.requestUrl).origin;
    } catch {
      // Continue to the proxy headers supplied by the request.
    }
  }

  const forwardedHost = firstHeaderValue(options.headers?.get("x-forwarded-host") ?? null);
  const host = forwardedHost || firstHeaderValue(options.headers?.get("host") ?? null);
  if (!host) return null;

  const forwardedProtocol = firstHeaderValue(options.headers?.get("x-forwarded-proto") ?? null);
  const protocol = forwardedProtocol || (/^(localhost|127\.0\.0\.1)/i.test(host) ? "http" : "https");
  return normalizeSiteUrl(`${protocol}://${host}`);
}

function isVercelPreviewOrigin(origin: string | null) {
  if (!origin) return false;

  try {
    return new URL(origin).hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function getSiteUrl(options: { headers?: HeaderReader; requestUrl?: string } = {}) {
  const requestOrigin = getRequestOrigin(options);

  // Preview deployments must keep auth and password-reset links on the exact
  // deployment host.  A production NEXT_PUBLIC_SITE_URL can be inherited by
  // Vercel Preview, so it must not take precedence in this environment.
  if (process.env.VERCEL_ENV === "preview" && isVercelPreviewOrigin(requestOrigin)) {
    return requestOrigin;
  }

  const configured = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (configured) return configured;

  if (requestOrigin) return requestOrigin;

  return process.env.NODE_ENV === "production"
    ? "https://www.getsocialrush.com"
    : "http://localhost:3000";
}

export function absoluteUrl(path: string, siteUrl: string) {
  const safePath = path.startsWith("/") && !path.startsWith("//") ? path : "/";
  return new URL(safePath, `${siteUrl}/`).toString();
}
