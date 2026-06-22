import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AIChatbot from "@/components/AIChatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "SocialRUSH | Social Media Growth Platform",
    template: "%s | SocialRUSH",
  },
  description: "Order and track premium social media growth services for Instagram, YouTube, Facebook, LinkedIn, TikTok, and Twitter/X.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}<AIChatbot/></body>
    </html>
  );
}
