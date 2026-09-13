"use client";

import { useEffect } from "react";

const DIRECT_UPI_PREFIX = "socialrush_direct_upi:";

export default function DirectUpiCheckoutBridge() {
  useEffect(() => {
    const target = window as typeof window & { Cashfree?: (options: unknown) => { checkout: (input: { paymentSessionId: string; returnUrl?: string; redirectTarget?: string }) => Promise<unknown> } };
    const previous = target.Cashfree;

    const bridge = (options: unknown) => ({
      checkout: async (input: { paymentSessionId: string; returnUrl?: string; redirectTarget?: string }) => {
        if (input.paymentSessionId.startsWith(DIRECT_UPI_PREFIX) && input.returnUrl) {
          window.location.assign(input.returnUrl);
          return { redirected: true };
        }

        if (previous) return previous(options).checkout(input);
        throw new Error("This payment session is not available.");
      },
    });

    target.Cashfree = bridge;
    return () => {
      if (target.Cashfree !== bridge) return;
      if (previous) target.Cashfree = previous;
      else delete target.Cashfree;
    };
  }, []);

  return null;
}
