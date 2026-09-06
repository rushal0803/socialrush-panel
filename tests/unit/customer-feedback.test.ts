import test from "node:test";
import assert from "node:assert/strict";
import { customerFeedbackError } from "../../lib/dashboard/customer-feedback.ts";

test("customer feedback keeps safe validation copy but hides implementation errors", () => {
  assert.equal(customerFeedbackError(new Error("Passwords do not match."), "Could not save settings."), "Passwords do not match.");
  assert.equal(customerFeedbackError(new Error("relation profiles does not exist"), "Could not save settings."), "Could not save settings.");
  assert.equal(customerFeedbackError({ message: "provider error" }, "Could not load notifications."), "Could not load notifications.");
});
