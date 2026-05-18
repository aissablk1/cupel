# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in cupel, **please do not open a public GitHub issue**.

### Preferred: GitHub Private Vulnerability Reporting

Use GitHub's coordinated disclosure feature:
[github.com/aissablk1/cupel/security/advisories/new](https://github.com/aissablk1/cupel/security/advisories/new)

### Fallback: Email

If GitHub PVR is unavailable, email **contact@aissabelkoussa.fr** with subject `[cupel-security]`.

Include in your report:
- A description of the vulnerability
- Steps to reproduce (with a minimal proof of concept if possible)
- Impact assessment (data exfil, RCE, denial of service, etc.)
- Suggested remediation if you have one

## Response timeline

| Stage | Target |
|---|---|
| Acknowledge receipt | within 48 hours |
| Initial assessment | within 7 days |
| Patch released | within 30 days for High/Critical |
| Public disclosure | coordinated with reporter, after patch is published |

For high-severity issues (RCE, data exfiltration, privilege escalation), I will request CVE attribution via MITRE.

## Scope

In scope:
- The `cupel` CLI package on npm
- The `@cupel/*` workspace packages
- This GitHub repository's CI/CD pipeline

Out of scope:
- Issues in the user's own `~/.claude/skills/` content (cupel detects them, doesn't own them)
- Third-party plugins or forks of cupel
- Social engineering or physical attacks
- Denial of service via extremely large skill files (cupel caps reads at 512 KiB intentionally)

## Bug bounty

cupel is a solo open-source project. There is no formal bug bounty program.

If your report leads to a published patch, you will be credited in the release notes and the `CHANGELOG.md` (unless you prefer anonymity). For severe vulnerabilities, I'll happily provide a written endorsement for your portfolio / CV.

## Supply chain transparency

- **Lockfile committed**: `pnpm-lock.yaml` in repo, audited on every CI run
- **No lifecycle scripts**: `package.json` ships with zero `preinstall` / `postinstall` / `prepublish` hooks. `npx cupel` runs only the bundled `bin/cupel.mjs`.
- **npm provenance**: releases are published with `--provenance` (sigstore signature) — verify with `npm audit signatures`
- **Reproducible build**: `tsup` produces deterministic output; the `dist/` matches what GitHub Actions builds from the tagged commit

## Defensive packages

To protect against typosquatting, cupel reserves the following npm names that redirect to the canonical package:

- `cuple`
- `cupel-cli`
- `cupel-scanner`
- `@cupel/cli`

If you typed one of these by mistake, the package's README points back here. Do not use any other name claiming to be cupel.

---

**Author**: Aïssa BELKOUSSA — [aissabelkoussa.fr](https://aissabelkoussa.fr)
