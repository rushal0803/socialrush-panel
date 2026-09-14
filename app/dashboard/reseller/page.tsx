import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, CircleDollarSign, FolderKanban, PackageCheck, Repeat2, Users, WalletCards } from "lucide-react";
import { getDashboardContext } from "@/lib/auth/dashboard-context";

const workflow = [
  { title: "Add client", text: "Create a client workspace so every brand, profile and order stays organized.", href: "/dashboard/clients", icon: Users },
  { title: "Build campaign", text: "Group multi-service work into campaigns instead of managing disconnected orders.", href: "/dashboard/campaigns", icon: FolderKanban },
  { title: "Plan bulk work", text: "Prepare several client jobs in one queue, then hand each item into the normal checkout safely.", href: "/dashboard/reseller/bulk-planner", icon: PackageCheck },
  { title: "Fund & repeat", text: "Keep wallet funds ready and reuse completed orders when a client renews a campaign.", href: "/dashboard/wallet", icon: Repeat2 },
];

const activeStatuses = new Set(["pending", "processing", "in_progress", "partial"]);

export default async function ResellerHubPage() {
  const { supabase, user } = await getDashboardContext();
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: clients }, { data: campaigns }, { data: orders }] = await Promise.all([
    supabase.from("customer_clients").select("id,name,archived_at").eq("user_id", user!.id).is("archived_at", null),
    supabase.from("campaigns").select("id,status").eq("user_id", user!.id),
    supabase.from("orders").select("id,client_id,status,charge,created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(500),
  ]);

  const allOrders = orders || [];
  const completedOrders = allOrders.filter((order) => order.status === "completed");
  const completedRevenue = completedOrders.reduce((sum, order) => sum + Number(order.charge || 0), 0);
  const spend30 = completedOrders.filter((order) => String(order.created_at || "") >= since30).reduce((sum, order) => sum + Number(order.charge || 0), 0);
  const activeCampaigns = (campaigns || []).filter((campaign) => activeStatuses.has(String(campaign.status || "")) || !campaign.status).length;
  const clientOrderCounts = new Map<string, number>();
  for (const order of completedOrders) if (order.client_id) clientOrderCounts.set(order.client_id, (clientOrderCounts.get(order.client_id) || 0) + 1);
  const repeatClients = Array.from(clientOrderCounts.values()).filter((count) => count >= 2).length;
  const unassignedOrders = allOrders.filter((order) => !order.client_id).length;

  const metrics = [
    ["Active clients", (clients || []).length.toLocaleString("en-IN")],
    ["Repeat clients", repeatClients.toLocaleString("en-IN")],
    ["30-day completed value", `₹${spend30.toLocaleString("en-IN")}`],
    ["Completed client value", `₹${completedRevenue.toLocaleString("en-IN")}`],
  ] as const;

  return (
    <main className="dashboard-premium-page mx-auto w-full max-w-[1500px] px-4 pb-12 pt-5 text-white sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[1.6rem] border border-orange-400/20 bg-[radial-gradient(circle_at_top_right,rgba(255,153,0,.18),transparent_34%),linear-gradient(125deg,#17150f,#0f1117_62%)] p-5 sm:p-7 lg:p-8">
        <div className="grid gap-7 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-orange-300">Agency + reseller revenue system</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-.035em] sm:text-4xl lg:text-5xl">Run repeat client growth from one workspace.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">Use real client, campaign and order activity to manage recurring spend, prepare larger workloads and protect margin before you quote the next job.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard/reseller/bulk-planner" className="btn-dashboard-primary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">Open bulk planner <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/dashboard/clients" className="btn-dashboard-secondary inline-flex min-h-12 items-center justify-center gap-2 px-5 text-sm">Manage clients <Users className="h-4 w-4" /></Link>
            </div>
          </div>
          <aside className="rounded-2xl border border-white/10 bg-black/25 p-5">
            <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><CircleDollarSign className="h-5 w-5" /></span><div><p className="text-xs font-black uppercase tracking-[.12em] text-slate-400">Revenue focus</p><p className="mt-1 text-lg font-black">Higher-value recurring clients</p></div></div>
            <p className="mt-4 text-sm leading-6 text-slate-400">{unassignedOrders ? `${unassignedOrders} recent order${unassignedOrders === 1 ? " is" : "s are"} not linked to a client workspace yet.` : "Recent orders are linked cleanly into client workspaces."}</p>
          </aside>
        </div>
      </section>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value]) => <article key={label} className="rounded-2xl border border-white/10 bg-[#101116] p-5"><p className="text-[10px] font-black uppercase tracking-[.13em] text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-white">{value}</p></article>)}</section>

      <section className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {workflow.map(({ title, text, href, icon: Icon }, index) => <Link key={title} href={href} className="group rounded-2xl border border-white/10 bg-[#101116] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/30 hover:bg-orange-500/[.05]"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><Icon className="h-5 w-5" /></span><span className="text-[10px] font-black text-slate-500">0{index + 1}</span></div><h2 className="mt-4 text-lg font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p><span className="mt-4 inline-flex items-center gap-1 text-xs font-black text-orange-300">Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" /></span></Link>)}
      </section>

      <section className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
        <article className="dashboard-glass p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><BriefcaseBusiness className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Portfolio health</p><h2 className="mt-1 text-xl font-black">Build recurring client value</h2></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[.07] bg-black/20 p-4"><h3 className="text-sm font-black text-white">Repeat signal</h3><p className="mt-2 text-xs leading-5 text-slate-400">{repeatClients} client{repeatClients === 1 ? " has" : "s have"} at least two completed orders.</p></div>
            <div className="rounded-xl border border-white/[.07] bg-black/20 p-4"><h3 className="text-sm font-black text-white">Campaign load</h3><p className="mt-2 text-xs leading-5 text-slate-400">{activeCampaigns} campaign{activeCampaigns === 1 ? " is" : "s are"} currently active or open.</p></div>
          </div>
          <Link href="/dashboard/retainers" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-300">Open recurring revenue center <ArrowRight className="h-4 w-4" /></Link>
        </article>

        <article className="dashboard-glass p-5 sm:p-6">
          <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300"><WalletCards className="h-5 w-5" /></span><div><p className="text-[10px] font-black uppercase tracking-[.14em] text-orange-300">Margin protection</p><h2 className="mt-1 text-xl font-black">Before you quote a client</h2></div></div>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300"><li>Use the current live SocialRUSH price as fulfillment cost input.</li><li>Keep your own client strategy, service fee and margin separate.</li><li>Do not promise fixed discounts, delivery or refill terms unless the active service shows them.</li></ul>
          <Link href="/admin/profitability" className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-300">Review profitability tools <ArrowRight className="h-4 w-4" /></Link>
        </article>
      </section>
    </main>
  );
}
