"use client";
import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DISPLAY_CURRENCY_COOKIE, type Currency, type CurrencyRates } from "@/lib/currency";
type State = { currency: Currency; setCurrency: (currency: Currency) => void; rates: CurrencyRates; ratesLoading: boolean; ratesSource: "server"; ratesUpdatedAt: number };
const Context = createContext<State | null>(null);
export function CurrencyProvider({ children, initialCurrency = "INR", rates = { INR: 1 } }: { children: ReactNode; initialCurrency?: Currency; rates?: CurrencyRates }) {
 const [currency, setValue] = useState(initialCurrency);
 const setCurrency = useCallback((value: Currency) => { setValue(value); document.cookie = `${DISPLAY_CURRENCY_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`; }, []);
 const value = useMemo<State>(() => ({ currency, setCurrency, rates, ratesLoading: false, ratesSource: "server", ratesUpdatedAt: 0 }), [currency, setCurrency, rates]);
 return createElement(Context.Provider, { value }, children);
}
export function usePreferredCurrency(initialCurrency?: Currency) { void initialCurrency; const value = useContext(Context); if (!value) throw new Error("usePreferredCurrency must be used within CurrencyProvider"); return value; }
