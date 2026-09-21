import Link from "next/link";

const priorityLinks = [
  { href: "/buy-instagram-comments-india", label: "Instagram Comments India" },
  { href: "/buy-instagram-saves-india", label: "Instagram Saves India" },
  { href: "/buy-instagram-shares-india", label: "Instagram Shares India" },
  { href: "/buy-youtube-comments-india", label: "YouTube Comments India" },
  { href: "/buy-youtube-watch-hours-india", label: "YouTube Watch Hours India" },
  { href: "/buy-facebook-group-members-india", label: "Facebook Group Members India" },
  { href: "/buy-facebook-shares-india", label: "Facebook Shares India" },
  { href: "/us/buy-instagram-followers", label: "Instagram Followers · US" },
  { href: "/uk/buy-instagram-followers", label: "Instagram Followers · UK" },
  { href: "/ca/buy-instagram-followers", label: "Instagram Followers · Canada" },
  { href: "/au/buy-instagram-followers", label: "Instagram Followers · Australia" },
  { href: "/us/buy-youtube-subscribers", label: "YouTube Subscribers · US" },
  { href: "/uk/buy-youtube-subscribers", label: "YouTube Subscribers · UK" },
  { href: "/services/linkedin-usa-followers", label: "LinkedIn USA Followers" },
  { href: "/services/linkedin-usa-connections", label: "LinkedIn USA Connections" },
] as const;

export default function CrawlPriorityLinks() {
  return (
    <section aria-labelledby="priority-growth-links" className="border-y border-white/[.06] bg-[#090B10]">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-300">Explore more services</p>
          <h2 id="priority-growth-links" className="mt-2 text-xl font-black text-white sm:text-2xl">
            Popular growth services by goal and market
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#A8AFBD]">
            Browse focused service pages with current ordering requirements, delivery information and market-specific planning details.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {priorityLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-10 items-center rounded-full border border-orange-400/20 bg-orange-400/[.06] px-3.5 py-2 text-xs font-bold text-[#E5E7EB] transition hover:border-orange-400/50 hover:bg-orange-400/[.1] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
