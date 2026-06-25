import Link from "next/link";

export function PageHeader({ title, description, action, variant = "light" }: { title: string; description: string; action?: React.ReactNode; variant?: "light" | "dark" }) {
  return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className={`text-2xl font-bold tracking-tight ${variant === "dark" ? "text-white" : "text-slate-900"}`}>{title}</h1><p className={`mt-1.5 text-sm ${variant === "dark" ? "text-slate-300" : "text-slate-500"}`}>{description}</p></div>{action}</div>;
}

export type Status = "Pending" | "Processing" | "Completed" | "Partial" | "Cancelled" | "Open" | "Answered" | "Closed";

const badgeStyles: Record<Status, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-600/10",
  Processing: "bg-blue-50 text-blue-700 ring-blue-600/10",
  Completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  Partial: "bg-violet-50 text-violet-700 ring-violet-600/10",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-600/10",
  Open: "bg-blue-50 text-blue-700 ring-blue-600/10",
  Answered: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  Closed: "bg-slate-100 text-slate-600 ring-slate-600/10",
};

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${badgeStyles[status]}`}><i className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}

export function EmptyAction({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">{children}</Link>;
}

export function SectionTitle({ title, description, action, variant = "light" }: { title: string; description?: string; action?: React.ReactNode; variant?: "light" | "dark" }) {
  return <div className={`flex items-center justify-between border-b ${variant === "dark" ? "border-slate-700" : "border-slate-100"} px-5 py-4 sm:px-6`}><div><h2 className={`text-sm font-bold ${variant === "dark" ? "text-white" : "text-slate-800"}`}>{title}</h2>{description && <p className={`mt-1 text-xs ${variant === "dark" ? "text-slate-400" : "text-slate-400"}`}>{description}</p>}</div>{action}</div>;
}
