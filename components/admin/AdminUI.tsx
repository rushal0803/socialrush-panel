import { adminStatusLabel, adminStatusTone } from "@/lib/admin/status";
export { default as Modal } from "./AdminModal";

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
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${adminStatusTone(value)}`}>
      <i className="h-1.5 w-1.5 rounded-full bg-current" />
      {adminStatusLabel(value)}
    </span>
  );
}

export const inputClass = "admin-input mt-2 w-full rounded-xl px-3.5 py-3 text-xs outline-none transition placeholder:text-[#747B89]";
export const primaryButton = "btn-dashboard-primary rounded-xl px-4 py-3 text-xs font-bold";
