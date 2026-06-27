import Logo from "@/components/Logo";
import { AdminNav } from "./AdminSidebar";

export default function AdminHeader({ name, email }: { name: string; email: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD";

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/72 px-5 py-3.5 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-4">
        <div className="lg:hidden">
          <Logo />
        </div>
        <div className="hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#4f6daa]">Admin workspace</p>
          <p className="mt-1 text-sm font-bold text-[#132e66]">SocialRUSH operations</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 sm:block">
            ● System online
          </span>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-bold text-[#18356f]">{name || "Administrator"}</p>
            <p className="mt-0.5 text-[10px] text-[#6880ae]">{email}</p>
          </div>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-xs font-black text-white shadow-[0_10px_24px_rgba(117,109,255,.35)]">
            {initials}
          </span>
          <details className="relative lg:hidden">
            <summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl border border-white/80 bg-white/80 text-[#4a6398]">
              ☰
            </summary>
            <div className="absolute right-0 top-12 w-64 rounded-2xl border border-white/85 bg-white/92 p-3 shadow-[0_20px_40px_rgba(76,106,170,.22)] backdrop-blur-xl">
              <AdminNav mobile />
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
