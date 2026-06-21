-- Professional campaign objectives used by public service pages and the campaign workspace.

insert into public.services (category_id, name, rate, min, max, description, status)
select c.id, seed.name, 0, 1, 1, seed.description, 'active'
from (values
  ('Instagram Growth Campaigns', 'Instagram Audience Growth', 'Increase profile visibility and attract a larger audience to your Instagram presence.'),
  ('Instagram Growth Campaigns', 'Instagram Engagement Boost', 'Increase engagement on your content and improve audience interaction.'),
  ('Instagram Growth Campaigns', 'Instagram Content Reach', 'Expand the visibility of your content to reach a broader audience.'),
  ('YouTube Reach Campaigns', 'YouTube Channel Growth', 'Accelerate channel growth and strengthen audience credibility.'),
  ('YouTube Reach Campaigns', 'YouTube Video Promotion', 'Increase the reach and visibility of your video content.'),
  ('Facebook Page Growth', 'Facebook Brand Engagement', 'Strengthen your Facebook presence and improve audience interaction.'),
  ('LinkedIn Brand Visibility', 'LinkedIn Professional Growth', 'Build authority and strengthen your professional presence.'),
  ('X/Twitter Engagement Campaigns', 'X Authority Growth', 'Expand your influence and strengthen your presence on X.')
) as seed(category, name, description)
join public.categories c on c.name = seed.category
where not exists (select 1 from public.services s where s.name = seed.name);

update public.services s set description = seed.description
from (values
  ('Instagram Audience Growth', 'Increase profile visibility and attract a larger audience to your Instagram presence.'),
  ('Instagram Engagement Boost', 'Increase engagement on your content and improve audience interaction.'),
  ('Instagram Content Reach', 'Expand the visibility of your content to reach a broader audience.'),
  ('YouTube Channel Growth', 'Accelerate channel growth and strengthen audience credibility.'),
  ('YouTube Video Promotion', 'Increase the reach and visibility of your video content.'),
  ('Facebook Brand Engagement', 'Strengthen your Facebook presence and improve audience interaction.'),
  ('LinkedIn Professional Growth', 'Build authority and strengthen your professional presence.'),
  ('X Authority Growth', 'Expand your influence and strengthen your presence on X.')
) as seed(name, description)
where s.name = seed.name;
