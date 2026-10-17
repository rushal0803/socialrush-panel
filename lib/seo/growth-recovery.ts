export const recoveryWorkstreams = ["seo", "geo"] as const;
export const recoveryIssues = [
  "discovered_not_indexed",
  "crawled_not_indexed",
  "canonical_conflict",
  "technical_error",
  "content_gap",
  "ai_answer_readiness",
] as const;
export const recoveryPriorities = ["critical", "high", "normal", "low"] as const;
export const recoveryStatuses = ["open", "in_progress", "blocked", "verified", "closed"] as const;
export const recoveryEvidenceSources = ["search_console", "site_audit", "geo_audit", "manual"] as const;

export type RecoveryWorkstream = (typeof recoveryWorkstreams)[number];
export type RecoveryIssue = (typeof recoveryIssues)[number];
export type RecoveryPriority = (typeof recoveryPriorities)[number];
export type RecoveryStatus = (typeof recoveryStatuses)[number];
export type RecoveryEvidenceSource = (typeof recoveryEvidenceSources)[number];

function oneOf<const T extends readonly string[]>(value: string, options: T, field: string): T[number] {
  if (!options.includes(value)) throw new Error("Invalid " + field + ".");
  return value as T[number];
}

export function normalizeRecoveryPath(input: string): string {
  const candidate = input.trim().replace(/\/$/, "") || "/";
  // Only first-party, lowercase clean paths may be stored; no query, fragment,
  // protocol, credentials, backslashes, encoded delimiters or traversal.
  if (
    candidate.length > 180 ||
    !/^\/(?:[a-z0-9]+(?:[-/][a-z0-9]+)*)?$/.test(candidate) ||
    candidate.includes("//") ||
    /(?:^|\/)(?:admin|api|auth|account|dashboard|wallet|billing|login|register|orders|new-campaign|order-summary)(?:\/|$)/.test(candidate)
  ) {
    throw new Error("Use a clean, public SocialRUSH path such as /buy-instagram-comments-india.");
  }
  return candidate;
}

function dateOrNull(value: string): string | null {
  const input = value.trim();
  if (!input) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input) || Number.isNaN(Date.parse(input)) || new Date(input).toISOString().slice(0, 10) !== input) {
    throw new Error("Evidence date must be a valid date.");
  }
  // Do not allow future-dated search evidence.
  if (input > new Date().toISOString().slice(0, 10)) throw new Error("Evidence cannot be future-dated.");
  return input;
}

export type NewRecoveryItem = {
  canonical_path: string;
  workstream: RecoveryWorkstream;
  issue_type: RecoveryIssue;
  priority: RecoveryPriority;
  title: string;
  details: string | null;
  evidence_source: RecoveryEvidenceSource;
  evidence_date: string | null;
};

export function parseRecoveryItem(input: Record<string, string>): NewRecoveryItem {
  const title = (input.title || "").trim();
  const details = (input.details || "").trim();
  if (title.length < 8 || title.length > 160) throw new Error("Use an issue title between 8 and 160 characters.");
  if (details.length > 2000) throw new Error("Issue notes must be under 2,000 characters.");
  return {
    canonical_path: normalizeRecoveryPath(input.canonical_path || ""),
    workstream: oneOf(input.workstream || "", recoveryWorkstreams, "workstream"),
    issue_type: oneOf(input.issue_type || "", recoveryIssues, "issue type"),
    priority: oneOf(input.priority || "", recoveryPriorities, "priority"),
    title,
    details: details || null,
    evidence_source: oneOf(input.evidence_source || "", recoveryEvidenceSources, "evidence source"),
    evidence_date: dateOrNull(input.evidence_date || ""),
  };
}

export function validateRecoveryStatus(input: string, resolutionNote: string): RecoveryStatus {
  const status = oneOf(input, recoveryStatuses, "status");
  if ((status === "verified" || status === "closed") && resolutionNote.trim().length < 12) {
    throw new Error("Verification or closure requires a supporting note of at least 12 characters.");
  }
  if (resolutionNote.length > 2000) throw new Error("Resolution note is too long.");
  return status;
}

export function formatRecoveryLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (ch) => ch.toUpperCase());
}

const priorityScore: Record<RecoveryPriority, number> = { critical: 0, high: 1, normal: 2, low: 3 };
export function recoveryPriorityScore(priority: RecoveryPriority): number {
  return priorityScore[priority];
}
