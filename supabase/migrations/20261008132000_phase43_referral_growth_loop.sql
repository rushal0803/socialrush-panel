-- Phase 43 — Referral Growth Loop.
-- Qualify an attributed referral when the referred customer completes an
-- eligible paid order. The function is private and is not exposed over the
-- Data API. Existing live reward amounts remain unchanged.

create or replace function private.qualify_referral_on_order_completion()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_ref public.referral_attributions%rowtype;
  v_rules public.reward_programme_rules%rowtype;
  v_event_id uuid;
  v_transaction_id uuid;
begin
  if new.status <> 'completed'
     or coalesce(new.payment_status, 'paid') not in ('paid', 'completed') then
    return new;
  end if;

  if tg_op = 'UPDATE'
     and old.status = 'completed'
     and coalesce(old.payment_status, 'paid') in ('paid', 'completed') then
    return new;
  end if;

  select *
  into v_ref
  from public.referral_attributions
  where referred_user_id = new.user_id
    and status = 'pending'
  for update;

  if not found then
    return new;
  end if;

  if v_ref.expires_at < now() then
    update public.referral_attributions
    set status = 'expired'
    where id = v_ref.id;
    return new;
  end if;

  select *
  into v_rules
  from public.reward_programme_rules
  where id = true;

  if not found
     or not v_rules.enabled
     or coalesce(new.charge, 0) < v_rules.minimum_order_amount then
    return new;
  end if;

  update public.referral_attributions
  set status = 'qualified',
      qualifying_order_id = new.id,
      qualified_at = now()
  where id = v_ref.id;

  if coalesce(v_rules.referrer_reward, 0) <= 0 then
    return new;
  end if;

  insert into public.customer_reward_events(
    user_id,
    event_type,
    referral_id,
    qualifying_order_id,
    amount,
    status,
    source,
    internal_note
  )
  values(
    v_ref.referrer_id,
    'referral_reward',
    v_ref.id,
    new.id,
    v_rules.referrer_reward,
    case when v_rules.manual_approval then 'pending' else 'approved' end,
    'referral_growth_loop',
    'Referral reward created after qualifying referred-customer order'
  )
  on conflict do nothing
  returning id into v_event_id;

  if v_event_id is null or v_rules.manual_approval then
    return new;
  end if;

  update public.profiles
  set balance = coalesce(balance, 0) + v_rules.referrer_reward
  where id = v_ref.referrer_id;

  insert into public.transactions(
    user_id,
    amount,
    type,
    status,
    payment_method,
    description,
    metadata
  )
  values(
    v_ref.referrer_id,
    v_rules.referrer_reward,
    'reward',
    'completed',
    'reward',
    'Referral reward',
    jsonb_build_object(
      'reward_event_id', v_event_id,
      'referral_id', v_ref.id,
      'qualifying_order_id', new.id,
      'reward_type', 'referral_reward'
    )
  )
  returning id into v_transaction_id;

  update public.customer_reward_events
  set status = 'credited',
      transaction_id = v_transaction_id,
      updated_at = now()
  where id = v_event_id;

  update public.referral_attributions
  set status = 'rewarded',
      rewarded_at = now()
  where id = v_ref.id;

  return new;
end
$$;

revoke all on function private.qualify_referral_on_order_completion() from public;
revoke all on function private.qualify_referral_on_order_completion() from anon;
revoke all on function private.qualify_referral_on_order_completion() from authenticated;

drop trigger if exists trg_qualify_referral_on_order_completion on public.orders;
create trigger trg_qualify_referral_on_order_completion
after insert or update of status, payment_status, charge on public.orders
for each row
execute function private.qualify_referral_on_order_completion();
