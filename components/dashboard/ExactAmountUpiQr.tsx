"use client";

import { useMemo } from "react";

export default function ExactAmountUpiQr({ upiHref, amountLabel }: { upiHref: string; amountLabel: string }) {
  const qrUrl = useMemo(
    () =>
      upiHref
        ? `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&data=${encodeURIComponent(upiHref)}`
        : "",
    [upiHref],
  );

  if (!qrUrl) return null;

  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="grid items-center gap-4 sm:grid-cols-[220px_1fr]">
        <div className="rounded-2xl bg-white p-3">
          <img
            src={qrUrl}
            alt={`UPI QR to pay exactly ${amountLabel}`}
            width={220}
            height={220}
            className="mx-auto h-auto w-full max-w-[220px]"
          />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-300">Scan & pay</p>
          <h3 className="mt-2 text-xl font-black text-white">Pay exactly {amountLabel}</h3>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Scan this QR with any UPI app. The order amount is already included, so you do not need to type it again.
          </p>
          <div className="mt-3 rounded-xl border border-emerald-400/10 bg-emerald-500/[0.06] p-3 text-xs leading-5 text-emerald-100/80">
            Use either the UPI app button or this QR code. Pay only once, then submit the UTR for verification.
          </div>
        </div>
      </div>
    </div>
  );
}
