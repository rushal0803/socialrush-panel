import type { CRMLead, CRMLeadContact, CRMOutreachSettings, CRMSuppressionEntry } from "./types";

export function isLeadContactOutreachEligible(contact: CRMLeadContact, lead: Pick<CRMLead, "status">, settings: Pick<CRMOutreachSettings, "require_verified_business_email" | "require_compliance_eligible"> | null, suppressions: Pick<CRMSuppressionEntry, "email">[]) {
  const suppressed = suppressions.some((entry) => entry.email.trim().toLowerCase() === contact.email.trim().toLowerCase());
  if (suppressed || contact.opted_out_at || lead.status === "do_not_contact") return false;
  if (settings?.require_verified_business_email !== false && contact.verification_status !== "valid") return false;
  if (settings?.require_compliance_eligible !== false && contact.compliance_status !== "eligible") return false;
  return true;
}

export const scoreLabel = (score: number | null) => score !== null && score >= 80 ? "Strong Fit" : score !== null && score >= 60 ? "Good Fit" : score !== null && score >= 40 ? "Possible Fit" : "Low Fit";
