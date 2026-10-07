import PremiumPackagesPageContent from "@/components/marketing/packages/PremiumPackagesPageContent";
import { getLivePackageGroups } from "@/lib/package-catalog.server";

export default async function DashboardPackagesPage({ searchParams }: { searchParams?: { platform?: string; service?: string; package?: string } }) {
  const groups = await getLivePackageGroups();
  return <PremiumPackagesPageContent variant="dashboard" initialGroups={groups} initialPlatformParam={searchParams?.platform} initialServiceParam={searchParams?.service} initialPackageIdParam={searchParams?.package} />;
}
