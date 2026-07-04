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
        src="/images/brand/socialrush-icon-black.png"
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
      data-on-dark={light || undefined}
      className={`inline-flex min-w-0 shrink-0 items-center bg-transparent ${className}`}
    >
      <Image
        src="/images/brand/socialrush-logo-transparent.png"
        alt="SocialRUSH logo"
        width={320}
        height={160}
        priority={priority}
        className="h-9 w-auto max-w-[176px] object-contain sm:h-10 md:h-12"
      />
    </Link>
  );
}
