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
    <main className={tone === "light3d" ? "public-dark min-h-screen bg-[#050505] text-white" : "public-dark min-h-screen bg-[#050505] text-white"}>
      <MarketingHeader tone={tone} />
      {children}
      <MarketingFooter tone={tone} />
    </main>
  );
}
