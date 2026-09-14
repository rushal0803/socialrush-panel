import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CircleDollarSign, FolderKanban, PackageCheck, Repeat2, Users, WalletCards } from "lucide-react";

const workflow = [
  { title: "Add client", text: "Create a client workspace so every brand, profile and order stays organized.", href: "/dashboard/clients", icon: Users },
  { title: "Build campaign", text: "Group multi-service work into campaigns instead of managing disconnected orders.", href: "/dashboard/campaigns", icon: FolderKanban },
  { title: "Place orders", text: "Use current live service pricing and saved client profiles for faster fulfillment handoff.", href: "/dashboard/new-order", icon: PackageCheck },
  { title: "Fund & repeat", text: "Keep wallet funds ready and reuse completed orders when a client renews a campaign.", href: "/dashboard/wallet", icon: Repeat2 },
];

const principles = [
  "Quote clients from your own strategy and service scope; SocialRUSH continues to show the current live fulfillment price before checkout.",
  "Do not promise fixed discounts, delivery guarantees or refill terms unless the live service currently shows them.",
  "Use client workspaces and campaigns to separate brands, profiles, spend and repeat orders.",
  "For higher-volume accounts, protect margin by reviewing your selling price against live service cost before confirming a client quote.",
];

export default function ResellerHubPage() {
  return (
    <main className="dashboard-premium-page mx-auto w-full max-w-[1500px] px-4 pb-12 pt-5 text-white sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[1.6rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,.18),transparent_34%),linear-gradient(125deg,#17150f,#0f1117_62%)] p-5 sm:p-7 lg:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Agency + reseller revenue system</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-.035em] sm:text-4xl lg:text-5xl">Run repeat client growth from one workspace.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Use your existing SocialRUSH client, campaign, wallet and reorder tools as an agency operating system. The goal is simple: manage more client spend without losing track of brands, margins or repeat work.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/clients" className="btn-dashboard-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">Open client workspace <ArrowRight className="h-4 w-4"/></Link>
              <Link href="/dashboard/new-campaign" className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">Create campaign <FolderKanban className="h-4 w-4"/></Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-white/10 bg-black/25 p-5">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><CircleDollarSign className="h-5 w-5"/></span><div><p className="text-xs font-black uppercase tracking-[.12em] text-slate-400">Revenue focus</p><p className="mt-1 text-lg font-black">Higher-value recurring clients</p></div></div>
            <p className="mt-4 text-sm leading-6 text-slate-400">A reseller account becomes valuable when the same client comes back every month. Organize the relationship first; scale order volume second.</p>
          </aside>
        </div>
      </section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {workflow.map(({ title, text, href, icon: Icon }, index) => <Link key={title} href={href} className="group rounded-2xl border border-white/10 bg-[#101116] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/30 hover:bg-orange-500/[.05]"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><Icon className="h-5 w-5"/></span><span className="text-[10px] font-black text-slate-500">0{index+1}</span></div><h2 className="mt-4 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-300">Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"/></span></Link>)}
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <article className="dashboard-glass p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><BriefcaseBusiness className="h-5 w-5"/></span><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Operating model</p><h2 className="mt-1 text-xl font-black">A clean monthly client workflow</h2></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[['1. Onboard','Create the client and save their social profiles once.'],['2. Plan','Create a campaign around the client goal and selected services.'],['3. Fulfill','Place each order using current live prices and the correct client profile.'],['4. Retain','Track completion, then use Order Again when the client renews.']].map(([title,text])=><div key={title} className="rounded-xl border border-white/[.07] bg-black/20 p-4"><h3 className="text-sm font-black text-white">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-400">{text}</p></div>)}
          </div>
        </article>

        <article className="dashboard-glass p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><WalletCards className="h-5 w-5"/></span><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Margin protection</p><h2 className="mt-1 text-xl font-black">Before you quote a client</h2></div></div>
          <ul className="mt-5 space-y-3">{principles.map((item)=><li key={item} className="flex gap-3 text-sm leading-6 text-slate-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400"/>{item}</li>)}</ul>
          <Link href="/dashboard/packages" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-300">Review current packages <ArrowRight className="h-4 w-4"/></Link>
        </article>
      </section>

      <section className="mt-5 rounded-2xl border border-orange-400/20 bg-orange-500/[.06] p-5 sm:p-6"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Next client action</p><h2 className="mt-1 text-xl font-black">Turn the next one-off buyer into a managed client.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Create their workspace, save their profiles, and route future work through campaigns so repeat revenue is easier to manage.</p></div><Link href="/dashboard/clients" className="btn-dashboard-primary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-5 text-sm"><Users className="h-4 w-4"/>Manage clients</Link></div></section>
    </main>
  );
}
