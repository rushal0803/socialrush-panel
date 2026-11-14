import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Password recovery",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function RecoveryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
