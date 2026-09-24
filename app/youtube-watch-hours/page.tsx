import type { Metadata } from "next";
import Link from "next/link";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import IndiaCommercialServiceJsonLd from "@/components/seo/IndiaCommercialServiceJsonLd";
import MoneyPageAuthorityLinks from "@/components/seo/MoneyPageAuthorityLinks";
import { getServiceById } from "@/lib/smm-service-catalog";

const canonical = "https://www.getsocialrush.com/youtube-watch-hours";

export const metadata: Metadata = {
  title: "YouTube Watch Hours India | Packages & Live Service Details | SocialRUSH",
  description:
    "Explore YouTube Watch Hours packages in India with public-link ordering, live service details, dashboard tracking and no Google password required.",
  alternates: { canonical },
  robots: { index: true, follow: true },
  openGraph: {
    title: "YouTube Watch Hours India | SocialRUSH",
    description:
      "Compare YouTube Watch Hours options with live service terms, public-link ordering and dashboard tracking.",
    url: canonical,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YouTube Watch Hours India | SocialRUSH",
    description:
      "Compare YouTube Watch Hours options with live service terms and dashboard tracking.",
  },
};

const faqs = [
  {
    question: "What are YouTube watch hours?",
    answer:
      "Watch hours measure the time viewers spend watching eligible YouTube content. They are different from subscribers, views, likes and comments.",
  },
  {
    question: "What link do I need to submit?",
    answer:
      "Use the correct public YouTube video URL required by the active service and keep the video public while the order is processing.",
  },
  {
    question: "Do I need to share my YouTube or Google password?",
    answer:
      "No. SocialRUSH does not require your YouTube or Google password for this service. Never share account credentials or OTPs.",
  },
  {
    question: "How much do YouTube Watch Hours cost in India?",
    answer:
      "Pricing and available quantities depend on the active service. Review the current package details and exact total in the SocialRUSH order flow before payment.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "The current delivery estimate is shown with the active service before ordering. Timing can vary with the selected package, video availability and platform conditions.",
  },
  {
    question: "Does buying watch hours guarantee YouTube monetization?",
    answer:
      "No. SocialRUSH does not guarantee YouTube Partner Program approval, monetization, revenue, rankings or channel eligibility. YouTube independently determines eligibility and approval under its current policies.",
  },
  {
    question: "Are watch hours the same as YouTube views?",
    answer:
      "No. Views count eligible video plays, while watch hours measure viewing time. Choose the service that matches the metric you are trying to support.",
  },
];

export default function YouTubeWatchHoursPage() {
  const service = getServiceById("youtube-watch-hours");
  const protectedFacts = service?.requiresLiveCatalogFacts === true;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "YouTube Services", path: "/services?platform=youtube" },
          { name: "YouTube Watch Hours", path: "/youtube-watch-hours" },
        ]}
      />
      <IndiaCommercialServiceJsonLd
        code="youtube-watch-hours"
        name="YouTube Watch Hours"
        path="/youtube-watch-hours"
        platform="YouTube"
        serviceType="YouTube watch hours service"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c"),
        }}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            YouTube growth services · India
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            YouTube Watch Hours in India
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            Support viewing activity around eligible public YouTube content with a
            dedicated Watch Hours service. Review the active package details before
            ordering, submit the correct public video link, and track your order from
            your SocialRUSH account.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-950">Current service terms</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {protectedFacts
                  ? "Price, quantity limits, delivery and refill/support details are shown from the active service before checkout."
                  : `Delivery: ${service?.deliveryTime ?? "shown before checkout"}. Refill/support: ${service?.refillPolicy ?? "shown before checkout"}.`}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-950">Public-link ordering</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Submit the correct public YouTube video URL. No YouTube or Google password is required.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-950">Realistic expectations</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Watch Hours do not guarantee monetization, YPP approval, revenue, rankings or channel eligibility.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/new-order"
              className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Check live Watch Hours options
            </Link>
            <Link
              href="/services?platform=youtube"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-900"
            >
              Compare YouTube services
            </Link>
          </div>
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">How ordering works</h2>
            <ol className="mt-4 space-y-3 text-slate-600">
              <li>1. Open the SocialRUSH order flow and select the active YouTube Watch Hours service.</li>
              <li>2. Review the current quantity limits, pricing, delivery estimate and applicable support terms.</li>
              <li>3. Submit the correct public YouTube video URL and verify it before payment.</li>
              <li>4. Keep the video public while the order is processing and follow updates from your dashboard.</li>
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Watch Hours vs other YouTube metrics</h2>
            <p className="mt-4 leading-7 text-slate-600">
              Watch hours represent viewing time. Subscribers represent channel audience size, views represent eligible plays, and likes or comments represent visible engagement. These are separate metrics, so choose the service that matches your actual goal.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link href="/youtube-subscribers" className="underline">YouTube Subscribers</Link>
              <Link href="/youtube-views" className="underline">YouTube Views</Link>
              <Link href="/youtube-likes" className="underline">YouTube Likes</Link>
              <Link href="/buy-youtube-comments-india" className="underline">YouTube Comments</Link>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-bold text-slate-950">YouTube Watch Hours FAQs</h2>
          <div className="mt-5 space-y-4">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="rounded-2xl border border-slate-200 bg-white p-5">
                <summary className="cursor-pointer font-semibold text-slate-950">{question}</summary>
                <p className="mt-3 leading-7 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <MoneyPageAuthorityLinks platform="youtube" />
    </>
  );
}
