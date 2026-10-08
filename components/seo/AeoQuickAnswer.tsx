type Props = {
  serviceName: string;
  destination: string;
  pricePer1000: number | null;
  deliveryTime: string;
  refillPolicy: string;
  minQuantity: number;
};

export default function AeoQuickAnswer({
  serviceName,
  destination,
  pricePer1000,
  deliveryTime,
  refillPolicy,
  minQuantity,
}: Props) {
  const priceAnswer =
    pricePer1000 !== null
      ? `₹${pricePer1000.toLocaleString("en-IN")} per 1,000`
      : "See the current confirmed price in Packages";
  const quantityAnswer =
    minQuantity > 0
      ? `Current minimum: ${minQuantity.toLocaleString("en-IN")}`
      : "Current quantity limits are shown in the live order flow";

  return (
    <section
      data-aeo-answer="service-summary"
      aria-labelledby="aeo-quick-answer"
      className="mx-auto max-w-7xl px-4 py-6 sm:px-6"
    >
      <div className="rounded-[2rem] border border-orange-200/70 bg-white/85 p-5 shadow-[0_20px_50px_-35px_rgba(255,122,0,.45)] sm:p-7">
        <p className="text-[10px] font-black uppercase tracking-[.16em] text-orange-600">Quick answer</p>
        <h2 id="aeo-quick-answer" className="mt-2 text-2xl font-black tracking-tight text-[#0B0B0F]">
          What should I know before ordering {serviceName} in India?
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-[#374151] sm:text-base">
          SocialRUSH {serviceName} campaigns use a {destination}. No social media password is required.
          Review the current price, quantity, delivery estimate and refill information before checkout, then track the order from your dashboard.
        </p>
        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Price", priceAnswer],
            ["Quantity", quantityAnswer],
            ["Delivery", deliveryTime],
            ["Refill", refillPolicy],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-[#FFF1DF] bg-[#FFF9F2] p-4">
              <dt className="text-[10px] font-black uppercase tracking-[.12em] text-orange-600">{label}</dt>
              <dd className="mt-2 text-sm font-bold leading-6 text-[#111827]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
