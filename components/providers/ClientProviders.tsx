"use client";

import type { ReactNode } from "react";
import { CurrencyProvider } from "@/lib/currency/use-currency";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <CurrencyProvider>{children}</CurrencyProvider>;
}
