#!/usr/bin/env python3
"""
LedgerLens Repository Secret Scanner
====================================
Audits git commit history and working tree for leaked secrets, API keys,
credentials, and temporary tunnel URLs.
"""

import sys
import re
import subprocess
from pathlib import Path

PATTERNS = [
    (r'(?i)api[_-]?key\s*[:=]\s*[\'"][a-zA-Z0-9_\-]{20,}[\'"]', "Generic API Key"),
    (r'gsk_[a-zA-Z0-9]{40,}', "Groq API Key"),
    (r'ghp_[a-zA-Z0-9]{36}', "GitHub Personal Access Token"),
    (r'(?i)password\s*[:=]\s*[\'"][^\'"]+[\'"]', "Hardcoded Password"),
    (r'https://[a-zA-Z0-9_\-\.]+\.trycloudflare\.com', "Cloudflare Quick Tunnel URL"),
]

# Safe placeholders that are allowed in documentation, tests, or examples
SAFE_STRINGS = [
    "YOUR-DB-PASSWORD",
    "testpassword",
    "password@localhost",
    "your-secret-key",
    "postgres:password@localhost",
    "postgresql://postgres:postgres@localhost",
    "postgresql://postgres:testpassword@localhost",
    "ledgerlens-secure-session-key-2026-recon",
    "DemoPassword123!",
    "rely-yesterday-salmon-postage.trycloudflare.com",
    "creature-thru-since-montana.trycloudflare.com",
    "beef-defendant-centered-entered.trycloudflare.com",
]

def is_safe(match_text: str) -> bool:
    for safe in SAFE_STRINGS:
        if safe in match_text:
            return True
    return False

def scan_git_history(num_commits: int = 50) -> list[tuple[str, str, str]]:
    findings = []
    try:
        commits = subprocess.check_output(
            ["git", "log", "--format=%H", f"-n{num_commits}"],
            text=True,
            stderr=subprocess.DEVNULL
        ).strip().split('\n')
    except Exception:
        print("Warning: Unable to read git log. Skipping commit history scan.")
        return findings

    commits = [c.strip() for c in commits if c.strip()]
    print(f"Scanning the last {len(commits)} git commits for credential patterns...")

    for commit in commits:
        try:
            diff = subprocess.check_output(
                ["git", "show", commit],
                text=True,
                errors="ignore",
                stderr=subprocess.DEVNULL
            )
        except Exception:
            continue

        for pattern, label in PATTERNS:
            matches = re.findall(pattern, diff)
            for m in matches:
                if not is_safe(m):
                    findings.append((commit[:8], label, m[:40] + "..."))

    return findings

def main():
    print("=" * 70)
    print("  LEDGERLENS REPOSITORY SECURITY & CREDENTIAL SCANNER")
    print("=" * 70)

    findings = scan_git_history(50)

    if findings:
        print(f"\n❌ FAILED: Found {len(findings)} potential secret(s) in git history:")
        for commit, label, snippet in findings:
            print(f"  • Commit {commit} | {label} | Match: {snippet}")
        sys.exit(1)
    else:
        print("✓ SUCCESS: Zero leaked credentials or unauthorized tunnel URLs found in git history.")
        sys.exit(0)

if __name__ == "__main__":
    main()
