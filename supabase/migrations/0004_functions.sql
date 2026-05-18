-- =============================================================================
-- Cupel — Utility SQL functions
-- Author: Aïssa BELKOUSSA
-- Migration: 0004_functions
-- Date: 2026-05-14
-- Notes: Idempotent — uses CREATE OR REPLACE.
-- =============================================================================

-- =============================================================================
-- FUNCTION: search_skills(query, lang)
-- Full-text search sur skills publiés, ranking par ts_rank + popularité.
-- lang ∈ ('french','english'); fallback 'simple' si autre valeur.
-- =============================================================================

create or replace function public.search_skills(
  p_query text,
  p_lang text default 'french',
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id uuid,
  slug text,
  name text,
  tagline text,
  category text,
  platforms platform[],
  price_cents integer,
  pricing_model pricing_model,
  install_count integer,
  rating_avg numeric,
  rating_count integer,
  rank real
)
language plpgsql
stable
as $$
declare
  v_cfg regconfig;
  v_tsq tsquery;
begin
  v_cfg := case lower(coalesce(p_lang, 'french'))
    when 'french' then 'french'::regconfig
    when 'fr' then 'french'::regconfig
    when 'english' then 'english'::regconfig
    when 'en' then 'english'::regconfig
    else 'simple'::regconfig
  end;

  if p_query is null or length(trim(p_query)) = 0 then
    return query
      select s.id, s.slug, s.name, s.tagline, s.category, s.platforms,
             s.price_cents, s.pricing_model, s.install_count,
             s.rating_avg, s.rating_count, 0::real as rank
      from public.skills s
      where s.status = 'published'
      order by s.install_count desc, s.rating_avg desc nulls last
      limit p_limit offset p_offset;
    return;
  end if;

  v_tsq := websearch_to_tsquery(v_cfg, p_query);

  return query
    select s.id, s.slug, s.name, s.tagline, s.category, s.platforms,
           s.price_cents, s.pricing_model, s.install_count,
           s.rating_avg, s.rating_count,
           ts_rank(s.search_vector, v_tsq) as rank
    from public.skills s
    where s.status = 'published'
      and s.search_vector @@ v_tsq
    order by rank desc, s.install_count desc
    limit p_limit offset p_offset;
end;
$$;

-- =============================================================================
-- FUNCTION: get_skill_stats(skill_id)
-- Stats agrégées 30j (installs, revenue, conversion) pour un skill.
-- =============================================================================

create or replace function public.get_skill_stats(p_skill_id uuid)
returns table (
  skill_id uuid,
  total_installs integer,
  installs_30d integer,
  total_revenue_cents bigint,
  revenue_30d_cents bigint,
  rating_avg numeric,
  rating_count integer,
  purchases_count integer,
  refunds_count integer,
  reviews_count integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return query
    select
      s.id as skill_id,
      s.install_count as total_installs,
      coalesce((
        select count(*)::integer from public.installs i
        where i.skill_id = s.id and i.installed_at > now() - interval '30 days'
      ), 0) as installs_30d,
      coalesce((
        select sum(p.amount_cents - p.vat_cents)::bigint from public.purchases p
        where p.skill_id = s.id and p.status = 'completed'
      ), 0) as total_revenue_cents,
      coalesce((
        select sum(p.amount_cents - p.vat_cents)::bigint from public.purchases p
        where p.skill_id = s.id and p.status = 'completed'
          and p.created_at > now() - interval '30 days'
      ), 0) as revenue_30d_cents,
      s.rating_avg,
      s.rating_count,
      coalesce((
        select count(*)::integer from public.purchases p
        where p.skill_id = s.id and p.status = 'completed'
      ), 0) as purchases_count,
      coalesce((
        select count(*)::integer from public.purchases p
        where p.skill_id = s.id and p.status = 'refunded'
      ), 0) as refunds_count,
      coalesce((
        select count(*)::integer from public.reviews r where r.skill_id = s.id
      ), 0) as reviews_count
    from public.skills s
    where s.id = p_skill_id;
end;
$$;

-- =============================================================================
-- FUNCTION: claim_pending_payouts(creator_id, period_start, period_end)
-- Calcule et crée un payout 'pending' agrégeant les purchases non payées
-- d'un créateur sur la fenêtre. Marque les purchases creator_paid_at.
-- Idempotent grâce à UNIQUE(creator_id, period_start, period_end).
-- =============================================================================

create or replace function public.claim_pending_payouts(
  p_creator_id uuid,
  p_period_start date,
  p_period_end date
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_cents bigint;
  v_count integer;
  v_currency text;
  v_payout_id uuid;
begin
  if p_period_end <= p_period_start then
    raise exception 'period_end must be > period_start';
  end if;

  -- Aggrégat sur purchases éligibles
  select
    coalesce(sum(p.creator_share_cents), 0)::bigint,
    count(*)::integer,
    coalesce(min(p.currency), 'EUR')
  into v_total_cents, v_count, v_currency
  from public.purchases p
  join public.skills s on s.id = p.skill_id
  where s.creator_id = p_creator_id
    and p.status = 'completed'
    and p.creator_paid_at is null
    and p.created_at >= p_period_start
    and p.created_at <  p_period_end + interval '1 day';

  if v_count = 0 or v_total_cents <= 0 then
    return null;
  end if;

  -- Crée ou retourne le payout existant pour cette fenêtre (idempotent)
  insert into public.payouts (
    creator_id, period_start, period_end,
    total_cents, currency, purchases_count, status
  )
  values (
    p_creator_id, p_period_start, p_period_end,
    v_total_cents, v_currency, v_count, 'pending'
  )
  on conflict (creator_id, period_start, period_end)
  do update set
    total_cents = excluded.total_cents,
    purchases_count = excluded.purchases_count
  returning id into v_payout_id;

  -- Marquer purchases comme payées (réserve la fenêtre)
  update public.purchases p
  set creator_paid_at = now()
  from public.skills s
  where s.id = p.skill_id
    and s.creator_id = p_creator_id
    and p.status = 'completed'
    and p.creator_paid_at is null
    and p.created_at >= p_period_start
    and p.created_at <  p_period_end + interval '1 day';

  return v_payout_id;
end;
$$;

-- =============================================================================
-- FUNCTION: increment_skill_revenue(p_skill_id, p_amount_cents)
-- Appelé par le webhook Lemon Squeezy pour incrémenter le compteur.
-- =============================================================================

create or replace function public.increment_skill_revenue(
  p_skill_id uuid,
  p_amount_cents integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount_cents is null or p_amount_cents = 0 then
    return;
  end if;
  update public.skills
  set revenue_cents = revenue_cents + p_amount_cents,
      updated_at = now()
  where id = p_skill_id;
end;
$$;

-- =============================================================================
-- GRANTS
-- =============================================================================

grant execute on function public.search_skills(text, text, integer, integer) to anon, authenticated;
grant execute on function public.get_skill_stats(uuid) to authenticated;
grant execute on function public.claim_pending_payouts(uuid, date, date) to service_role;
grant execute on function public.increment_skill_revenue(uuid, integer) to service_role;
