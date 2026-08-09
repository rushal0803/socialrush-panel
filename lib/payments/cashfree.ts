import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";

const API_VERSION = "2025-01-01";

export type CashfreeOrder = {
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED" | string;
  payment_session_id: string;
};

export type CashfreePayment = {
  cf_payment_id: string;
  order_id: string;
  payment_amount: number;
  payment_currency: string;
  order_amount: number;
  order_currency: string;
  payment_status: "SUCCESS" | "FAILED" | "PENDING" | string;
  is_captured?: boolean;
};

export function cashfreeConfig() {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  const environment = process.env.CASHFREE_ENV || "sandbox";
  if (!clientId || !clientSecret) throw new Error("Cashfree is not configured");
  if (environment !== "sandbox" && environment !== "production") {
    throw new Error("Cashfree environment is invalid");
  }
  return {
    clientId,
    clientSecret,
    environment,
    baseUrl: environment === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg",
  };
}

export async function cashfreeRequest<T>(path: string, init: RequestInit = {}) {
  const { clientId, clientSecret, baseUrl } = cashfreeConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "x-api-version": API_VERSION,
      "x-client-id": clientId,
      "x-client-secret": clientSecret,
      "x-request-id": randomUUID(),
      ...init.headers,
    },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as T | { message?: string; type?: string } | null;
  if (!response.ok) throw new Error("Cashfree request failed");
  return payload as T;
}

export function verifyCashfreeWebhook(rawBody: string, timestamp: string, signature: string) {
  const secret = process.env.CASHFREE_CLIENT_SECRET;
  if (!secret || !timestamp || !signature) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}${rawBody}`).digest("base64");
  const left = Buffer.from(expected);
  const right = Buffer.from(signature);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function cashfreeMode() {
  return cashfreeConfig().environment;
}
