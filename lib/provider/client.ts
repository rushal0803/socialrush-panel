import "server-only";

export type ProviderOrderRequest = { service: string | number; link: string; quantity: number };
export type ProviderPreparedRequest = { configured: boolean; endpoint: string; method: "POST"; headers: { "Content-Type": string; Authorization: string }; body: Record<string, unknown> };

function config() {
  return { apiUrl: process.env.SMM_PROVIDER_API_URL?.replace(/\/$/, "") || "", apiKey: process.env.SMM_PROVIDER_API_KEY || "" };
}

export const providerClient = {
  isConfigured() { const value = config(); return Boolean(value.apiUrl && value.apiKey); },
  preparePlaceOrder(order: ProviderOrderRequest): ProviderPreparedRequest {
    const value = config();
    return { configured: Boolean(value.apiUrl && value.apiKey), endpoint: `${value.apiUrl || "https://provider.example"}/orders`, method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${value.apiKey ? "[configured]" : "[not-configured]"}` }, body: order };
  },
  prepareStatusCheck(providerOrderId: string): ProviderPreparedRequest {
    const value = config();
    return { configured: Boolean(value.apiUrl && value.apiKey), endpoint: `${value.apiUrl || "https://provider.example"}/orders/status`, method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${value.apiKey ? "[configured]" : "[not-configured]"}` }, body: { order_id: providerOrderId } };
  },
};

export function mapProviderStatus(status: string) {
  const normalized = status.toLowerCase().replace(/[ -]/g, "_");
  const map: Record<string,string> = { pending: "pending", processing: "processing", in_progress: "in_progress", completed: "completed", partial: "partial", cancelled: "cancelled", canceled: "cancelled", refunded: "refunded", failed: "failed" };
  return map[normalized] || "processing";
}
