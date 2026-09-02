import type { CRMLead, CRMLeadContact, CRMOutreachSettings, CRMSuppressionEntry } from "./types";

export function isLeadContactOutreachEligible(contact: CRMLeadContact, lead: Pick<CRMLead, "status">, settings: Pick<CRMOutreachSettings, "require_verified_business_email" | "require_compliance_eligible"> | null, suppressions: Pick<CRMSuppressionEntry, "email">[]) {
  return getLeadContactOutreachBlockReason(contact, lead, settings, suppressions) === null;
}

export function getLeadContactOutreachBlockReason(contact: CRMLeadContact | null | undefined, lead: Pick<CRMLead, "status"> | null | undefined, settings: Pick<CRMOutreachSettings, "require_verified_business_email" | "require_compliance_eligible"> | null, suppressions: Pick<CRMSuppressionEntry, "email">[]) {
  if (!contact || !lead) return "Outreach disabled";
  const suppressed = suppressions.some((entry) => entry.email.trim().toLowerCase() === contact.email.trim().toLowerCase());
  if (suppressed) return "Suppressed";
  if (contact.opted_out_at) return "Opted out";
  if (lead.status === "do_not_contact") return "Do Not Contact";
  if (settings?.require_verified_business_email !== false && contact.verification_status !== "valid") return "Email not verified";
  if (settings?.require_compliance_eligible !== false && contact.compliance_status !== "eligible") return "Compliance review required";
  return null;
}

export const scoreLabel = (score: number | null) => score !== null && score >= 80 ? "Strong Fit" : score !== null && score >= 60 ? "Good Fit" : score !== null && score >= 40 ? "Possible Fit" : "Low Fit";
