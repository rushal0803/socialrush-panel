import { expect, test } from "@playwright/test";
import { cashfreeCustomerPhone } from "../../lib/payments/cashfree-customer";

test("direct Cashfree checkout keeps a saved valid phone when available", () => {
  expect(cashfreeCustomerPhone("98765 43210")).toBe("9876543210");
});

test("direct Cashfree checkout uses a non-user fallback when no valid phone is saved", () => {
  expect(cashfreeCustomerPhone(null)).toBe("9999999999");
  expect(cashfreeCustomerPhone("not-a-phone")).toBe("9999999999");
});
