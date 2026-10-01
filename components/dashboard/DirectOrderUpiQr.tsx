"use client";

import { useMemo, useState } from "react";
import { QrCode, Smartphone } from "lucide-react";

type Props = {
  amount: number;
  upiId: string;
  payeeName: string;
  intentId: string;
};

export default function DirectOrderUpiQr({ amount, upiId, payeeName, intentId }: Props) {
  const [showMobileQr, setShowMobileQr] = useState(false);
  const upiHref = useMemo(() => {
    const params = new URLSearchParams({
      pa: upiId,
      pn: payeeName || "SocialRUSH",
      am: amount.toFixed(2),
      cu: "INR",
      tn: `SocialRUSH order ${intentId.slice(0, 8)}`,
    });
    return `upi://pay?${params.toString()}`;
  }, [amount, intentId, payeeName, upiId]);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=12&data=${encodeURIComponent(upiHref)}`;
  const amountLabel = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amount);

  return (
    <section className="mx-auto mb-5 max-w-2xl rounded-3xl border border-orange-400/20 bg-[#0d1118] p-4 text-white shadow-xl sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[.2em] text-orange-300">Fast UPI checkout</p>
          <h2 className="mt-1 text-lg font-black">Pay exactly {amountLabel}</h2>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black text-emerald-300">Amount pre-filled</span>
      </div>

      <div className="mt-4 hidden items-center gap-5 lg:flex">
        <div className="shrink-0 rounded-2xl bg-white p-3">
          <img src={qrUrl} alt={`UPI QR for ${amountLabel}`} width={190} height={190} className="h-[190px] w-[190px]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-black"><QrCode className="h-4 w-4 text-orange-300" /> Scan with your phone</div>
          <p className="mt-2 text-xs leading-5 text-zinc-400">Open Google Pay, PhonePe, Paytm, BHIM or another UPI app and scan this QR. The order amount is already included in the QR.</p>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3"><p className="text-[10px] font-black uppercase text-zinc-500">Payable</p><p className="mt-1 text-xl font-black text-orange-200">{amountLabel}</p></div>
          <p className="mt-3 text-[11px] font-semibold text-emerald-200">After payment, continue below and submit the UTR / Transaction ID. Do not pay twice.</p>
        </div>
      </div>

      <div className="mt-4 lg:hidden">
        <a href={upiHref} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 text-sm font-black text-black"><Smartphone className="h-4 w-4" /> Pay {amountLabel} with UPI App</a>
        <button type="button" onClick={() => setShowMobileQr((value) => !value)} className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-black text-zinc-200"><QrCode className="h-4 w-4" /> {showMobileQr ? "Hide QR Code" : "Show QR Code"}</button>
        {showMobileQr ? <div className="mt-3 rounded-2xl border border-white/10 bg-white p-3 text-center"><img src={qrUrl} alt={`UPI QR for ${amountLabel}`} width={280} height={280} className="mx-auto h-auto w-full max-w-[280px]" /><p className="mt-2 text-xs font-black text-zinc-800">Scan from another device · {amountLabel}</p></div> : null}
        <p className="mt-3 text-center text-[11px] leading-5 text-zinc-500">Same phone: use UPI App. Another device: show and scan the QR.</p>
      </div>
    </section>
  );
}
