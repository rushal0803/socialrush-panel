"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { CurrencyProvider } from "@/lib/currency/use-currency";
import type { Currency, CurrencyRates } from "@/lib/currency";

export default function ClientProviders({ children, initialCurrency, rates }: { children: ReactNode; initialCurrency?: Currency; rates?: CurrencyRates }) {
  return (
    <MotionConfig reducedMotion="user">
      <CurrencyProvider initialCurrency={initialCurrency} rates={rates}>{children}</CurrencyProvider>
    </MotionConfig>
  );
}
