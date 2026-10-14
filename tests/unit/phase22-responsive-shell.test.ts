import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(new URL("../../" + path, import.meta.url), "utf8");

test("Phase 22 keeps dashboard mobile drawer links readable outside dashboard shell", () => {
  const source = read("components/Sidebar.tsx");
  const css = read("components/dashboard/PremiumWorkspace.module.css");
  const drawer = read("components/dashboard/DashboardMobileMenu.tsx");
  const portal = read("components/navigation/MobileMenuLayer.tsx");

  // Navigation now uses a shared CSS module rather than legacy inline Tailwind
  // classes. Verify real mobile readability, tap targets, focus and active state.
  assert.match(source, /className=\{styles\.navLink\}/);
  assert.match(source, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(drawer, /<NavLinks mobile onNavigate=\{\(\) => setIsOpen\(false\)\} \/>/);
  assert.match(portal, /createPortal\(/);
  assert.match(css, /\.navLink\s*\{[^}]*min-height:\s*44px;[^}]*color:\s*#[0-9a-f]{6};/s);
  assert.match(css, /\.navLink\[aria-current="page"\]\s*\{[^}]*color:/s);
  assert.match(css, /\.navLink:focus-visible\s*\{[^}]*outline:/s);
});

test("Phase 22 compacts the dashboard header through the sidebar's narrow desktop widths", () => {
  const source = read("components/dashboard/DashboardHeaderBar.tsx");
  assert.match(source, /BrandMark priority className="min-\[430px\]:hidden lg:hidden"/);
  assert.match(source, /hidden min-\[430px\]:inline-flex lg:hidden/);
  assert.match(source, /hidden xl:inline">Add Funds<\/span>/);
  assert.match(source, /aria-label="Add Funds"/);
  assert.match(source, /h-11 w-11 shrink-0/);
  assert.match(source, /lg:inline-flex/);
});

test("Phase 22 preserves access to notifications in the mobile navigation", () => {
  const source = read("lib/dashboard/navigation.ts");
  assert.match(source, /label:"Notifications",href:"\/dashboard\/notifications"/);
});

test("Packages keep platform controls in a wrapping document-flow grid", () => {
  const source = read("components/marketing/packages/PremiumPackagesPageContent.tsx");
  assert.match(source, /grid-cols-2 gap-2 min-\[375px\]:grid-cols-3/);
  assert.doesNotMatch(source, /sticky top-16 z-30/);
});


test("Phase 22 keeps expanded admin navigation scrollable on shorter desktops", () => {
  const sidebar = read("components/admin/AdminSidebar.tsx");
  assert.match(sidebar, /overflow-y-auto overscroll-contain/);
});

test("Phase 22 constrains long admin identity text instead of crowding the header", () => {
  const header = read("components/admin/AdminHeader.tsx");
  assert.match(header, /max-w-40/);
  assert.match(header, /truncate text-xs font-bold/);
  assert.match(header, /truncate text-xs text-\[#A8AFBD\]/);
  assert.doesNotMatch(header, /truncate text-\[10px\]/);
});

test("Phase 22 keeps admin modals viewport-bounded and vertically scrollable", () => {
  const modal = read("components/admin/AdminModal.tsx");
  assert.match(modal, /max-h-\[calc\(100dvh-2rem\)\]/);
  assert.match(modal, /w-full max-w-2xl overflow-y-auto/);
});


test("Phase 22 keeps admin login inputs at 16px on mobile to prevent browser zoom", () => {
  const source = read("app/admin/login/AdminLoginForm.tsx");
  const matches = source.match(/text-base text-white[^"]*sm:text-sm/g) ?? [];
  assert.equal(matches.length, 2);
});
