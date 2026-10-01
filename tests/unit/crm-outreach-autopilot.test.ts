import assert from "node:assert/strict";
import test from "node:test";
import { getLeadContactOutreachBlockReason } from "../../lib/crm/outreach.ts";
import { formatAutonomousOutreachEmail } from "../../lib/crm/email-formatting.ts";

const settings={require_verified_business_email:true,require_compliance_eligible:true};
const lead={status:"researching" as const};
const contact={
  id:"contact",lead_id:"lead",full_name:"Asha",job_title:"Growth Lead",email:"asha@acme.com",
  email_type:"business" as const,verification_status:"valid" as const,compliance_status:"eligible" as const,
  contact_basis:"public_business_contact" as const,is_primary:true,source_url:"https://acme.com/contact",
  discovered_at:"2026-10-01T00:00:00.000Z",opted_out_at:null,created_at:"2026-10-01T00:00:00.000Z",updated_at:"2026-10-01T00:00:00.000Z"
};

test("autopilot accepts only a verified compliance-eligible business contact",()=>{
  assert.equal(getLeadContactOutreachBlockReason(contact,lead,settings,[]),null);
});

test("autopilot blocks personal or non-business addresses even when technically valid",()=>{
  assert.equal(getLeadContactOutreachBlockReason({...contact,email_type:"personal"},lead,settings,[]),"Verified business email required");
});

test("autopilot blocks uncertain contact basis",()=>{
  assert.equal(getLeadContactOutreachBlockReason({...contact,contact_basis:"other"},lead,settings,[]),"Contact basis needs review");
});

test("autopilot blocks suppression and opt-out before any send",()=>{
  assert.equal(getLeadContactOutreachBlockReason(contact,lead,settings,[{email:"ASHA@ACME.COM"}]),"Suppressed");
  assert.equal(getLeadContactOutreachBlockReason({...contact,opted_out_at:"2026-10-01T01:00:00.000Z"},lead,settings,[]),"Opted out");
});

test("autonomous outreach adds a clear reply-to-unsubscribe instruction",()=>{
  const email=formatAutonomousOutreachEmail(
    "Hi {{first_name}},\n\nI thought {{business_name}} may benefit from {{recommended_service}}.",
    {full_name:"Asha Sharma",business_name:"Acme",recommended_service:"LinkedIn growth"}
  );
  assert.match(email.text,/reply “unsubscribe”/i);
  assert.match(email.html,/reply “unsubscribe”/i);
  assert.match(email.text,/Asha/);
  assert.match(email.text,/Acme/);
});
