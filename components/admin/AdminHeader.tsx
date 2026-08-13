"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "@/components/Logo";
import { AdminNav } from "./AdminSidebar";
import { logout } from "@/app/auth/actions";

export default function AdminHeader({ name, email }: { name: string; email: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD";
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="admin-header sticky top-0 z-30 px-4 py-3 sm:px-8 sm:py-3.5">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-2 sm:gap-4">
        <div className="lg:hidden">
          <Logo light priority />
        </div>
        <div className="hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#FF9F00]">Admin workspace</p>
          <p className="mt-1 text-sm font-bold text-white">SocialRUSH operations</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-300 sm:block">
            ● System online
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-white">{name || "Administrator"}</p>
            <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{email}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-xs font-black text-white shadow-[0_10px_24px_rgba(255, 196, 0, .35)]">
            {initials}
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open admin menu"
            aria-expanded={menuOpen}
            className="grid h-10 w-10 place-items-center rounded-xl border border-orange-400/25 bg-white/[.06] text-white transition hover:border-orange-400/60 hover:bg-orange-500/10 active:scale-[.98] lg:hidden"
          >
            ☰
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div className="fixed inset-0 z-[10000] lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu backdrop"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-black/72 backdrop-blur-sm"
          />
          <aside aria-label="Admin navigation" className="admin-mobile-drawer absolute right-0 top-0 flex h-[100dvh] w-[min(22rem,calc(100vw-1.25rem))] flex-col overflow-y-auto p-4 shadow-[0_30px_80px_rgba(0,0,0,.75)]">
            <div className="flex items-center justify-between gap-3">
              <Logo light priority />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close admin menu"
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.06] text-xl text-white transition hover:border-orange-400/50 hover:bg-orange-500/10 active:scale-[.98]"
              >
                ×
              </button>
            </div>
            <div className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#FF9F00]">Admin workspace</p>
              <p className="mt-1 text-sm font-bold text-white">{name || "Administrator"}</p>
              <p className="mt-0.5 break-all text-[10px] text-[#9CA3AF]">{email}</p>
            </div>
            <div className="mt-5">
              <AdminNav mobile onNavigate={() => setMenuOpen(false)} />
            </div>
            <div className="mt-auto border-t border-white/10 pt-4">
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex min-h-11 items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-[#D1D5DB] transition hover:bg-orange-500/10 hover:text-white active:scale-[.98]"
              >
                ← Customer dashboard
              </Link>
              <form action={logout}>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex min-h-11 w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 active:scale-[.98]"
                >
                  ↪ Sign out
                </button>
              </form>
            </div>
          </aside>
        </div>
      ) : null}
    </header>
  );
}
