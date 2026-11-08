// This batch clarifies existing offers only; it never creates live-only offers.
const referenceUnits: Readonly<Record<string, string>> = {
  "/instagram-likes": "likes",
  "/youtube-subscribers": "subscribers",
  "/youtube-views": "views",
  "/buy-facebook-followers-india": "followers",
  "/linkedin-followers": "followers",
  "/facebook-likes": "likes",
  "/telegram-members": "members",
};

export function servicePriceSpecification(path: string, pricePer1000: number) {
  const unitText = referenceUnits[path];
  if (!unitText || !Number.isFinite(pricePer1000) || pricePer1000 <= 0) return {};
  return {
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: pricePer1000,
      priceCurrency: "INR",
      referenceQuantity: { "@type": "QuantitativeValue", value: 1000, unitText },
    },
  };
}
