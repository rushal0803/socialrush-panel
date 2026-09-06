import PublicShell from "@/components/marketing/PublicShell";
import PageHero from "@/components/marketing/PageHero";
import PublicReviewsSection from "@/components/reviews/PublicReviewsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
export const metadata=createPageMetadata({title:"Customer Reviews",description:"Read moderated SocialRUSH customer reviews submitted for completed orders, with permission for public display.",path:"/reviews"});
export default function ReviewsPage(){return <PublicShell><PageHero eyebrow="Customer reviews" title="Feedback tied to completed customer orders." description="Every published review is submitted by an authenticated customer, moderated for safety, and shown only with their permission."/><PublicReviewsSection limit={48}/></PublicShell>}
