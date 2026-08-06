"use client";

import type { ReactNode } from "react";
import { CurrencyProvider } from "@/lib/currency/use-currency";
import type { Currency, CurrencyRates } from "@/lib/currency";

export default function ClientProviders({ children, initialCurrency, rates }: { children: ReactNode; initialCurrency?: Currency; rates?: CurrencyRates }) {
  return <CurrencyProvider initialCurrency={initialCurrency} rates={rates}>{children}</CurrencyProvider>;
}
