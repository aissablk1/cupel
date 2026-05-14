-- =============================================================================
-- Forgekit — Teams RLS policies
-- Author: Aïssa BELKOUSSA
-- Migration: 0006_teams_rls
-- Date: 2026-05-15
-- =============================================================================

alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.org_invites enable row level security;
alter table public.org_skills enable row level security;
alter table public.org_allowlist enable row level security;

-- =============================================================================
-- Helper: is_org_member / is_org_admin (SECURITY DEFINER pour éviter récursion RLS)
-- =============================================================================

create or replace function public.is_org_member(p_org_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org_id
      and m.user_id = p_user_id
      and m.accepted_at is not null
  );
$$;

create or replace function public.is_org_admin(p_org_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = p_org_id
      and m.user_id = p_user_id
      and m.accepted_at is not null
      and m.role in ('owner', 'admin')
  );
$$;

grant execute on function public.is_org_member(uuid, uuid) to authenticated;
grant execute on function public.is_org_admin(uuid, uuid) to authenticated;

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

create policy "Membres voient leur organisation"
  on public.organizations for select
  using (
    public.is_org_member(id, auth.uid())
    or owner_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

create policy "Owner crée son organisation"
  on public.organizations for insert
  with check (owner_id = auth.uid());

create policy "Admin org modifie organisation"
  on public.organizations for update
  using (public.is_org_admin(id, auth.uid()))
  with check (public.is_org_admin(id, auth.uid()));

create policy "Owner supprime organisation"
  on public.organizations for delete
  using (owner_id = auth.uid());

-- =============================================================================
-- ORG_MEMBERS
-- =============================================================================

create policy "Membres voient les autres membres de leur org"
  on public.org_members for select
  using (public.is_org_member(org_id, auth.uid()));

create policy "Admin org gère les membres"
  on public.org_members for all
  using (public.is_org_admin(org_id, auth.uid()))
  with check (public.is_org_admin(org_id, auth.uid()));

create policy "User accepte sa propre invitation"
  on public.org_members for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =============================================================================
-- ORG_INVITES
-- =============================================================================

create policy "Admin org voit invitations"
  on public.org_invites for select
  using (public.is_org_admin(org_id, auth.uid()));

create policy "Destinataire voit son invitation"
  on public.org_invites for select
  using (
    lower(email) = lower(coalesce(
      (select email from auth.users where id = auth.uid()),
      ''
    ))
  );

create policy "Admin org crée invitations"
  on public.org_invites for insert
  with check (public.is_org_admin(org_id, auth.uid()));

create policy "Admin org modifie invitations"
  on public.org_invites for update
  using (public.is_org_admin(org_id, auth.uid()))
  with check (public.is_org_admin(org_id, auth.uid()));

create policy "Admin org supprime invitations"
  on public.org_invites for delete
  using (public.is_org_admin(org_id, auth.uid()));

-- =============================================================================
-- ORG_SKILLS
-- =============================================================================

create policy "Membres voient skills de leur org"
  on public.org_skills for select
  using (public.is_org_member(org_id, auth.uid()));

create policy "Admin org gère skills de l'org"
  on public.org_skills for all
  using (public.is_org_admin(org_id, auth.uid()))
  with check (public.is_org_admin(org_id, auth.uid()));

-- =============================================================================
-- ORG_ALLOWLIST
-- =============================================================================

create policy "Membres voient allowlist"
  on public.org_allowlist for select
  using (public.is_org_member(org_id, auth.uid()));

create policy "Admin org gère allowlist"
  on public.org_allowlist for all
  using (public.is_org_admin(org_id, auth.uid()))
  with check (public.is_org_admin(org_id, auth.uid()));

-- =============================================================================
-- SKILLS — adapter la policy SELECT pour gérer is_private
-- =============================================================================

drop policy if exists "Skills publiés ou propres ou admin visibles" on public.skills;

create policy "Skills visibles selon visibilité et appartenance org"
  on public.skills for select
  using (
    -- Skills publics publiés
    (status = 'published' and is_private = false)
    -- Skills privés d'une org dont l'utilisateur est membre
    or (is_private = true and organization_id is not null and public.is_org_member(organization_id, auth.uid()))
    -- Créateur voit toujours ses skills
    or creator_id = auth.uid()
    -- Admin plateforme
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );
