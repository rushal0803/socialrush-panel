"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";
import { logout } from "@/app/auth/actions";

const links = [
  ["Overview", "/admin/dashboard", "grid"], ["Services", "/admin/services", "layers"], ["Packages", "/admin/packages", "tag"],
  ["Orders", "/admin/orders", "cart"], ["Users", "/admin/users", "users"], ["Payments", "/admin/payments", "wallet"],
  ["Support", "/admin/support", "support"], ["Settings", "/admin/settings", "settings"],
] as const;

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>, tag: <><path d="m20 13-7 7L3 10V3h7l10 10Z"/><path d="M7.5 7.5h.01"/></>,
    cart: <><path d="M3 4h2l2.5 11h10l2-7H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></>, users: <><circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M18 15a6 6 0 0 1 4 6"/></>,
    wallet: <><path d="M4 6h14a2 2 0 0 1 2 2v11H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12"/><path d="M15 12h5"/></>, support: <><path d="M4 13a8 8 0 0 1 16 0v6h-4v-7h4M4 12v7h4v-7H4Z"/><path d="M16 19c0 2-2 3-4 3"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1A8 8 0 0 0 15 6l-.3-2.6h-4L10.4 6A8 8 0 0 0 9 7L6.6 6 4.5 9.5l2 1.5a7 7 0 0 0 0 2l-2 1.5L6.6 18 9 17a8 8 0 0 0 1.4 1l.3 2.6h4L15 18a8 8 0 0 0 1.5-1l2.4 1 2-3.4-2-1.5c.1-.4.1-.7.1-1Z"/></>,
  };
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function AdminNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav className={mobile ? "grid gap-1" : "space-y-1"}>
      {links.map(([label, href, icon]) => {
        const active = href === "/admin/dashboard" ? pathname === href || pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active ? "text-white" : "text-[#4b669b] hover:bg-white/70 hover:text-[#1f3d77]"
            }`}
          >
            {active && (
              <motion.span
                layoutId={mobile ? "mobile-admin-active" : "admin-active"}
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] shadow-[0_12px_26px_rgba(117,109,255,.35)]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">
              <NavIcon name={icon} />
            </span>
            <span className="relative z-10">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar() {
  return (
    <aside className="dashboard-sidebar hidden h-screen w-72 shrink-0 flex-col px-4 py-6 lg:sticky lg:top-0 lg:flex">
      <div className="px-2">
        <Logo />
      </div>

      <div className="mx-2 mt-6 rounded-xl border border-white/85 bg-white/82 px-3 py-2.5 shadow-[0_10px_20px_rgba(85,113,175,.12)]">
        <p className="text-[9px] font-black uppercase tracking-[.16em] text-[#4f6daa]">Administration</p>
        <p className="mt-1 text-xs font-semibold text-[#1f3d77]">Control center</p>
      </div>

      <p className="mb-3 mt-6 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-[#6f85b0]">Management</p>
      <AdminNav />

      <div className="mt-auto">
        <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#5e77a6] hover:bg-white/70 hover:text-[#1f3b75]">
          ← Customer dashboard
        </Link>
        <form action={logout}>
          <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#5e77a6] hover:bg-white/70 hover:text-[#1f3b75]">
            ↪ Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
