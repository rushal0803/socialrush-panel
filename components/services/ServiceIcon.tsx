import type { GrowthService } from "@/lib/growth-services";

export default function ServiceIcon({ icon, className = "h-7 w-7" }: { icon: GrowthService["icon"]; className?: string }) {
  const paths = {
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></>,
    youtube: <><path d="M21 12s0-4-1-5-1-1-7-1-7-1-1 0-1 1-1 5-1 5 0 4 1 5 1 1 7 1 7 1s6 0 7-1c1-1 1-5 1-5Z"/><path d="m10 9 5 3-5 3Z"/></>,
    facebook: <path d="M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v6h4v-6h3l1-4h-4V9c0-.6.4-1 1-1Z"/>,
    linkedin: <><rect x="4" y="9" width="4" height="11"/><path d="M6 4v.01M12 20v-7a4 4 0 0 1 8 0v7M12 9v11"/></>,
    twitter: <path d="M4 4l16 16M20 4 4 20M9 4l11 16M4 4l11 16"/>,
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[icon]}</svg>;
}
