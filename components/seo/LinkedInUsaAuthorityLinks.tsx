import Link from "next/link";

const links = [
  ["LinkedIn USA Followers", "/services/linkedin-usa-followers"],
  ["LinkedIn USA Connections", "/services/linkedin-usa-connections"],
  ["LinkedIn USA Post Likes", "/services/linkedin-usa-post-likes"],
  ["LinkedIn USA Group Members", "/services/linkedin-usa-group-members"],
  ["LinkedIn USA Custom Comments", "/services/linkedin-usa-custom-comments"],
  ["LinkedIn USA Reposts", "/services/linkedin-usa-reposts"],
  ["LinkedIn USA Endorsements", "/services/linkedin-usa-endorsements"],
  ["LinkedIn Services", "/services/linkedin"],
] as const;

export default function LinkedInUsaAuthorityLinks() {
  return (
    <section className="px-5 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-orange-500">
          LinkedIn USA service cluster
        </p>
        <h2 className="mt-3 text-3xl font-black text-[#0B0B0F]">
          Explore related LinkedIn USA services
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#374151]">
          Compare USA-targeted LinkedIn audience and engagement services before choosing the option that matches your campaign.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-14 items-center justify-between rounded-2xl border border-[#FFE7C2] bg-white px-4 py-3 text-sm font-bold text-[#0B0B0F] transition hover:border-orange-400"
            >
              <span>{label}</span>
              <span className="text-orange-500">→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
