-- Refresh exactly one unsent internal formatting test draft, when the existing
-- internal contact is present. This does not create or send a prospect email.
do $$
declare
  internal_contact record;
begin
  select c.id, c.lead_id into internal_contact
  from public.crm_lead_contacts c
  where lower(c.email) in ('growth@outreach.getsocialrush.com', 'growth@socialrush.com')
  order by c.created_at asc
  limit 1;

  if internal_contact.id is not null then
    delete from public.crm_outreach_messages
    where contact_id = internal_contact.id
      and direction = 'outbound'
      and status = 'draft'
      and subject = 'SocialRUSH professional email formatting test';

    insert into public.crm_outreach_messages (lead_id, contact_id, direction, subject, body, status, provider)
    values (
      internal_contact.lead_id,
      internal_contact.id,
      'outbound',
      'SocialRUSH professional email formatting test',
      E'Hi {{first_name}},\n\nThis is an internal formatting check for SocialRUSH outreach emails. It confirms that paragraph breaks and personalization display clearly in Gmail and Outlook.\n\nIf you have a moment, please reply to confirm the message looks clean on your device.\n\nThanks,\nSocialRUSH Team\nSocial Media Growth Solutions\ngetsocialrush.com',
      'draft',
      'resend'
    );
  end if;
end $$;

-- This safeguard is deliberately repeated in the formatting migration.
update public.crm_outreach_settings set auto_send = false where auto_send is distinct from false;
