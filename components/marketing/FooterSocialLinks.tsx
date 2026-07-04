import PlatformIcon from "@/components/PlatformIcon";

const socialLinks = [
  {
    label: "Instagram",
    platform: "instagram",
    href: "https://www.instagram.com/getsocialrush?igsh=bTBuNmNlNjkyd3Qw",
  },
  {
    label: "Facebook",
    platform: "facebook",
    href: "https://www.facebook.com/share/18VDDFqWzY/",
  },
] as const;

export default function FooterSocialLinks() {
  return (
    <div className="mt-6">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white">
        Follow SocialRUSH
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow SocialRUSH on ${social.label}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-400/25 bg-orange-500/10 px-3.5 py-2 text-xs font-bold text-orange-100 transition hover:-translate-y-0.5 hover:border-orange-400/60 hover:bg-orange-500/20 hover:text-white"
          >
            <PlatformIcon
              platform={social.platform}
              className="h-4 w-4 text-orange-400"
            />
            {social.label}
          </a>
        ))}
      </div>
    </div>
  );
}
