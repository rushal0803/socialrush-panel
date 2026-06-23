import type { Metadata } from "next";
import HomepageContent from "@/components/marketing/HomepageContent";

export const metadata: Metadata = {
  title: "SocialRUSH | Premium Social Media Growth Platform",
  description:
    "Launch high-volume growth campaigns across Instagram, YouTube, LinkedIn, Facebook, Telegram, TikTok, and X with secure checkout, wallet support, WhatsApp assistance, multi-currency pricing, and professional order tracking.",
};

export default function HomePage() {
  return <HomepageContent />;
}
