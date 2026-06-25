import MarketingHeader from "./MarketingHeader";
import MarketingFooter from "./MarketingFooter";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-brand-navy text-slate-100"><MarketingHeader/>{children}<MarketingFooter/></main>;
}
