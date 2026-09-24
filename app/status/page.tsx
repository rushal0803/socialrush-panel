import type { Metadata } from "next";
import StatusContent from "./status-content";
import InteractiveHomepageShell from "@/components/marketing/InteractiveHomepageShell";

export const metadata: Metadata = {
  title: { absolute: "Service Status | SocialRUSH" },
  description: "Current availability notices for SocialRUSH services.",
  robots: { index: false, follow: true },
};

export default function StatusPage() {
  return <InteractiveHomepageShell><div className="service-money-page"><StatusContent /></div></InteractiveHomepageShell>;
}
