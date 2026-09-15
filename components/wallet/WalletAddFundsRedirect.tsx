"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WalletAddFundsRedirect() {
  const router = useRouter();
  useEffect(() => {
    const routeToAddFunds = () => {
      if (window.location.hash === "#add-funds") router.push("/dashboard/add-funds");
    };
    routeToAddFunds();
    window.addEventListener("hashchange", routeToAddFunds);
    return () => window.removeEventListener("hashchange", routeToAddFunds);
  }, [router]);
  return null;
}
