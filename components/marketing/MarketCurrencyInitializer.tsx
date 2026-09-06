"use client";

import { useEffect } from "react";
import type { Currency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

export default function MarketCurrencyInitializer({ currency }: { currency: Currency }) {
  const { setCurrency } = usePreferredCurrency();
  useEffect(() => { setCurrency(currency); }, [currency, setCurrency]);
  return null;
}
