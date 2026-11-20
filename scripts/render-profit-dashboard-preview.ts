/** Writes a standalone synthetic-only review artifact to stdout; no server or network. */
import {readFileSync} from 'node:fs';
import {buildAdjustedProfitReport,buildWalletLiability} from '../lib/intelligence/period-adjustments.ts';
import {renderProfitDashboard} from '../lib/intelligence/profit-dashboard.ts';
import type {ProfitInput} from '../lib/intelligence/profit-report.ts';
const input=JSON.parse(readFileSync(new URL('../tests/fixtures/phase3/financial.json',import.meta.url),'utf8')) as ProfitInput;
if(input.dataset!=='synthetic')throw Error('Synthetic fixtures only');
const correction={id:'fixture-review-correction',kind:'earned_revenue_correction' as const,amountPaise:-40000,originalAt:'2026-10-01T00:00:00Z',postedAt:'2026-11-02T00:00:00Z',dataset:'synthetic' as const,verified:true,internal:false};
console.log(renderProfitDashboard({complete:buildAdjustedProfitReport(input,[correction],true),incomplete:buildAdjustedProfitReport(input,[correction],false),wallet:buildWalletLiability({dataset:'synthetic',start:input.start,endExclusive:input.endExclusive,openingPaise:10000,coverageComplete:true,movements:[]})}).replace(/[ \t]+\n/g,"\n"));
