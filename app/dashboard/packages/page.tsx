import PackagesPageContent from "@/components/marketing/packages/PackagesPageContent";

type DashboardPackagesPageProps = {
  searchParams?: Promise<{
    platform?: string;
    service?: string;
    package?: string;
    packageId?: string;
  }>;
};

export default async function DashboardPackagesPage({ searchParams: searchParamsPromise }: DashboardPackagesPageProps) {
  const searchParams = searchParamsPromise ? await searchParamsPromise : undefined;
  return (
    <div className="min-w-0 overflow-x-clip [&>main>footer]:hidden [&>main>header]:hidden [&>main]:min-h-[calc(100vh-5rem)]">
      <PackagesPageContent
        initialPlatformParam={searchParams?.platform}
        initialServiceParam={searchParams?.service}
        initialPackageIdParam={searchParams?.package ?? searchParams?.packageId}
      />
    </div>
  );
}
