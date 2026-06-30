import ContactPageContent from "@/components/marketing/contact/ContactPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Support India",
  description:
    "Contact SocialRUSH support in India for help choosing Instagram, YouTube, LinkedIn, Facebook, TikTok or Twitter growth services and managing orders.",
  path: "/contact",
  keywords: ["SocialRUSH contact India", "social media growth support India"],
});

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
      <ContactPageContent />
    </>
  );
}
