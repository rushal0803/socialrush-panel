import { createClient } from "@/lib/supabase/server";
import ReplyInbox from "@/components/admin/ReplyInbox";
import type { CRMInboundMessage, CRMLead, CRMLeadContact } from "@/lib/crm/types";
export default async function RepliesPage(){const s=await createClient();const [{data:messages},{data:leads},{data:contacts}]=await Promise.all([s.from("crm_inbound_messages").select("*").order("received_at",{ascending:false}).limit(200),s.from("crm_leads").select("*"),s.from("crm_lead_contacts").select("*")]);return <ReplyInbox messages={(messages||[]) as CRMInboundMessage[]} leads={(leads||[]) as CRMLead[]} contacts={(contacts||[]) as CRMLeadContact[]} mailboxConnected={Boolean(process.env.RESEND_API_KEY&&process.env.RESEND_WEBHOOK_SECRET)}/>}
