# Razorpay wallet setup

1. Apply the wallet migration:

   ```bash
   supabase db push
   ```

2. Add the Razorpay key ID and secret, webhook signing secret, and Supabase service-role key to `.env.local` using `.env.example` as the template.

3. In the Razorpay dashboard, create a webhook pointing to:

   ```text
   https://your-domain.com/api/payments/razorpay/webhook
   ```

4. Subscribe the webhook to `payment.captured` and `payment.failed`, and use the same secret configured as `RAZORPAY_WEBHOOK_SECRET`.

The browser callback and webhook both use idempotent database settlement. A verified payment can credit the wallet only once.

Refunds are exposed through the admin-only endpoint `POST /api/payments/razorpay/refund` with a JSON body containing `transactionId`. The wallet balance is validated before Razorpay is contacted.
