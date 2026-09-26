import IndiaServiceLandingPage from "@/components/marketing/services/IndiaServiceLandingPage";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";

export const metadata = getIndiaServiceMetadata("buy-facebook-group-members-india");

export default function Page() {
  return (
    <>
      <IndiaCommercialServiceJsonLd
        code="facebook-group-members"
        name="Facebook Group Members"
        path="/buy-facebook-group-members-india"
        platform="Facebook"
        serviceType="Facebook group members service"
      />
      <IndiaServiceLandingPage slug="buy-facebook-group-members-india" />
      <MoneyPageAuthorityLinks platform="facebook" />
    </>
  );
}
