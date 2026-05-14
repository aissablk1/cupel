-- =============================================================================
-- Forgekit — Row Level Security policies
-- Author: Aïssa BELKOUSSA
-- Migration: 0002_rls
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.skills enable row level security;
alter table public.skill_versions enable row level security;
alter table public.skill_categories enable row level security;
alter table public.purchases enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reviews enable row level security;
alter table public.install_tokens enable row level security;
alter table public.installs enable row level security;
alter table public.bundles enable row level security;
alter table public.bundle_skills enable row level security;
alter table public.payouts enable row level security;
alter table public.events enable row level security;

-- =============================================================================
-- PROFILES
-- =============================================================================

create policy "Profiles publics en lecture"
  on public.profiles for select using (true);

create policy "User modifie son profil"
  on public.profiles for update using (auth.uid() = id);

create policy "User crée son profil"
  on public.profiles for insert with check (auth.uid() = id);

-- =============================================================================
-- SKILL_CATEGORIES (lecture publique)
-- =============================================================================

create policy "Catégories publiques"
  on public.skill_categories for select using (true);

-- =============================================================================
-- SKILLS
-- =============================================================================

create policy "Skills publiés ou propres ou admin visibles"
  on public.skills for select
  using (
    status = 'published'
    or creator_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and is_admin)
  );

create policy "Créateur gère ses skills"
  on public.skills for all
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

create policy "Admin gère tous les skills"
  on public.skills for all
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));

-- =============================================================================
-- SKILL_VERSIONS
-- =============================================================================

create policy "Versions visibles si skill visible"
  on public.skill_versions for select
  using (
    exists (
      select 1 from public.skills s
      where s.id = skill_versions.skill_id
      and (s.status = 'published' or s.creator_id = auth.uid())
    )
  );

create policy "Créateur publie versions"
  on public.skill_versions for insert
  with check (
    exists (
      select 1 from public.skills s
      where s.id = skill_versions.skill_id
      and s.creator_id = auth.uid()
    )
  );

-- =============================================================================
-- PURCHASES (insert via service_role uniquement)
-- =============================================================================

create policy "User voit ses achats"
  on public.purchases for select
  using (user_id = auth.uid());

create policy "Créateur voit ventes de ses skills"
  on public.purchases for select
  using (
    exists (
      select 1 from public.skills s
      where s.id = purchases.skill_id
      and s.creator_id = auth.uid()
    )
  );

-- =============================================================================
-- SUBSCRIPTIONS
-- =============================================================================

create policy "User voit ses abonnements"
  on public.subscriptions for select
  using (user_id = auth.uid());

-- =============================================================================
-- REVIEWS
-- =============================================================================

create policy "Reviews publiques"
  on public.reviews for select using (true);

create policy "User review si achat complété"
  on public.reviews for insert
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.purchases p
      where p.user_id = auth.uid()
      and p.skill_id = reviews.skill_id
      and p.status = 'completed'
    )
  );

create policy "User modifie sa review"
  on public.reviews for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "User supprime sa review"
  on public.reviews for delete
  using (user_id = auth.uid());

-- =============================================================================
-- INSTALL_TOKENS
-- =============================================================================

create policy "User gère ses tokens"
  on public.install_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =============================================================================
-- INSTALLS
-- =============================================================================

create policy "User voit ses installs"
  on public.installs for select
  using (user_id = auth.uid());

create policy "Créateur voit installs de ses skills"
  on public.installs for select
  using (
    exists (
      select 1 from public.skills s
      where s.id = installs.skill_id
      and s.creator_id = auth.uid()
    )
  );

-- =============================================================================
-- BUNDLES
-- =============================================================================

create policy "Bundles publiés visibles"
  on public.bundles for select
  using (status = 'published' or curator_id = auth.uid());

create policy "Curator gère ses bundles"
  on public.bundles for all
  using (curator_id = auth.uid())
  with check (curator_id = auth.uid());

create policy "Bundle_skills visibles si bundle visible"
  on public.bundle_skills for select
  using (
    exists (
      select 1 from public.bundles b
      where b.id = bundle_skills.bundle_id
      and (b.status = 'published' or b.curator_id = auth.uid())
    )
  );

-- =============================================================================
-- PAYOUTS
-- =============================================================================

create policy "Créateur voit ses payouts"
  on public.payouts for select
  using (creator_id = auth.uid());

-- =============================================================================
-- EVENTS (admin uniquement en lecture)
-- =============================================================================

create policy "Admin voit events"
  on public.events for select
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin));
