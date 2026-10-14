import type { ReactNode } from "react";
import PaymentConfidenceExperience from "@/components/wallet/PaymentConfidenceExperience";

export default function AddFundsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <PaymentConfidenceExperience mode="add-funds" />
    </>
  );
}
