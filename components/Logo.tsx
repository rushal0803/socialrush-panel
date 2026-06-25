import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
        S
      </span>
      <span className={light ? "text-white" : "text-slate-100"}>
        Social<span className="text-cyan-300">RUSH</span>
      </span>
    </Link>
  );
}
