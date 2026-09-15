import { track } from "@/lib/analytics/events";

export type ExperimentVariant = "control" | "variant";

const EXPERIMENT_SEED_KEY = "sr_experiment_seed_v1";

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function assignExperimentVariant(experiment: string, seed: string): ExperimentVariant {
  if (!experiment || !seed) return "control";
  return hash(`${experiment}:${seed}`) % 2 === 0 ? "control" : "variant";
}

export function getStableExperimentVariant(experiment: string): ExperimentVariant {
  if (typeof window === "undefined") return "control";

  try {
    let seed = window.localStorage.getItem(EXPERIMENT_SEED_KEY);
    if (!seed) {
      seed = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(EXPERIMENT_SEED_KEY, seed);
    }
    return assignExperimentVariant(experiment, seed);
  } catch {
    return "control";
  }
}

export function trackExperimentExposure(experiment: string, variant: ExperimentVariant) {
  track("experiment_exposure", {
    surface: experiment.slice(0, 80),
    step: variant,
  });
}
