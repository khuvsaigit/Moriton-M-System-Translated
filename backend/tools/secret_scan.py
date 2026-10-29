"""Redacted working-tree secret scan. Reports file and rule only, never matched text."""
from __future__ import annotations

import re
import subprocess
from pathlib import Path

RULES = (
    ("private-key", re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----")),
    ("aws-access-key", re.compile(r"\bAKIA[0-9A-Z]{16}\b")),
    ("aws-secret-key", re.compile(r"aws_secret_access_key\s*[:=]\s*['\"]?[A-Za-z0-9/+=]{40}", re.I)),
    ("github-token", re.compile(r"\b(?:ghp|github_pat)_[A-Za-z0-9_]{30,}\b")),
    ("slack-token", re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b")),
)


def scan_text(text: str) -> list[str]:
    return [name for name, pattern in RULES if pattern.search(text)]


def scan_worktree(root: Path) -> list[str]:
    files = subprocess.run(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
        cwd=root, check=True, capture_output=True,
    ).stdout.split(b"\0")
    findings = []
    for raw_path in files:
        if not raw_path:
            continue
        path = root / raw_path.decode("utf-8", errors="replace")
        try:
            if path.stat().st_size > 2_000_000:
                continue
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue
        findings.extend(f"{path.relative_to(root)}: {rule}" for rule in scan_text(text))
    return findings


if __name__ == "__main__":
    found = scan_worktree(Path(__file__).resolve().parents[2])
    if found:
        print("\n".join(found))
        raise SystemExit(1)
    print("No configured credential patterns found in working-tree text files.")
