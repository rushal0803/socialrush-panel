import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-rush-600 text-white shadow-lg shadow-rush-500/25">
        S
      </span>
      <span className={light ? "text-white" : "text-ink"}>
        Social<span className="text-rush-500">RUSH</span>
      </span>
    </Link>
  );
}
