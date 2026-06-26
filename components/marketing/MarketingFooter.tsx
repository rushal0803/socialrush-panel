import Link from "next/link";
import Logo from "@/components/Logo";

const groups = [
  { title: "Growth services", links: [["Instagram Growth", "/services#instagram-followers"], ["YouTube Growth", "/services#youtube-subscribers"], ["Facebook Growth", "/services#facebook-followers"], ["LinkedIn Growth", "/services#linkedin-followers"], ["TikTok Growth", "/services#tiktok-followers"], ["Twitter/X Growth", "/services#twitter-followers"]] },
  { title: "Platform", links: [["Services", "/services"], ["Pricing", "/pricing"], ["Login", "/login"], ["Register", "/register"], ["Dashboard", "/dashboard"], ["Support", "/dashboard/support"]] },
  { title: "Company & legal", links: [["About", "/about"], ["Case Studies", "/case-studies"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Privacy Policy", "/privacy"], ["Refund Policy", "/refund-policy"], ["Terms", "/terms"]] },
];

export default function MarketingFooter({ tone = "default" }: { tone?: "default" | "light3d" }) {
  const isLight3d = tone === "light3d";
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20a%20service";

  return (
    <footer className={isLight3d ? "relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#fcecff_0%,#eef7ff_40%,#f6fbff_100%)] px-4 pb-9 pt-14 text-[#203b72] sm:px-6 lg:px-8" : "relative bg-brand-navy px-5 pb-8 pt-16 text-white sm:px-6 lg:px-8"}>
      <div className={isLight3d ? "pointer-events-none absolute -left-24 top-6 h-64 w-64 rounded-full bg-pink-200/35 blur-3xl" : "pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl"} />
      <div className={isLight3d ? "pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-cyan-200/35 blur-3xl" : "pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl"} />
      <div className="relative mx-auto max-w-7xl">
        <div className={isLight3d ? "grid gap-10 rounded-3xl border border-white/80 bg-white/72 p-6 shadow-[0_24px_54px_-34px_rgba(15,23,42,.42)] backdrop-blur-2xl sm:p-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]" : "grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]"}>
          <div className={isLight3d ? "rounded-2xl border border-[#dce8ff] bg-white/80 p-4 sm:p-5" : ""}>
            {isLight3d ? (
              <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-[#17366f]">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] text-sm font-extrabold text-white shadow-[0_12px_28px_-14px_rgba(117,109,255,.7)]">
                  SR
                </span>
                <span>
                  Social<span className="bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] bg-clip-text text-transparent">RUSH</span>
                </span>
              </Link>
            ) : (
              <Logo light />
            )}
            <p className={isLight3d ? "mt-5 max-w-sm text-xs leading-6 text-[#5f79ab]" : "mt-5 max-w-sm text-xs leading-6 text-slate-400"}>
              Premium social media growth services for creators, influencers,
              brands, agencies, and businesses across India and global markets.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/packages"
                className={isLight3d ? "rounded-xl bg-gradient-to-r from-[#ff67b2] via-[#8b8dff] to-[#46c3ff] px-4 py-2.5 text-xs font-bold text-white shadow-[0_14px_30px_-14px_rgba(117,109,255,.65)] transition hover:-translate-y-0.5" : "rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold transition hover:bg-blue-500"}
              >
                View Packages
              </Link>
              <Link
                href="/register"
                className={isLight3d ? "rounded-xl border border-[#d7e4ff] bg-[#eef4ff] px-4 py-2.5 text-xs font-bold text-[#35548d] transition hover:bg-[#e7f0ff]" : "rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/20"}
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
            <div key={group.title} className={isLight3d ? "rounded-2xl border border-[#dce8ff] bg-white/80 p-4 sm:p-5" : ""}>
              <h3 className={isLight3d ? "text-xs font-bold text-[#17366f]" : "text-xs font-bold"}>{group.title}</h3>
              <div className={isLight3d ? "mt-5 space-y-3 text-xs text-[#5f79ab]" : "mt-5 space-y-3 text-xs text-slate-400"}>
                {group.links.map(([label, href]) => (
                  <Link key={label} href={href} className={isLight3d ? "block transition hover:text-[#193a73]" : "block transition hover:text-white"}>
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className={isLight3d ? "mt-6 flex flex-col justify-between gap-3 border-t border-[#dce8ff] pt-6 text-[10px] text-[#6f86b2] sm:flex-row" : "flex flex-col justify-between gap-3 pt-7 text-[10px] text-slate-500 sm:flex-row"}>
          <p>© 2026 SocialRUSH. All rights reserved.</p>
          <p>Secure Checkout · Wallet Support · WhatsApp Support · Multi-currency Pricing · Order Tracking</p>
        </div>
      </div>
    </footer>
  );
}
