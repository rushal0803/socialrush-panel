import Link from "next/link";
import { ArrowRight, IndianRupee, Link2, ShieldCheck } from "lucide-react";
import { buildQuantityPlanning, serviceUnitFromCode } from "@/lib/seo/search-demand";

const guideLinks: Record<string, Array<{ label:string; href:string }>> = {
  instagram: [
    { label: "Instagram follower price guide", href: "/blog/instagram-followers-price-in-india" },
    { label: "Instagram followers vs engagement", href: "/blog/instagram-followers-vs-engagement" },
  ],
  youtube: [
    { label: "YouTube views price guide", href: "/blog/youtube-views-price-in-india" },
    { label: "YouTube channel readiness checklist", href: "/blog/youtube-channel-readiness-checklist" },
  ],
  linkedin: [
    { label: "LinkedIn followers for business growth", href: "/blog/linkedin-followers-for-business-growth" },
    { label: "LinkedIn followers vs engagement", href: "/blog/linkedin-followers-vs-engagement-india" },
  ],
  x: [
    { label: "Public-link ordering safety", href: "/blog/why-public-link-ordering-is-safer" },
    { label: "Campaign mistakes to avoid", href: "/blog/social-media-campaign-mistakes-to-avoid" },
  ],
  facebook: [
    { label: "Facebook page growth for local businesses", href: "/blog/facebook-page-growth-tips-for-local-businesses" },
    { label: "Public-link ordering safety", href: "/blog/why-public-link-ordering-is-safer" },
  ],
  telegram: [
    { label: "How growth campaigns work", href: "/blog/how-social-media-growth-campaigns-work" },
    { label: "Campaign mistakes to avoid", href: "/blog/social-media-campaign-mistakes-to-avoid" },
  ],
  tiktok: [
    { label: "Social media growth strategy for Indian creators", href: "/blog/social-media-growth-strategy-indian-creators" },
    { label: "Public-link ordering safety", href: "/blog/why-public-link-ordering-is-safer" },
  ],
};

function money(value:number){
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(value);
}

export default function SearchDemandPriceSection({
  displayName,
  serviceCode,
  platform,
  pricePer1000,
  destination,
  packagesHref,
  tone="light",
}:{
  displayName:string;
  serviceCode:string;
  platform:string;
  pricePer1000:number|null;
  destination:string;
  packagesHref:string;
  tone?:"light"|"dark";
}){
  const rows=buildQuantityPlanning(pricePer1000);
  const unit=serviceUnitFromCode(serviceCode);
  const dark=tone==="dark";
  const links=guideLinks[platform]||[];
  return <section className={dark?"border-y border-white/10 bg-[#111114] px-4 py-16 text-white sm:px-6 lg:px-8":"bg-white/70 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"}>
    <div className="mx-auto max-w-7xl">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
        <div>
          <p className={dark?"text-xs font-black uppercase tracking-[.16em] text-orange-300":"text-xs font-black uppercase tracking-[.16em] text-orange-600"}>{displayName} price in India</p>
          <h2 className={dark?"mt-3 text-3xl font-black tracking-tight text-white":"mt-3 text-3xl font-black tracking-tight text-[#0B0B0F]"}>What do 1K, 5K and 10K {unit} cost?</h2>
          <p className={dark?"mt-4 max-w-3xl text-sm leading-7 text-[#D1D5DB]":"mt-4 max-w-3xl text-sm leading-7 text-[#111827]"}>
            Use these values as quantity-planning examples from the confirmed public per-1K rate. Your final total, current availability and service terms are recalculated in the live order flow before payment.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {rows.length?rows.map(row=><article key={row.quantity} className={dark?"rounded-2xl border border-white/10 bg-white/[.035] p-5":"rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"}>
              <p className={dark?"text-[10px] font-black uppercase tracking-[.13em] text-orange-200":"text-[10px] font-black uppercase tracking-[.13em] text-orange-600"}>{row.quantity.toLocaleString("en-IN")} {unit}</p>
              <p className={dark?"mt-2 text-2xl font-black text-white":"mt-2 text-2xl font-black text-[#0B0B0F]"}>{money(row.total)}</p>
              <p className={dark?"mt-2 text-[11px] leading-5 text-[#9CA3AF]":"mt-2 text-[11px] leading-5 text-[#111827]"}>Planning total at the confirmed per-1K rate.</p>
            </article>):<article className={dark?"rounded-2xl border border-white/10 bg-white/[.035] p-5 sm:col-span-3":"rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:col-span-3"}><p className={dark?"text-sm font-bold text-[#D1D5DB]":"text-sm font-bold text-[#111827]"}>This service uses live catalog pricing. Open Packages to review the latest confirmed rate and exact quantity total.</p></article>}
          </div>
          <Link href={packagesHref} className={dark?"mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-5 text-sm font-black text-white":"mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0B0B0F] px-5 text-sm font-black text-white"}>Check current price <ArrowRight className="h-4 w-4"/></Link>
        </div>
        <aside className={dark?"rounded-[2rem] border border-white/10 bg-black/20 p-6":"rounded-[2rem] border border-orange-100 bg-[#FFF8F1] p-6"}>
          <div className="flex items-center gap-3"><span className={dark?"grid h-10 w-10 place-items-center rounded-xl bg-orange-500/10 text-orange-300":"grid h-10 w-10 place-items-center rounded-xl bg-white text-orange-600"}><IndianRupee className="h-5 w-5"/></span><div><p className={dark?"text-[10px] font-black uppercase tracking-[.13em] text-orange-200":"text-[10px] font-black uppercase tracking-[.13em] text-orange-600"}>Before ordering</p><h3 className={dark?"mt-1 text-lg font-black text-white":"mt-1 text-lg font-black text-[#0B0B0F]"}>Check price, link and service terms together</h3></div></div>
          <ul className={dark?"mt-5 space-y-3 text-sm leading-6 text-[#D1D5DB]":"mt-5 space-y-3 text-sm leading-6 text-[#111827]"}>
            <li className="flex gap-2"><IndianRupee className="mt-1 h-4 w-4 shrink-0 text-orange-500"/>Confirm the current INR rate and exact total.</li>
            <li className="flex gap-2"><Link2 className="mt-1 h-4 w-4 shrink-0 text-orange-500"/>Use the correct {destination}.</li>
            <li className="flex gap-2"><ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-500"/>Never submit a password, OTP or recovery code.</li>
          </ul>
          {links.length?<div className="mt-6 border-t border-white/10 pt-5"><p className={dark?"text-[10px] font-black uppercase tracking-[.13em] text-[#9CA3AF]":"text-[10px] font-black uppercase tracking-[.13em] text-[#111827]"}>Helpful guides</p><div className="mt-3 space-y-2">{links.map(link=><Link key={link.href} href={link.href} className={dark?"flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] px-4 py-3 text-xs font-bold text-white":"flex items-center justify-between rounded-xl border border-orange-100 bg-white px-4 py-3 text-xs font-bold text-[#0B0B0F]"}>{link.label}<ArrowRight className="h-3.5 w-3.5 text-orange-500"/></Link>)}</div></div>:null}
        </aside>
      </div>
    </div>
  </section>;
}
