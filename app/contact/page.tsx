import type { Metadata } from "next";
import PageHero from "@/components/marketing/PageHero";
import MarketingIcon from "@/components/marketing/MarketingIcon";
import PublicShell from "@/components/marketing/PublicShell";
import { agencyServices, publicFaqs } from "@/lib/marketing/content";

export const metadata: Metadata = {
  title: "Contact SocialRUSH | Social Media Growth Support",
  description: "Contact SocialRUSH for help choosing or managing an Instagram, YouTube, Facebook, LinkedIn, TikTok, or Twitter/X growth service.",
};

export default function ContactPage() {
  const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim();
  return (
    <PublicShell>
      <PageHero
        eyebrow="Contact SocialRUSH"
        title="Tell us what social growth should look like for you."
        description="Share your platform, campaign goal, and preferred service. Our support team will help you choose a practical next step."
        action="Send an enquiry"
        actionHref="#inquiry"
      />
      <section className="px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_.72fr]">
          <form id="inquiry" action="mailto:support@socialrush.in" method="post" encType="text/plain" className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-blue-900/5 sm:p-8">
            <h2 className="text-xl font-bold text-[#07152f]">Service enquiry</h2>
            <p className="mt-2 text-xs leading-6 text-slate-500">Fields marked with * are required. Submitting opens your email application so you can review the message before sending.</p>
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-bold text-slate-700">Full name *<input required name="name" className="field" placeholder="Your name" /></label>
              <label className="text-xs font-bold text-slate-700">Email *<input required type="email" name="email" className="field" placeholder="you@example.com" /></label>
              <label className="text-xs font-bold text-slate-700">Brand or channel<input name="company" className="field" placeholder="Brand or channel name" /></label>
              <label className="text-xs font-bold text-slate-700">Service interest *<select required name="service" className="field"><option value="">Select a service</option>{agencyServices.map((service) => <option key={service.slug} value={service.name}>{service.name}</option>)}</select></label>
            </div>
            <label className="mt-5 block text-xs font-bold text-slate-700">How can we help? *<textarea required name="message" rows={6} className="field resize-y" placeholder="Tell us about your platform, goal, and timeline." /></label>
            <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-slate-500"><input required type="checkbox" className="mt-1" />I agree that SocialRUSH may use this information to respond to my enquiry in accordance with the Privacy Policy.</label>
            <button className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Review and send enquiry</button>
          </form>
          <aside className="space-y-5">
            <div className="rounded-3xl bg-[#07152f] p-7 text-white">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-500/15 text-blue-300"><MarketingIcon name="message" className="h-5 w-5" /></span>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-wider text-blue-400">Customer support</p>
              <a href="mailto:support@socialrush.in" className="mt-4 block text-lg font-bold">support@socialrush.in</a>
              <p className="mt-2 text-xs leading-6 text-slate-400">Typical response target: within one business day.</p>
              {whatsappUrl ? <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-600"><MarketingIcon name="message" className="h-4 w-4" />Open WhatsApp support</a> : <a href="mailto:support@socialrush.in?subject=SocialRUSH%20support" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-500"><MarketingIcon name="message" className="h-4 w-4" />Message support</a>}
            </div>
            <div className="rounded-3xl border border-slate-200 p-7">
              <h2 className="font-bold text-[#07152f]">What we can help with</h2>
              <div className="mt-5 space-y-3">{["Choosing the right service", "Wallet or payment questions", "Order status and delivery", "Eligible refill requests"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600"><span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-50 text-blue-600"><MarketingIcon name="check" className="h-3.5 w-3.5" /></span>{item}</div>)}</div>
            </div>
          </aside>
        </div>
      </section>
      <section className="bg-[#f6f9ff] px-5 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Support paths</p><h2 className="mt-4 text-2xl font-bold text-[#07152f]">Get the right help without repeating your story.</h2></div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">{[["search", "Pre-sales guidance", "Ask which service, link type, or campaign setup fits your goal."], ["card", "Payment and wallet help", "Include your payment reference when reporting a missing credit or failed payment."], ["message", "Order and refill support", "Use your dashboard ticket area so the team can review the relevant order context."]].map(([icon, title, text]) => <article key={title} className="rounded-2xl border border-white bg-white p-5 shadow-sm"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600"><MarketingIcon name={icon as "search" | "card" | "message"} className="h-5 w-5" /></span><h3 className="mt-4 text-sm font-bold text-[#07152f]">{title}</h3><p className="mt-3 text-xs leading-6 text-slate-500">{text}</p></article>)}</div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">{publicFaqs.slice(1, 4).map(([question, answer]) => <article key={question} className="rounded-2xl border border-blue-100 bg-blue-50 p-5"><h3 className="text-sm font-bold text-[#07152f]">{question}</h3><p className="mt-3 text-xs leading-6 text-slate-600">{answer}</p></article>)}</div>
        </div>
      </section>
    </PublicShell>
  );
}
