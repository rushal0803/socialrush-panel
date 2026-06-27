type PlatformIconProps = {
  platform: string;
  className?: string;
  title?: string;
};

function normalizePlatform(value: string) {
  const platform = value.toLowerCase();
  if (platform.includes("instagram")) return "instagram";
  if (platform.includes("youtube")) return "youtube";
  if (platform.includes("facebook")) return "facebook";
  if (platform.includes("linkedin")) return "linkedin";
  if (platform.includes("telegram")) return "telegram";
  if (platform.includes("tiktok")) return "tiktok";
  if (platform === "x" || platform.includes("twitter")) return "x";
  return "generic";
}

export default function PlatformIcon({ platform, className = "h-5 w-5", title }: PlatformIconProps) {
  const normalized = normalizePlatform(platform);
  const accessibleTitle = title ?? platform;

  if (normalized === "instagram") {
    return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-label={accessibleTitle} role="img"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.7" r="1" fill="currentColor" stroke="none" /></svg>;
  }
  if (normalized === "youtube") {
    return <svg viewBox="0 0 24 24" className={className} fill="none" aria-label={accessibleTitle} role="img"><path d="M21.2 7.1a2.8 2.8 0 0 0-2-2C17.4 4.6 12 4.6 12 4.6s-5.4 0-7.2.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2.3 12a29 29 0 0 0 .5 4.9 2.8 2.8 0 0 0 2 2c1.8.5 7.2.5 7.2.5s5.4 0 7.2-.5a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .5-4.9 29 29 0 0 0-.5-4.9Z" fill="currentColor" /><path d="m10 15.4 5.2-3.4L10 8.6v6.8Z" fill="white" /></svg>;
  }
  if (normalized === "facebook") {
    return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label={accessibleTitle} role="img"><path d="M14.3 22v-8h2.8l.4-3.2h-3.2V8.7c0-.9.3-1.6 1.7-1.6h1.8V4.2c-.3 0-1.4-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5v2.3H8V14h2.8v8h3.5Z" /></svg>;
  }
  if (normalized === "linkedin") {
    return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label={accessibleTitle} role="img"><rect x="3" y="9" width="4" height="12" rx="1" /><circle cx="5" cy="5" r="2.2" /><path d="M10 9h4v1.7c1-1.3 2.3-2.1 4.1-2.1 3 0 3.9 2 3.9 5.3V21h-4v-6.2c0-1.5-.3-2.7-1.9-2.7-1.8 0-2.1 1.4-2.1 3.2V21h-4V9Z" /></svg>;
  }
  if (normalized === "telegram") {
    return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label={accessibleTitle} role="img"><path d="M21.7 3.7 18.5 20c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9-8.1c.4-.4-.1-.6-.6-.2L6.1 13.8l-4.8-1.5c-1-.3-1.1-1 .2-1.5L20.2 3.6c.9-.3 1.7.2 1.5.1Z" /></svg>;
  }
  if (normalized === "tiktok") {
    return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label={accessibleTitle} role="img"><path d="M15.2 3c.3 2.3 1.6 3.8 3.8 4.2v3.3a9 9 0 0 1-3.8-1.1v6.2a5.8 5.8 0 1 1-5-5.7v3.4a2.5 2.5 0 1 0 1.7 2.3V3h3.3Z" /></svg>;
  }
  if (normalized === "x") {
    return <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-label={accessibleTitle} role="img"><path d="M4 3h4.7l4.1 5.8L17.8 3H20l-6.2 7.5L21 21h-4.7l-4.7-6.6L6.2 21H4l6.6-8.3L4 3Zm3.6 1.8 9.6 14.4h1.9L9.5 4.8H7.6Z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-label={accessibleTitle} role="img"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>;
}
