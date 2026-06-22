import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/marketing/PageHero";
import PublicShell from "@/components/marketing/PublicShell";

export const metadata: Metadata = { title: "Social Media Growth Guides", description: "Practical SocialRUSH guides about Instagram, YouTube, service selection, wallet checkout, tracking, safety, and refill support." };

const posts = [
  ["Instagram", "How to prepare your Instagram profile before a growth campaign", "A checklist covering profile clarity, public access, content consistency, and the correct campaign link."],
  ["YouTube", "Subscribers, likes, or views: choosing the right YouTube service", "Understand how each service supports channel presentation, content visibility, or public engagement."],
  ["Safety", "Why SocialRUSH never asks for your social media password", "Learn why public-link ordering is enough and how wallet checkout keeps campaign activity organized."],
  ["Agencies", "Managing several client campaigns from one dashboard", "Use order IDs, searchable history, wallet transactions, and support tickets for cleaner campaign operations."],
  ["Tracking", "Understanding pending, processing, and completed statuses", "A plain-language guide to the campaign status updates shown in your order history."],
  ["Refills", "How eligible refill support works", "Understand coverage periods, eligibility, and what information to include when requesting assistance."],
];

export default function BlogPage() {
  return <PublicShell><PageHero eyebrow="SocialRUSH guides" title="Practical guidance for better campaign decisions." description="Clear articles about account safety, service selection, ordering, tracking, refill support, and customer dashboard workflows." /><section className="px-5 py-16 sm:px-6 lg:py-20"><div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-3">{posts.map(([tag, title, text]) => <article key={title} className="rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{tag}</p><h2 className="mt-4 text-xl font-bold leading-7 text-[#07152f]">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-500">{text}</p><Link href="/faq" className="mt-6 inline-flex min-h-11 items-center text-xs font-bold text-blue-600">Read the related guidance →</Link></article>)}</div></section></PublicShell>;
}
