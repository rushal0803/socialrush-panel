"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics/events";

export default function EmailRecoveryAttribution() {
  const searchParams = useSearchParams();
  const source = searchParams.get("source");
  const campaign = searchParams.get("campaign");

  useEffect(() => {
    if (source !== "email_recovery") return;
    track("email_recovery_click", {
      campaign: (campaign || "unknown").slice(0, 80),
      surface: "dashboard_landing",
    });
  }, [campaign, source]);

  return null;
}
