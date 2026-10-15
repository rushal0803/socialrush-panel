/** Public Instagram Comments must not accept orders without valid live facts. */
export type InstagramCommentsFacts={ available:boolean; rate:number; min:number; max:number };
export function isOrderableInstagramCommentsService(facts:InstagramCommentsFacts|null|undefined):facts is InstagramCommentsFacts{
  return facts?.available===true && Number.isFinite(facts.rate) && facts.rate>0 &&
    Number.isSafeInteger(facts.min) && facts.min>0 && Number.isSafeInteger(facts.max) && facts.max>=facts.min;
}
export function getInstagramCommentsOrderReadiness(facts:InstagramCommentsFacts|null|undefined,quantity:number,validPublicLink:boolean){
  const serviceReady=isOrderableInstagramCommentsService(facts);
  const quantityReady=serviceReady && Number.isSafeInteger(quantity) && quantity>=facts.min && quantity<=facts.max;
  const total=quantityReady?Math.round((facts.rate*quantity/1000+Number.EPSILON)*100)/100:null;
  return {serviceReady,quantityReady,total,canContinue:quantityReady&&validPublicLink};
}
