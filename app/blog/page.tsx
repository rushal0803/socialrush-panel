import BlogPageContent from "@/components/marketing/blog/BlogPageContent";
import ContentAuthorityNavigation from "@/components/marketing/blog/ContentAuthorityNavigation";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "Social Media Growth Guides & Strategy India",
  description:
    "Research practical social media growth strategies for creators, brands and agencies, then move to relevant services, trust guidance and ordering help when ready.",
  path: "/blog",
  keywords: ["social media growth blog India", "social media growth guides India", "Instagram growth guides India", "YouTube growth guides India"],
});

export default function BlogPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
      <BlogPageContent />
      <section className="bg-[#07080D] px-5 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-[#0E121B] p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.14em] text-orange-200">SocialRUSH knowledge network</p>
          <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">Research first. Choose the right next step when you are ready.</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">The Growth Library supports informed decisions rather than replacing live service information. Current service details, quantities, totals and checkout remain authoritative.</p>
          <ContentAuthorityNavigation />
        </div>
      </section>
    </>
  );
}
