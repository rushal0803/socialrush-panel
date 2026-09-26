import Link from "next/link";
import FacebookViewsLanding from "@/components/marketing/FacebookViewsLanding";
import { getIndiaServiceMetadata } from "@/lib/seo/india-service-pages";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";

export const metadata = getIndiaServiceMetadata("buy-facebook-views-india");

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need my Facebook password?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. SocialRUSH only needs the public Facebook video or post URL requested by the service. Never share a password, login, or OTP.",
      },
    },
    {
      "@type": "Question",
      name: "Which Facebook link should I submit?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Submit the exact public Facebook video or post link and verify that it opens publicly before continuing.",
      },
    },
    {
      "@type": "Question",
      name: "How is the price calculated?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The active catalog rate is applied to the selected quantity and the live total is shown before checkout.",
      },
    },
    {
      "@type": "Question",
      name: "Can I track my order?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Continue through checkout and review status and order history from the SocialRUSH dashboard.",
      },
    },
  ],
};

export default function Page() {
  return (
    <>
      <IndiaCommercialServiceJsonLd
        code="facebook-views"
        name="Facebook Views"
        path="/facebook-views"
        platform="Facebook"
        serviceType="Facebook video views service"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FacebookViewsLanding />
      <section className="border-t border-white/10 bg-[#0d0f13] px-4 py-12 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Facebook video visibility</p>
          <h2 className="mt-3 text-2xl font-black sm:text-3xl">Facebook Views have a different goal from Likes and Followers</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            This page is intended for view campaigns on eligible public Facebook video or post URLs. Likes focus on visible post engagement, while Followers focus on the visible audience of a Page or profile. Use the service that matches the metric you actually want to support.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="font-black">Required link</p><p className="mt-2 text-sm leading-6 text-slate-300">Submit the exact eligible public Facebook video or post URL. Private or inaccessible content cannot be processed.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="font-black">Live order total</p><p className="mt-2 text-sm leading-6 text-slate-300">Choose an available quantity and review the total calculated from the active catalog rate before checkout.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="font-black">Delivery conditions</p><p className="mt-2 text-sm leading-6 text-slate-300">Timing depends on the active service, quantity and link availability. Keep the submitted content public while the order is processing.</p></div>
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-300">
            Need another Facebook service? Compare <Link href="/buy-facebook-followers-india" className="font-bold text-orange-300 hover:text-orange-200">Facebook Followers</Link>, <Link href="/facebook-likes" className="font-bold text-orange-300 hover:text-orange-200">Facebook Likes</Link>, or use the <Link href="/facebook-growth-india" className="font-bold text-orange-300 hover:text-orange-200">Facebook Growth India hub</Link> to choose the right destination.
          </p>
        </div>
      </section>
      <MoneyPageAuthorityLinks platform="facebook" />
    </>
  );
}
