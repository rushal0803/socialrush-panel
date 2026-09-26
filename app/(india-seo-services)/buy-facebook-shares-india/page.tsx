import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-facebook-shares-india");

export default function Page() {
  return (
    <>
      <IndiaCommercialServiceJsonLd
        code="facebook-shares"
        name="Facebook Shares"
        path="/buy-facebook-shares-india"
        platform="Facebook"
        serviceType="Facebook shares service"
      />
      <IndiaServiceLandingPage slug="buy-facebook-shares-india" />
      <MoneyPageAuthorityLinks platform="facebook" />
    </>
  );
}
