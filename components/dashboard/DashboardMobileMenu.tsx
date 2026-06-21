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

  return <div ref={menuRef} className="relative lg:hidden">
    <button type="button" aria-label="Toggle dashboard navigation" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600">
      <span className="text-lg">{isOpen ? "×" : "☰"}</span>
    </button>
    {isOpen && <div className="absolute right-0 top-12 w-72 rounded-2xl bg-[#08152f] p-3 shadow-2xl">
      <NavLinks mobile onNavigate={() => setIsOpen(false)} />
      <div className="mt-2 border-t border-white/10 pt-2">
        <button type="button" onClick={handleLogout} className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white">↪ Log out</button>
      </div>
    </div>}
  </div>;
}
