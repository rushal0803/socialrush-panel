export type ExperimentKey =
  | "hero_cta_copy"
  | "service_card_density"
  | "checkout_copy";

export type ExperimentVariant = "control" | "variant_a";

export type ExperimentDefinition = Readonly<{
  key: ExperimentKey;
  enabled: boolean;
  variants: readonly ExperimentVariant[];
  purpose: string;
}>;

/**
 * Phase 12 experiments are deliberately disabled until funnel analytics are
 * verified in production. Keeping definitions central makes later A/B tests
 * reviewable without silently changing customer-facing behavior.
 */
export const experimentDefinitions: Record<ExperimentKey, ExperimentDefinition> = {
  hero_cta_copy: {
    key: "hero_cta_copy",
    enabled: false,
    variants: ["control", "variant_a"],
    purpose: "Compare homepage hero CTA wording.",
  },
  service_card_density: {
    key: "service_card_density",
    enabled: false,
    variants: ["control", "variant_a"],
    purpose: "Compare compact and standard service-card density.",
  },
  checkout_copy: {
    key: "checkout_copy",
    enabled: false,
    variants: ["control", "variant_a"],
    purpose: "Compare checkout reassurance copy without changing payment logic.",
  },
};

function stableBucket(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function resolveExperimentVariant(key: ExperimentKey, seed: string): ExperimentVariant {
  const experiment = experimentDefinitions[key];
  if (!experiment.enabled) return "control";
  const variants = experiment.variants;
  return variants[stableBucket(`${key}:${seed}`) % variants.length] ?? "control";
}

export function experimentExposureMetadata(key: ExperimentKey, seed: string) {
  return {
    experiment_key: key,
    variant: resolveExperimentVariant(key, seed),
    enabled: experimentDefinitions[key].enabled,
  } as const;
}
