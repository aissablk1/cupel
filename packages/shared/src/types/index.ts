// Forgekit — Types métier
// Author: Aïssa BELKOUSSA

import type { Category, Currency, Platform, PricingModel, SkillStatus } from '../constants';

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  website_url: string | null;
  twitter_handle: string | null;
  github_handle: string | null;
  is_verified_creator: boolean;
  is_admin: boolean;
  default_currency: Currency;
  locale: string;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  slug: string;
  creator_id: string;
  name: string;
  tagline: string;
  description_md: string;
  category: Category;
  tags: string[];
  platforms: Platform[];
  icon_url: string | null;
  cover_url: string | null;
  screenshots: string[];
  price_cents: number;
  pricing_model: PricingModel;
  status: SkillStatus;
  install_count: number;
  rating_avg: number | null;
  rating_count: number;
  current_version: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface SkillVersion {
  id: string;
  skill_id: string;
  version: string;
  changelog_md: string | null;
  r2_key: string;
  zip_sha256: string;
  zip_size_bytes: number;
  manifest: SkillManifest;
  signature: string | null;
  published_at: string;
  yanked_at: string | null;
}

export interface SkillManifest {
  name: string;
  version: string;
  description: string;
  platforms: Platform[];
  category: Category;
  tags?: string[];
  author: {
    name: string;
    email?: string;
    url?: string;
  };
  files: Array<{
    path: string;
    sha256: string;
    size: number;
  }>;
  dependencies?: Record<string, string>;
  min_platform_versions?: Partial<Record<Platform, string>>;
}

export interface Purchase {
  id: string;
  user_id: string;
  skill_id: string;
  version_id: string | null;
  amount_cents: number;
  currency: Currency;
  vat_cents: number;
  ls_order_id: string;
  status: 'pending' | 'completed' | 'refunded' | 'disputed';
  creator_share_cents: number;
  platform_share_cents: number;
  creator_paid_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  skill_id: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  comment: string | null;
  helpful_count: number;
  creator_response: string | null;
  created_at: string;
}

export interface InstallToken {
  id: string;
  user_id: string;
  name: string;
  token_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

export interface Payout {
  id: string;
  creator_id: string;
  period_start: string;
  period_end: string;
  total_cents: number;
  currency: Currency;
  status: 'pending' | 'processing' | 'paid' | 'failed';
  stripe_transfer_id: string | null;
  paid_at: string | null;
  purchases_count: number;
}
