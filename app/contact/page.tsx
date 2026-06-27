import type { Metadata } from "next";
import ContactPageContent from "@/components/marketing/contact/ContactPageContent";

export const metadata: Metadata = {
  title: "Contact SocialRUSH | Social Media Growth Support",
  description: "Contact SocialRUSH for help choosing or managing an Instagram, YouTube, Facebook, LinkedIn, TikTok, or Twitter/X growth service.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <ContactPageContent />;
}
