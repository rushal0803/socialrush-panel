import type { Metadata } from "next";
import "./globals.css";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import ClientProviders from "@/components/providers/ClientProviders";
import { SEO_SITE_URL } from "@/lib/seo/metadata";

const siteUrl = SEO_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Social Media Growth Services India | SocialRUSH",
    template: "%s | SocialRUSH",
  },
  description:
    "SocialRUSH provides social media growth services in India for Instagram, YouTube, Facebook, LinkedIn, TikTok and Twitter/X.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon-48x48.png",
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SocialRUSH",
    title: "Social Media Growth Services India | SocialRUSH",
    description:
      "SocialRUSH provides social media growth services in India for Instagram, YouTube, Facebook, LinkedIn, TikTok and Twitter/X.",
    url: "/",
    images: [
      {
        url: "/images/hero-3d.png",
        width: 1448,
        height: 1086,
        alt: "SocialRUSH social media growth services dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Media Growth Services India | SocialRUSH",
    description:
      "SocialRUSH provides social media growth services in India for Instagram, YouTube, Facebook, LinkedIn, TikTok and Twitter/X.",
    images: ["/images/hero-3d.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body className="overflow-x-clip bg-[#050505] text-white">
        <ClientProviders>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "SocialRUSH",
                url: siteUrl,
                logo: new URL("/images/brand/socialrush-logo-transparent.png", siteUrl).toString(),
                sameAs: [
                  "https://www.instagram.com/getsocialrush?igsh=bTBuNmNlNjkyd3Qw",
                  "https://www.facebook.com/share/18VDDFqWzY/",
                ],
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+91-88603-30771",
                  contactType: "customer support",
                  areaServed: "IN",
                  availableLanguage: ["English", "Hindi"],
                },
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "SocialRUSH",
                url: siteUrl,
              }),
            }}
          />
          {children}
          <FloatingWhatsAppButton />
        </ClientProviders>
      </body>
    </html>
  );
}
