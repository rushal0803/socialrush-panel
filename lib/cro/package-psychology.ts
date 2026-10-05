import type { PackageUiSelection } from "@/lib/package-ui-adapter";

export type PackageChoiceBadge = "Low commitment" | "Balanced choice" | "Scale" | "High volume";

export type PackageChoicePresentation = Readonly<{
  badge: PackageChoiceBadge;
  featured: boolean;
  rationale: string;
  unitRateNote: string | null;
  savingsNote: string | null;
}>;

function sameUnitRate(packages: readonly PackageUiSelection[]) {
  const rates = packages
    .map((pkg) => pkg.pricePer1000Paise)
    .filter((rate): rate is number => rate !== null && rate > 0);
  return rates.length > 1 && new Set(rates).size === 1;
}

function lowestUnitRate(packages: readonly PackageUiSelection[]) {
  const rates = packages
    .map((pkg) => pkg.pricePer1000Paise)
    .filter((rate): rate is number => rate !== null && rate > 0);
  return rates.length ? Math.min(...rates) : null;
}

/**
 * Phase 33 package psychology.
 *
 * This intentionally avoids popularity, scarcity and "best value" claims
 * unless checkout data proves a real saving. The highlighted package is a
 * neutral middle-ground recommendation, not a claim about customer behavior.
 */
export function getPackageChoicePresentation(
  pkg: PackageUiSelection,
  packages: readonly PackageUiSelection[],
): PackageChoicePresentation {
  const badgeByTier: Record<PackageUiSelection["tierId"], PackageChoiceBadge> = {
    starter: "Low commitment",
    growth: "Balanced choice",
    pro: "Scale",
    scale: "High volume",
  };

  const rationaleByTier: Record<PackageUiSelection["tierId"], string> = {
    starter: "Smaller quantity when you want to start with less commitment.",
    growth: "A middle-ground quantity for ongoing campaigns without jumping to the largest tier.",
    pro: "Higher quantity when you want fewer repeat orders for the same service.",
    scale: "Largest fixed tier for higher-volume campaign requirements.",
  };

  const lowest = lowestUnitRate(packages);
  const unitRateNote =
    pkg.pricePer1000Paise === null
      ? null
      : sameUnitRate(packages)
        ? "Same catalog rate per 1K across these tiers."
        : lowest !== null && pkg.pricePer1000Paise === lowest
          ? "Lowest verified unit rate in this package set."
          : "Unit rate shown for direct comparison.";

  const savingsNote =
    pkg.savingsPaise > 0 && pkg.savingsPercent > 0
      ? `Verified saving: ${pkg.savingsPercent}% versus the package engine comparison price.`
      : null;

  return {
    badge: badgeByTier[pkg.tierId],
    featured: pkg.tierId === "growth",
    rationale: rationaleByTier[pkg.tierId],
    unitRateNote,
    savingsNote,
  };
}

export const packageChoiceGuide = [
  { label: "Starter", text: "Lower commitment" },
  { label: "Balanced", text: "Middle-ground quantity" },
  { label: "Scale", text: "Fewer repeat orders" },
  { label: "High Volume", text: "Largest fixed tier" },
] as const;
