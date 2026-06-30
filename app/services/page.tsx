import ServicesPageContent from "@/components/marketing/services/ServicesPageContent";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Instagram, YouTube & Social Growth Services India",
  description:
    "Explore social media growth services in India, including Instagram followers and likes, YouTube subscribers and views, LinkedIn followers and Twitter followers.",
  path: "/services",
  keywords: ["Instagram growth services India", "YouTube growth services India"],
});

export default function ServicesPage() {
  return <ServicesPageContent />;
}
