import {
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaTelegramPlane,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { IconType } from "react-icons";

type PlatformIconProps = {
  platform: string;
  className?: string;
  title?: string;
};

function normalizePlatform(value: string) {
  const key = value.toLowerCase().replace(/\s+/g, "");
  if (
    key === "x" ||
    key.includes("twitter") ||
    key.includes("twitter/x") ||
    key.includes("twitter-x")
  ) return "x";
  if (key.includes("instagram")) return "instagram";
  if (key.includes("youtube")) return "youtube";
  if (key.includes("facebook")) return "facebook";
  if (key.includes("linkedin")) return "linkedin";
  if (key.includes("telegram")) return "telegram";
  if (key.includes("tiktok")) return "tiktok";
  return "generic";
}

const platformIcons: Record<ReturnType<typeof normalizePlatform>, IconType> = {
  instagram: FaInstagram,
  youtube: FaYoutube,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  telegram: FaTelegramPlane,
  tiktok: FaTiktok,
  x: FaXTwitter,
  generic: FaGlobe,
};

export default function PlatformIcon({
  platform,
  className = "h-5 w-5",
  title,
}: PlatformIconProps) {
  const normalized = normalizePlatform(platform);
  const Icon = platformIcons[normalized];
  return (
    <Icon
      className={`shrink-0 text-current ${className}`}
      role="img"
      aria-label={title ?? platform}
      focusable="false"
    />
  );
}
