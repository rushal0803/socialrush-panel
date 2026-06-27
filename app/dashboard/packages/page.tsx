import PackagesPageContent from "@/components/marketing/packages/PackagesPageContent";

export default function DashboardPackagesPage() {
  return (
    <div className="min-w-0 overflow-x-clip [&>main>footer]:hidden [&>main>header]:hidden [&>main]:min-h-[calc(100vh-5rem)]">
      <PackagesPageContent />
    </div>
  );
}
