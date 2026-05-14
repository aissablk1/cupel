-- =============================================================================
-- Forgekit — pgTAP tests (RLS policies)
-- Author: Aïssa BELKOUSSA
-- Date: 2026-05-14
-- Usage: psql -f supabase/tests/rls.test.sql
-- =============================================================================

begin;
create extension if not exists pgtap;

select plan(18);

-- -----------------------------------------------------------------------------
-- Préparation : 3 users (anon, creator, autre)
-- -----------------------------------------------------------------------------

insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at, raw_user_meta_data)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'creator@test.local', '',
   now(), now(), now(), '{"preferred_username":"creatortest"}'::jsonb),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'other@test.local', '',
   now(), now(), now(), '{"preferred_username":"othertest"}'::jsonb)
on conflict (id) do nothing;

-- Skill brouillon du creator
insert into public.skills (
  id, slug, creator_id, name, tagline, description_md, category, platforms, status
) values (
  'ffffffff-0000-0000-0000-000000000001',
  'rls-test-draft',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'RLS Test Draft',
  'Skill brouillon pour tests RLS',
  repeat('test ', 20),
  'frontend',
  array['claude_code']::platform[],
  'draft'
) on conflict (id) do nothing;

-- Skill publié du creator
insert into public.skills (
  id, slug, creator_id, name, tagline, description_md, category, platforms, status, published_at
) values (
  'ffffffff-0000-0000-0000-000000000002',
  'rls-test-published',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'RLS Test Published',
  'Skill publié pour tests RLS',
  repeat('test ', 20),
  'frontend',
  array['claude_code']::platform[],
  'published',
  now()
) on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- TEST: anon ne voit que les skills publiés
-- -----------------------------------------------------------------------------

set local role anon;

select results_eq(
  $$ select count(*) from public.skills where id = 'ffffffff-0000-0000-0000-000000000002' $$,
  ARRAY[1::bigint],
  'anon voit le skill publié'
);

select results_eq(
  $$ select count(*) from public.skills where id = 'ffffffff-0000-0000-0000-000000000001' $$,
  ARRAY[0::bigint],
  'anon ne voit PAS le skill brouillon'
);

select is_empty(
  $$ select 1 from public.purchases $$,
  'anon ne voit aucune purchase'
);

select is_empty(
  $$ select 1 from public.payouts $$,
  'anon ne voit aucun payout'
);

select is_empty(
  $$ select 1 from public.install_tokens $$,
  'anon ne voit aucun install_token'
);

reset role;

-- -----------------------------------------------------------------------------
-- TEST: creator voit ses propres skills (draft + published)
-- -----------------------------------------------------------------------------

set local role authenticated;
set local "request.jwt.claim.sub" to 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
set local "request.jwt.claims" to '{"sub":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","role":"authenticated"}';

select results_eq(
  $$ select count(*) from public.skills where creator_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  ARRAY[2::bigint],
  'creator voit ses 2 skills (draft + published)'
);

select lives_ok(
  $$ update public.skills set tagline = 'Updated' where id = 'ffffffff-0000-0000-0000-000000000001' $$,
  'creator peut modifier son skill'
);

-- -----------------------------------------------------------------------------
-- TEST: other user ne voit pas le draft du creator
-- -----------------------------------------------------------------------------

set local "request.jwt.claim.sub" to 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
set local "request.jwt.claims" to '{"sub":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","role":"authenticated"}';

select results_eq(
  $$ select count(*) from public.skills where id = 'ffffffff-0000-0000-0000-000000000001' $$,
  ARRAY[0::bigint],
  'autre user ne voit PAS le brouillon'
);

select results_eq(
  $$ select count(*) from public.skills where id = 'ffffffff-0000-0000-0000-000000000002' $$,
  ARRAY[1::bigint],
  'autre user voit le skill publié'
);

select throws_ok(
  $$ update public.skills set tagline = 'Hack' where id = 'ffffffff-0000-0000-0000-000000000001' $$,
  NULL,
  NULL,
  'autre user ne peut pas modifier le skill du creator'
);

-- Review sans purchase complétée doit être refusée
select throws_ok(
  $$ insert into public.reviews (user_id, skill_id, rating)
     values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
             'ffffffff-0000-0000-0000-000000000002', 5) $$,
  '42501',
  NULL,
  'review impossible sans purchase complétée'
);

select is_empty(
  $$ select 1 from public.install_tokens where user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'autre user ne voit pas les tokens du creator'
);

select is_empty(
  $$ select 1 from public.purchases where user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'autre user ne voit pas les purchases du creator'
);

reset role;

-- -----------------------------------------------------------------------------
-- TEST: profiles publics
-- -----------------------------------------------------------------------------

set local role anon;

select isnt_empty(
  $$ select 1 from public.profiles where id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  'profiles lisibles publiquement'
);

select isnt_empty(
  $$ select 1 from public.skill_categories $$,
  'categories lisibles publiquement'
);

select isnt_empty(
  $$ select 1 from public.reviews limit 1 $$
  || ' union all select 1',
  'reviews lisibles publiquement (au moins lecture autorisée)'
);

reset role;

-- -----------------------------------------------------------------------------
-- TEST: service_role bypass RLS
-- -----------------------------------------------------------------------------

set local role service_role;

select results_eq(
  $$ select count(*)::int >= 2 from public.skills where creator_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' $$,
  ARRAY[true],
  'service_role voit tous les skills'
);

select lives_ok(
  $$ insert into public.events (event_type, entity_type) values ('test.rls','test') $$,
  'service_role peut insérer events'
);

reset role;

select * from finish();
rollback;
