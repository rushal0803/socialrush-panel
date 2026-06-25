import Link from "next/link";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/server";
import DashboardMobileMenu from "@/components/dashboard/DashboardMobileMenu";

export default async function Header() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  const {data:profile}=user?await supabase.from("profiles").select("full_name,role").eq("id",user.id).maybeSingle():{data:null};
  const name=profile?.full_name||user?.email?.split("@")[0]||"Client";
  const initials=name.split(" ").map((part:string)=>part[0]).join("").slice(0,2).toUpperCase();
  return <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#07111F]/90 px-5 backdrop-blur-xl sm:px-8"><div className="lg:hidden"><Logo/></div><div className="hidden lg:block"><p className="text-xs font-medium uppercase tracking-widest text-slate-300">SocialRUSH workspace</p><p className="mt-1 text-sm font-semibold text-white">Welcome back, {name.split(" ")[0]}</p></div><div className="flex items-center gap-3"><Link href="/dashboard/new-campaign" className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white sm:block">+ New campaign</Link><button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300"><span>◉</span></button><div className="hidden text-right sm:block"><p className="text-sm font-semibold text-white">{name}</p><p className="text-xs capitalize text-slate-300">{profile?.role||"user"}</p></div><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1e42] text-sm font-bold text-white">{initials}</span><DashboardMobileMenu/></div></header>;
}
