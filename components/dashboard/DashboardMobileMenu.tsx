"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavLinks } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/client";
import { Menu, X } from "lucide-react";
import MobileMenuLayer from "@/components/navigation/MobileMenuLayer";

export default function DashboardMobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  async function handleLogout() {
    setIsOpen(false);
    await createClient().auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Toggle dashboard navigation"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/80 bg-white/85 text-[#111827] shadow-[0_10px_24px_rgba(255, 159, 0, .15)] transition hover:-translate-y-0.5 hover:bg-white"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      <MobileMenuLayer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        topClassName="top-20"
        showCloseButton={false}
      >
        <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-white/85 bg-white/95 p-3.5 shadow-[0_24px_60px_-24px_rgba(255, 159, 0, .38)] backdrop-blur-xl sm:rounded-[1.75rem] sm:p-4">
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#FFF8F1] pb-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#111827]">Dashboard Menu</p>
                  <p className="mt-1 text-sm font-bold text-[#0B0B0F]">Quick navigation</p>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setIsOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/80 bg-white/80 text-lg font-semibold text-[#111827] shadow-[0_8px_18px_rgba(255, 159, 0, .12)]"
                >
                  ×
                </button>
              </div>

              <NavLinks mobile onNavigate={() => setIsOpen(false)} />

              <div className="mt-3 border-t border-[#FFF8F1] pt-3">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-2xl border border-[#FFF8F1] bg-[#FFF8F1] px-4 py-3 text-left text-sm font-semibold text-[#111827] shadow-[0_10px_24px_-18px_rgba(255, 159, 0, .35)] transition hover:bg-[#FFF8F1] hover:text-[#0B0B0F]"
                >
                  ↪ Log out
                </button>
              </div>
        </div>
      </MobileMenuLayer>
    </div>
  );
}
