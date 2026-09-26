import FacebookViewsLanding from "@/components/marketing/FacebookViewsLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

export const metadata = getIndiaServiceMetadata("buy-facebook-views-india");

export default function Page() {
  return (
    <>
      <IndiaCommercialServiceJsonLd
        code="facebook-views"
        name="Facebook Views"
        path="/facebook-views"
        platform="Facebook"
        serviceType="Facebook video views service"
      />
      <FacebookViewsLanding />
      <MoneyPageAuthorityLinks platform="facebook" />
    </>
  );
}
