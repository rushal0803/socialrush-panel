import Link from "next/link";
import Logo from "./Logo";
import { NavLinks } from "./Sidebar";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data:profile}=user?await supabase.from("profiles").select("full_name,role").eq("id",user.id).maybeSingle():{data:null};
  const name=profile?.full_name||user?.email?.split("@")[0]||"Client";
  const initials=name.split(" ").map((part:string)=>part[0]).join("").slice(0,2).toUpperCase();
  return <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8"><div className="lg:hidden"><Logo/></div><div className="hidden lg:block"><p className="text-xs font-medium uppercase tracking-widest text-slate-400">SocialRUSH workspace</p><p className="mt-1 text-sm font-semibold text-slate-700">Welcome back, {name.split(" ")[0]}</p></div><div className="flex items-center gap-3"><Link href="/dashboard/new-campaign" className="hidden rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 sm:block">+ New campaign</Link><button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500"><span>◉</span></button><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{name}</p><p className="text-xs capitalize text-slate-400">{profile?.role||"user"}</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1e42] text-sm font-bold text-white">{initials}</span><details className="group relative lg:hidden"><summary className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 text-slate-600"><span className="text-lg">☰</span></summary><div className="absolute right-0 top-12 w-72 rounded-2xl bg-[#08152f] p-3 shadow-2xl"><NavLinks mobile/><form action={logout} className="mt-2 border-t border-white/10 pt-2"><button className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white">↪ Log out</button></form></div></details></div></header>;
}
