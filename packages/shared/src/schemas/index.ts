// Cupel — Zod schemas
// Author: Aïssa BELKOUSSA

import { z } from 'zod';
import { CATEGORIES, PLATFORMS, PRICING_MODELS } from '../constants';

export const skillManifestSchema = z.object({
  name: z.string().min(3).max(80),
  version: z.string().regex(/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/),
  description: z.string().min(10).max(500),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  category: z.enum(CATEGORIES),
  tags: z.array(z.string().min(2).max(30)).max(10).optional(),
  author: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().optional(),
    url: z.string().url().optional(),
  }),
  files: z.array(
    z.object({
      path: z.string().min(1),
      sha256: z.string().length(64),
      size: z.number().int().positive(),
    }),
  ).min(1),
  dependencies: z.record(z.string()).optional(),
  min_platform_versions: z.record(z.string()).optional(),
});

export type SkillManifestInput = z.input<typeof skillManifestSchema>;

export const profileUpdateSchema = z.object({
  display_name: z.string().min(2).max(80),
  bio: z.string().max(500).optional().nullable(),
  website_url: z.string().url().optional().nullable(),
  twitter_handle: z.string().regex(/^@?[a-zA-Z0-9_]{1,15}$/).optional().nullable(),
  github_handle: z.string().regex(/^[a-zA-Z0-9-]{1,39}$/).optional().nullable(),
});

export const skillSubmissionSchema = z.object({
  name: z.string().min(3).max(80),
  slug: z.string().regex(/^[a-z0-9-]{3,60}$/),
  tagline: z.string().min(10).max(160),
  description_md: z.string().min(50).max(20000),
  category: z.enum(CATEGORIES),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  tags: z.array(z.string()).max(10),
  pricing_model: z.enum(PRICING_MODELS),
  price_cents: z.number().int().nonnegative(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(80).optional(),
  comment: z.string().max(2000).optional(),
});
