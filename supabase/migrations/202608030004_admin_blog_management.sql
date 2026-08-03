-- Managed editorial content. Legacy code-backed articles remain untouched.
create table if not exists public.blog_articles (
 id uuid primary key default gen_random_uuid(), slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), title text not null check (char_length(title) between 10 and 120), description text not null check (char_length(description) between 50 and 300), category text not null check (char_length(trim(category)) > 0), status text not null default 'draft' check (status in ('draft','published','archived','redirect')), featured boolean not null default false, author_name text, hero_image_url text, hero_image_alt text, content jsonb not null default '[]'::jsonb, faq_items jsonb not null default '[]'::jsonb, related_slugs jsonb not null default '[]'::jsonb, seo_title text, seo_description text, canonical_path text unique, published_at timestamptz, redirect_to text, created_by uuid references public.profiles(id) on delete set null, updated_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz,
 check ((status = 'redirect' and redirect_to is not null) or status <> 'redirect'),
 check (redirect_to is null or redirect_to ~ '^/blog/[a-z0-9]+(?:-[a-z0-9]+)*$')
);
create index if not exists blog_articles_public_idx on public.blog_articles(status, published_at desc);
create index if not exists blog_articles_updated_idx on public.blog_articles(updated_at desc);
alter table public.blog_articles enable row level security;
create policy "blog public published read" on public.blog_articles for select using (status in ('published','redirect'));
create policy "blog admins manage" on public.blog_articles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create table if not exists public.blog_audit_log (id bigint generated always as identity primary key, article_id uuid references public.blog_articles(id) on delete set null, actor_id uuid references public.profiles(id) on delete set null, action text not null, created_at timestamptz not null default now());
alter table public.blog_audit_log enable row level security;
create policy "blog audit admins read" on public.blog_audit_log for select to authenticated using (public.is_admin());
create policy "blog audit admins write" on public.blog_audit_log for insert to authenticated with check (public.is_admin());
