import MarketingHeader from "./MarketingHeader";
import MarketingFooter from "./MarketingFooter";

export default function PublicShell({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "light3d";
}) {
  return (
    <main className={tone === "light3d" ? "min-h-screen bg-[#FFF8F1] text-[#0B0B0F]" : "min-h-screen bg-brand-navy text-slate-100"}>
      <MarketingHeader tone={tone} />
      {children}
      <MarketingFooter tone={tone} />
    </main>
  );
}
