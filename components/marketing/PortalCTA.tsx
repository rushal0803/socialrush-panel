"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PortalCTA({ children, className = "" }: { children: ReactNode; className?: string }) {
  const router = useRouter();
  const [href, setHref] = useState("/register");
  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => setHref(data.session ? "/dashboard/new-campaign" : "/register"));
  }, []);
  async function followSession(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const { data } = await createClient().auth.getSession();
    router.push(data.session ? "/dashboard/new-campaign" : "/register");
  }
  return <Link href={href} onClick={followSession} className={className}>{children}</Link>;
}
