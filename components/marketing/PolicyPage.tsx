import PublicShell from "./PublicShell";
import LegalPageLayout from "./LegalPageLayout";

export type PolicySection = { title: string; body: string[]; bullets?: string[] };

export default function PolicyPage({
  title,
  subtitle,
  badge = "SocialRUSH policy center",
  breadcrumbLabel,
  tone = "default",
  sections,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  breadcrumbLabel?: string;
  tone?: "default" | "light3d";
  sections: PolicySection[];
}) {
  const tableOfContentsItems = sections.map((section, index) => ({
    id: `section-${index + 1}`,
    label: section.title,
  }));

  return (
    <PublicShell tone={tone}>
      <LegalPageLayout
        title={title}
        subtitle={subtitle}
        badge={badge}
        breadcrumbLabel={breadcrumbLabel ?? title}
        tableOfContentsItems={tableOfContentsItems}
        sections={sections}
      />
    </PublicShell>
  );
}
