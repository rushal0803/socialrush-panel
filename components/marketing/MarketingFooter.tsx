import Link from "next/link";
import Logo from "@/components/Logo";

const groups = [
  { title: "Growth services", links: [["Instagram Growth", "/services#instagram-followers"], ["YouTube Growth", "/services#youtube-subscribers"], ["Facebook Growth", "/services#facebook-followers"], ["LinkedIn Growth", "/services#linkedin-followers"], ["TikTok Growth", "/services#tiktok-followers"], ["Twitter/X Growth", "/services#twitter-followers"]] },
  { title: "Platform", links: [["Services", "/services"], ["Pricing", "/pricing"], ["Login", "/login"], ["Register", "/register"], ["Dashboard", "/dashboard"], ["Support", "/dashboard/support"]] },
  { title: "Company & legal", links: [["About", "/about"], ["Case Studies", "/case-studies"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Privacy Policy", "/privacy"], ["Refund Policy", "/refund-policy"], ["Terms", "/terms"]] },
];

export default function MarketingFooter() {
  return <footer className="bg-[#050f23] px-5 pb-8 pt-16 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"><div><Logo light /><p className="mt-5 max-w-sm text-xs leading-6 text-slate-400">Premium social media growth services for creators, influencers, brands, agencies, and businesses across India.</p><div className="mt-6 flex gap-2"><Link href="/register" className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold transition hover:bg-blue-500">Start Growing</Link><Link href="/login" className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold transition hover:bg-white/10">Login</Link></div></div>{groups.map((group) => <div key={group.title}><h3 className="text-xs font-bold">{group.title}</h3><div className="mt-5 space-y-3 text-xs text-slate-400">{group.links.map(([label, href]) => <Link key={label} href={href} className="block transition hover:text-white">{label}</Link>)}</div></div>)}</div><div className="flex flex-col justify-between gap-3 pt-7 text-[10px] text-slate-500 sm:flex-row"><p>© 2026 SocialRUSH. All rights reserved.</p><p>Secure payments · Refill support · Real-time tracking · Customer support</p></div></div></footer>;
}
