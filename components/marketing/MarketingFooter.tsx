import Link from "next/link";
import Logo from "@/components/Logo";
import PortalCTA from "./PortalCTA";

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
  "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20placing%20an%20order";

const footerGroups = [
  {
    title: "Explore",
    links: [
      ["Home", "/"],
      ["Services", "/#services"],
      ["Packages", "/packages"],
      ["How It Works", "/#how-it-works"],
      ["FAQ", "/#faq"],
      ["Contact", "/#contact"],
    ],
  },
  {
    title: "Top services",
    links: [
      ["Instagram Followers", "/services#instagram-followers"],
      ["YouTube Subscribers", "/services#youtube-subscribers"],
      ["LinkedIn Followers", "/services#linkedin-followers"],
      ["Facebook Followers", "/services#facebook-followers"],
      ["Telegram Members", "/services#telegram-members"],
      ["TikTok Followers", "/services#tiktok-followers"],
      ["Twitter/X Followers", "/services#twitter-followers"],
    ],
  },
  {
    title: "Account, Support & Legal",
    links: [
      ["Login", "/login"],
      ["Sign Up", "/register"],
      ["Support", "/support"],
      ["Privacy Policy", "/privacy-policy"],
      ["Terms & Conditions", "/terms-and-conditions"],
      ["Refund Policy", "/refund-policy"],
    ],
  },
];

export default function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-[linear-gradient(180deg,#f6faff_0%,#ffffff_100%)] px-5 pb-8 pt-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-[0_30px_90px_-55px_rgba(2,132,199,.55)] backdrop-blur-sm lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:p-8">
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600">
              SocialRUSH is a premium social media growth platform for creators, influencers, businesses, agencies, and brands.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[.14em] text-emerald-700">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Support Available
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <PortalCTA className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700">
                Start Order
              </PortalCTA>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100">
                WhatsApp Support
              </a>
            </div>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-bold uppercase tracking-[.16em] text-slate-700">{group.title}</h3>
              <div className="mt-5 space-y-2.5 text-sm text-slate-600">
                {group.links.map(([label, href]) => (
                  <Link key={label} href={href} className="block transition hover:text-blue-700">
                    {label}
                  </Link>
                ))}

                {group.title === "Account, Support & Legal" && (
                  <>
                    <PortalCTA className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-[#0b1635] px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700">
                      Start Order
                    </PortalCTA>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100">
                      WhatsApp Support
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 SocialRUSH. All rights reserved.</p>
          <p>Fast delivery · Secure orders · Multi-platform services · Order tracking</p>
        </div>
      </div>
    </footer>
  );
}