import SeoServiceLandingPage from "@/components/marketing/services/SeoServiceLandingPage";
import { getSeoServiceMetadata } from "@/lib/seo/service-landing-pages";

export const metadata = getSeoServiceMetadata("telegram-members");

export default function TelegramMembersPage() {
  return <SeoServiceLandingPage slug="telegram-members" />;
}
