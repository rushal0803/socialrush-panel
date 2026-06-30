import PackagesPageContent from "@/components/marketing/packages/PackagesPageContent";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Packages India",
  description:
    "Compare SocialRUSH packages for Instagram followers and likes, YouTube subscribers and views, LinkedIn followers, TikTok growth and Twitter followers in India.",
  path: "/packages",
  keywords: ["social media growth packages India", "Instagram follower packages India"],
});

export default function PackagesPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Packages", path: "/packages" }]} />
      <PackagesPageContent />
    </>
  );
}
