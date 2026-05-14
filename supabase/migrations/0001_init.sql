-- =============================================================================
-- Forgekit — Initial schema
-- Author: Aïssa BELKOUSSA
-- Migration: 0001_init
-- Date: 2026-05-14
-- =============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "vector";

-- =============================================================================
-- ENUMS
-- =============================================================================

create type public.pricing_model as enum ('free', 'one_shot', 'subscription', 'pay_per_use');
create type public.skill_status as enum ('draft', 'in_review', 'published', 'suspended', 'archived');
create type public.platform as enum ('claude_code', 'cursor', 'codex', 'windsurf', 'gemini_cli', 'copilot_cli', 'continue');
create type public.payout_status as enum ('pending', 'processing', 'paid', 'failed');
create type public.purchase_status as enum ('pending', 'completed', 'refunded', 'disputed');

-- =============================================================================
-- TABLE: profiles (étend auth.users)
-- =============================================================================

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_-]{3,30}$'),
  display_name text not null,
  bio text,
  avatar_url text,
  website_url text,
  twitter_handle text,
  github_handle text,
  is_verified_creator boolean default false,
  is_admin boolean default false,
  stripe_account_id text,
  default_currency text default 'EUR' check (default_currency in ('EUR', 'USD', 'GBP')),
  locale text default 'fr',
  email_notifications boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_profiles_username on public.profiles(username);
create index idx_profiles_verified on public.profiles(is_verified_creator) where is_verified_creator = true;

-- =============================================================================
-- TABLE: skill_categories
-- =============================================================================

create table public.skill_categories (
  slug text primary key,
  name_fr text not null,
  name_en text not null,
  description_fr text,
  description_en text,
  icon text,
  display_order integer default 0
);

-- =============================================================================
-- TABLE: skills
-- =============================================================================

create table public.skills (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null check (slug ~ '^[a-z0-9-]{3,60}$'),
  creator_id uuid references public.profiles(id) not null,

  name text not null check (length(name) between 3 and 80),
  tagline text not null check (length(tagline) between 10 and 160),
  description_md text not null check (length(description_md) between 50 and 20000),
  category text not null references public.skill_categories(slug),
  tags text[] default '{}',
  platforms platform[] not null check (array_length(platforms, 1) >= 1),

  icon_url text,
  cover_url text,
  screenshots text[] default '{}',
  demo_video_url text,

  price_cents integer default 0 check (price_cents >= 0),
  pricing_model pricing_model default 'free',
  ls_product_id text,
  ls_variant_id text,

  status skill_status default 'draft',
  current_version_id uuid,
  current_version text,

  install_count integer default 0 check (install_count >= 0),
  rating_avg numeric(2,1) check (rating_avg between 0 and 5),
  rating_count integer default 0,
  revenue_cents integer default 0,

  search_vector tsvector,
  embedding vector(1536),

  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  review_notes text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

create index idx_skills_slug on public.skills(slug);
create index idx_skills_creator on public.skills(creator_id);
create index idx_skills_status on public.skills(status);
create index idx_skills_category on public.skills(category) where status = 'published';
create index idx_skills_platforms on public.skills using gin(platforms);
create index idx_skills_tags on public.skills using gin(tags);
create index idx_skills_search on public.skills using gin(search_vector);
create index idx_skills_embedding on public.skills using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_skills_install_count on public.skills(install_count desc) where status = 'published';
create index idx_skills_rating on public.skills(rating_avg desc nulls last) where status = 'published';

create function public.skills_search_trigger() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('french', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(new.tagline, '')), 'B') ||
    setweight(to_tsvector('french', coalesce(new.description_md, '')), 'C') ||
    setweight(to_tsvector('french', array_to_string(coalesce(new.tags, '{}'), ' ')), 'B');
  return new;
end;
$$ language plpgsql;

create trigger skills_search_update
before insert or update on public.skills
for each row execute function public.skills_search_trigger();

-- =============================================================================
-- TABLE: skill_versions
-- =============================================================================

create table public.skill_versions (
  id uuid primary key default uuid_generate_v4(),
  skill_id uuid references public.skills(id) on delete cascade not null,

  version text not null check (version ~ '^\d+\.\d+\.\d+(-[a-z0-9.]+)?$'),
  changelog_md text,

  r2_key text not null,
  zip_sha256 text not null check (length(zip_sha256) = 64),
  zip_size_bytes integer not null check (zip_size_bytes > 0 and zip_size_bytes < 50 * 1024 * 1024),

  manifest jsonb not null,

  min_claude_code_version text,
  min_cursor_version text,
  min_codex_version text,

  security_scan_status text default 'pending',
  security_scan_results jsonb,
  signature text,

  published_at timestamptz default now(),
  yanked_at timestamptz,
  yank_reason text,

  unique (skill_id, version)
);

create index idx_versions_skill on public.skill_versions(skill_id, published_at desc);
create index idx_versions_sha on public.skill_versions(zip_sha256);

alter table public.skills
  add constraint fk_current_version
  foreign key (current_version_id) references public.skill_versions(id) deferrable initially deferred;

-- =============================================================================
-- TABLE: purchases
-- =============================================================================

create table public.purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  skill_id uuid references public.skills(id) not null,
  version_id uuid references public.skill_versions(id),

  amount_cents integer not null check (amount_cents >= 0),
  currency text not null check (currency in ('EUR', 'USD', 'GBP')),
  vat_cents integer default 0,
  ls_order_id text not null,
  ls_subscription_id text,

  status purchase_status default 'pending',
  refunded_at timestamptz,
  refund_reason text,

  creator_share_cents integer not null,
  platform_share_cents integer not null,
  creator_paid_at timestamptz,

  created_at timestamptz default now(),

  unique (user_id, skill_id, ls_order_id)
);

create index idx_purchases_user on public.purchases(user_id, created_at desc);
create index idx_purchases_skill on public.purchases(skill_id, created_at desc);
create index idx_purchases_creator_unpaid on public.purchases(skill_id) where creator_paid_at is null and status = 'completed';
create index idx_purchases_ls_order on public.purchases(ls_order_id);

-- =============================================================================
-- TABLE: subscriptions
-- =============================================================================

create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  skill_id uuid references public.skills(id) not null,

  ls_subscription_id text unique not null,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_subs_user on public.subscriptions(user_id) where status = 'active';
create index idx_subs_skill on public.subscriptions(skill_id);

-- =============================================================================
-- TABLE: reviews
-- =============================================================================

create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  skill_id uuid references public.skills(id) not null,
  purchase_id uuid references public.purchases(id),

  rating integer not null check (rating between 1 and 5),
  title text check (length(title) <= 80),
  comment text check (length(comment) <= 2000),

  helpful_count integer default 0,
  reported_count integer default 0,

  creator_response text,
  creator_responded_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (user_id, skill_id)
);

create index idx_reviews_skill on public.reviews(skill_id, created_at desc);
create index idx_reviews_user on public.reviews(user_id);

-- =============================================================================
-- TABLE: install_tokens
-- =============================================================================

create table public.install_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,

  name text not null,
  token_hash text unique not null,
  token_prefix text not null,

  scopes text[] default array['install', 'list'],
  last_used_at timestamptz,
  last_used_ip inet,

  created_at timestamptz default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

create index idx_tokens_user on public.install_tokens(user_id) where revoked_at is null;
create index idx_tokens_hash on public.install_tokens(token_hash) where revoked_at is null;

-- =============================================================================
-- TABLE: installs
-- =============================================================================

create table public.installs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) not null,
  skill_id uuid references public.skills(id) not null,
  version_id uuid references public.skill_versions(id) not null,
  token_id uuid references public.install_tokens(id),

  platform platform not null,
  cli_version text,
  os text,
  os_arch text,
  ip inet,
  country text,

  installed_at timestamptz default now()
);

create index idx_installs_skill_date on public.installs(skill_id, installed_at desc);
create index idx_installs_user on public.installs(user_id);
create index idx_installs_version on public.installs(version_id);

-- =============================================================================
-- TABLE: bundles
-- =============================================================================

create table public.bundles (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  curator_id uuid references public.profiles(id) not null,

  name text not null,
  tagline text,
  description_md text,
  cover_url text,

  price_cents integer not null,
  discount_percent integer default 0 check (discount_percent between 0 and 80),
  ls_variant_id text,

  status skill_status default 'draft',

  created_at timestamptz default now(),
  published_at timestamptz
);

create table public.bundle_skills (
  bundle_id uuid references public.bundles(id) on delete cascade,
  skill_id uuid references public.skills(id) on delete cascade,
  display_order integer default 0,
  primary key (bundle_id, skill_id)
);

create index idx_bundles_curator on public.bundles(curator_id);
create index idx_bundles_status on public.bundles(status) where status = 'published';

-- =============================================================================
-- TABLE: payouts
-- =============================================================================

create table public.payouts (
  id uuid primary key default uuid_generate_v4(),
  creator_id uuid references public.profiles(id) not null,

  period_start date not null,
  period_end date not null,
  total_cents integer not null,
  currency text not null,

  status payout_status default 'pending',
  stripe_transfer_id text,
  paid_at timestamptz,
  failure_reason text,

  purchases_count integer default 0,

  created_at timestamptz default now(),

  unique (creator_id, period_start, period_end)
);

create index idx_payouts_creator on public.payouts(creator_id, period_start desc);

-- =============================================================================
-- TABLE: events (audit log + analytics)
-- =============================================================================

create table public.events (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id),
  event_type text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  ip inet,
  user_agent text,
  created_at timestamptz default now()
);

create index idx_events_user on public.events(user_id, created_at desc);
create index idx_events_type on public.events(event_type, created_at desc);
create index idx_events_entity on public.events(entity_type, entity_id) where entity_id is not null;

-- =============================================================================
-- FUNCTIONS / TRIGGERS COMMUNS
-- =============================================================================

create function public.update_skill_rating() returns trigger as $$
begin
  update public.skills
  set
    rating_avg = (select avg(rating)::numeric(2,1) from public.reviews where skill_id = coalesce(new.skill_id, old.skill_id)),
    rating_count = (select count(*) from public.reviews where skill_id = coalesce(new.skill_id, old.skill_id)),
    updated_at = now()
  where id = coalesce(new.skill_id, old.skill_id);
  return coalesce(new, old);
end;
$$ language plpgsql;

create trigger reviews_update_rating
after insert or update or delete on public.reviews
for each row execute function public.update_skill_rating();

create function public.update_skill_install_count() returns trigger as $$
begin
  update public.skills
  set install_count = install_count + 1,
      updated_at = now()
  where id = new.skill_id;
  return new;
end;
$$ language plpgsql;

create trigger installs_update_count
after insert on public.installs
for each row execute function public.update_skill_install_count();

create function public.updated_at_trigger() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.updated_at_trigger();
create trigger skills_updated_at before update on public.skills for each row execute function public.updated_at_trigger();
create trigger reviews_updated_at before update on public.reviews for each row execute function public.updated_at_trigger();
create trigger subscriptions_updated_at before update on public.subscriptions for each row execute function public.updated_at_trigger();

-- Auto-create profile on auth.users insert
create function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'preferred_username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Utilisateur')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
