import "server-only";
import { monitoringConfig } from "./config";

const sensitive = /authorization|cookie|secret|token|password|signature|api[_-]?key|card|upi|email|target|url/i;
export function safeMetadata(input: Record<string, unknown> = {}) {
  return Object.fromEntries(Object.entries(input).flatMap(([key, value]) => {
    if (sensitive.test(key) || value === undefined || value === null) return [];
    const text = typeof value === "string" ? value.slice(0, 160) : String(value).slice(0, 160);
    return [[key, text]];
  }));
}
export function safeLog(level: "debug" | "info" | "warn" | "error", event: string, metadata?: Record<string, unknown>) {
  const entry = { level, event, environment: monitoringConfig.environment, ...safeMetadata(metadata) };
  if (level === "error") console.error("[monitoring]", entry);
  else if (level === "warn") console.warn("[monitoring]", entry);
  else console.info("[monitoring]", entry);
}
