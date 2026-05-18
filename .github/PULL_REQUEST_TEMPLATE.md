## Summary

<!-- One sentence describing what this PR does and why. -->

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New detection rule (RFC accepted in issue #___)
- [ ] Documentation update
- [ ] Refactor / internal improvement (no behavior change)
- [ ] Breaking change (would require version bump)

## Checklist

- [ ] `pnpm --filter cupel test` passes (all 37+ tests green)
- [ ] `pnpm --filter cupel typecheck` passes
- [ ] If adding a rule: added at least one positive test case AND one anti-false-positive test case
- [ ] If modifying CLI output: tested with `npx cupel` AND `cupel | grep` (NO_COLOR pipe)
- [ ] Commit messages follow conventional commits (`feat:`, `fix:`, `docs:`, `chore:`)
- [ ] No new `dependencies` added without justification (cupel ships zero-network — verify deps don't fetch at install/runtime)
- [ ] No `preinstall` / `postinstall` / `prepublish` scripts added
- [ ] CHANGELOG.md updated under `[Unreleased]` section

## Why this change

<!--
Explain the user-facing impact:
- Who benefits?
- What's the threat model justification (for rules) or DX gain (for refactors)?
- Any tradeoffs?
-->

## Test plan

<!--
How did you verify this works?
- Manual commands run
- Test cases added
- Real-world skill that triggered the bug, before/after
-->
