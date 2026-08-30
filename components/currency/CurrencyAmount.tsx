"use client";

import { formatCurrency } from "@/lib/currency";
import { usePreferredCurrency } from "@/lib/currency/use-currency";

export default function CurrencyAmount({
  amountINR,
  prefix,
  suffix,
}: {
  amountINR: number;
  prefix?: string;
  suffix?: string;
}) {
  const { currency, rates } = usePreferredCurrency("INR");
  return (
    <>
      {prefix || ""}
      {formatCurrency(amountINR, currency, rates)}
      {suffix || ""}
    </>
  );
}
