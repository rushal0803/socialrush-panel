/** Explicit synthetic-only CLI. No backend, capture, provider or credential imports. */
import fs from "node:fs";
import { buildProfitReport, type ProfitInput } from "../lib/intelligence/profit-report.ts";
const fixture = JSON.parse(fs.readFileSync(new URL("../tests/fixtures/phase3/financial.json", import.meta.url), "utf8")) as ProfitInput;
if (fixture.dataset !== "synthetic" || fixture.entries.some(e => e.dataset !== "synthetic")) throw new Error("Synthetic fixtures only");
const complete = buildProfitReport(fixture);
const incomplete = buildProfitReport({ ...fixture, coverage: { ...fixture.coverage, fulfillment: false, income_tax: false } });
console.log(JSON.stringify({ label: "SYNTHETIC DEMONSTRATION — NOT BUSINESS RESULTS", complete, incomplete }, null, 2));
