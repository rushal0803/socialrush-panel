"use client";
import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DISPLAY_CURRENCY_COOKIE, isCurrency, setClientCurrencyRates, type Currency, type CurrencyRates } from "@/lib/currency";

type State = { currency: Currency; setCurrency: (currency: Currency) => void; rates: CurrencyRates; ratesLoading: boolean; ratesSource: "server"; ratesUpdatedAt: number };
type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const Context = createContext<State | null>(null);

const hasRate = (rates: CurrencyRates, currency: Currency) =>
  currency === "INR" || (Number.isFinite(rates[currency]) && Number(rates[currency]) > 0);

export function CurrencyProvider({ children, initialCurrency = "INR", rates: initialRates = { INR: 1 } }: { children: ReactNode; initialCurrency?: Currency; rates?: CurrencyRates }) {
 const [currency, setValue] = useState(initialCurrency);
 const [rates, setRates] = useState(initialRates);
 const [ratesLoading, setRatesLoading] = useState(false);
 const setCurrency = useCallback((value: Currency) => { setValue(value); document.cookie = `${DISPLAY_CURRENCY_COOKIE}=${value}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`; }, []);

 useEffect(() => {
   let active = true;
   const stored = document.cookie
     .split(";")
     .map((part) => part.trim())
     .find((part) => part.startsWith(`${DISPLAY_CURRENCY_COOKIE}=`))
     ?.split("=")[1];

   if (isCurrency(stored)) {
     setValue(stored);
     return () => { active = false; };
   }

   const idleWindow = window as IdleWindow;
   let idleHandle: number | undefined;
   let timeoutHandle: number | undefined;
   const detectCurrency = () => {
     fetch("/api/display-currency", { cache: "no-store" })
       .then((response) => response.ok ? response.json() : null)
       .then((payload) => {
         if (!active || !isCurrency(payload?.currency)) return;
         setValue(payload.currency);
         document.cookie = `${DISPLAY_CURRENCY_COOKIE}=${payload.currency}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
       })
       .catch(() => undefined);
   };

   if (idleWindow.requestIdleCallback) {
     idleHandle = idleWindow.requestIdleCallback(detectCurrency, { timeout: 2500 });
   } else {
     timeoutHandle = window.setTimeout(detectCurrency, 1500);
   }

   return () => {
     active = false;
     if (idleHandle !== undefined) idleWindow.cancelIdleCallback?.(idleHandle);
     if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
   };
 }, []);

 useEffect(() => { setClientCurrencyRates(rates); }, [rates]);

 useEffect(() => {
   if (hasRate(rates, currency)) {
     setRatesLoading(false);
     return;
   }

   let active = true;
   setRatesLoading(true);
   fetch("/api/fx-rates", { cache: "force-cache" })
     .then((response) => response.ok ? response.json() : null)
     .then((payload) => {
       if (active && payload?.rates?.INR === 1) setRates(payload.rates);
     })
     .catch(() => undefined)
     .finally(() => { if (active) setRatesLoading(false); });

   return () => { active = false; };
 }, [currency, rates]);

 const value = useMemo<State>(() => ({ currency, setCurrency, rates, ratesLoading, ratesSource: "server", ratesUpdatedAt: 0 }), [currency, setCurrency, rates, ratesLoading]);
 return createElement(Context.Provider, { value }, children);
}
export function usePreferredCurrency(initialCurrency?: Currency) { void initialCurrency; const value = useContext(Context); if (!value) throw new Error("usePreferredCurrency must be used within CurrencyProvider"); return value; }
