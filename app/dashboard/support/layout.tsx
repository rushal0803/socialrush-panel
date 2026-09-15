import type { ReactNode } from "react";
import SupportJourney from "@/components/support/SupportJourney";

export default function DashboardSupportLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SupportJourney variant="dashboard" />
      {children}
    </>
  );
}
