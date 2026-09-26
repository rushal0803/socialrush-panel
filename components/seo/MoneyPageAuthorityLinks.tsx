import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Platform = "instagram" | "youtube" | "facebook" | "linkedin" | "tiktok" | "twitter" | "telegram";

const groups = {
  instagram: {
    eyebrow: "Instagram topic cluster",
    title: "Explore related Instagram growth services",
    intro: "Compare the service that matches your actual campaign goal, then use the Instagram growth hub for broader planning.",
    links: [
      ["Instagram Growth India", "/instagram-growth-india"], ["Instagram Followers", "/buy-instagram-followers-india"], ["Instagram Likes", "/instagram-likes"], ["Instagram Views", "/instagram-views"], ["Instagram Comments", "/buy-instagram-comments-india"], ["Instagram Saves", "/buy-instagram-saves-india"], ["Instagram Shares", "/buy-instagram-shares-india"], ["Instagram Engagement Calculator", "/tools/instagram-engagement-rate-calculator"],
    ],
  },
  facebook: {
    eyebrow: "Facebook topic cluster",
    title: "Explore related Facebook growth services",
    intro: "Compare audience growth, post engagement, video visibility and community-growth options that are currently represented by dedicated SocialRUSH Facebook pages.",
    links: [
      ["Facebook Growth India", "/facebook-growth-india"],
      ["Facebook Followers", "/buy-facebook-followers-india"],
      ["Facebook Likes", "/facebook-likes"],
      ["Facebook Views", "/facebook-views"],
      ["Facebook Group Members", "/buy-facebook-group-members-india"],
      ["All Facebook Services", "/services?platform=facebook"],
      ["For Brands", "/for-brands"],
      ["Creator Growth", "/creator-growth"],
    ],
  },
  linkedin: {
    eyebrow: "LinkedIn topic cluster", title: "Explore related LinkedIn growth services", intro: "Compare profile growth, post engagement and professional-audience services before choosing the option that fits your LinkedIn campaign.",
    links: [["LinkedIn Growth India", "/linkedin-growth-india"], ["LinkedIn Followers", "/linkedin-followers"], ["LinkedIn Likes", "/linkedin-likes"], ["LinkedIn Services", "/services/linkedin"], ["LinkedIn USA Followers", "/services/linkedin-usa-followers"], ["LinkedIn USA Connections", "/services/linkedin-usa-connections"], ["For Brands", "/for-brands"], ["For Agencies", "/for-agencies"]],
  },
  tiktok: {
    eyebrow: "TikTok topic cluster", title: "Explore related TikTok growth services", intro: "Compare follower growth, video engagement and content-interaction services from the TikTok growth hub.",
    links: [["TikTok Growth India", "/tiktok-growth-india"], ["TikTok Followers", "/tiktok-followers"], ["TikTok Likes", "/services/tiktok-likes"], ["TikTok Views", "/services/tiktok-views"], ["TikTok Comments", "/services/tiktok-custom-comments"], ["TikTok Saves", "/services/tiktok-saves"], ["TikTok Services", "/services/tiktok"], ["Creator Growth", "/creator-growth"]],
  },
  twitter: {
    eyebrow: "Twitter / X service cluster",
    title: "Compare Twitter (X) followers, likes, views and repost services",
    intro: "Choose the page that matches your search intent. Twitter followers are handled by the dedicated India follower page, while likes, views and retweets (now called reposts on X) each have their own service page.",
    links: [
      ["Buy Twitter Followers in India", "/twitter-followers"],
      ["Buy Twitter (X) Likes", "/services/twitter-likes"],
      ["Buy Twitter (X) Views", "/services/twitter-views"],
      ["Buy Twitter Retweets / X Reposts", "/services/twitter-retweets"],
      ["Twitter / X Growth Hub", "/x-growth-india"],
      ["All Twitter / X Services", "/services/twitter-x"],
      ["Twitter / X Crypto Followers", "/services/twitter-crypto-followers"],
      ["Twitter / X Crypto Engagement", "/services/twitter-crypto-likes"],
    ],
  },
  telegram: {
    eyebrow: "Telegram topic cluster", title: "Explore related Telegram growth services", intro: "Compare member growth, post visibility, reactions and poll activity from the Telegram service hub.",
    links: [["Telegram Services", "/services/telegram"], ["Telegram Members", "/telegram-members"], ["Telegram Post Views", "/services/telegram-post-views"], ["Telegram Reactions", "/services/telegram-post-reactions"], ["Telegram Poll Votes", "/services/telegram-poll-votes"], ["All Services", "/services"], ["For Brands", "/for-brands"], ["For Agencies", "/for-agencies"]],
  },
  youtube: {
    eyebrow: "YouTube topic cluster", title: "Explore related YouTube growth services", intro: "Compare channel growth, video visibility, engagement and watch-time options before choosing the service that fits your goal.",
    links: [["YouTube Growth India", "/youtube-growth-india"], ["YouTube Subscribers", "/youtube-subscribers"], ["YouTube Views", "/youtube-views"], ["YouTube Likes", "/youtube-likes"], ["YouTube Comments", "/buy-youtube-comments-india"], ["YouTube Watch Hours", "/youtube-watch-hours"], ["YouTube Engagement Calculator", "/tools/youtube-engagement-rate-calculator"], ["Creator Growth", "/creator-growth"]],
  },
} as const;

export default function MoneyPageAuthorityLinks({ platform }: { platform: Platform }) {
  const group = groups[platform];
  return (
    <section className="border-y border-white/10 bg-[#0d0f13] px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-300">{group.eyebrow}</p>
        <h2 className="mt-3 text-2xl font-black sm:text-3xl">{group.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{group.intro}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {group.links.map(([label, href]) => (
            <Link key={href} href={href} className="group flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm font-bold transition hover:border-orange-400/40 hover:bg-white/[.06]">
              <span>{label}</span><ArrowRight className="h-4 w-4 shrink-0 text-orange-300 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
