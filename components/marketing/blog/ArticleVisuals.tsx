import { BarChart3, Check, CreditCard, Link2, LockKeyhole, Play, Search, ShieldCheck, UserRound } from "lucide-react";

type VisualProps = { category: string; title: string; variant?: "hero" | "inline" };

function kind(category: string, title: string) {
  const text = `${category} ${title}`.toLowerCase();
  if (text.includes("payment") || text.includes("upi")) return "payment";
  if (text.includes("youtube")) return "youtube";
  if (text.includes("facebook")) return "facebook";
  if (text.includes("linkedin")) return "linkedin";
  if (text.includes("seo") || text.includes("search") || text.includes("keyword")) return "seo";
  if (text.includes("instagram")) return "instagram";
  return "growth";
}

const palettes: Record<string, string> = {
  instagram: "from-fuchsia-500/30 via-violet-500/15 to-orange-400/25",
  youtube: "from-red-500/30 via-rose-500/15 to-orange-400/20",
  facebook: "from-blue-500/30 via-cyan-500/15 to-indigo-500/20",
  linkedin: "from-sky-500/30 via-blue-500/15 to-indigo-500/20",
  payment: "from-orange-500/35 via-amber-400/15 to-emerald-400/20",
  seo: "from-emerald-500/25 via-cyan-400/15 to-blue-500/20",
  growth: "from-orange-500/30 via-amber-400/15 to-fuchsia-500/20",
};

export function ArticleHeroVisual({ category, title, variant = "hero" }: VisualProps) {
  const type = kind(category, title);
  const isPayment = type === "payment";
  const Icon = type === "youtube" ? Play : type === "seo" ? Search : type === "payment" ? CreditCard : type === "linkedin" ? UserRound : type === "facebook" ? UserRound : BarChart3;
  return <div aria-hidden="true" className={`relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${palettes[type]} ${variant === "hero" ? "min-h-[260px] sm:min-h-[320px]" : "min-h-[180px]"}`}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(255,255,255,.17),transparent_30%),linear-gradient(135deg,rgba(8,10,18,.1),rgba(8,10,18,.75))]" />
    <div className="absolute -right-12 -top-12 h-52 w-52 rounded-full border border-white/15" /><div className="absolute right-8 top-10 h-24 w-24 rounded-full border border-white/10" />
    <div className="relative mx-auto grid max-w-sm gap-3 p-5 pt-10 sm:p-8 sm:pt-14">
      <div className="rounded-2xl border border-white/15 bg-[#0B0F19]/85 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-orange-200"><Icon className="h-5 w-5" /></span><div><p className="text-xs font-black text-white">Campaign overview</p><p className="mt-1 text-[10px] font-semibold text-white/60">Live growth check</p></div><span className="ml-auto h-2.5 w-2.5 rounded-full bg-emerald-300" /></div>
        <div className="mt-5 grid grid-cols-3 gap-2">{["Reach", "Growth", "Status"].map((label, index) => <div key={label} className="rounded-xl bg-white/[.06] p-2.5"><div className="h-1.5 w-8 rounded bg-white/25" /><div className="mt-3 text-sm font-black text-white">{index === 2 ? "Live" : ["+24%", "1.2K"][index]}</div></div>)}</div>
      </div>
      {isPayment ? <div className="flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-400/10 p-3 text-xs font-bold text-emerald-100"><ShieldCheck className="h-4 w-4 shrink-0" /> Public link only · PIN and password stay private</div> : <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0F19]/70 p-3 text-xs font-bold text-white/80"><Check className="h-4 w-4 text-orange-200" /> A focused guide for better decisions</div>}
    </div>
  </div>;
}

export function ArticleFlowDiagram({ category, title }: VisualProps) {
  const payment = kind(category, title) === "payment";
  const steps = payment ? [["01", "Choose service", CreditCard], ["02", "Add public link", Link2], ["03", "Pay securely", LockKeyhole], ["04", "Track order", BarChart3]] : [["01", "Set the goal", Search], ["02", "Choose the format", Play], ["03", "Review details", Check], ["04", "Track progress", BarChart3]];
  return <figure className="my-7 overflow-hidden rounded-2xl border border-orange-300/20 bg-[#0C1019] p-4 sm:p-5"><figcaption className="text-xs font-black uppercase tracking-[.16em] text-orange-200">{payment ? "A safer order flow" : "A practical growth flow"}</figcaption><ol className="mt-4 grid gap-3 sm:grid-cols-4">{steps.map(([number, label, Icon]) => <li key={label as string} className="relative rounded-xl border border-white/10 bg-white/[.035] p-3"><span className="text-[10px] font-black tracking-widest text-orange-200">{number as string}</span><Icon className="mt-3 h-4 w-4 text-white" /><span className="mt-3 block text-sm font-bold text-white">{label as string}</span></li>)}</ol></figure>;
}

export function ArticleSafetyCallout() {
  return <aside className="my-7 rounded-2xl border border-amber-300/25 bg-amber-300/[.08] p-4 sm:p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" /><div><h3 className="font-extrabold text-white">Keep your account and payment details private</h3><p className="mt-1 text-sm leading-6 text-slate-200">A public-link order does not require an Instagram password, OTP, recovery code, UPI PIN, or screen sharing. Enter your UPI PIN only in your own payment app.</p></div></div></aside>;
}
