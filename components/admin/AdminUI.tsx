export function AdminPageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#0B0B0F]">{title}</h1>
        <p className="mt-1.5 text-sm text-[#111827]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminStatus({ value }: { value: string }) {
  const styles: Record<string, string> = { active: "bg-emerald-50 text-emerald-700", admin: "bg-amber-50 text-amber-700", blocked: "bg-red-50 text-red-700", inactive: "bg-slate-100 text-slate-600", pending: "bg-amber-50 text-amber-700", processing: "bg-orange-50 text-orange-700", in_progress: "bg-amber-50 text-amber-700", completed: "bg-emerald-50 text-emerald-700", paid: "bg-emerald-50 text-emerald-700", partial: "bg-amber-50 text-amber-700", cancelled: "bg-slate-100 text-slate-600", refunded: "bg-amber-50 text-amber-700", failed: "bg-red-50 text-red-700", refill_requested: "bg-orange-50 text-orange-700", refilling: "bg-orange-50 text-orange-700", open: "bg-orange-50 text-orange-700", answered: "bg-emerald-50 text-emerald-700", solved: "bg-emerald-50 text-emerald-700", closed: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${styles[value] || "bg-slate-100 text-slate-600"}`}>
      <i className="h-1.5 w-1.5 rounded-full bg-current" />
      {value.replaceAll("_", " ")}
    </span>
  );
}

export function Modal({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary className="btn-dashboard-primary cursor-pointer list-none px-4 py-3 text-sm font-semibold">{label}</summary>
      <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-4">
        <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/80 bg-white p-4 shadow-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-[#0B0B0F]">{title}</h2>
            <span className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg bg-slate-100 text-slate-500">x</span>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </details>
  );
}

export const inputClass = "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-xs text-slate-700 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10";
export const primaryButton = "btn-dashboard-primary rounded-xl px-4 py-3 text-xs font-bold";
