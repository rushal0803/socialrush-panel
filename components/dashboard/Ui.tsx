import Link from "next/link";

export function PageHeader({ title, description, action, variant = "light" }: { title: string; description: string; action?: React.ReactNode; variant?: "light" | "dark" }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className={`text-2xl font-black tracking-tight ${variant === "dark" ? "text-[#FFF8F1]" : "text-[#0B0B0F]"}`}>{title}</h1>
        <p className={`mt-1.5 text-sm ${variant === "dark" ? "text-[#FF9F00]" : "text-[#111827]"}`}>{description}</p>
      </div>
      {action}
    </div>
  );
}

export type Status = "Pending" | "Processing" | "Completed" | "Partial" | "Cancelled" | "Open" | "Answered" | "Closed";

const badgeStyles: Record<Status, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/10",
  Processing: "bg-orange-50 text-orange-700 ring-orange-600/10",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  Partial: "bg-amber-50 text-amber-700 ring-amber-600/10",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-600/10",
  Open: "bg-orange-50 text-orange-700 ring-orange-600/10",
  Answered: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  Closed: "bg-slate-100 text-slate-600 ring-slate-600/10",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${badgeStyles[status]}`}>
      <i className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function EmptyAction({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn-dashboard-primary inline-flex items-center justify-center px-4 py-3 text-sm font-semibold">
      {children}
    </Link>
  );
}

export function SectionTitle({ title, description, action, variant = "light" }: { title: string; description?: string; action?: React.ReactNode; variant?: "light" | "dark" }) {
  return (
    <div className={`flex items-center justify-between border-b ${variant === "dark" ? "border-[#0B0B0F]" : "border-[#FFF8F1]"} px-5 py-4 sm:px-6`}>
      <div>
        <h2 className={`text-sm font-bold ${variant === "dark" ? "text-[#FFF8F1]" : "text-[#0B0B0F]"}`}>{title}</h2>
        {description && <p className={`mt-1 text-xs ${variant === "dark" ? "text-[#FF9F00]" : "text-[#111827]"}`}>{description}</p>}
      </div>
      {action}
    </div>
  );
}
