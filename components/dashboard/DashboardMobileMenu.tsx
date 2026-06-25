"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { NavLinks } from "@/components/Sidebar";
import { createClient } from "@/lib/supabase/client";

export default function DashboardMobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const closeOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    return () => document.removeEventListener("mousedown", closeOutside);
  }, [isOpen]);

  async function handleLogout() {
    setIsOpen(false);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div ref={menuRef} className="relative lg:hidden">
      <button
        type="button"
        aria-label="Toggle dashboard navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="grid h-10 w-10 place-items-center rounded-xl border border-white/80 bg-white/80 text-[#4a6398]"
      >
        <span className="text-lg">{isOpen ? "×" : "☰"}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 top-12 z-40 w-72 rounded-2xl border border-white/85 bg-white/92 p-3 shadow-[0_20px_40px_rgba(76,106,170,.22)] backdrop-blur-xl">
          <NavLinks mobile onNavigate={() => setIsOpen(false)} />
          <div className="mt-2 border-t border-[#e3ebff] pt-2">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#5f78a7] hover:bg-[#f2f7ff] hover:text-[#1f3b75]"
            >
              ↪ Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
