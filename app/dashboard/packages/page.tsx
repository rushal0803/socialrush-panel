import PremiumPackagesPageContent from "@/components/marketing/packages/PremiumPackagesPageContent";
import { getLivePackageGroups } from "@/lib/package-catalog.server";

export default async function DashboardPackagesPage({ searchParams }: { searchParams: Promise<{ platform?: string; service?: string; package?: string }> }) {
  const [groups, params] = await Promise.all([getLivePackageGroups(), searchParams]);
  return <PremiumPackagesPageContent variant="dashboard" initialGroups={groups} initialPlatformParam={params.platform} initialServiceParam={params.service} initialPackageIdParam={params.package} />;
}
