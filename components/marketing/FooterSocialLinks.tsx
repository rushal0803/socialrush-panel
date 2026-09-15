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
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-content-primary">
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
            className="inline-flex min-h-11 items-center gap-2 rounded-sr-control border border-sr-border bg-white/[.03] px-3.5 py-2 text-xs font-bold text-content-secondary outline-none transition duration-normal ease-sr-out hover:-translate-y-0.5 hover:border-action/30 hover:bg-action/[.08] hover:text-white focus-visible:shadow-sr-focus motion-reduce:transform-none"
          >
            <PlatformIcon platform={social.platform} className="h-4 w-4 text-orange-300" />
            {social.label}
          </a>
        ))}
      </div>
    </div>
  );
}
