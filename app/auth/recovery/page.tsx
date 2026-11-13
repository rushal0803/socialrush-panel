"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RecoverySessionPage() {
  const router = useRouter();
  const attempted = useRef(false);
  const [message, setMessage] = useState("Verifying your recovery link...");

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;
    let active = true;

    async function verifyRecovery() {
      // Supabase's default email template can return tokens in the URL hash.
      // Browser fragments are invisible to Next.js server route handlers.
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const search = new URLSearchParams(window.location.search);
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");
      const code = search.get("code");
      const tokenHash = search.get("token_hash");
      const tokenType = hash.get("type") || search.get("type");

      // Remove credentials from browser history before calling async auth APIs.
      window.history.replaceState(window.history.state, "", "/auth/recovery");

      try {
        const supabase = createClient();
        if (accessToken && refreshToken && tokenType === "recovery") {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else if (tokenHash && tokenType === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (error) throw error;
        } else {
          throw new Error("Missing recovery credentials");
        }

        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) throw error || new Error("Recovery session not established");
        if (active) router.replace("/reset-password");
      } catch {
        if (active) setMessage("This reset link is invalid or expired. Request a new password reset email.");
      }
    }

    void verifyRecovery();
    return () => { active = false; };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Password recovery</h1>
      <p role="status" className="text-sm text-slate-700">{message}</p>
      <a href="/forgot-password" className="underline">Request a new reset link</a>
    </main>
  );
}
