import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { isInternalAnalyticsHost, shouldIgnoreAnalyticsCollection } from "../../lib/analytics/collection-environment.ts";
import { primeAttribution, track } from "../../lib/analytics/events.ts";

test("collection excludes local/default preview hosts and custom-domain previews", () => {
  for (const host of ['localhost', 'qa.localhost', '127.0.0.1', '[::1]', '::1', 'branch.vercel.app', 'BRANCH.VERCEL.APP.']) {
    assert.equal(isInternalAnalyticsHost(host), true, host);
    assert.equal(shouldIgnoreAnalyticsCollection(host, 'production'), true, host);
  }
  for (const host of ['www.getsocialrush.com', 'getsocialrush.com', 'vercel.app.example.com', 'notvercel.app', 'localhost.example.com']) {
    assert.equal(isInternalAnalyticsHost(host), false, host);
    assert.equal(shouldIgnoreAnalyticsCollection(host, 'production'), false, host);
    assert.equal(shouldIgnoreAnalyticsCollection(host, 'preview'), true, host);
  }
});

test("preview browser events create neither attribution storage nor network beacons", () => {
  const keys = ['window', 'navigator', 'location', 'document'] as const;
  const saved = keys.map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
  try {
    let storageWrites = 0, beacons = 0;
    Object.defineProperty(globalThis, 'window', { configurable: true, value: {
      location: { hostname: 'branch.vercel.app', search: '' },
      sessionStorage: { getItem: () => null, setItem: () => { storageWrites++; } },
    } });
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { doNotTrack: '0', sendBeacon: () => { beacons++; return true; } } });
    Object.defineProperty(globalThis, 'location', { configurable: true, value: { pathname: '/instagram-likes' } });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: { referrer: 'https://www.google.com/' } });
    primeAttribution(); track('page_viewed'); track('organic_landing_view');
    assert.equal(storageWrites, 0); assert.equal(beacons, 0);
  } finally {
    for (const [key, descriptor] of saved) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
  }
});

// A guard in the common trusted-event writer prevents all callers from recording
// preview login, checkout, and payment events, before privileged client creation.
test("trusted server analytics skips preview before constructing the admin client", () => {
  for (const environment of ["preview", "development"]) {
    assert.equal(shouldIgnoreAnalyticsCollection(undefined, environment), true);
  }
  assert.equal(shouldIgnoreAnalyticsCollection(undefined, "production"), false);
  const source = readFileSync(new URL("../../lib/analytics/server.ts", import.meta.url), "utf8");
  const guard = source.indexOf("if (shouldIgnoreAnalyticsCollection(undefined, process.env.VERCEL_ENV)) return;");
  const admin = source.indexOf("const admin = createAdminClient();");
  assert.ok(guard >= 0, "trusted analytics must have an explicit preview guard");
  assert.ok(admin > guard, "guard must run before privileged Supabase client creation");
});
