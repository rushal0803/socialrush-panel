"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WalletAddFundsRedirect() {
  const router = useRouter();

  useEffect(() => {
    const routeToAddFunds = () => {
      const params = new URLSearchParams(window.location.search);
      const requestedAmount = params.get("amount");
      const returnTo = params.get("returnTo");
      const packageFundingRequested = Boolean(requestedAmount || returnTo);

      if (window.location.hash !== "#add-funds" && !packageFundingRequested) return;

      const addFundsParams = new URLSearchParams();
      if (requestedAmount) addFundsParams.set("amount", requestedAmount);
      if (returnTo) addFundsParams.set("returnTo", returnTo);
      const query = addFundsParams.toString();
      router.replace(`/dashboard/add-funds${query ? `?${query}` : ""}`);
    };

    routeToAddFunds();
    window.addEventListener("hashchange", routeToAddFunds);
    return () => window.removeEventListener("hashchange", routeToAddFunds);
  }, [router]);

  return null;
}
