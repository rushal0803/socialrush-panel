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
        src="/logo.svg"
        alt="SocialRUSH Logo"
        width={48}
        height={48}
        priority={priority}
        className="h-full w-full scale-[2.35] object-contain"
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
    <Link href="/" aria-label="SocialRUSH home" className={`inline-flex min-w-0 shrink-0 items-center gap-2 sm:gap-3 ${className}`}>
      <BrandMark priority={priority} />
      <span className={`${compactOnMobile ? "text-base min-[360px]:text-lg" : "text-lg"} whitespace-nowrap font-extrabold tracking-tight sm:text-xl md:text-2xl`}>
        <span className={light ? "text-white" : "text-slate-950"}>Social</span>
        <span className={light ? "text-yellow-400" : "text-yellow-500"}>RUSH</span>
      </span>
    </Link>
  );
}
