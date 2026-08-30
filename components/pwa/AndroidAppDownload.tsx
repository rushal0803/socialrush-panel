"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

const isAndroid = () => /Android/i.test(navigator.userAgent);
const isTwa = () => /; wv\)|Version\/4\.0|SocialRUSH\/Android/i.test(navigator.userAgent);

/** Android-only APK distribution CTA. The redirect URL stays stable across releases. */
export default function AndroidAppDownload({ compact = false }: { compact?: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(isAndroid() && !isTwa()), []);
  if (!visible) return null;

  return (
    <div className={compact ? "" : "rounded-2xl border border-orange-400/25 bg-orange-500/[.08] p-4"}>
      {!compact ? <><p className="text-sm font-black text-white">Get the SocialRUSH App</p><p className="mt-1 text-xs leading-5 text-[#c4cad5]">Faster app-style access to your SocialRUSH account.</p></> : null}
      <a href="/download/android" className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF6200] to-[#FF9A00] px-3 text-sm font-black text-white shadow-[0_12px_26px_rgba(255,118,0,.18)]">
        <Download className="h-4 w-4" aria-hidden="true" /> Download Android App
      </a>
      {!compact ? <p className="mt-2 text-[11px] leading-4 text-[#aeb5c0]">Download SocialRUSH.apk, open it, then tap Install. Android may ask permission to install apps from your browser.</p> : null}
    </div>
  );
}
