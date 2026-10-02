import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 22 keeps dashboard mobile drawer links readable outside dashboard shell", () => {
  const source = read("components/Sidebar.tsx");
  assert.ok(source.includes('mobile ? "text-[#D1D5DB] hover:bg-orange-500/10 hover:text-white"'));
});

test("Phase 22 compacts the dashboard header below the desktop sidebar breakpoint", () => {
  const source = read("components/dashboard/DashboardHeaderBar.tsx");
  assert.match(source, /BrandMark priority className="min-\[430px\]:hidden lg:hidden"/);
  assert.match(source, /hidden min-\[430px\]:inline-flex lg:hidden/);
  assert.match(source, /hidden lg:inline">Add Funds<\/span>/);
  assert.match(source, /lg:inline-flex/);
});

test("Phase 22 preserves access to notifications in the mobile navigation", () => {
  const source = read("lib/dashboard/navigation.ts");
  assert.match(source, /label:"Notifications",href:"\/dashboard\/notifications"/);
});

test("Phase 22 keeps package platform tabs below the public sticky header", () => {
  const source = read("components/marketing/packages/PremiumPackagesPageContent.tsx");
  assert.match(source, /sticky top-16 z-30/);
});
