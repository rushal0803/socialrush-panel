"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { recoverSession } from "@/lib/auth/recovery-session";
import { createClient } from "@/lib/supabase/client";

export default function RecoverySessionPage() {
  const router = useRouter();
  const recoveryAttempt = useRef<Promise<boolean> | null>(null);
  const [message, setMessage] = useState("Verifying your recovery link...");

  useEffect(() => {
    let active = true;

    if (!recoveryAttempt.current) recoveryAttempt.current = recoverSession(
      window.location,
      () => window.history.replaceState(window.history.state, "", "/auth/recovery"),
      () => createClient().auth,
    );
    void recoveryAttempt.current.then((success) => {
      if (!active) return;
      if (success) router.replace("/reset-password");
      else setMessage("This reset link is invalid or expired. Request a new password reset email.");
    });
    return () => { active = false; };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Password recovery</h1>
      <p role="status" className="text-sm text-slate-700">{message}</p>
      <Link href="/forgot-password" className="underline">Request a new reset link</Link>
    </main>
  );
}
