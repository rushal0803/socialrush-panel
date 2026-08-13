import ContactPageContent from "@/components/marketing/contact/ContactPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Contact SocialRUSH Support",
  description:
    "Contact SocialRUSH support for help with orders, payments, services and account questions. Choose a support path and send the details our team needs.",
  path: "/contact",
  keywords: ["Contact SocialRUSH", "SocialRUSH support", "SocialRUSH customer support", "social media service support"],
});

export default function ContactPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }]} />
      <ContactPageContent />
    </>
  );
}
