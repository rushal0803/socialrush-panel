import Logo from "@/components/Logo";
import { AdminNav } from "./AdminSidebar";

export default function AdminHeader({ name, email }: { name: string; email: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD";

  return (
    <header className="sticky top-0 z-30 border-b border-orange-400/20 bg-[#0B0B0F]/95 px-4 py-3 shadow-[0_10px_30px_-24px_rgba(0,0,0,.9)] backdrop-blur-xl sm:px-8 sm:py-3.5">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-2 sm:gap-4">
        <div className="lg:hidden">
          <Logo light priority />
        </div>
        <div className="hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#FF9F00]">Admin workspace</p>
          <p className="mt-1 text-sm font-bold text-[#0B0B0F]">SocialRUSH operations</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 sm:block">
            ● System online
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-[#0B0B0F]">{name || "Administrator"}</p>
            <p className="mt-0.5 text-[10px] text-[#111827]">{email}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#FF7A00] to-[#FFB000] text-xs font-black text-white shadow-[0_10px_24px_rgba(255, 196, 0, .35)]">
            {initials}
          </span>
          <details className="relative lg:hidden">
            <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl border border-orange-400/25 bg-white/[.06] text-white">
              ☰
            </summary>
            <div className="absolute right-0 top-12 max-h-[calc(100dvh-5.5rem)] w-[min(16rem,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-orange-400/25 bg-[#111111]/98 p-3 shadow-[0_20px_40px_rgba(0,0,0,.55)] backdrop-blur-xl">
              <AdminNav mobile />
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
