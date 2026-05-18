# Cupel — Roadmap

> Live document. Updated after each release. The strategic plan stays private (Notion); this page is the public commitment.

## Now — May 2026

**v0.3.0** *(current release)*

- 14 detection rules, including 3 LLM-native vectors (`invisible_unicode`, `tool_poisoning_directive`, `hex_escape_chain`)
- SARIF 2.1.0 output (`--sarif`) for GitHub Code Scanning, GitLab Code Quality, VS Code SARIF Viewer
- Multi-platform scan (Claude Code, Cursor, Codex, Windsurf, Gemini CLI, Continue, GitHub Copilot CLI)
- 37 unit tests, zero network, MIT

## Next — Q3 2026 (target: v0.4 in June, v0.5 in August)

**v0.4 — Reduce false positives**

The current rules are intentionally conservative. The biggest source of friction reported is that `rm -rf /` inside a markdown doc-as-example (think "what NOT to do" sections) triggers a `danger` tier.

- Distinguish *code context* (fenced ``` blocks in `.md`) from *script context* (raw `.sh`, `.py`, `.js` files)
- New tier modifier: `pattern_in_doc_block` → downgrade severity by one level
- Support `.cupelignore` file at skill root for known-safe patterns
- Support `<!-- cupel:ignore-line -->` inline override

**v0.5 — Incremental scan cache**

For CI pre-commit hooks on monorepos with 100+ skills, re-running cupel on every commit is wasteful when most files haven't changed.

- `~/.cache/cupel/` keyed by `mtime + sha1` per file
- Re-run only on diff
- `--no-cache` flag for forensic full scans
- Expected: 50× speedup on warm runs

## Later — Q4 2026 (target: v1.0 in October)

**v1.0 — AST-based detection for JS/TS/Python**

Regex catches the easy cases. The hard cases are obfuscations like `eval ( atob ( ... ) )` with weird whitespace, or `globalThis['ev'+'al']`. A tolerant AST parser (acorn-loose for JS/TS, tree-sitter via WASM for Python) closes that gap.

- New `packages/cli/src/lib/ast-rules.ts`
- Limited to `.js`, `.ts`, `.py` files (regex stays for `.md`, `.sh`, etc.)
- Same scoring model, same tiers

**v1.0 — Signed skill manifests (proposal phase)**

The biggest hole in the AI supply chain right now: no public skill registry signs publications. cupel currently flags this as `unsigned` because the convention doesn't exist yet.

I'll propose a minimal ed25519 manifest format (`.cupel-sig` file at skill root, signing the canonical JSON form of the skill metadata) and see if any registry (awesome-claude-code, Anthropic's official catalog when it ships) adopts it. If no traction by v1.0, the `unsigned` rule weight drops to 1 (informational only).

## Maybe — 2027+

- **Marketplace component** (`cupel install`, `cupel publish`) — only if community demand justifies the maintenance cost
- **Web UI for SARIF report visualization** — currently better served by GitHub Code Scanning UI for free
- **Cloud SaaS multi-tenant** — explicitly NOT on the roadmap (would kill the zero-network value prop)

## Not on the roadmap (and won't be)

These have been suggested. They're declined intentionally:

- **YAML rule files contributed by users** (e.g., `.cupel/rules/*.yaml`) — multiplies the attack surface, dilutes editorial responsibility, breaks reproducibility of scores across machines. Stay opinionated.
- **Auto-fix mode** (`cupel --fix`) — the whole point is human judgment after detection. Auto-fix would create a false sense of security.
- **Built-in telemetry** — ever. No exceptions.
- **Bundling third-party AI agents for review** — cupel sends nothing over the network. Period.

---

## How to influence this roadmap

1. **Open an RFC issue** with the `rule_proposal` template — for new detection rules
2. **Comment on an existing issue** — for prioritization signals
3. **Open a PR** with a `WIP` label — for implementation discussions

The maintainer ([@aissablk1](https://github.com/aissablk1)) reads every issue. Response time SLA: 7 days. If you don't hear back, comment again — the issue may have fallen off the triage list.

Last updated: 2026-05-18
