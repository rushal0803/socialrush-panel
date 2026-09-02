import CrmSubnav from "@/components/admin/CrmSubnav";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <><CrmSubnav />{children}</>;
}
