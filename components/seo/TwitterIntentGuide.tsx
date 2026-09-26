import Link from "next/link";

const services = [
  { href: "/twitter-followers", title: "Twitter / X Followers", intent: "Profile audience growth", description: "Use the followers page when the goal is to add followers to an eligible public X profile. It covers India pricing, quantities, requirements and refill information." },
  { href: "/services/twitter-likes", title: "Twitter / X Likes", intent: "Post engagement", description: "Use the likes page for an eligible public X post when likes are the specific campaign goal." },
  { href: "/services/twitter-retweets", title: "Twitter Retweets / X Reposts", intent: "Post amplification", description: "Use the repost page when the goal is repost activity. Retweets are now called reposts on X, so the page covers both terms naturally." },
  { href: "/services/twitter-views", title: "Twitter / X Views", intent: "Post visibility", description: "Use the views page when the campaign is focused on view activity for an eligible public X post." },
] as const;

export default function TwitterIntentGuide() {
  return (
    <section className="border-y border-white/10 bg-[#090c11] px-4 py-12 text-white sm:px-6 lg:px-8" aria-labelledby="twitter-service-guide-title">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">Twitter / X service guide</p>
        <h2 id="twitter-service-guide-title" className="mt-3 max-w-3xl text-2xl font-black sm:text-3xl">Choose the Twitter (X) service that matches your goal</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">X is the platform formerly known as Twitter. SocialRUSH keeps followers, likes, reposts and views on separate pages so each service has one clear purpose, requirements and ordering path.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <article key={service.href} className="flex flex-col rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <p className="text-xs font-bold uppercase tracking-[.12em] text-orange-200">{service.intent}</p>
              <h3 className="mt-2 text-lg font-black">{service.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-400">{service.description}</p>
              <Link href={service.href} className="mt-5 inline-flex min-h-11 items-center font-black text-orange-300 hover:text-orange-200">View {service.title} →</Link>
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold">
          <Link href="/x-growth-india" className="text-slate-200 hover:text-orange-300">Twitter / X growth guide</Link>
          <Link href="/services/twitter-x" className="text-slate-200 hover:text-orange-300">All Twitter / X services</Link>
          <Link href="/contact" className="text-slate-200 hover:text-orange-300">Contact support</Link>
        </div>
      </div>
    </section>
  );
}
