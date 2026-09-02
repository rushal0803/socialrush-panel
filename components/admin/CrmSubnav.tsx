"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin/crm", label: "Overview" },
  { href: "/admin/crm/customers", label: "Customers" },
  { href: "/admin/crm/follow-ups", label: "Follow-ups" },
  { href: "/admin/crm/automations", label: "Automations" },
  { href: "/admin/crm/leads", label: "Leads" },
  { href: "/admin/crm/outreach", label: "Outreach" },
  { href: "/admin/crm/replies", label: "Replies" },
];

export default function CrmSubnav() {
  const pathname = usePathname();
  return (
    <nav aria-label="CRM navigation" className="border-b border-white/10 bg-[#0d0d0f]/90 px-4 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-[1650px] gap-2 overflow-x-auto pb-0.5">
        {links.map((link) => { const active=link.href==="/admin/crm"?pathname===link.href:pathname.startsWith(link.href); return <Link key={link.href} href={link.href} aria-current={active?"page":undefined} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-400 ${active?"border-orange-400/35 bg-orange-500/15 text-orange-100 shadow-[inset_0_1px_rgba(255,255,255,.07)]":"border-white/10 bg-white/[.03] text-[#D1D5DB] hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-white"}`}>{link.label}</Link> })}
      </div>
    </nav>
  );
}
