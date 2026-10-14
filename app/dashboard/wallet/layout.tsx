import type { ReactNode } from "react";
import PaymentConfidenceExperience from "@/components/wallet/PaymentConfidenceExperience";

export default function WalletLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <PaymentConfidenceExperience mode="wallet" />
    </>
  );
}
