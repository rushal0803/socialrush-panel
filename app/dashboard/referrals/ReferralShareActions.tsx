"use client";

import { useEffect, useState } from "react";
import { Check, Copy, MessageCircle, Share2 } from "lucide-react";
import { track } from "@/lib/analytics/events";

export default function ReferralShareActions({
  referralLink,
  shareText,
}: {
  referralLink: string;
  shareText: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    track("referral_center_view");
  }, []);

  async function copyLink() {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    track("referral_share_clicked", { channel: "copy" });
    window.setTimeout(() => setCopied(false), 1800);
  }

  function shareWhatsApp() {
    track("referral_share_clicked", { channel: "whatsapp" });
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText} ${referralLink}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function shareNative() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    track("referral_share_clicked", { channel: "native" });
    await navigator.share({ title: "SocialRUSH", text: shareText, url: referralLink }).catch(() => undefined);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <button
        type="button"
        onClick={shareWhatsApp}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-black text-white transition hover:bg-emerald-400"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </button>
      <button
        type="button"
        onClick={copyLink}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-orange-300/30 bg-orange-400/10 px-4 text-sm font-black text-orange-100 transition hover:bg-orange-400/15"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={shareNative}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[.04] px-4 text-sm font-black text-slate-100 transition hover:border-orange-300/35"
      >
        <Share2 className="h-4 w-4" />
        Share
      </button>
    </div>
  );
}
