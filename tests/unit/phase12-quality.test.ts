import test from "node:test";
import assert from "node:assert/strict";
import {
  experimentDefinitions,
  experimentExposureMetadata,
  resolveExperimentVariant,
} from "../../lib/experiments/flags.ts";

test("Phase 12 experiments remain control-only while disabled", () => {
  for (const key of Object.keys(experimentDefinitions) as Array<keyof typeof experimentDefinitions>) {
    assert.equal(experimentDefinitions[key].enabled, false);
    assert.equal(resolveExperimentVariant(key, "visitor-a"), "control");
    assert.equal(resolveExperimentVariant(key, "visitor-b"), "control");
  }
});

test("experiment exposure metadata is explicit and non-financial", () => {
  const metadata = experimentExposureMetadata("checkout_copy", "visitor-a");
  assert.deepEqual(metadata, {
    experiment_key: "checkout_copy",
    variant: "control",
    enabled: false,
  });
});
