-- =============================================================================
-- Cupel — Seed data (dev / demo)
-- Author: Aïssa BELKOUSSA
-- Date: 2026-05-14
-- Notes: Idempotent — utilise ON CONFLICT DO NOTHING. UUIDs déterministes.
--        Crée 2 utilisateurs system + 5 skills réalistes publiés.
--        NB: ce seed est destiné à l'environnement local. Les profiles sont
--        insérés directement (bypass trigger auth) pour la démo offline.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- auth.users (dev only) — Supabase local autorise l'insert direct
-- -----------------------------------------------------------------------------

insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_user_meta_data)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'system@cupel.local', '',
   now(), now(), now(), '{"preferred_username":"cupel","full_name":"Cupel Official"}'::jsonb),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'aissa@cupel.local', '',
   now(), now(), now(), '{"preferred_username":"aissa","full_name":"Aïssa BELKOUSSA"}'::jsonb)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- profiles (le trigger handle_new_user crée déjà les profiles ; on upsert)
-- -----------------------------------------------------------------------------

insert into public.profiles (id, username, display_name, bio, is_verified_creator, is_admin, locale)
values
  ('00000000-0000-0000-0000-000000000001', 'cupel', 'Cupel Official',
   'Compte officiel — skills curés par l''équipe.', true, true, 'fr'),
  ('00000000-0000-0000-0000-000000000002', 'aissa', 'Aïssa BELKOUSSA',
   'Builder du marketplace. Skills frontend, SEO, sécurité.', true, true, 'fr')
on conflict (id) do update set
  username = excluded.username,
  display_name = excluded.display_name,
  bio = excluded.bio,
  is_verified_creator = excluded.is_verified_creator,
  is_admin = excluded.is_admin;

-- -----------------------------------------------------------------------------
-- skills (5 démo, status='published')
-- -----------------------------------------------------------------------------

insert into public.skills (
  id, slug, creator_id, name, tagline, description_md, category, tags,
  platforms, price_cents, pricing_model, status, current_version,
  install_count, rating_avg, rating_count, published_at
) values
  (
    '10000000-0000-0000-0000-000000000001',
    'seo-auditor',
    '00000000-0000-0000-0000-000000000002',
    'SEO Auditor',
    'Audit SEO technique complet — Core Web Vitals, schema.org, GEO, AI Overviews.',
    E'# SEO Auditor\n\nSkill spécialisé en audit SEO technique pour devs.\n\n## Capacités\n- Audit Lighthouse + Core Web Vitals (LCP, INP, CLS)\n- Vérification schema.org / JSON-LD\n- Détection erreurs canonical, hreflang, sitemap\n- Optimisation GEO (Generative Engine Optimization)\n- Rapport actionnable Markdown\n\n## Installation\n```bash\ncupel install seo-auditor\n```',
    'seo',
    array['seo','lighthouse','schema-org','geo','core-web-vitals'],
    array['claude_code','cursor','codex']::platform[],
    0, 'free', 'published', '1.2.0',
    1247, 4.8, 89, now() - interval '60 days'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'typescript-expert',
    '00000000-0000-0000-0000-000000000002',
    'TypeScript Expert',
    'Refactoring TypeScript strict — types avancés, génériques, narrowing, perf.',
    E'# TypeScript Expert\n\nRefactoring et conception TypeScript niveau senior.\n\n## Capacités\n- Migration JS → TS strict\n- Types conditionnels, mapped types, template literals\n- Discriminated unions et narrowing exhaustif\n- Suppression des `any` implicites\n- Optimisation perf tsc / project references\n\n## Pricing\n2 900 ¢ EUR (29 €) — licence perpétuelle.',
    'backend',
    array['typescript','refactoring','types','dx'],
    array['claude_code','cursor','codex','windsurf']::platform[],
    2900, 'one_shot', 'published', '2.0.1',
    312, 4.9, 47, now() - interval '45 days'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'frontend-design-pro',
    '00000000-0000-0000-0000-000000000001',
    'Frontend Design Pro',
    'Interfaces premium production-grade — anti-AI-slop, Framer Motion, Tailwind.',
    E'# Frontend Design Pro\n\nGénère des interfaces distinctives sans AI-slop.\n\n## Stack supportée\n- Tailwind CSS v4\n- Framer Motion / motion-react\n- shadcn/ui\n- 11 directions esthétiques (editorial, brutalist, glass, etc.)\n\n## Garanties\n- Polices whitelist Apple/Linear/Vercel\n- Touch targets WCAG 2.2 AA\n- Respect prefers-reduced-motion',
    'frontend',
    array['tailwind','framer-motion','shadcn','design-system'],
    array['claude_code','cursor']::platform[],
    4900, 'one_shot', 'published', '3.1.0',
    856, 4.7, 134, now() - interval '90 days'
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'cve-analyzer',
    '00000000-0000-0000-0000-000000000001',
    'CVE Analyzer',
    'Scan exhaustif des CVE dans les dépendances — 9 écosystèmes, 4 sources (OSV, NVD, EPSS, KEV).',
    E'# CVE Analyzer\n\nScan supply chain et vulnérabilités.\n\n## Sources\n- OSV.dev (Google)\n- NVD (NIST)\n- EPSS (FIRST.org)\n- CISA KEV\n\n## Écosystèmes\nnpm, PyPI, Go, Rust, Ruby, Maven, PHP, NuGet, Dart.\n\n## Sortie\nRapport Markdown + JSON + SARIF pour CI/CD.',
    'security',
    array['cve','owasp','supply-chain','sarif','sast'],
    array['claude_code','cursor','codex','windsurf','gemini_cli']::platform[],
    0, 'free', 'published', '1.4.2',
    2103, 4.9, 211, now() - interval '120 days'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'rag-architect',
    '00000000-0000-0000-0000-000000000002',
    'RAG Architect',
    'Conception pipelines RAG production — chunking, embeddings, reranking, evals.',
    E'# RAG Architect\n\nDesign de pipelines RAG production-ready.\n\n## Couvre\n- Stratégies de chunking (semantic, recursive, agentic)\n- Choix embeddings (OpenAI, Voyage, Cohere, local)\n- Reranking (Cohere, BGE, ColBERT)\n- Eval pipelines (RAGAS, TruLens)\n- Hybrid search (BM25 + dense)\n\n## Pricing\nAbonnement 19 €/mois — accès continu + updates.',
    'ai',
    array['rag','embeddings','llm','vector-db','evals'],
    array['claude_code','cursor','codex']::platform[],
    1900, 'subscription', 'published', '0.9.4',
    478, 4.6, 62, now() - interval '30 days'
  )
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- skill_versions (une version courante par skill)
-- -----------------------------------------------------------------------------

insert into public.skill_versions (
  id, skill_id, version, changelog_md, r2_key, zip_sha256, zip_size_bytes,
  manifest, security_scan_status, published_at
) values
  ('20000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-000000000001', '1.2.0',
   'Ajout audit GEO + AI Overviews.',
   'skills/seo-auditor/1.2.0.zip',
   'aaaa1111aaaa1111aaaa1111aaaa1111aaaa1111aaaa1111aaaa1111aaaa1111',
   245678,
   '{"name":"seo-auditor","entry":"SKILL.md","platforms":["claude_code","cursor","codex"]}'::jsonb,
   'passed', now() - interval '60 days'),
  ('20000000-0000-0000-0000-000000000002',
   '10000000-0000-0000-0000-000000000002', '2.0.1',
   'Fix narrowing sur unions discriminées.',
   'skills/typescript-expert/2.0.1.zip',
   'bbbb2222bbbb2222bbbb2222bbbb2222bbbb2222bbbb2222bbbb2222bbbb2222',
   312456,
   '{"name":"typescript-expert","entry":"SKILL.md"}'::jsonb,
   'passed', now() - interval '45 days'),
  ('20000000-0000-0000-0000-000000000003',
   '10000000-0000-0000-0000-000000000003', '3.1.0',
   'Tailwind v4, support container queries.',
   'skills/frontend-design-pro/3.1.0.zip',
   'cccc3333cccc3333cccc3333cccc3333cccc3333cccc3333cccc3333cccc3333',
   489012,
   '{"name":"frontend-design-pro","entry":"SKILL.md"}'::jsonb,
   'passed', now() - interval '90 days'),
  ('20000000-0000-0000-0000-000000000004',
   '10000000-0000-0000-0000-000000000004', '1.4.2',
   'Ajout EPSS + KEV scoring composite.',
   'skills/cve-analyzer/1.4.2.zip',
   'dddd4444dddd4444dddd4444dddd4444dddd4444dddd4444dddd4444dddd4444',
   567890,
   '{"name":"cve-analyzer","entry":"SKILL.md"}'::jsonb,
   'passed', now() - interval '120 days'),
  ('20000000-0000-0000-0000-000000000005',
   '10000000-0000-0000-0000-000000000005', '0.9.4',
   'Support reranking ColBERT.',
   'skills/rag-architect/0.9.4.zip',
   'eeee5555eeee5555eeee5555eeee5555eeee5555eeee5555eeee5555eeee5555',
   198765,
   '{"name":"rag-architect","entry":"SKILL.md"}'::jsonb,
   'passed', now() - interval '30 days')
on conflict (id) do nothing;

-- Lier current_version_id
update public.skills set current_version_id = '20000000-0000-0000-0000-000000000001' where id = '10000000-0000-0000-0000-000000000001';
update public.skills set current_version_id = '20000000-0000-0000-0000-000000000002' where id = '10000000-0000-0000-0000-000000000002';
update public.skills set current_version_id = '20000000-0000-0000-0000-000000000003' where id = '10000000-0000-0000-0000-000000000003';
update public.skills set current_version_id = '20000000-0000-0000-0000-000000000004' where id = '10000000-0000-0000-0000-000000000004';
update public.skills set current_version_id = '20000000-0000-0000-0000-000000000005' where id = '10000000-0000-0000-0000-000000000005';
