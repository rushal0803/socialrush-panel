"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PortalCTA({ children, className = "" }: { children: ReactNode; className?: string }) {
  const router = useRouter();
  const [href, setHref] = useState("/login?next=/dashboard/new-order");
  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) =>
      setHref(data.session ? "/dashboard/new-order" : "/login?next=/dashboard/new-order"),
    );
  }, []);
  async function followSession(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const { data } = await createClient().auth.getSession();
    router.push(
      data.session ? "/dashboard/new-order" : "/login?next=/dashboard/new-order",
    );
  }
  return <Link href={href} onClick={followSession} className={className}>{children}</Link>;
}
