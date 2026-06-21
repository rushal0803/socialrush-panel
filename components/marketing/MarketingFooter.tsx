import Link from "next/link";
import Logo from "@/components/Logo";

const groups = [
  { title: "Services", links: [["SEO Services","/services#seo"],["Performance Advertising","/services#google-ads"],["Website Development","/services#web-development"],["AI & CRM Automation","/services#ai-chatbots"]] },
  { title: "Company", links: [["About","/about"],["Case Studies","/case-studies"],["Testimonials","/testimonials"],["FAQ","/faq"]] },
  { title: "Trust", links: [["Contact","/contact"],["Privacy Policy","/privacy-policy"],["Refund Policy","/refund-policy"],["Terms & Conditions","/terms-and-conditions"]] },
];

export default function MarketingFooter() {
  return <footer className="bg-[#050f23] px-5 pb-8 pt-16 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl"><div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"><div><Logo light/><p className="mt-5 max-w-sm text-xs leading-6 text-slate-400">AI-powered digital marketing and automation agency for businesses, startups, creators, and local brands.</p><Link href="/contact" className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Request a consultation</Link></div>{groups.map((group) => <div key={group.title}><h3 className="text-xs font-bold">{group.title}</h3><div className="mt-5 space-y-3 text-xs text-slate-400">{group.links.map(([label,href]) => <Link key={label} className="block transition hover:text-white" href={href}>{label}</Link>)}</div></div>)}</div><div className="flex flex-col justify-between gap-3 pt-7 text-[10px] text-slate-500 sm:flex-row"><p>© 2026 SocialRUSH. All rights reserved.</p><p>support@socialrush.in · Transparent delivery · Secure payments</p></div></div></footer>;
}
