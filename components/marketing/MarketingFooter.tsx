import Link from "next/link";
import Logo from "@/components/Logo";
import FooterSocialLinks from "@/components/marketing/FooterSocialLinks";

const groups = [
  { title: "Growth services", links: [["Instagram Followers", "/buy-instagram-followers-india"], ["Instagram Likes", "/buy-instagram-likes-india"], ["Instagram Views", "/buy-instagram-views-india"], ["YouTube Subscribers", "/buy-youtube-subscribers-india"], ["YouTube Likes", "/buy-youtube-likes-india"], ["YouTube Views", "/buy-youtube-views-india"], ["Facebook Followers", "/buy-facebook-followers-india"], ["LinkedIn Followers", "/buy-linkedin-followers-india"], ["Telegram Members", "/buy-telegram-members-india"], ["Twitter/X Followers", "/buy-twitter-followers-india"]] },
  { title: "Platform", links: [["Services", "/services"], ["Pricing", "/pricing"], ["Login", "/login"], ["Register", "/register"], ["Dashboard", "/dashboard"], ["Support", "/dashboard/support"]] },
  { title: "Company & legal", links: [["About", "/about"], ["Case Studies", "/case-studies"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Privacy Policy", "/privacy"], ["Refund Policy", "/refund-policy"], ["Terms", "/terms"]] },
];

export default function MarketingFooter({ tone = "default" }: { tone?: "default" | "light3d" }) {
  const isLight3d = tone === "light3d";
  const whatsappUrl = "https://wa.me/918860330771";

  return (
    <footer className={isLight3d ? "brand-footer relative overflow-hidden px-4 pb-9 pt-14 text-white sm:px-6 lg:px-8" : "brand-footer relative px-5 pb-8 pt-16 text-white sm:px-6 lg:px-8"}>
      <div className={isLight3d ? "pointer-events-none absolute -left-24 top-6 h-64 w-64 rounded-full bg-orange-200/35 blur-3xl" : "pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-orange-600/15 blur-3xl"} />
      <div className={isLight3d ? "pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" : "pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-amber-400/15 blur-3xl"} />
      <div className="relative mx-auto max-w-7xl">
        <div className={isLight3d ? "brand-footer-surface grid gap-10 rounded-3xl border p-6 backdrop-blur-2xl sm:p-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]" : "brand-footer-surface grid gap-10 border pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"}>
          <div className={isLight3d ? "rounded-2xl border border-[#FFF8F1] bg-white/80 p-4 sm:p-5" : ""}>
            <Logo light />
            <p className={isLight3d ? "mt-5 max-w-sm text-xs leading-6 text-[#111827]" : "mt-5 max-w-sm text-xs leading-6 text-slate-400"}>
              SocialRUSH helps creators, brands and businesses manage social media
              growth campaigns with public-link ordering, transparent pricing,
              secure checkout, dashboard tracking and WhatsApp support.
            </p>
            <FooterSocialLinks />
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/packages"
                className={isLight3d ? "rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-4 py-2.5 text-xs font-bold text-white shadow-[0_14px_30px_-14px_rgba(255, 196, 0, .65)] transition hover:-translate-y-0.5" : "rounded-xl bg-orange-600 px-4 py-2.5 text-xs font-bold transition hover:bg-orange-500"}
              >
                View Packages
              </Link>
              <Link
                href="/register"
                className={isLight3d ? "rounded-xl border border-[#FFF3E0] bg-[#FFF8F1] px-4 py-2.5 text-xs font-bold text-[#FF9F00] transition hover:bg-[#FFF8F1]" : "rounded-xl border border-amber-300/30 bg-amber-300/10 px-4 py-2.5 text-xs font-bold text-amber-100 transition hover:bg-amber-300/20"}
              >
                Create Account
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={isLight3d ? "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100" : "rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-400/20"}
              >
                WhatsApp Support
              </a>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.title} className={isLight3d ? "rounded-2xl border border-[#FFF8F1] bg-white/80 p-4 sm:p-5" : ""}>
              <h3 className={isLight3d ? "text-xs font-bold text-[#0B0B0F]" : "text-xs font-bold"}>{group.title}</h3>
              <div className={isLight3d ? "mt-5 space-y-3 text-xs text-[#111827]" : "mt-5 space-y-3 text-xs text-slate-400"}>
                {group.links.map(([label, href]) => (
                  <Link key={label} href={href} className={isLight3d ? "block transition hover:text-[#0B0B0F]" : "block transition hover:text-white"}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={isLight3d ? "mt-6 flex flex-col justify-between gap-3 border-t border-[#FFF8F1] pt-6 text-[10px] text-[#111827] sm:flex-row" : "flex flex-col justify-between gap-3 pt-7 text-[10px] text-slate-500 sm:flex-row"}>
          <p>© 2026 SocialRUSH. All rights reserved.</p>
          <p>Secure Checkout · Wallet Support · WhatsApp Support · Multi-currency Pricing · Order Tracking</p>
        </div>
      </div>
    </footer>
  );
}
