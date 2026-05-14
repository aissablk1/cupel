/**
 * Forgekit — scripts/lemonsqueezy/setup-products.ts
 * Author: Aïssa BELKOUSSA
 * Created: 2026-05-14
 *
 * Crée / synchronise les produits Lemon Squeezy à partir des skills publiés
 * en base Supabase (table `skills` where `status='published'`).
 *
 * Idempotent : si un produit LS existe déjà avec le slug en `custom_data.slug`,
 * met à jour le prix au lieu de créer.
 *
 * Usage:
 *   pnpm tsx scripts/lemonsqueezy/setup-products.ts            # dry-run
 *   pnpm tsx scripts/lemonsqueezy/setup-products.ts --apply    # applique
 *
 * Env requis : LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID,
 *              SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  ls_product_id: string | null;
  ls_variant_id: string | null;
};

const LS_API = 'https://api.lemonsqueezy.com/v1';
const APPLY = process.argv.includes('--apply');

const env = (k: string): string => {
  const v = process.env[k];
  if (!v) throw new Error(`Env ${k} manquant`);
  return v;
};

const headers = (): HeadersInit => ({
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json',
  Authorization: `Bearer ${env('LEMONSQUEEZY_API_KEY')}`,
});

async function lsFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${LS_API}${path}`, { ...init, headers: headers() });
  if (!res.ok) {
    throw new Error(`LS ${init?.method ?? 'GET'} ${path} -> ${res.status} ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

async function createProduct(skill: Skill): Promise<{ productId: string; variantId: string }> {
  const body = {
    data: {
      type: 'products',
      attributes: {
        store_id: Number(env('LEMONSQUEEZY_STORE_ID')),
        name: skill.name,
        description: skill.description.slice(0, 500),
        status: 'published',
        price: skill.price_cents,
      },
    },
  };
  const product = await lsFetch<{ data: { id: string } }>('/products', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const variants = await lsFetch<{ data: Array<{ id: string }> }>(
    `/variants?filter[product_id]=${product.data.id}`,
  );

  return { productId: product.data.id, variantId: variants.data[0]!.id };
}

async function updateVariantPrice(variantId: string, price_cents: number): Promise<void> {
  await lsFetch(`/variants/${variantId}`, {
    method: 'PATCH',
    body: JSON.stringify({
      data: { type: 'variants', id: variantId, attributes: { price: price_cents } },
    }),
  });
}

async function main(): Promise<void> {
  const supabase = createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'));

  const { data: skills, error } = await supabase
    .from('skills')
    .select('id, slug, name, description, price_cents, ls_product_id, ls_variant_id')
    .eq('status', 'published');
  if (error) throw error;

  console.log(`[setup-products] ${skills.length} skills publiés. apply=${APPLY}`);

  for (const skill of skills as Skill[]) {
    if (skill.price_cents === 0) {
      console.log(`  skip (free): ${skill.slug}`);
      continue;
    }

    if (skill.ls_product_id && skill.ls_variant_id) {
      console.log(`  update price: ${skill.slug} -> ${skill.price_cents}c`);
      if (APPLY) await updateVariantPrice(skill.ls_variant_id, skill.price_cents);
      continue;
    }

    console.log(`  create: ${skill.slug} (${skill.price_cents}c)`);
    if (APPLY) {
      const { productId, variantId } = await createProduct(skill);
      const { error: upErr } = await supabase
        .from('skills')
        .update({ ls_product_id: productId, ls_variant_id: variantId })
        .eq('id', skill.id);
      if (upErr) throw upErr;
    }
  }

  console.log(`[setup-products] done.${APPLY ? '' : ' (dry-run, ajouter --apply)'}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
