-- =============================================================================
-- Forgekit — Teams (B2B organizations)
-- Author: Aïssa BELKOUSSA
-- Migration: 0005_teams
-- Date: 2026-05-15
-- =============================================================================

-- =============================================================================
-- ENUMS
-- =============================================================================

create type public.org_plan as enum ('free', 'teams', 'enterprise');
create type public.org_role as enum ('owner', 'admin', 'member');
create type public.org_skill_visibility as enum ('public', 'private', 'internal_only');
create type public.allowlist_policy as enum ('allow', 'block');

-- =============================================================================
-- TABLE: organizations
-- =============================================================================

create table public.organizations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null check (slug ~ '^[a-z0-9-]{3,40}$'),
  name text not null check (length(name) between 2 and 80),

  plan org_plan not null default 'free',
  seats_purchased integer not null default 0 check (seats_purchased >= 0),

  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  billing_email text,

  owner_id uuid not null references public.profiles(id),

  trial_ends_at timestamptz,
  suspended_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_organizations_slug on public.organizations(slug);
create index idx_organizations_stripe_customer on public.organizations(stripe_customer_id) where stripe_customer_id is not null;
create index idx_organizations_owner on public.organizations(owner_id);

create trigger organizations_updated_at
before update on public.organizations
for each row execute function public.updated_at_trigger();

-- =============================================================================
-- TABLE: org_members
-- =============================================================================

create table public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role org_role not null default 'member',

  invited_email text,
  invited_at timestamptz,
  accepted_at timestamptz,

  created_at timestamptz default now(),

  primary key (org_id, user_id)
);

create index idx_org_members_user on public.org_members(user_id);
create index idx_org_members_org on public.org_members(org_id);

-- =============================================================================
-- TABLE: org_invites
-- =============================================================================

create table public.org_invites (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null check (email ~ '^[^@]+@[^@]+\.[^@]+$'),
  role org_role not null default 'member',

  token_hash text unique not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,

  invited_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create index idx_org_invites_org on public.org_invites(org_id);
create index idx_org_invites_email on public.org_invites(lower(email)) where accepted_at is null;
create index idx_org_invites_token on public.org_invites(token_hash) where accepted_at is null;

-- =============================================================================
-- TABLE: skills extension — is_private + organization_id
-- =============================================================================

alter table public.skills
  add column is_private boolean not null default false,
  add column organization_id uuid references public.organizations(id) on delete set null;

create index idx_skills_organization on public.skills(organization_id) where organization_id is not null;
create index idx_skills_private on public.skills(organization_id, is_private) where is_private = true;

alter table public.skills
  add constraint skills_private_requires_org
  check ((is_private = false) or (organization_id is not null));

-- =============================================================================
-- TABLE: org_skills (skills exposés dans le périmètre d'une org)
-- =============================================================================

create table public.org_skills (
  org_id uuid not null references public.organizations(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  visibility org_skill_visibility not null default 'internal_only',
  added_by uuid references public.profiles(id),
  added_at timestamptz default now(),

  primary key (org_id, skill_id)
);

create index idx_org_skills_org on public.org_skills(org_id);
create index idx_org_skills_skill on public.org_skills(skill_id);

-- =============================================================================
-- TABLE: org_allowlist
-- =============================================================================

create table public.org_allowlist (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  skill_slug_pattern text not null check (length(skill_slug_pattern) between 1 and 120),
  policy allowlist_policy not null,
  reason text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),

  unique (org_id, skill_slug_pattern, policy)
);

create index idx_org_allowlist_org on public.org_allowlist(org_id);
