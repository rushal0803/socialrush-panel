// This batch clarifies existing offers only; it never creates live-only offers.
const referenceUnits: Readonly<Record<string, string>> = {
  "/instagram-likes": "likes",
  "/youtube-subscribers": "subscribers",
  "/youtube-views": "views",
  "/buy-facebook-followers-india": "followers",
  "/linkedin-followers": "followers",
  "/facebook-likes": "likes",
  "/telegram-members": "members",
  "/youtube-likes": "likes",
  "/facebook-views": "views",
  "/linkedin-likes": "likes",
  "/buy-instagram-saves-india": "saves",
  "/buy-instagram-shares-india": "shares",
  "/buy-youtube-comments-india": "comments",
  "/buy-facebook-shares-india": "shares",
  "/buy-facebook-group-members-india": "members",
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
