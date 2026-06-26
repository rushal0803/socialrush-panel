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
    <main className={tone === "light3d" ? "min-h-screen bg-[#f4f9ff] text-[#17366f]" : "min-h-screen bg-brand-navy text-slate-100"}>
      <MarketingHeader tone={tone} />
      {children}
      <MarketingFooter tone={tone} />
    </main>
  );
}
