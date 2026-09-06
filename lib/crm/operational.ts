export const INDIA_TIME_ZONE = "Asia/Kolkata";

export type OperationalLead = { source_name?: string | null; business_name?: string | null };

/** Keeps synthetic Resend E2E data visible in CRM history while excluding it from sales operations. */
export const isInternalOperationalTestLead = (lead: OperationalLead) =>
  lead.source_name === "Internal Resend E2E Test" || lead.business_name === "SocialRUSH Internal Test";

export const operationalLeadIds = <T extends OperationalLead & { id: string }>(leads: T[]) =>
  new Set(leads.filter((lead) => !isInternalOperationalTestLead(lead)).map((lead) => lead.id));

export const filterOperationalLeadItems = <T extends { lead_id?: string | null }>(items: T[], leadIds: Set<string>) =>
  items.filter((item) => !item.lead_id || leadIds.has(item.lead_id));

export const istDayBounds = (reference = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(reference).reduce<Record<string, string>>((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const start = new Date(`${date}T00:00:00+05:30`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
};

/** datetime-local inputs from the admin UI represent India time, not server time. */
export const istDateTimeInputToIso = (value: string) => {
  const normalized = value.trim();
  if (!normalized) return null;
  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized);
  const parsed = new Date(hasOffset ? normalized : `${normalized.length === 16 ? `${normalized}:00` : normalized}+05:30`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

export const formatIstDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date).reduce<Record<string, string>>((result, part) => {
    result[part.type] = part.value;
    return result;
  }, {});
  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute} ${parts.dayPeriod.toUpperCase()} IST`;
};

export const istHour = (reference = new Date()) => Number(new Intl.DateTimeFormat("en-IN", {
  timeZone: INDIA_TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
}).format(reference));
