export function AdminPageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[#D1D5DB]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminStatus({ value }: { value: string }) {
  const styles: Record<string, string> = { active: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300", admin: "border-amber-400/25 bg-amber-500/10 text-amber-300", blocked: "border-red-400/25 bg-red-500/10 text-red-300", inactive: "border-white/10 bg-white/5 text-[#9CA3AF]", pending: "border-amber-400/25 bg-amber-500/10 text-amber-300", processing: "border-orange-400/25 bg-orange-500/10 text-orange-300", in_progress: "border-amber-400/25 bg-amber-500/10 text-amber-300", completed: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300", paid: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300", partial: "border-amber-400/25 bg-amber-500/10 text-amber-300", cancelled: "border-white/10 bg-white/5 text-[#9CA3AF]", refunded: "border-red-400/25 bg-red-500/10 text-red-300", failed: "border-red-400/25 bg-red-500/10 text-red-300", refill_requested: "border-orange-400/25 bg-orange-500/10 text-orange-300", refilling: "border-orange-400/25 bg-orange-500/10 text-orange-300", open: "border-orange-400/25 bg-orange-500/10 text-orange-300", answered: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300", solved: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300", closed: "border-white/10 bg-white/5 text-[#9CA3AF]" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${styles[value] || "border-white/10 bg-white/5 text-[#9CA3AF]"}`}>
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
        <div className="max-h-[90dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-orange-400/30 bg-[#111111] p-4 text-[#D1D5DB] shadow-2xl sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">{title}</h2>
            <span className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg border border-white/10 bg-white/5 text-[#D1D5DB]">×</span>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </details>
  );
}

export const inputClass = "mt-2 w-full rounded-xl border border-orange-400/25 bg-[#0B0B0F] px-3.5 py-3 text-xs text-white outline-none transition placeholder:text-[#9CA3AF] focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15";
export const primaryButton = "btn-dashboard-primary rounded-xl px-4 py-3 text-xs font-bold";
