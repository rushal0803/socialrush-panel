import type { ReactNode } from "react";
import ProfessionalUpiCheckout from "@/components/dashboard/ProfessionalUpiCheckout";

// Only the order-review route needs the legacy UPI overlay client bundle.
export default function OrderSummaryLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <><ProfessionalUpiCheckout />{children}</>;
}
