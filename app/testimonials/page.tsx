import Link from "next/link";
import PageHero from "@/components/marketing/PageHero";
import PublicShell from "@/components/marketing/PublicShell";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Customer Safety & Support",
  description:
    "Learn how SocialRUSH keeps social media growth ordering clear with public-link ordering, transparent pricing, dashboard tracking, and WhatsApp support.",
  path: "/testimonials",
});

const safetyPoints = [
  [
    "No password required",
    "SocialRUSH only asks for the public profile, post, video, channel, page, or group link needed for the selected service.",
  ],
  [
    "Transparent checkout",
    "Pricing, quantity, delivery estimate, and refill/support terms are shown before an order is confirmed.",
  ],
  [
    "Dashboard tracking",
    "Customers can review order IDs, services, amounts, submitted links, status updates, and support context from their account.",
  ],
  [
    "Support before ordering",
    "If you are unsure which service or package fits your goal, you can contact SocialRUSH support before placing an order.",
  ],
  [
    "Refill terms shown clearly",
    "Refill support is available only for eligible services and within the displayed service terms.",
  ],
  [
    "Public-link workflow",
    "Orders are designed around public links so customers do not need to share private account credentials.",
  ],
] as const;

export default function TestimonialsPage() {
  return (
    <PublicShell>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Customer Safety & Support", path: "/testimonials" },
        ]}
      />
      <PageHero
        eyebrow="Customer safety"
        title="A clearer way to order social growth services."
        description="Instead of relying on exaggerated claims or fake-looking reviews, SocialRUSH focuses on a transparent ordering process, public-link submissions, dashboard tracking, and support when customers need help."
      />

      <main className="px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <section className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {safetyPoints.map(([title, body]) => (
              <article
                key={title}
                className="rounded-3xl border border-orange-400/25 bg-[#111111] p-6 shadow-[0_18px_44px_-26px_rgba(255,122,0,.35)]"
              >
                <h2 className="text-lg font-black text-white">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-[30px] border border-orange-400/25 bg-gradient-to-br from-[#111111] to-[#0B0B0F] p-6 shadow-[0_24px_60px_-32px_rgba(255,122,0,.45)] sm:p-8">
            <h2 className="text-2xl font-black text-white">
              Need help choosing the right service?
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Share your platform, service goal, quantity, and public link with
              support. The team can help you understand available services before
              you place an order.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/packages"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF7A00] to-[#FFB000] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_34px_-14px_rgba(255,122,0,.55)]"
              >
                View Packages
              </Link>
              <Link
                href="/services"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-orange-400/30 bg-white/5 px-6 py-3 text-sm font-bold text-orange-100"
              >
                Browse Services
              </Link>
              <a
                href="https://wa.me/918860330771"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-6 py-3 text-sm font-bold text-emerald-100"
              >
                WhatsApp Support
              </a>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
