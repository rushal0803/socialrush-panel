/** Offline posted-period corrections. Never rewrites the prior order or ledger. */
import { buildProfitReport, type ProfitInput } from "./profit-report.ts";
type Adjustment = { id:string; kind:"earned_revenue_correction"|"cost_correction"; amountPaise:number; originalAt:string; postedAt:string; dataset:"synthetic"|"production"; verified:boolean; internal:boolean };
const safe=(n:number)=>{if(!Number.isSafeInteger(n))throw Error("Invalid or overflowing integer paise");return n;};
const date=(v:string)=>{const n=Date.parse(v);if(!Number.isFinite(n)||!/(Z|[+-]\d\d:\d\d)$/.test(v))throw Error("Explicit valid timestamp required");return n;};
export function buildAdjustedProfitReport(input:ProfitInput, adjustments:Adjustment[], coverageComplete:boolean) {
  const base=buildProfitReport(input),seen=new Map<string,Adjustment>();let revenue=0,cost=0,excluded=0,unresolved=false;
  for(const row of adjustments){
    if(row.dataset!==input.dataset||row.verified!==true||row.internal!==false){
      if(row.dataset===input.dataset&&row.internal===false&&row.verified!==true&&date(row.postedAt)>=date(input.start)&&date(row.postedAt)<date(input.endExclusive))unresolved=true;
      excluded++;continue;
    }
    if(!row.id||input.entries.some(e=>e.id===row.id))throw Error("Adjustment overlaps ledger ID");
    const old=seen.get(row.id);if(old&&JSON.stringify(old)!==JSON.stringify(row))throw Error("Conflicting adjustment ID");if(old)continue;
    seen.set(row.id,row);safe(row.amountPaise);
    if(!["earned_revenue_correction","cost_correction"].includes(row.kind))throw Error("Refunds belong in the refund ledger, not adjustment corrections");
    if(date(row.originalAt)>=date(input.start))throw Error("Not a prior-period correction");
    if(date(row.postedAt)<date(input.start)||date(row.postedAt)>=date(input.endExclusive))continue;
    if(row.kind==="earned_revenue_correction")revenue=safe(revenue+row.amountPaise);else cost=safe(cost+row.amountPaise);
  }
  const complete=coverageComplete===true&&!unresolved;
  const revenueComplete=complete&&!base.missingInputs.includes("earned_revenue")&&!base.missingInputs.includes("refunds");
  return {dataset:input.dataset,basePeriod:base,coverage:complete?"COMPLETE_INPUTS_NOT_AUDITED":"UNKNOWN",
    postedRevenueAdjustmentPaise:revenue,postedCostAdjustmentPaise:cost,excludedAdjustments:excluded,
    adjustedNetRevenuePaise:revenueComplete?safe(base.netRevenuePaise+revenue):null,
    adjustedNetProfitPaise:complete&&base.netProfitPaise!==null?safe(base.netProfitPaise+revenue-cost):null,
    serviceContribution:"WITHHELD_PENDING_REVIEWED_CORRECTION_ALLOCATION",
  };
}
type WalletMovement={id:string;kind:"deposit"|"refund_credit"|"order_application"|"cash_refund";amountPaise:number;postedAt:string;dataset:"synthetic"|"production";verified:boolean;internal:boolean};
export function buildWalletLiability(input:{dataset:"synthetic"|"production";start:string;endExclusive:string;openingPaise:number|null;coverageComplete:boolean;movements:WalletMovement[]}) {
  const start=date(input.start),end=date(input.endExclusive);if(start>=end)throw Error("Invalid period");
  if(input.openingPaise!==null)safe(input.openingPaise);
  const seen=new Map<string,WalletMovement>();let delta=0,excluded=0,unresolved=false;
  for(const row of input.movements){
    if(row.dataset!==input.dataset||row.verified!==true||row.internal!==false){
      if(row.dataset===input.dataset&&row.internal===false&&row.verified!==true&&date(row.postedAt)>=start&&date(row.postedAt)<end)unresolved=true;
      excluded++;continue;
    }
    if(!row.id||!Number.isSafeInteger(row.amountPaise)||row.amountPaise<0)throw Error("Invalid wallet movement");
    if(!["deposit","refund_credit","order_application","cash_refund"].includes(row.kind))throw Error("Unsupported wallet movement");
    const prior=seen.get(row.id);if(prior&&JSON.stringify(prior)!==JSON.stringify(row))throw Error("Conflicting wallet movement");if(prior)continue;seen.set(row.id,row);
    if(date(row.postedAt)<start||date(row.postedAt)>=end)continue;
    delta=safe(delta+(["deposit","refund_credit"].includes(row.kind)?row.amountPaise:-row.amountPaise));
  }
  const closing=input.coverageComplete===true&&!unresolved&&input.openingPaise!==null?safe(input.openingPaise+delta):null;
  return {dataset:input.dataset,basis:"LIABILITY_NOT_EARNED_REVENUE",openingLiabilityPaise:input.openingPaise,knownMovementPaise:delta,closingLiabilityPaise:closing,
    status:closing===null?"UNKNOWN":closing<0?"NEGATIVE_LIABILITY_RECONCILIATION_REQUIRED":"COMPLETE_INPUTS_NOT_AUDITED",excludedMovements:excluded};
}
