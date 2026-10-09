export type LiveServiceRow = {
  id: number;
  code?: string;
  platform?: string;
  rate: number | string;
  min: number | string;
  max: number | string;
  delivery_time: string | null;
  refill_policy: string | null;
  quality_type: string | null;
  health_status: string | null;
  important_instruction: string | null;
};

export function mapLiveServiceRow(data: LiveServiceRow) {
  return {
    id: data.id, rate: Number(data.rate), min: Number(data.min), max: Number(data.max),
    deliveryTime: data.delivery_time || "Estimate shown before checkout",
    refillPolicy: data.refill_policy || "Check current service terms",
    qualityType: data.quality_type || "Premium",
    available: data.health_status !== "paused",
    healthStatus: data.health_status || "stable",
    importantInstruction: data.important_instruction || "Use the exact public YouTube video URL and keep the video public while processing.",
  };
}

// Rows arrive in id order, matching the single-service query's limit(1).
// Preserve its case-insensitive platform filter, including %twitter% for X.
export function findLiveServiceRow(rows: readonly LiveServiceRow[], platform: string, code: string) {
  const normalized = platform.trim().toLowerCase();
  return rows.find(row => {
    const actual = (row.platform || "").toLowerCase();
    return row.code === code && (normalized === "x" || normalized === "twitter" ? actual.includes("twitter") : actual === normalized);
  });
}
