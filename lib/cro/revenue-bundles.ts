import type { SmmPlatformId, SmmService } from "@/lib/smm-service-catalog";

export type RevenueBundle = { id:string; name:string; eyebrow:string; description:string; platform:SmmPlatformId; serviceCodes:string[]; recommendedQuantity:number };

const BUNDLES: RevenueBundle[] = [
  { id:"instagram-growth-stack",name:"Instagram Growth Stack",eyebrow:"Build a fuller campaign",description:"Pair follower growth with visible post engagement instead of relying on one signal alone.",platform:"instagram",serviceCodes:["instagram-followers","instagram-likes","instagram-views"],recommendedQuantity:5000 },
  { id:"youtube-growth-stack",name:"YouTube Growth Stack",eyebrow:"Grow channel + content",description:"Combine channel growth with video activity using services that are currently available.",platform:"youtube",serviceCodes:["youtube-subscribers","youtube-views","youtube-likes"],recommendedQuantity:5000 },
  { id:"linkedin-authority-stack",name:"LinkedIn Authority Stack",eyebrow:"Professional visibility",description:"Build a broader LinkedIn campaign with follower and engagement services where available.",platform:"linkedin",serviceCodes:["linkedin-followers","linkedin-likes","linkedin-usa-followers"],recommendedQuantity:5000 },
  { id:"x-growth-stack",name:"X Growth Stack",eyebrow:"Profile + post activity",description:"Combine profile growth with public post engagement using current live services.",platform:"x",serviceCodes:["x-followers","twitter-likes","twitter-views","twitter-retweets"],recommendedQuantity:5000 },
  { id:"tiktok-growth-stack",name:"TikTok Growth Stack",eyebrow:"Audience + video reach",description:"Build a campaign around follower growth and video engagement using eligible live services.",platform:"tiktok",serviceCodes:["tiktok-followers","tiktok-likes","tiktok-views"],recommendedQuantity:5000 },
  { id:"telegram-engagement-stack",name:"Telegram Engagement Stack",eyebrow:"Post engagement",description:"Combine eligible Telegram post views, reactions and poll activity for a broader campaign.",platform:"telegram",serviceCodes:["telegram-post-views","telegram-post-reactions","telegram-poll-votes"],recommendedQuantity:5000 },
];

export function revenueBundlesForPlatform(platform:SmmPlatformId){ return BUNDLES.filter(bundle=>bundle.platform===platform); }

export function resolveRevenueBundle(bundle:RevenueBundle,services:SmmService[]){
 const available=bundle.serviceCodes.map(code=>services.find(service=>service.code===code)).filter((service):service is SmmService=>Boolean(service&&service.isActive&&!service.requiresLiveCatalogFacts&&service.pricePer1000>0));
 const items=available.map(service=>{const step=Math.max(1,service.quantityStep??1);const floor=Math.max(service.minQuantity,step);const ceiling=Math.min(service.maxQuantity,bundle.recommendedQuantity);const quantity=ceiling<floor?floor:Math.max(floor,Math.floor(ceiling/step)*step);return{service,quantity,total:(service.pricePer1000*quantity)/1000};});
 return{...bundle,items,total:items.reduce((sum,item)=>sum+item.total,0)};
}
