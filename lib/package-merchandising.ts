import type { BigPackage } from "./big-packages";

export type PackageTier = "Starter" | "Balanced" | "Scale" | "High Volume";

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
      badge: "Low Commitment",
      featured: false,
      benefit: "A lower-commitment option when you want to start with a smaller quantity.",
    };
  }

  if (index === 1 || (safeTotal === 2 && index === safeTotal - 1)) {
    return {
      tier: "Balanced",
      badge: "Balanced Choice",
      featured: true,
      benefit: "A middle-ground quantity between the entry and higher-volume options.",
    };
  }

  if (ratio < 0.85) {
    return {
      tier: "Scale",
      badge: "Scale",
      featured: false,
      benefit: "A larger fixed quantity when you want fewer repeat orders.",
    };
  }

  return {
    tier: "High Volume",
    badge: "High Volume",
    featured: false,
    benefit: "The largest fixed option for higher-volume campaign requirements.",
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
