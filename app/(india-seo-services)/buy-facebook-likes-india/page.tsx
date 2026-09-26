import Link from "next/link";
import FacebookLikesLanding from "@/components/marketing/FacebookLikesLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

export const metadata = getIndiaServiceMetadata("buy-facebook-likes-india");

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need my Facebook password?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. SocialRUSH only needs the public Facebook post or video URL required by this service. Never share a password, login, or OTP.",
      },
    },
    {
      "@type": "Question",
      name: "Which Facebook post link should I submit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Submit the exact public Facebook post or video link and confirm that it opens publicly and points to the intended content.",
      },
    },
    {
      "@type": "Question",
      name: "How is the price calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The total is calculated from the active catalog rate and selected quantity and is shown before checkout.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. After checkout, use the SocialRUSH dashboard to review order status and history.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <IndiaCommercialServiceJsonLd
        code="facebook-likes"
        name="Facebook Likes"
        path="/facebook-likes"
        platform="Facebook"
        serviceType="Facebook likes service"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FacebookLikesLanding />
      <section className="border-t border-white/10 bg-[#0d0f13] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Facebook post engagement</p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">Facebook Likes are for posts, not follower growth</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            This page is specifically for Likes on an eligible public Facebook post or video. If your goal is to increase the visible audience of a Facebook Page or profile, use the Facebook Followers service instead. Keeping these intents separate helps you choose the correct campaign and submit the correct URL.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="font-black">Required link</p><p className="mt-2 text-sm leading-6 text-slate-300">An eligible public Facebook post or video URL. No password, login or OTP is required.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="font-black">Pricing</p><p className="mt-2 text-sm leading-6 text-slate-300">The order builder uses the active catalog rate and shows the total for your selected quantity before checkout.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="font-black">Delivery & support</p><p className="mt-2 text-sm leading-6 text-slate-300">Current delivery and refill/support terms are shown with the active service. Keep the submitted content public while processing.</p></div>
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-300">
            Looking for a different Facebook goal? Visit <Link href="/buy-facebook-followers-india" className="font-bold text-orange-300 hover:text-orange-200">Facebook Followers</Link>, <Link href="/facebook-views" className="font-bold text-orange-300 hover:text-orange-200">Facebook Views</Link>, or the <Link href="/facebook-growth-india" className="font-bold text-orange-300 hover:text-orange-200">Facebook Growth India hub</Link>.
          </p>
        </div>
      </section>
      <MoneyPageAuthorityLinks platform="facebook" />
    </>
  );
}
