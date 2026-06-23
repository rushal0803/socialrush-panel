"use client";

import { useCallback, useEffect, useState } from "react";
import { currencies, type Currency } from "@/lib/currency";

const CURRENCY_STORAGE_KEY = "socialrush.currency";
const CURRENCY_EVENT = "socialrush-currency-change";

function isCurrency(value: string | null | undefined): value is Currency {
  return Boolean(value && currencies.some((item) => item.code === value));
}

function detectDefaultCurrency(): Currency {
  return "INR";
}

function readStoredCurrency(): Currency {
  if (typeof window === "undefined") return "INR";
  const stored = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
  if (isCurrency(stored)) return stored;
  return detectDefaultCurrency();
}

function writeStoredCurrency(currency: Currency) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
  window.dispatchEvent(new CustomEvent(CURRENCY_EVENT, { detail: currency }));
}

export function usePreferredCurrency(initialCurrency?: Currency) {
  const [currency, setCurrencyState] = useState<Currency>(
    initialCurrency || "INR",
  );

  useEffect(() => {
    const selected = initialCurrency || readStoredCurrency();
    setCurrencyState(selected);
    writeStoredCurrency(selected);
  }, [initialCurrency]);

  const setCurrency = useCallback((nextCurrency: Currency) => {
    setCurrencyState(nextCurrency);
    writeStoredCurrency(nextCurrency);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CURRENCY_STORAGE_KEY) return;
      if (!isCurrency(event.newValue)) return;
      setCurrencyState(event.newValue);
    };

    const onCurrencyEvent = (event: Event) => {
      const custom = event as CustomEvent<Currency>;
      if (!isCurrency(custom.detail)) return;
      setCurrencyState(custom.detail);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(CURRENCY_EVENT, onCurrencyEvent);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CURRENCY_EVENT, onCurrencyEvent);
    };
  }, []);

  return { currency, setCurrency };
}
