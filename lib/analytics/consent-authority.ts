import { CONSENT_VERSION, CANONICAL_ANALYTICS_ORIGIN, privacyOptOut, productionCollectionAllowed } from "./privacy.ts";

export type ConsentRecord = { id: string; version: number; expiresAt: number; choice: "granted" | "denied" };
/** A future reviewed adapter MUST be durable/shared across workers. No live adapter
 * is installed by this PR. replace/revoke/consume must be atomic transactions. */
export interface ConsentRepository {
  isPublicActivity(request: Request): Promise<boolean>;
  replace(previousId: string | undefined, record: ConsentRecord): Promise<void>;
  revoke(id: string): Promise<void>;
  read(id: string): Promise<ConsentRecord | null>;
  // Atomically recheck grant/version/expiry AND claim a unique event ID.
  consume(id: string, eventId: string, now: number, version: number): Promise<boolean>;
}
export type ConsentEnvironment = { enabled?: string; deployment?: string; dataset?: string };
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
export async function consentDecision(request: Request, choice: "granted" | "denied", previousId: string | undefined, repo: ConsentRepository | null, env: ConsentEnvironment, now = Date.now(), generate = () => crypto.randomUUID()) {
  const canonicalRuntime = new URL(request.url).origin === CANONICAL_ANALYTICS_ORIGIN && env.deployment === "production";
  if (previousId && uuid.test(previousId) && canonicalRuntime) {
    if (!repo) return {choice:"denied" as const,reason:"durable_adapter_unavailable"};
    await repo.revoke(previousId);
  }
  if (!productionCollectionAllowed(new URL(request.url).origin, env)) return { choice: "denied" as const, reason: "disabled_or_environment" };
  if (!repo) return { choice: "denied" as const, reason: "durable_adapter_unavailable" };
  if (choice !== "granted" || privacyOptOut(request.headers.get("dnt"), request.headers.get("sec-gpc")) || await repo.isPublicActivity(request) !== true) return { choice: "denied" as const, reason: "privacy_or_exclusion" };
  const id = generate(); if (!uuid.test(id)) throw new Error("Invalid consent receipt ID");
  const record: ConsentRecord = { id, version: CONSENT_VERSION, expiresAt: now + 86_400_000, choice: "granted" };
  await repo.replace(previousId, record);
  return { choice: "granted" as const, id, expiresAt: record.expiresAt };
}
export async function authorizeOptionalEvent(request: Request, receipt: string | undefined, eventId: string, repo: ConsentRepository | null, env: ConsentEnvironment, now = Date.now()) {
  if (!productionCollectionAllowed(new URL(request.url).origin, env) || !repo || !receipt || !uuid.test(receipt) ||
    !(uuid.test(eventId) || /^server:[a-f0-9]{64}$/i.test(eventId)) || privacyOptOut(request.headers.get("dnt"), request.headers.get("sec-gpc"))) return false;
  if (await repo.isPublicActivity(request) !== true) return false; // trusted account/test/internal classification, never body flags
  const record = await repo.read(receipt);
  if (!record || record.id !== receipt || record.choice !== "granted" || record.version !== CONSENT_VERSION || record.expiresAt <= now) return false;
  return repo.consume(receipt, eventId, now, CONSENT_VERSION);
}
