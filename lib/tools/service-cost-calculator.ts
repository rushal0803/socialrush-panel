import { SERVICE_PRICES } from "../service-pricing.ts";

export type ServiceCostOption = {
  id: string;
  label: string;
  unit: string;
  href: string;
  pricePer1000: number | null;
  pricingMode: "confirmed" | "live";
};

export const serviceCostOptions: readonly ServiceCostOption[] = [
  {
    id: "instagram-followers",
    label: "Instagram Followers",
    unit: "followers",
    href: "/buy-instagram-followers-india",
    pricePer1000: SERVICE_PRICES["instagram-followers"],
    pricingMode: "confirmed",
  },
  {
    id: "linkedin-followers",
    label: "LinkedIn Followers",
    unit: "followers",
    href: "/linkedin-followers",
    pricePer1000: SERVICE_PRICES["linkedin-followers"],
    pricingMode: "confirmed",
  },
  {
    id: "x-followers",
    label: "Twitter / X Followers",
    unit: "followers",
    href: "/twitter-followers",
    pricePer1000: SERVICE_PRICES["x-followers"],
    pricingMode: "confirmed",
  },
  {
    id: "youtube-subscribers",
    label: "YouTube Subscribers",
    unit: "subscribers",
    href: "/youtube-subscribers",
    pricePer1000: null,
    pricingMode: "live",
  },
  {
    id: "facebook-followers",
    label: "Facebook Followers",
    unit: "followers",
    href: "/buy-facebook-followers-india",
    pricePer1000: null,
    pricingMode: "live",
  },
  {
    id: "telegram-members",
    label: "Telegram Members",
    unit: "members",
    href: "/telegram-members",
    pricePer1000: null,
    pricingMode: "live",
  },
] as const;

export function calculateServiceCost(pricePer1000: number, quantity: number) {
  if (!Number.isFinite(pricePer1000) || pricePer1000 <= 0) return null;
  if (!Number.isFinite(quantity) || quantity <= 0) return null;

  const total = Math.round(((pricePer1000 * quantity) / 1000) * 100) / 100;
  const perUnit = Math.round((pricePer1000 / 1000) * 10000) / 10000;

  return { total, perUnit };
}

export function getServiceCostOption(id: string) {
  return serviceCostOptions.find((option) => option.id === id) ?? serviceCostOptions[0];
}
