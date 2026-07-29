"use client";

export type CheckoutRazorpayResult = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type CheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: { email?: string };
  theme?: { color?: string };
  handler: (result: CheckoutRazorpayResult) => void;
  modal?: { ondismiss?: () => void };
};

type CheckoutInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: (result: { error?: { description?: string } }) => void) => void;
};

type RazorpayWindow = Window & {
  Razorpay?: new (options: CheckoutOptions) => CheckoutInstance;
};

async function loadRazorpay() {
  if ((window as RazorpayWindow).Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openCheckoutRazorpay(input: Omit<CheckoutOptions, "handler" | "modal">) {
  const loaded = await loadRazorpay();
  const Razorpay = (window as RazorpayWindow).Razorpay;
  if (!loaded || !Razorpay) throw new Error("Secure checkout could not be loaded. Please try again.");

  return new Promise<CheckoutRazorpayResult>((resolve, reject) => {
    const checkout = new Razorpay({
      ...input,
      handler: resolve,
      modal: { ondismiss: () => reject(new Error("Payment was cancelled. Your order was not charged.")) },
    });
    checkout.on("payment.failed", (result) => {
      reject(new Error(result.error?.description || "Payment could not be completed. Please try again."));
    });
    checkout.open();
  });
}
