import type { Metadata } from "next";
import ServicesPageContent from "@/components/marketing/services/ServicesPageContent";

export const metadata: Metadata = {
  title: "Social Media Growth Services",
  description:
    "Explore premium social growth services for Instagram, YouTube, Facebook, LinkedIn, TikTok, and Twitter/X with secure dashboard checkout and campaign tracking.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return <ServicesPageContent />;
}
