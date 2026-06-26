"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  currencies,
  getCurrencyRates,
  getCurrencyRatesEventName,
  hydrateCurrencyRatesFromStorage,
  refreshCurrencyRates,
  type Currency,
} from "@/lib/currency";

const CURRENCY_STORAGE_KEY = "socialrush.currency";
const CURRENCY_EVENT = "socialrush-currency-change";

type CurrencyState = {
  currency: Currency;
  setCurrency: (nextCurrency: Currency) => void;
  rate: number;
  ratesLoading: boolean;
  ratesSource: "api" | "fallback";
  ratesUpdatedAt: number;
};

const CurrencyContext = createContext<CurrencyState | null>(null);

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

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("INR");
  const [ratesState, setRatesState] = useState(() => {
    const hydrated = hydrateCurrencyRatesFromStorage();
    return {
      loading: false,
      source: hydrated.source,
      updatedAt: hydrated.updatedAt,
      inrRate: hydrated.rates.INR ?? 1,
    };
  });

  useEffect(() => {
    const selected = readStoredCurrency();
    setCurrencyState(selected);
  }, []);

  const setCurrency = useCallback((nextCurrency: Currency) => {
    setCurrencyState(nextCurrency);
    writeStoredCurrency(nextCurrency);
  }, []);

  useEffect(() => {
    const code = currency;
    const rates = getCurrencyRates();
    setRatesState((current) => ({
      ...current,
      inrRate: rates.rates[code] ?? 1,
      source: rates.source,
      updatedAt: rates.updatedAt,
    }));
  }, [currency]);

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

    const ratesEventName = getCurrencyRatesEventName();
    const onRatesEvent = (event: Event) => {
      const custom = event as CustomEvent<{ updatedAt?: number; source?: "api" | "fallback" }>;
      const snapshot = getCurrencyRates();
      setRatesState((current) => ({
        ...current,
        loading: false,
        source: custom.detail?.source ?? snapshot.source,
        updatedAt: custom.detail?.updatedAt ?? snapshot.updatedAt,
        inrRate: snapshot.rates[currency] ?? 1,
      }));
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(CURRENCY_EVENT, onCurrencyEvent);
    window.addEventListener(ratesEventName, onRatesEvent);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(CURRENCY_EVENT, onCurrencyEvent);
      window.removeEventListener(ratesEventName, onRatesEvent);
    };
  }, [currency]);

  useEffect(() => {
    let cancelled = false;
    setRatesState((current) => ({ ...current, loading: true }));
    void refreshCurrencyRates().then((payload) => {
      if (cancelled) return;
      setRatesState({
        loading: false,
        source: payload.source,
        updatedAt: payload.updatedAt,
        inrRate: payload.rates[currency] ?? 1,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [currency]);

  const value = useMemo<CurrencyState>(
    () => ({
      currency,
      setCurrency,
      rate: ratesState.inrRate,
      ratesLoading: ratesState.loading,
      ratesSource: ratesState.source,
      ratesUpdatedAt: ratesState.updatedAt,
    }),
    [currency, ratesState.inrRate, ratesState.loading, ratesState.source, ratesState.updatedAt, setCurrency],
  );

  return createElement(CurrencyContext.Provider, { value }, children);
}

export function usePreferredCurrency(initialCurrency?: Currency) {
  void initialCurrency;
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("usePreferredCurrency must be used within CurrencyProvider");
  }
  return context;
}
