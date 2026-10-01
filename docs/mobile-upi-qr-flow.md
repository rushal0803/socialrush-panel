# Mobile UPI + QR flow

The Add Funds checkout offers two UPI paths on mobile:

1. **Pay with UPI App** — opens the device UPI handler with `pa`, `pn`, exact `am`, `cu=INR`, and a SocialRUSH reference embedded in the payment request.
2. **Show QR Code** — renders the same exact-amount UPI request as a QR for scanning from another phone or UPI-enabled device.

After payment, the customer confirms payment and submits the UTR / transaction ID to the existing manual verification endpoint. Wallet balance is not credited merely from opening the UPI link or displaying/scanning the QR.
