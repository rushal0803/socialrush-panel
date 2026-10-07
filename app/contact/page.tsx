import ContactPageContent from "@/components/marketing/contact/ContactPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Contact SocialRUSH Support | Orders, Payments & Account Help",
  description:
    "Contact SocialRUSH Support for order status, payment questions, service guidance, account help and bulk or agency enquiries. Choose the right support path and send the relevant details.",
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
