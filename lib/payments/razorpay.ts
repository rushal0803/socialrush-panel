import "server-only";
import { createHmac, timingSafeEqual } from "crypto";

export function razorpayConfig() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay is not configured");

  const keyMode = keyId.startsWith("rzp_live_")
    ? "live"
    : keyId.startsWith("rzp_test_")
      ? "test"
      : null;
  if (!keyMode) throw new Error("Razorpay key ID has an invalid format");
  if (process.env.NODE_ENV === "production" && keyMode !== "live") {
    throw new Error("Razorpay live keys are required in production");
  }

  return { keyId, keySecret };
}

export async function razorpayRequest<T>(path: string, init: RequestInit = {}) {
  const { keyId, keySecret } = razorpayConfig();
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`, "Content-Type": "application/json", ...init.headers },
    cache: "no-store",
  });
  const payload = await response.json() as T & { error?: { description?: string } };
  if (!response.ok) throw new Error(payload.error?.description || "Razorpay request failed");
  return payload;
}

export function verifyHmac(payload: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const left = Buffer.from(expected); const right = Buffer.from(signature || "");
  return left.length === right.length && timingSafeEqual(left, right);
}
