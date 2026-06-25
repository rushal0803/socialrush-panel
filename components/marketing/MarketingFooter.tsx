import Link from "next/link";
import Logo from "@/components/Logo";

const groups = [
  { title: "Growth services", links: [["Instagram Growth", "/services#instagram-followers"], ["YouTube Growth", "/services#youtube-subscribers"], ["Facebook Growth", "/services#facebook-followers"], ["LinkedIn Growth", "/services#linkedin-followers"], ["TikTok Growth", "/services#tiktok-followers"], ["Twitter/X Growth", "/services#twitter-followers"]] },
  { title: "Platform", links: [["Services", "/services"], ["Pricing", "/pricing"], ["Login", "/login"], ["Register", "/register"], ["Dashboard", "/dashboard"], ["Support", "/dashboard/support"]] },
  { title: "Company & legal", links: [["About", "/about"], ["Case Studies", "/case-studies"], ["FAQ", "/faq"], ["Contact", "/contact"], ["Privacy Policy", "/privacy"], ["Refund Policy", "/refund-policy"], ["Terms", "/terms"]] },
];

export default function MarketingFooter() {
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() ||
    "https://wa.me/918860330771?text=Hi%20SocialRUSH%2C%20I%20need%20help%20choosing%20a%20service";

  return (
    <footer className="relative bg-brand-navy px-5 pb-8 pt-16 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-blue-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-8 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-xs leading-6 text-slate-400">
              Premium social media growth services for creators, influencers,
              brands, agencies, and businesses across India and global markets.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/packages"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold transition hover:bg-blue-500"
              >
                View Packages
              </Link>
              <Link
                href="/register"
                className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-2.5 text-xs font-bold text-cyan-100 transition hover:bg-cyan-300/20"
              >
                Create Account
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2.5 text-xs font-bold text-emerald-200 transition hover:bg-emerald-400/20"
              >
                WhatsApp Support
              </a>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-bold">{group.title}</h3>
              <div className="mt-5 space-y-3 text-xs text-slate-400">
                {group.links.map(([label, href]) => (
                  <Link key={label} href={href} className="block transition hover:text-white">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col justify-between gap-3 pt-7 text-[10px] text-slate-500 sm:flex-row">
          <p>© 2026 SocialRUSH. All rights reserved.</p>
          <p>Secure Checkout · Wallet Support · WhatsApp Support · Multi-currency Pricing · Order Tracking</p>
        </div>
      </div>
    </footer>
  );
}
