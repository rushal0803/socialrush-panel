"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  nextPath: string;
  className?: string;
  children: React.ReactNode;
};

export default function OrderNowButton({ nextPath, className = "", children }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push(nextPath);
        return;
      }

      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Redirecting..." : children}
    </button>
  );
}
