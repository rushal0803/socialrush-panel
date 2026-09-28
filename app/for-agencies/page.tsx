import AudienceLandingPage from "@/components/marketing/audiences/AudienceLandingPage";
import AgencyResellerIntentSection from "@/components/marketing/audiences/AgencyResellerIntentSection";
import BulkSmmIndiaAuthority from "@/components/marketing/audiences/BulkSmmIndiaAuthority";
import SmmApiIndiaAuthority from "@/components/marketing/audiences/SmmApiIndiaAuthority";
import BulkLeadEngine from "@/components/marketing/BulkLeadEngine";
import BreadcrumbJsonLd from "@/components/seo/BreadcrumbJsonLd";
import { audiencePages } from "@/lib/marketing/audience-pages";
import { createPageMetadata, SEO_SITE_URL } from "@/lib/seo/metadata";
import { agencyResellerFaqs, agencyResellerIntentKeywords } from "@/lib/seo/agency-reseller-intent";
import { smmApiFaqs, smmApiIndiaKeywords } from "@/lib/seo/smm-api-intent";
import { bulkSmmFaqs, bulkSmmIndiaKeywords } from "@/lib/seo/bulk-smm-intent";
const config=audiencePages.agencies;
export const metadata=createPageMetadata({title:"Social Media Growth Platform for Agencies India | SocialRUSH",description:"Agency-focused social media growth workspace in India with multi-client campaign planning, bulk workflows, monthly planning, API access and tracked orders.",path:"/for-agencies",keywords:[...agencyResellerIntentKeywords,...smmApiIndiaKeywords,...bulkSmmIndiaKeywords]});
const jsonLd=(value:object)=>JSON.stringify(value).replace(/</g,"\\u003c");
export default function ForAgenciesPage(){const combinedFaqs=[...config.faqs,...agencyResellerFaqs(),...smmApiFaqs(),...bulkSmmFaqs()];const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:combinedFaqs.map(faq=>({"@type":"Question",name:faq.question,acceptedAnswer:{"@type":"Answer",text:faq.answer}}))};const discoverySchema={"@context":"https://schema.org","@type":"ItemList",name:"SocialRUSH agency growth workflow",itemListElement:[["Qualified Bulk / Agency Enquiry","/for-agencies#bulk-lead-engine"],["Agency Operations Workspace","/dashboard/reseller"],["Bulk Job Planner","/dashboard/reseller/bulk-planner"],["Campaign Stacks","/dashboard/campaign-stacks"],["Developer API Documentation","/dashboard/api-docs"],["Agency Support","/contact#support-form"]].map(([name,path],index)=>({"@type":"ListItem",position:index+1,name,url:`${SEO_SITE_URL}${path}`}))};return <><BreadcrumbJsonLd items={[{name:"Home",path:"/"},{name:"For Agencies",path:"/for-agencies"}]}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(faqSchema)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(discoverySchema)}}/><AudienceLandingPage config={config}/><AgencyResellerIntentSection/><BulkSmmIndiaAuthority/><SmmApiIndiaAuthority/><BulkLeadEngine/></>}
