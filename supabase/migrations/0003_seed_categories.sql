-- =============================================================================
-- Forgekit — Seed categories
-- Author: Aïssa BELKOUSSA
-- Migration: 0003_seed_categories
-- =============================================================================

insert into public.skill_categories (slug, name_fr, name_en, description_fr, description_en, icon, display_order) values
  ('frontend',     'Frontend',     'Frontend',     'React, Vue, Svelte, CSS, animations',          'React, Vue, Svelte, CSS, animations',           'palette',     10),
  ('backend',      'Backend',      'Backend',      'API, bases de données, serveurs',              'APIs, databases, servers',                      'server',      20),
  ('devops',       'DevOps',       'DevOps',       'CI/CD, Docker, Kubernetes, monitoring',         'CI/CD, Docker, Kubernetes, monitoring',         'cloud',       30),
  ('seo',          'SEO',          'SEO',          'Optimisation, schema.org, GEO',                 'Optimization, schema.org, GEO',                 'trending-up', 40),
  ('design',       'Design',       'Design',       'UI/UX, design systems, Figma',                  'UI/UX, design systems, Figma',                  'pen-tool',    50),
  ('security',     'Sécurité',     'Security',     'OWASP, CVE, audits, hardening',                 'OWASP, CVE, audits, hardening',                 'shield',      60),
  ('content',      'Contenu',      'Content',      'Rédaction, copywriting, blog',                  'Writing, copywriting, blog',                    'pen',         70),
  ('data',         'Data',         'Data',         'Analytics, SQL, dashboards',                    'Analytics, SQL, dashboards',                    'bar-chart',   80),
  ('ai',           'IA / ML',      'AI / ML',      'Modèles, prompts, agents, RAG',                 'Models, prompts, agents, RAG',                  'sparkles',    90),
  ('productivity', 'Productivité', 'Productivity', 'Workflows, automations, agents',                'Workflows, automations, agents',                'zap',         100);
