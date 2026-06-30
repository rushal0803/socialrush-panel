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
      <body className="overflow-x-clip bg-white text-slate-950">
        <ClientProviders>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "SocialRUSH",
                url: siteUrl,
                logo: new URL("/logo.svg", siteUrl).toString(),
                sameAs: ["https://wa.me/918860330771"],
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
