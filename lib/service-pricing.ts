export const SERVICE_PRICES = {
  "instagram-followers": 599,
  "instagram-likes": 249,
  "instagram-views": 30,
  "youtube-subscribers": 3999,
  "youtube-likes": 499,
  "youtube-views": 249,
  "facebook-followers": 299,
  "facebook-likes": 149,
  "facebook-views": 99,
  "facebook-shares": 499,
  "linkedin-followers": 2999,
  "linkedin-likes": 2499,
  "telegram-members": 799,
  "tiktok-followers": 499,
  "tiktok-likes": 150,
  "tiktok-views": 15,
  "x-followers": 799,
} as const;

export type ServiceCode = keyof typeof SERVICE_PRICES;

export function getPricePer1000(serviceCode: ServiceCode) {
  return SERVICE_PRICES[serviceCode];
}

export function calculateServiceTotal(serviceCode: ServiceCode, quantity: number) {
  return Math.round(((quantity / 1000) * getPricePer1000(serviceCode)) * 100) / 100;
}
