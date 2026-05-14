-- =============================================================================
-- Forgekit — Audit log (org-scoped)
-- Author: Aïssa BELKOUSSA
-- Migration: 0007_audit_log
-- Date: 2026-05-15
-- =============================================================================

create table public.audit_events (
  id uuid primary key default uuid_generate_v4(),
  org_id uuid references public.organizations(id) on delete cascade,
  actor_user_id uuid references public.profiles(id) on delete set null,

  event_type text not null check (length(event_type) between 3 and 80),
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,

  ip inet,
  user_agent text,

  created_at timestamptz default now()
);

create index idx_audit_events_org on public.audit_events(org_id, created_at desc) where org_id is not null;
create index idx_audit_events_actor on public.audit_events(actor_user_id, created_at desc);
create index idx_audit_events_type on public.audit_events(event_type, created_at desc);
create index idx_audit_events_target on public.audit_events(target_type, target_id) where target_id is not null;

alter table public.audit_events enable row level security;

create policy "Admin org voit audit log"
  on public.audit_events for select
  using (
    org_id is not null and public.is_org_admin(org_id, auth.uid())
  );

create policy "Admin plateforme voit tous les audits"
  on public.audit_events for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

-- Insert via service_role uniquement (pas de policy → bloqué pour anon/authenticated)
