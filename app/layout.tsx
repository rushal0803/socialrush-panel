import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AIChatbot from "@/components/AIChatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "SocialRUSH Panel",
    template: "%s | SocialRUSH",
  },
  description: "Manage social media growth campaigns, brand visibility, content reach, and marketing automation from one professional workspace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}<AIChatbot/></body>
    </html>
  );
}
