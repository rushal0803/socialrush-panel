import type { Metadata, Viewport } from "next";
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
      { url: "/favicon.ico" },
      { url: "/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
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
    title: "SocialRUSH | Social Media Growth Services for Creators & Brands",
    description:
      "SocialRUSH helps creators, brands and businesses manage social media growth campaigns with public-link ordering, secure checkout, transparent pricing, dashboard tracking and WhatsApp support.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SocialRUSH social media growth services for creators and brands",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialRUSH | Social Media Growth Services for Creators & Brands",
    description:
      "SocialRUSH helps creators, brands and businesses manage social media growth campaigns with public-link ordering, secure checkout, transparent pricing, dashboard tracking and WhatsApp support.",
    images: [`${siteUrl}/og-image.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
                "@id": new URL("/#organization", siteUrl).toString(),
                name: "SocialRUSH",
                url: siteUrl,
                logo: new URL("/images/brand/socialrush-logo.png", siteUrl).toString(),
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
                "@type": "LocalBusiness",
                "@id": new URL("/#localbusiness", siteUrl).toString(),
                name: "SocialRUSH",
                url: siteUrl,
                image: new URL("/og-image.png", siteUrl).toString(),
                logo: new URL("/images/brand/socialrush-logo.png", siteUrl).toString(),
                telephone: "+91-88603-30771",
                priceRange: "₹₹",
                areaServed: {
                  "@type": "Country",
                  name: "India",
                },
                sameAs: [
                  "https://www.instagram.com/getsocialrush?igsh=bTBuNmNlNjkyd3Qw",
                  "https://www.facebook.com/share/18VDDFqWzY/",
                ],
              }).replace(/</g, "\\u003c"),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "@id": new URL("/#website", siteUrl).toString(),
                name: "SocialRUSH",
                url: siteUrl,
                publisher: { "@id": new URL("/#organization", siteUrl).toString() },
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: new URL(
                      "/services?search={search_term_string}",
                      siteUrl,
                    ).toString(),
                  },
                  "query-input": "required name=search_term_string",
                },
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
