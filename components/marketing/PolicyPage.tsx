import PublicShell from "./PublicShell";
import PolicyPageContent from "./PolicyPageContent";

export type PolicySection = { title: string; body: string[]; bullets?: string[] };

export default function PolicyPage({ title, summary, sections }: { title: string; summary: string; sections: PolicySection[] }) {
  return (
    <PublicShell>
      <PolicyPageContent title={title} summary={summary} sections={sections} />
    </PublicShell>
  );
}
