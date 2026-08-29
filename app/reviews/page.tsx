import PublicShell from "@/components/marketing/PublicShell";
import PageHero from "@/components/marketing/PageHero";
import PublicReviewsSection from "@/components/reviews/PublicReviewsSection";
import { createPageMetadata } from "@/lib/seo/metadata";
export const metadata=createPageMetadata({title:"Verified Customer Reviews",description:"Read moderated SocialRUSH customer reviews from completed orders and learn what buyers say about service quality, delivery, support and ordering.",path:"/reviews"});
export default function ReviewsPage(){return <PublicShell><PageHero eyebrow="Verified reviews" title="Feedback tied to completed customer orders." description="Every published review is submitted by an authenticated customer, moderated for safety, and shown only with their permission."/><PublicReviewsSection limit={48}/></PublicShell>}
