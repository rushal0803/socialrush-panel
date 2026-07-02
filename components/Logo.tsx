import Image from "next/image";
import Link from "next/link";

export function BrandMark({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={`relative h-8 w-8 shrink-0 overflow-hidden sm:h-9 sm:w-9 md:h-11 md:w-11 ${className}`}>
      <Image
        src="/brand/socialrush-icon.png"
        alt="SocialRUSH logo"
        width={48}
        height={48}
        priority={priority}
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export default function Logo({
  light = false,
  compactOnMobile = false,
  priority = false,
  className = "",
}: {
  light?: boolean;
  compactOnMobile?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="SocialRUSH home"
      className={`inline-flex min-w-0 shrink-0 items-center ${light ? "rounded-lg bg-white/95 px-1 py-0.5" : ""} ${className}`}
    >
      <Image
        src="/brand/socialrush-logo.png"
        alt="SocialRUSH logo"
        width={320}
        height={160}
        priority={priority}
        className={`${compactOnMobile ? "h-8 min-[360px]:h-9" : "h-9"} w-auto max-w-[108px] object-contain sm:h-10 sm:max-w-[126px] md:h-12 md:max-w-[148px]`}
      />
    </Link>
  );
}
