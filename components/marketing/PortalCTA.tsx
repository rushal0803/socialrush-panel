"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PortalCTA({ children, className = "", targetPath = "/dashboard/new-order" }: { children: ReactNode; className?: string; targetPath?: string }) {
  const router = useRouter();
  const [href, setHref] = useState(`/login?next=${encodeURIComponent(targetPath)}`);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      setHref(data.session ? targetPath : `/login?next=${encodeURIComponent(targetPath)}`);
    });
  }, [targetPath]);

  async function followSession(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const { data } = await createClient().auth.getSession();
    router.push(data.session ? targetPath : `/login?next=${encodeURIComponent(targetPath)}`);
  }

  return <Link href={href} onClick={followSession} className={className}>{children}</Link>;
}
