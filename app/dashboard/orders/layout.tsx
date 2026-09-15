import type { ReactNode } from "react";
import OrderTrackingExperience from "@/components/dashboard/orders/OrderTrackingExperience";

export default function OrdersLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <OrderTrackingExperience>{children}</OrderTrackingExperience>;
}
