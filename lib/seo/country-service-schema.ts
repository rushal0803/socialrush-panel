import type { PublishedCountryServicePage } from "./international.ts";

type CountryServiceSchemaFacts = {
  name: string;
  deliveryTime: string;
  refillPolicy: string;
  pricePer1000: number;
};

export function createCountryServiceFaqs(page: PublishedCountryServicePage, service: CountryServiceSchemaFacts) {
  return [
    ["What link should I provide?", page.copy.faq],
    [`What currency will I see in ${page.market.name}?`, `${page.market.currency} is used for display planning. The authoritative checkout is processed in INR.`],
    ["When does delivery begin?", `The current service information shows an estimated ${service.deliveryTime} delivery window. Keep the destination public while processing.`],
    ["Is a refill included?", `This service currently shows: ${service.refillPolicy}. Contact support with an order ID if eligible support is needed.`],
  ] as const;
}

/** The Offer is intentionally INR-authoritative even when display currency differs. */
export function createCountryServiceSchema(page: PublishedCountryServicePage, service: CountryServiceSchemaFacts) {
  const path = `/${page.market.slug}/${page.serviceSlug}`;
  const faqs = createCountryServiceFaqs(page, service);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: page.h1,
        url: `https://www.getsocialrush.com${path}`,
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: service.pricePer1000,
          description: `Price per 1,000 ${service.name}`,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map(([name, text]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text },
        })),
      },
    ],
  };
}
