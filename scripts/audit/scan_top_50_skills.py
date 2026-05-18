"""
Cupel — scan des 50 skills Claude Code les plus visibles.

Clone awesome-claude-code (+ alternatives), extrait les répertoires de skills,
lance `cupel --json` sur chacun, agrège les résultats en JSON + Markdown.

Sortie :
- docs/audit/scan_results.json  — données brutes (tous les audits)
- docs/audit/scan_summary.md     — synthèse pour l'article blog

Usage :
  python3 scripts/audit/scan_top_50_skills.py

Auteur : Aïssa BELKOUSSA
"""
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

SOURCES = [
    ("anthropics/awesome-claude-code", "https://github.com/anthropics/awesome-claude-code"),
    ("hesreallyhim/awesome-claude-code-agents", "https://github.com/hesreallyhim/awesome-claude-code-agents"),
]

WORK_DIR = Path("/tmp/cupel-audit") / datetime.now().strftime("%Y-%m-%d")
ROOT = Path(__file__).resolve().parent.parent.parent
RESULTS_DIR = ROOT / "docs" / "audit"

CUPEL_BIN_LOCAL = ROOT / "packages" / "cli" / "bin" / "cupel.mjs"


def run(cmd, **kwargs):
    """Run a shell command, capture output, raise on error."""
    return subprocess.run(cmd, capture_output=True, text=True, check=False, **kwargs)


def clone(slug: str, url: str) -> Path:
    target = WORK_DIR / slug.replace("/", "__")
    if target.exists():
        shutil.rmtree(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    result = run(["git", "clone", "--depth", "1", url, str(target)])
    if result.returncode != 0:
        print(f"  ⚠ clone failed for {slug}: {result.stderr.strip()[:200]}", file=sys.stderr)
        return None
    return target


def extract_skills(repo_root: Path, limit: int = 30) -> list[Path]:
    """Find candidate skills: a directory containing SKILL.md, or a single .md file in `agents/`."""
    skills = set()
    # Pattern 1 : SKILL.md à n'importe quelle profondeur
    for skill_md in repo_root.rglob("SKILL.md"):
        skills.add(skill_md.parent)
    # Pattern 2 : dossier agents/* ou skills/* contenant des .md
    for pattern in ("agents", "skills"):
        for d in repo_root.rglob(pattern):
            if not d.is_dir():
                continue
            for child in d.iterdir():
                if child.is_dir():
                    skills.add(child)
                elif child.is_file() and child.suffix == ".md" and child.name.lower() != "readme.md":
                    skills.add(child.parent)
    skills = sorted(skills, key=lambda p: str(p).lower())
    return skills[:limit]


def cupel_doctor(skill_dir: Path) -> dict:
    """Run cupel doctor on a skill directory, return parsed JSON."""
    if shutil.which("cupel"):
        cmd = ["cupel", "--path", str(skill_dir), "--json"]
    elif CUPEL_BIN_LOCAL.exists():
        cmd = ["node", str(CUPEL_BIN_LOCAL), "--path", str(skill_dir), "--json"]
    else:
        return {"error": "cupel binary not found (install via `npm i -g cupel` or build locally)"}
    result = run(cmd, timeout=30)
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"error": "JSON parse failed", "stderr": result.stderr[:200], "stdout": result.stdout[:200]}


def aggregate(reports: list[dict]) -> dict:
    """Aggregate scan results into stats for article."""
    stats = {
        "scanned_at": datetime.now().isoformat(),
        "total_skills": 0,
        "by_tier": {"ok": 0, "warn": 0, "danger": 0},
        "by_signal": {},
        "by_platform": {},
    }
    for r in reports:
        audits = r.get("audits", [])
        for a in audits:
            stats["total_skills"] += 1
            tier = a.get("tier", "unknown")
            stats["by_tier"][tier] = stats["by_tier"].get(tier, 0) + 1
            platform = a.get("platform", "unknown")
            stats["by_platform"][platform] = stats["by_platform"].get(platform, 0) + 1
            for sig in a.get("signals", []):
                kind = sig.get("kind", "unknown")
                stats["by_signal"][kind] = stats["by_signal"].get(kind, 0) + 1
    stats["top_signals"] = sorted(stats["by_signal"].items(), key=lambda x: -x[1])[:10]
    return stats


def write_markdown_summary(stats: dict, output: Path):
    total = stats["total_skills"]
    danger = stats["by_tier"]["danger"]
    warn = stats["by_tier"]["warn"]
    ok = stats["by_tier"]["ok"]
    danger_pct = round(100 * danger / max(total, 1), 1)
    warn_pct = round(100 * warn / max(total, 1), 1)
    lines = [
        f"# Audit cupel — synthèse du scan",
        "",
        f"**Date** : {stats['scanned_at']}",
        f"**Total skills scannés** : {total}",
        "",
        "## Répartition par tier",
        "",
        f"- **danger** : {danger} ({danger_pct} %)",
        f"- **warn**   : {warn} ({warn_pct} %)",
        f"- **ok**     : {ok}",
        "",
        "## Top 10 signaux détectés",
        "",
        "| Signal | Occurrences |",
        "|---|---|",
    ]
    for kind, count in stats["top_signals"]:
        lines.append(f"| `{kind}` | {count} |")
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    WORK_DIR.mkdir(parents=True, exist_ok=True)
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    all_skill_dirs = []
    for slug, url in SOURCES:
        print(f"[+] Cloning {slug}…")
        repo = clone(slug, url)
        if repo is None:
            continue
        skills = extract_skills(repo, limit=30)
        print(f"    {len(skills)} skills candidats trouvés")
        all_skill_dirs.extend(skills)

    # Cap à 50 skills, dédupliqués sur le nom de base
    seen_names = set()
    deduped = []
    for s in all_skill_dirs:
        if s.name in seen_names:
            continue
        seen_names.add(s.name)
        deduped.append(s)
        if len(deduped) >= 50:
            break
    print(f"\n[+] Scan de {len(deduped)} skills uniques")

    reports = []
    for i, skill_dir in enumerate(deduped, 1):
        print(f"  [{i}/{len(deduped)}] {skill_dir.name}")
        reports.append(cupel_doctor(skill_dir))

    stats = aggregate(reports)
    json_out = RESULTS_DIR / "scan_results.json"
    json_out.write_text(
        json.dumps({"stats": stats, "reports": reports}, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"\n[+] JSON brut écrit : {json_out}")

    md_out = RESULTS_DIR / "scan_summary.md"
    write_markdown_summary(stats, md_out)
    print(f"[+] Synthèse markdown : {md_out}")

    print("\n=== Résultats agrégés ===")
    print(f"  Total       : {stats['total_skills']}")
    print(f"  Tier OK     : {stats['by_tier']['ok']}")
    print(f"  Tier WARN   : {stats['by_tier']['warn']}")
    print(f"  Tier DANGER : {stats['by_tier']['danger']}")
    print(f"\n  Top 5 signaux :")
    for kind, count in stats["top_signals"][:5]:
        print(f"    {kind:<35} {count}")


if __name__ == "__main__":
    main()
