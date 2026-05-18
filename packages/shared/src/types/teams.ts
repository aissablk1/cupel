// Cupel — Teams (B2B) types
// Author: Aïssa BELKOUSSA

export const ORG_PLANS = ['free', 'teams', 'enterprise'] as const;
export type OrgPlan = (typeof ORG_PLANS)[number];

export const ORG_ROLES = ['owner', 'admin', 'member'] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const ORG_SKILL_VISIBILITIES = ['public', 'private', 'internal_only'] as const;
export type OrgSkillVisibility = (typeof ORG_SKILL_VISIBILITIES)[number];

export const ALLOWLIST_POLICIES = ['allow', 'block'] as const;
export type AllowlistPolicy = (typeof ALLOWLIST_POLICIES)[number];

export interface Organization {
  id: string;
  slug: string;
  name: string;
  plan: OrgPlan;
  seats_purchased: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_email: string | null;
  owner_id: string;
  trial_ends_at: string | null;
  suspended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  org_id: string;
  user_id: string;
  role: OrgRole;
  invited_email: string | null;
  invited_at: string | null;
  accepted_at: string | null;
  created_at: string;
}

export interface OrgInvite {
  id: string;
  org_id: string;
  email: string;
  role: OrgRole;
  token_hash: string;
  expires_at: string;
  accepted_at: string | null;
  invited_by: string | null;
  created_at: string;
}

export interface OrgSkill {
  org_id: string;
  skill_id: string;
  visibility: OrgSkillVisibility;
  added_by: string | null;
  added_at: string;
}

export interface AllowlistRule {
  id: string;
  org_id: string;
  skill_slug_pattern: string;
  policy: AllowlistPolicy;
  reason: string | null;
  created_by: string | null;
  created_at: string;
}

export type AuditEventType =
  | 'skill.installed'
  | 'skill.published_private'
  | 'skill.added_to_org'
  | 'skill.removed_from_org'
  | 'member.invited'
  | 'member.joined'
  | 'member.removed'
  | 'member.role_changed'
  | 'allowlist.added'
  | 'allowlist.removed'
  | 'org.plan_changed'
  | 'org.seats_changed'
  | 'org.suspended';

export interface AuditEvent {
  id: string;
  org_id: string | null;
  actor_user_id: string | null;
  event_type: AuditEventType | string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}
