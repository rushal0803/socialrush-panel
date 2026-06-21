-- Rebrand existing catalog records as professional growth campaigns.

create or replace function pg_temp.merge_campaign_category(old_name text, new_name text)
returns void language plpgsql as $$
declare old_id bigint; new_id bigint;
begin
  select id into old_id from public.categories where name = old_name;
  select id into new_id from public.categories where name = new_name;
  if old_id is null then return; end if;
  if new_id is null then
    update public.categories set name = new_name where id = old_id;
  else
    update public.services set category_id = new_id where category_id = old_id;
    delete from public.categories where id = old_id;
  end if;
end;
$$;

select pg_temp.merge_campaign_category('Instagram', 'Instagram Growth Campaigns');
select pg_temp.merge_campaign_category('YouTube', 'YouTube Reach Campaigns');
select pg_temp.merge_campaign_category('Facebook', 'Facebook Page Growth');
select pg_temp.merge_campaign_category('LinkedIn', 'LinkedIn Brand Visibility');
select pg_temp.merge_campaign_category('Telegram', 'Telegram Community Growth');
select pg_temp.merge_campaign_category('Twitter / X', 'X/Twitter Engagement Campaigns');
select pg_temp.merge_campaign_category('X / Twitter', 'X/Twitter Engagement Campaigns');

insert into public.categories (name) values
  ('Instagram Growth Campaigns'), ('YouTube Reach Campaigns'), ('Facebook Page Growth'),
  ('LinkedIn Brand Visibility'), ('Telegram Community Growth'), ('X/Twitter Engagement Campaigns')
on conflict (name) do nothing;

-- Historical names below are matching keys for existing records only.
update public.services set name = 'Instagram Audience Growth — Premium', description = 'Audience growth campaign with measured, gradual activation.' where name = 'Instagram Followers — Premium Quality';
update public.services set name = 'Instagram Content Engagement — Posts & Reels', description = 'Engagement campaign for public posts and short-form content.' where name = 'Instagram Likes — Real & Fast';
update public.services set name = 'YouTube Content Reach — High Retention', description = 'Content reach campaign designed for sustained video discovery.' where name = 'YouTube Views — High Retention';
update public.services set name = 'Facebook Page Visibility Campaign', description = 'Page growth campaign focused on brand visibility.' where name = 'Facebook Page Likes — Worldwide';
update public.services set name = 'X Conversation Amplification', description = 'Engagement campaign for public conversations and content reach.' where name = 'Twitter / X Retweets';
