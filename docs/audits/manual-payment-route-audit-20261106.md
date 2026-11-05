# Manual payment route audit — 2026-11-06

Reviewed app/api/orders/manual-upi/route.ts, app/api/orders/route.ts and app/api/checkout/payment/route.ts.

Manual checkout accepts UPI, bank_transfer and usdt_trc20. It checks authentication, origin, checkout ownership, service status, existing orders and transaction references. Wallet application, order insertion and intent completion are separate operations, so retry and partial-failure scenarios need isolated tests. Specifically test: wallet applied but order insertion fails; simultaneous requests with the same key and different references; order created but intent update fails. Review structured uniqueness of payment references. Historical Razorpay POST is disabled; its GET path remains for reconciliation.

No production writes or merge approved.
