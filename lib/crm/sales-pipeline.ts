import type { CRMLead, CustomerMetric } from "@/lib/crm/types";

const activeLeadStatuses = new Set(["new","researching","ready","contacted","replied","qualified"]);
const salesPriority: Record<string,number> = {
  replied: 0,
  qualified: 1,
  ready: 2,
  contacted: 3,
  researching: 4,
  new: 5,
  won: 6,
  lost: 7,
  do_not_contact: 8,
};

export type PipelineStageCount = {
  status: CRMLead["status"];
  count: number;
};

export function buildLeadStageCounts(leads: Pick<CRMLead,"status">[]) {
  const order: CRMLead["status"][] = ["new","researching","ready","contacted","replied","qualified","won","lost","do_not_contact"];
  return order.map(status=>({status,count:leads.filter(lead=>lead.status===status).length}));
}

export function activeLeadCount(leads: Pick<CRMLead,"status">[]) {
  return leads.filter(lead=>activeLeadStatuses.has(lead.status)).length;
}

export function sortSalesOpportunities<T extends Pick<CRMLead,"status"|"score"|"updated_at">>(leads:T[]) {
  return [...leads].sort((a,b)=>{
    const statusDiff=(salesPriority[a.status]??99)-(salesPriority[b.status]??99);
    if(statusDiff!==0)return statusDiff;
    const scoreDiff=Number(b.score||0)-Number(a.score||0);
    if(scoreDiff!==0)return scoreDiff;
    return Date.parse(b.updated_at)-Date.parse(a.updated_at);
  });
}

export function customerRevenueSummary(rows:Array<{metrics:CustomerMetric;lastCompletedAt:string|null}>, now=Date.now()) {
  const completedCustomers=rows.filter(row=>row.metrics.validOrders>0);
  const repeatCustomers=completedCustomers.filter(row=>row.metrics.validOrders>=2);
  const firstOrderCustomers=completedCustomers.filter(row=>row.metrics.validOrders===1);
  const active30=completedCustomers.filter(row=>row.lastCompletedAt&&now-Date.parse(row.lastCompletedAt)<=30*864e5);
  const reactivation=completedCustomers.filter(row=>row.lastCompletedAt&&now-Date.parse(row.lastCompletedAt)>=21*864e5);
  return {
    completedCustomers: completedCustomers.length,
    firstOrderCustomers: firstOrderCustomers.length,
    repeatCustomers: repeatCustomers.length,
    active30: active30.length,
    reactivation: reactivation.length,
  };
}
