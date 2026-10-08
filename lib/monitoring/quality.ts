export const QUALITY_PRODUCTION_ORIGIN = "https://www.getsocialrush.com";
export const QUALITY_TIMEOUT_MS = 8_000;

export type QualityState = "healthy" | "warning" | "critical";
export type QualityCheck = {
  id: string;
  label: string;
  target: string;
  state: QualityState;
  httpStatus: number | null;
  latencyMs: number | null;
  message: string;
};
export type QualitySnapshot = {
  checkedAt: string;
  origin: string;
  overall: QualityState;
  checks: QualityCheck[];
  summary: {
    total: number;
    healthy: number;
    warning: number;
    critical: number;
  };
  note: string;
};

type Fetcher = (input: string | URL, init?: RequestInit) => Promise<Response>;

type RouteRule = {
  id: string;
  label: string;
  path: string;
  kind: "html" | "text" | "json";
  expectedText?: readonly string[];
};

export const qualityRouteRules: readonly RouteRule[] = [
  { id: "homepage", label: "Homepage", path: "/", kind: "html", expectedText: ["SocialRUSH"] },
  { id: "services", label: "Services catalog", path: "/services", kind: "html", expectedText: ["Services"] },
  { id: "packages", label: "Packages", path: "/packages", kind: "html", expectedText: ["Packages"] },
  { id: "login", label: "Customer login", path: "/login", kind: "html", expectedText: ["SocialRUSH"] },
  { id: "register", label: "Customer registration", path: "/register", kind: "html", expectedText: ["SocialRUSH"] },
  { id: "status", label: "Service status page", path: "/status", kind: "html", expectedText: ["Service availability"] },
  { id: "instagram-money", label: "Instagram money page", path: "/buy-instagram-followers-india", kind: "html", expectedText: ["Instagram"] },
  { id: "youtube-money", label: "YouTube money page", path: "/youtube-subscribers", kind: "html", expectedText: ["YouTube"] },
  { id: "linkedin-money", label: "LinkedIn money page", path: "/linkedin-followers", kind: "html", expectedText: ["LinkedIn"] },
  { id: "robots", label: "robots.txt", path: "/robots.txt", kind: "text", expectedText: ["Sitemap:", "Disallow: /admin"] },
  { id: "sitemap", label: "sitemap.xml", path: "/sitemap.xml", kind: "text", expectedText: ["/buy-instagram-followers-india", "/youtube-subscribers", "/linkedin-followers"] },
] as const;

const applicationError = /application error|something went wrong|internal server error/i;

async function fetchWithTimeout(fetcher: Fetcher, url: string) {
  const controller = new AbortController();
  const started = Date.now();
  const timeout = setTimeout(() => controller.abort(), QUALITY_TIMEOUT_MS);
  try {
    const response = await fetcher(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: { "user-agent": "SocialRUSH-Phase47-Quality-Monitor/1.0" },
    });
    return { response, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timeout);
  }
}

function overallState(checks: readonly QualityCheck[]): QualityState {
  if (checks.some((check) => check.state === "critical")) return "critical";
  if (checks.some((check) => check.state === "warning")) return "warning";
  return "healthy";
}

async function checkRoute(origin: string, rule: RouteRule, fetcher: Fetcher): Promise<QualityCheck> {
  const target = new URL(rule.path, origin).toString();
  try {
    const { response, latencyMs } = await fetchWithTimeout(fetcher, target);
    const body = await response.text();
    if (!response.ok) {
      return { id: rule.id, label: rule.label, target: rule.path, state: "critical", httpStatus: response.status, latencyMs, message: `HTTP ${response.status}` };
    }
    if (rule.kind === "html" && applicationError.test(body)) {
      return { id: rule.id, label: rule.label, target: rule.path, state: "critical", httpStatus: response.status, latencyMs, message: "Application error text detected." };
    }
    const missing = (rule.expectedText ?? []).filter((text) => !body.toLowerCase().includes(text.toLowerCase()));
    if (missing.length) {
      return { id: rule.id, label: rule.label, target: rule.path, state: "critical", httpStatus: response.status, latencyMs, message: `Expected production signal missing: ${missing.join(", ")}` };
    }
    if (latencyMs > 4_000) {
      return { id: rule.id, label: rule.label, target: rule.path, state: "warning", httpStatus: response.status, latencyMs, message: "Responded successfully but slower than the 4s monitoring threshold." };
    }
    return { id: rule.id, label: rule.label, target: rule.path, state: "healthy", httpStatus: response.status, latencyMs, message: "Production signal passed." };
  } catch (error) {
    return {
      id: rule.id,
      label: rule.label,
      target: rule.path,
      state: "critical",
      httpStatus: null,
      latencyMs: null,
      message: error instanceof Error ? `Request failed: ${error.name}` : "Request failed.",
    };
  }
}

async function checkHealth(origin: string, fetcher: Fetcher): Promise<QualityCheck> {
  const path = "/api/health";
  try {
    const { response, latencyMs } = await fetchWithTimeout(fetcher, new URL(path, origin).toString());
    const payload = await response.json() as { status?: string; services?: { app?: string; database?: string } };
    const healthy = response.ok && payload.status === "ok" && payload.services?.app === "ok" && payload.services?.database === "ok";
    return {
      id: "api-health",
      label: "Application + database health",
      target: path,
      state: healthy ? (latencyMs > 2_500 ? "warning" : "healthy") : "critical",
      httpStatus: response.status,
      latencyMs,
      message: healthy ? (latencyMs > 2_500 ? "Health endpoint is healthy but slower than 2.5s." : "Application and database report healthy.") : "Health endpoint reports degraded application or database state.",
    };
  } catch (error) {
    return { id: "api-health", label: "Application + database health", target: path, state: "critical", httpStatus: null, latencyMs: null, message: error instanceof Error ? `Health check failed: ${error.name}` : "Health check failed." };
  }
}

async function checkSecurityHeaders(origin: string, fetcher: Fetcher): Promise<QualityCheck> {
  try {
    const { response, latencyMs } = await fetchWithTimeout(fetcher, new URL("/", origin).toString());
    const csp = response.headers.get("content-security-policy") ?? "";
    const hsts = response.headers.get("strict-transport-security") ?? "";
    const nosniff = response.headers.get("x-content-type-options") ?? "";
    const problems: string[] = [];
    if (!csp.includes("https://sdk.cashfree.com")) problems.push("Cashfree CSP allowance missing");
    if (/razorpay\.com/i.test(csp)) problems.push("disabled Razorpay origin present in CSP");
    if (!/max-age=/i.test(hsts)) problems.push("HSTS missing");
    if (nosniff.toLowerCase() !== "nosniff") problems.push("nosniff missing");
    return {
      id: "security-headers",
      label: "Production security headers",
      target: "/",
      state: problems.length ? "critical" : "healthy",
      httpStatus: response.status,
      latencyMs,
      message: problems.length ? problems.join("; ") : "CSP, HSTS and nosniff safety signals passed.",
    };
  } catch (error) {
    return { id: "security-headers", label: "Production security headers", target: "/", state: "critical", httpStatus: null, latencyMs: null, message: error instanceof Error ? `Header check failed: ${error.name}` : "Header check failed." };
  }
}

export async function runProductionQualityMonitor({
  origin = QUALITY_PRODUCTION_ORIGIN,
  fetcher = fetch,
}: {
  origin?: string;
  fetcher?: Fetcher;
} = {}): Promise<QualitySnapshot> {
  const normalizedOrigin = origin.endsWith("/") ? origin : `${origin}/`;
  const checks = await Promise.all([
    ...qualityRouteRules.map((rule) => checkRoute(normalizedOrigin, rule, fetcher)),
    checkHealth(normalizedOrigin, fetcher),
    checkSecurityHeaders(normalizedOrigin, fetcher),
  ]);
  const overall = overallState(checks);
  return {
    checkedAt: new Date().toISOString(),
    origin: normalizedOrigin,
    overall,
    checks,
    summary: {
      total: checks.length,
      healthy: checks.filter((check) => check.state === "healthy").length,
      warning: checks.filter((check) => check.state === "warning").length,
      critical: checks.filter((check) => check.state === "critical").length,
    },
    note:
      "Phase 47 performs read-only GET checks only. It never submits an order, changes wallet balances, creates a payment, or mutates customer data.",
  };
}
