import { createClient } from "@/lib/supabase/server";
import LeadsWorkspace from "@/components/admin/LeadsWorkspace";
import type { CRMLead, CRMLeadContact } from "@/lib/crm/types";
export default async function LeadsPage(){const s=await createClient();const [{data:leads},{data:contacts}]=await Promise.all([s.from("crm_leads").select("*").order("created_at",{ascending:false}),s.from("crm_lead_contacts").select("*")]);return <LeadsWorkspace leads={(leads||[]) as CRMLead[]} contacts={(contacts||[]) as CRMLeadContact[]}/>}
