import PackagesPageContent from "@/components/marketing/packages/PackagesPageContent";

type DashboardPackagesPageProps = {
  searchParams?: {
    platform?: string;
    service?: string;
    package?: string;
    packageId?: string;
  };
};

export default function DashboardPackagesPage({ searchParams }: DashboardPackagesPageProps) {
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
