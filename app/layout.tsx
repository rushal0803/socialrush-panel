import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AIChatbot from "@/components/AIChatbot";
import ClientProviders from "@/components/providers/ClientProviders";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://socialrush.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SocialRUSH | Social Media Growth Platform",
    template: "%s | SocialRUSH",
  },
  description: "Order and track premium social media growth services for Instagram, YouTube, Facebook, LinkedIn, TikTok, and Twitter/X.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "SocialRUSH",
    title: "SocialRUSH | Social Media Growth Platform",
    description: "Order and track premium social media growth services with secure checkout, campaign tracking, and customer support.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialRUSH | Social Media Growth Platform",
    description: "Order and track premium social media growth services with secure checkout, campaign tracking, and customer support.",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-clip bg-white text-slate-950`}>
        <ClientProviders>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "SocialRUSH",
                url: siteUrl,
                logo: new URL("/images/logo.png", siteUrl).toString(),
                sameAs: [process.env.NEXT_PUBLIC_WHATSAPP_URL?.trim() || "https://wa.me/918860330771"],
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
                potentialAction: {
                  "@type": "SearchAction",
                  target: `${siteUrl}/services?query={search_term_string}`,
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
          {children}
          <AIChatbot />
        </ClientProviders>
      </body>
    </html>
  );
}
