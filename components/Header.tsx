import DashboardHeaderBar from "@/components/dashboard/DashboardHeaderBar";

export default function Header({
  email,
  fullName,
  role,
  balance,
}: {
  email: string;
  fullName: string;
  role: string;
  balance: number;
}) {
  const name = fullName || email.split("@")[0] || "Client";
  const initials = name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return <DashboardHeaderBar name={name} role={role || "user"} initials={initials} balance={balance} />;
}
