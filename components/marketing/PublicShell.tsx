import MarketingHeader from "./MarketingHeader";
import MarketingFooter from "./MarketingFooter";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-white text-slate-900"><MarketingHeader/>{children}<MarketingFooter/></main>;
}
