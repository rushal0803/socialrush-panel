import ServicesPageContent from "@/components/marketing/services/ServicesPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Services India",
  description:
    "Explore SocialRUSH social media growth services for Instagram, YouTube, Facebook, LinkedIn, Telegram, TikTok and X/Twitter.",
  path: "/services",
  keywords: ["social media growth services India", "Instagram growth services India", "YouTube growth services India"],
});

export default function ServicesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Services", path: "/services" }]} />
      <ServicesPageContent />
    </>
  );
}
