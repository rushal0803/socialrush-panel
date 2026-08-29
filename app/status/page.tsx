import type { Metadata } from "next";
import StatusContent from "./status-content";

export const metadata: Metadata = {
  title: "Service Status | SocialRUSH",
  description: "Current availability notices for SocialRUSH services.",
};

export default function StatusPage() {
  return <StatusContent />;
}
