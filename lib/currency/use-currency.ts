"use client";
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DISPLAY_CURRENCY_COOKIE, setClientCurrencyRates, type Currency, type CurrencyRates } from "@/lib/currency";
type State = { currency: Currency; setCurrency: (currency: Currency) => void; rates: CurrencyRates; ratesLoading: boolean; ratesSource: "server"; ratesUpdatedAt: number };
const Context = createContext<State | null>(null);
export function CurrencyProvider({ children, initialCurrency = "INR", rates: initialRates = { INR: 1 } }: { children: ReactNode; initialCurrency?: Currency; rates?: CurrencyRates }) {
 const [currency, setValue] = useState(initialCurrency);
 const [rates, setRates] = useState(initialRates);
 const [ratesLoading, setRatesLoading] = useState(false);
 const setCurrency = useCallback((value: Currency) => { setValue(value); document.cookie = `${DISPLAY_CURRENCY_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`; }, []);
 useEffect(() => { setClientCurrencyRates(rates); }, [rates]);
 useEffect(() => {
   let active = true;
   setRatesLoading(true);
   fetch("/api/fx-rates", { cache: "no-store" }).then((response) => response.ok ? response.json() : null).then((payload) => {
     if (active && payload?.rates?.INR === 1) setRates(payload.rates);
   }).catch(() => undefined).finally(() => { if (active) setRatesLoading(false); });
   return () => { active = false; };
 }, []);
 const value = useMemo<State>(() => ({ currency, setCurrency, rates, ratesLoading, ratesSource: "server", ratesUpdatedAt: 0 }), [currency, setCurrency, rates, ratesLoading]);
 return createElement(Context.Provider, { value }, children);
}
export function usePreferredCurrency(initialCurrency?: Currency) { void initialCurrency; const value = useContext(Context); if (!value) throw new Error("usePreferredCurrency must be used within CurrencyProvider"); return value; }
