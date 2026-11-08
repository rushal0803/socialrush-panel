import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-facebook-shares-india");

export default function Page() {
  return (
    <>
      <IndiaServiceLandingPage slug="buy-facebook-shares-india" />
      <MoneyPageAuthorityLinks platform="facebook" />
    </>
  );
}
