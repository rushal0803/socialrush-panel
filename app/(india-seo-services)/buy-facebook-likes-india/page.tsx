import FacebookLikesLanding from "@/components/marketing/FacebookLikesLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

export const metadata = getIndiaServiceMetadata("buy-facebook-likes-india");

export default function Page() {
  return (
    <>
      <IndiaCommercialServiceJsonLd
        code="facebook-likes"
        name="Facebook Likes"
        path="/facebook-likes"
        platform="Facebook"
        serviceType="Facebook likes service"
      />
      <FacebookLikesLanding />
      <MoneyPageAuthorityLinks platform="facebook" />
    </>
  );
}
