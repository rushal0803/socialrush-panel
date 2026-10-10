"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { logout } from "@/app/auth/actions";

const links = [
  ["Overview", "/admin/dashboard", "grid"], ["Services", "/admin/services", "layers"], ["Packages", "/admin/packages", "tag"],
  ["Orders", "/admin/orders", "cart"], ["Refills", "/admin/refills", "layers"], ["Users", "/admin/users", "users"], ["Payments", "/admin/payments", "wallet"],
  ["CRM", "/admin/crm", "users"],
  ["Command Center", "/admin/command-center", "grid"],
  ["SEO Indexation", "/admin/seo/indexation", "search"],
  ["SEO Content", "/admin/seo/content", "layers"],
  ["SEO CTR", "/admin/seo/ctr", "search"],
  ["SEO Authority", "/admin/seo/authority", "layers"],
  ["SEO Competitors", "/admin/seo/competitors", "search"],
  ["SEO International", "/admin/seo/international", "search"],
  ["SEO Digital PR", "/admin/seo/digital-pr", "search"],
  ["SEO AEO", "/admin/seo/aeo", "search"],
  ["Content Distribution", "/admin/crm/distribution", "layers"],
  ["100K Traffic", "/admin/growth/traffic", "grid"],
  ["₹5L Revenue", "/admin/growth/revenue", "wallet"],
  ["Profitability", "/admin/profitability", "wallet"],
  ["Support", "/admin/support", "support"], ["Analytics", "/admin/analytics", "grid"], ["Reviews", "/admin/reviews", "users"],
  ["Incidents", "/admin/incidents", "support"],
  ["Quality Monitor", "/admin/quality", "grid"],
  ["Case Studies", "/admin/case-studies", "layers"], ["Rewards", "/admin/rewards", "wallet"], ["Settings", "/admin/settings", "settings"],
] as const;

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>, tag: <><path d="m20 13-7 7L3 10V3h7l10 10Z"/><path d="M7.5 7.5h.01"/></>,
    cart: <><path d="M3 4h2l2.5 11h10l2-7H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></>, users: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M18 15a6 6 0 0 1 4 6"/></>,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12"/><path d="M15 12h5"/></>, support: <><path d="M4 13a8 8 0 0 1 16 0v6h-4v-7h4M4 12v7h4v-7H4Z"/><path d="M16 19c0 2-2 3-4 3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M8.5 11h5M11 8.5v5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.6h-4L10.4 6A8 8 0 0 0 9 7L6.6 6 4.5 9.5l2 1.5a7 7 0 0 0 0 2l-2 1.5L6.6 18 9 17a8 8 0 0 0 1.4 1l.3 2.6h4L15 18a8 8 0 0 0 1.5-1l2.4 1 2-3.4-2-1.5c.1-.4.1-.7.1-1Z"/></>,
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function AdminNav({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = [
    { name: "Manage", items: links.slice(0, 9) },
    { name: "Growth & SEO", items: links.slice(9, 21) },
    { name: "Customers & settings", items: links.slice(21) },
  ] as const;
  return (
    <nav aria-label={mobile ? "Admin sections on mobile" : "Admin sections"} className="grid gap-5">
      {groups.map((group) => (
        <div key={group.name}>
          <h2 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[.12em] text-[#A8AFBD]">{group.name}</h2>
          <ul className="grid gap-0.5">
            {group.items.map(([label, href, icon]) => {
              const active = href === "/admin/dashboard"
                ? pathname === href || pathname === "/admin"
                : pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link href={href} aria-current={active ? "page" : undefined}
                    onClick={() => { if (mobile) onNavigate?.(); }}
                    className={`group relative flex min-h-11 items-center gap-3 rounded-xl border-l-[3px] px-3 py-2.5 text-sm font-semibold outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7600] ${
                      active
                        ? "border-l-[#FF7600] bg-[#FF7600]/10 text-white"
                        : "border-l-transparent text-[#D1D5DB] hover:bg-white/[.05] hover:text-white"
                    }`}>
                    <span aria-hidden="true" className={active ? "text-[#FF9A2E]" : "text-[#A8AFBD] group-hover:text-[#FF9A2E]"}><NavIcon name={icon} /></span>
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>}

export default function AdminSidebar() {
  return (
    <aside className="dashboard-sidebar hidden h-screen w-72 shrink-0 flex-col overflow-y-auto overscroll-contain border-r border-white/10 bg-[#0C0E14] px-4 py-6 lg:sticky lg:top-0 lg:flex">
      <div className="px-2">
        <Logo light />
      </div>

      <div className="admin-workspace-card mx-2 mt-7 px-3.5 py-3">
        <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#FF9A2E]">Admin workspace</p>
        <p className="mt-1 text-xs font-semibold text-white">SocialRUSH control center</p>
      </div>

      <AdminNav />

      <div className="mt-auto">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#D1D5DB] hover:bg-orange-500/10 hover:text-white">
          ← Customer dashboard
        </Link>
        <form action={logout}>
          <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#D1D5DB] hover:bg-orange-500/10 hover:text-white">
            ↪ Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
