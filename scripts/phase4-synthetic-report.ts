/** Synthetic fixture demonstration only; no network, credentials or ledger connection. */
import {readFileSync} from "node:fs";
import {buildAdjustedProfitReport,buildWalletLiability} from "../lib/intelligence/period-adjustments.ts";
import type {ProfitInput} from "../lib/intelligence/profit-report.ts";
const fixture=JSON.parse(readFileSync(new URL('../tests/fixtures/phase3/financial.json',import.meta.url),'utf8')) as ProfitInput;
if(fixture.dataset!=="synthetic")throw Error("Synthetic only");
const corrections=[{id:'fixture-correction',kind:'earned_revenue_correction' as const,amountPaise:-40000,originalAt:'2026-10-01T00:00:00Z',postedAt:'2026-11-01T00:00:00Z',dataset:'synthetic' as const,verified:true,internal:false}];
console.log(JSON.stringify({label:'SYNTHETIC — NOT BUSINESS RESULTS',postedCorrection:buildAdjustedProfitReport(fixture,corrections,true),unknownCoverage:buildAdjustedProfitReport(fixture,corrections,false),wallet:buildWalletLiability({dataset:'synthetic',start:fixture.start,endExclusive:fixture.endExclusive,openingPaise:10000,coverageComplete:true,movements:[{id:'fixture-deposit',kind:'deposit',amountPaise:20000,postedAt:'2026-11-02T00:00:00Z',dataset:'synthetic',verified:true,internal:false}]})},null,2));
