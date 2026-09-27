import Link from "next/link";
import { ArrowRight, Layers3, ShieldCheck, WalletCards } from "lucide-react";
import { socialMediaServiceGroups } from "@/lib/seo/social-media-services-intent";

export default function SocialMediaServicesIndiaAuthority() {
  return (
    <section className="border-y border-white/10 bg-[#090a0d] px-4 py-14 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Social media services India</p>
          <h2 className="mt-2 text-3xl font-black">Compare order-based social media services by the job you need done.</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            SocialRUSH provides order-based social media growth services for eligible public profiles, pages, channels, posts and videos. It is not a monthly social media management agency: content creation, posting calendars, community management and ad-management retainers are outside this service catalog unless explicitly listed.
          </p>
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {socialMediaServiceGroups.map((group) => (
            <article key={group.id} className="rounded-3xl border border-white/10 bg-[#101116] p-5">
              <Layers3 className="h-5 w-5 text-orange-300" />
              <h3 className="mt-4 text-lg font-black">{group.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{group.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="inline-flex min-h-10 items-center gap-1 rounded-xl border border-white/10 bg-white/[.035] px-3 text-xs font-black text-orange-200 transition hover:border-orange-400/35 hover:bg-orange-500/[.07]">
                    {link.label}<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[.05] p-4">
            <div className="flex items-center gap-2 text-sm font-black text-emerald-200"><ShieldCheck className="h-4 w-4"/>Public-link ordering</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">Use the required public destination. Never submit a social-media password, OTP or recovery code.</p>
          </div>
          <div className="rounded-2xl border border-orange-400/15 bg-orange-500/[.05] p-4">
            <div className="flex items-center gap-2 text-sm font-black text-orange-200"><WalletCards className="h-4 w-4"/>Current checkout facts win</div>
            <p className="mt-2 text-xs leading-5 text-slate-400">The live service price, quantity limits, delivery estimate, refill terms and available payment methods shown before checkout remain authoritative.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
