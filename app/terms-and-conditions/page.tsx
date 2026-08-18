import TermsCenter from "@/components/marketing/TermsCenter";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Terms & Conditions",
  description:
    "Read the SocialRUSH Terms and Conditions for accounts, wallet funding, social media growth orders, delivery, refill support, cancellations and platform use.",
  path: "/terms-and-conditions",
});

export default function TermsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Terms & Conditions", path: "/terms-and-conditions" }]} />
      <TermsCenter />
    </>
  );
}
