import Link from "next/link";

const links = [
  { href: "/admin/crm", label: "Overview" },
  { href: "/admin/crm/customers", label: "Customers" },
  { href: "/admin/crm/follow-ups", label: "Follow-ups" },
];

export default function CrmSubnav() {
  return (
    <nav aria-label="CRM navigation" className="border-b border-white/10 bg-[#0d0d0f]/90 px-4 py-3 backdrop-blur sm:px-8">
      <div className="mx-auto flex max-w-[1650px] gap-2 overflow-x-auto pb-0.5">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-xs font-semibold text-[#D1D5DB] transition hover:border-orange-400/40 hover:bg-orange-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
