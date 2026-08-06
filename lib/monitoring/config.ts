export const incidentSeverities = ["critical", "high", "medium", "low", "informational"] as const;
export type IncidentSeverity = (typeof incidentSeverities)[number];

export const monitoringConfig = {
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
  cooldownMinutes: Number(process.env.MONITORING_INCIDENT_COOLDOWN_MINUTES || 30),
  supportWarningHours: Number(process.env.MONITORING_SUPPORT_WARNING_HOURS || 24),
  refillWarningHours: Number(process.env.MONITORING_REFILL_WARNING_HOURS || 48),
  healthTimeoutMs: 2_000,
} as const;
