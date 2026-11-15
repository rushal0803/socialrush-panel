/** Offline policy prototype. No storage, network, cookies or production capture adapter. */
export type MeasurementContext = {
  dataset: "production" | "synthetic";
  deployment: "production" | "preview" | "development";
  origin: string;
  canonicalOrigin: string;
  consent: "granted" | "denied" | "unknown";
  doNotTrack: boolean;
  globalPrivacyControl: boolean;
  internal: boolean;
  synthetic: boolean;
};

export const funnelEvents = {
  page_viewed: "landing",
  service_selected: "discovery",
  service_viewed: "service",
  order_details_completed: "details",
  checkout_started: "review",
  sign_up_completed: "auth",
  // A future trusted adapter must reconcile a paid ORDER, not a wallet top-up.
  verified_order_paid: "verified_paid_order",
} as const;

type EventName = keyof typeof funnelEvents;
type Input = {
  event: string;
  eventId: string;
  sessionId: string;
  occurredAt: string;
  source: "client" | "committed_server";
  dimensions?: Record<string, unknown>;
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const dimensions = {
  page_template: ["home", "directory", "service", "review", "auth"],
  platform: ["instagram", "youtube", "linkedin", "facebook", "tiktok", "telegram", "x", "other"],
  device: ["mobile", "tablet", "desktop", "unknown"],
  channel: ["organic", "paid", "direct", "referral", "unknown"],
} as const;

/** Context must come from a trusted runtime adapter, never request-body flags.
 * Consent applies to optional analytics, not the operational accounting ledger.
 * This function alone is not a bot filter, consent manager or identity proof. */
export function prepareMeasurement(input: Input, context: MeasurementContext) {
  const reject = (reason: string) => ({ accepted: false as const, reason });
  if (context.consent !== "granted" || context.doNotTrack !== false || context.globalPrivacyControl !== false) return reject("consent_or_privacy_signal");
  if (context.internal !== false) return reject("internal_or_unknown_activity");
  if (context.dataset === "production") {
    let origin: URL, canonical: URL;
    try { origin = new URL(context.origin); canonical = new URL(context.canonicalOrigin); } catch { return reject("invalid_origin"); }
    if (context.deployment !== "production" || context.synthetic !== false ||
      origin.protocol !== "https:" || origin.origin !== context.origin ||
      canonical.origin !== context.canonicalOrigin || origin.origin !== canonical.origin ||
      origin.hostname.endsWith(".vercel.app") || ["localhost", "127.0.0.1"].includes(origin.hostname)) return reject("nonproduction_activity");
  } else if (context.dataset !== "synthetic" || context.synthetic !== true || context.deployment !== "development") return reject("invalid_fixture_context");
  if (!Object.hasOwn(funnelEvents, input.event)) return reject("unsupported_event");
  if (!uuid.test(input.eventId) || !uuid.test(input.sessionId) || !Number.isFinite(Date.parse(input.occurredAt))) return reject("invalid_envelope");
  if (["sign_up_completed", "verified_order_paid"].includes(input.event) && input.source !== "committed_server") return reject("untrusted_outcome");
  if (!["client", "committed_server"].includes(input.source)) return reject("invalid_source");
  const safe: Record<string, string> = {};
  for (const [key, values] of Object.entries(dimensions)) {
    const value = input.dimensions?.[key];
    if (typeof value === "string" && (values as readonly string[]).includes(value)) safe[key] = value;
  }
  return {
    accepted: true as const,
    event: { dataset: context.dataset, event: input.event as EventName, stage: funnelEvents[input.event as EventName],
      eventId: input.eventId, sessionId: input.sessionId, occurredAt: new Date(input.occurredAt).toISOString(), dimensions: safe },
  };
}

/** Sequential, same-session funnel. Retries deduplicate by event ID; conflicting
 * reuses fail instead of silently changing an outcome. No cross-device identity. */
export function buildSequentialFunnel(events: Array<Extract<ReturnType<typeof prepareMeasurement>, { accepted: true }>["event"]>) {
  const unique = new Map<string, typeof events[number]>();
  for (const event of events) {
    const prior = unique.get(event.eventId);
    if (prior && JSON.stringify(prior) !== JSON.stringify(event)) throw new Error("Conflicting event ID");
    unique.set(event.eventId, event);
  }
  if (new Set(events.map(e => e.dataset)).size > 1) throw new Error("Cannot mix synthetic and production datasets");
  const stages = ["landing", "discovery", "service", "details", "review", "verified_paid_order"];
  const sessions = new Map<string, typeof events>();
  for (const event of unique.values()) sessions.set(event.sessionId, [...(sessions.get(event.sessionId) ?? []), event]);
  const counts = stages.map(() => 0);
  for (const session of sessions.values()) {
    let index = 0;
    for (const event of [...session].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))) {
      if (event.stage === stages[index]) { counts[index]++; index++; }
    }
  }
  return stages.map((stage, i) => ({ stage, sessions: counts[i], rateFromPrior: i && counts[i - 1] ? counts[i] / counts[i - 1] : null }));
}
