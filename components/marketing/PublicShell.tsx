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
    <div className="public-dark sr-page relative isolate min-h-screen overflow-x-clip bg-surface-page text-content-primary">
      <a
        href="#main-content"
        className="sr-only z-[100000] rounded-sr-control bg-sr-brand px-4 py-3 font-bold text-white shadow-sr-button focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_50%_-12%,rgba(255,118,0,0.12),transparent_58%)]"
      />

      <MarketingHeader tone={tone} />
      <main id="main-content" className="relative min-h-[55vh]">
        {children}
      </main>
      <div className="content-auto">
        <MarketingFooter tone={tone} />
      </div>
    </div>
  );
}
