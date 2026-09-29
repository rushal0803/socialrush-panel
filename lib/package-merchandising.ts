import type { BigPackage } from "./big-packages";

export type PackageTier = "Starter" | "Popular" | "Best Value" | "Pro";

export type PackageMerchandising = {
  tier: PackageTier;
  badge: string;
  featured: boolean;
  benefit: string;
};

/**
 * Presentation-only merchandising for package cards.
 * Pricing remains authoritative in the shared pricing/live catalog layer.
 * Never manufacture a crossed-out price or a discount that checkout does not honor.
 */
export function getPackageMerchandising(
  _pkg: BigPackage,
  index: number,
  total: number,
): PackageMerchandising {
  const safeTotal = Math.max(1, total);
  const ratio = safeTotal === 1 ? 0 : index / (safeTotal - 1);

  if (index === 0) {
    return {
      tier: "Starter",
      badge: "Easy Start",
      featured: false,
      benefit: "A lower-commitment option to start your campaign.",
    };
  }

  if (index === 1 || (safeTotal === 2 && index === safeTotal - 1)) {
    return {
      tier: "Popular",
      badge: "Most Popular",
      featured: true,
      benefit: "Balanced quantity for creators and growing accounts.",
    };
  }

  if (ratio < 0.85) {
    return {
      tier: "Best Value",
      badge: "Best Value",
      featured: true,
      benefit: "Built for larger campaigns with fewer repeat orders.",
    };
  }

  return {
    tier: "Pro",
    badge: "High Volume",
    featured: false,
    benefit: "High-volume option for brands, agencies and scaled campaigns.",
  };
}

export function getPackageUnitRate(pkg: BigPackage) {
  if (!pkg.quantity || pkg.quantity <= 0) return null;
  return pkg.basePriceINR / (pkg.quantity / 1000);
}

export function getPackageTrustPoints(pkg: BigPackage) {
  return [
    `${pkg.quantityLabel} included`,
    `Estimated delivery: ${pkg.deliveryTime}`,
    "Price confirmed before checkout",
    "Public-link ordering — no password required",
  ] as const;
}
