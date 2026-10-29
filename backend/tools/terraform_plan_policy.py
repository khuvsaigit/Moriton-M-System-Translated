"""Fail-closed Terraform plan gate. This validates a plan; it never applies it."""
from __future__ import annotations

import argparse
import json
from collections import Counter
from pathlib import Path
from typing import Any


class PolicyError(ValueError):
    pass


def check_plan(plan: dict[str, Any], manifest: dict[str, Any]) -> list[str]:
    if manifest.get("approval_status") != "APPROVED":
        raise PolicyError("client approval_status must be APPROVED")
    allowed = manifest.get("allowed_resource_types")
    ceilings = manifest.get("max_resource_changes")
    if not isinstance(allowed, list) or not allowed or not all(isinstance(x, str) for x in allowed):
        raise PolicyError("approved allowed_resource_types must be a non-empty string list")
    if not isinstance(ceilings, dict):
        raise PolicyError("approved max_resource_changes object is required")

    changes = plan.get("resource_changes")
    if not isinstance(changes, list):
        raise PolicyError("Terraform plan is missing resource_changes")
    counts: Counter[str] = Counter()
    for resource in changes:
        if not isinstance(resource, dict) or not isinstance(resource.get("type"), str):
            raise PolicyError("malformed resource change")
        actions = (resource.get("change") or {}).get("actions")
        if not isinstance(actions, list) or not actions:
            raise PolicyError(f"{resource.get('address', '<unknown>')}: missing actions")
        if actions == ["no-op"] or actions == ["read"]:
            continue
        if any(action not in {"create", "update"} for action in actions):
            raise PolicyError(f"{resource['address']}: destructive or unknown action {actions}")
        resource_type = resource["type"]
        if resource_type not in allowed:
            raise PolicyError(f"{resource['address']}: resource type {resource_type} is not allowlisted")
        counts[resource_type] += 1

    for resource_type, count in counts.items():
        ceiling = ceilings.get(resource_type)
        if not isinstance(ceiling, int) or ceiling < 0:
            raise PolicyError(f"{resource_type}: no approved non-negative change ceiling")
        if count > ceiling:
            raise PolicyError(f"{resource_type}: {count} changes exceed approved ceiling {ceiling}")
    return [f"{kind}: {count}/{ceilings[kind]} changes" for kind, count in sorted(counts.items())]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--plan", required=True, type=Path, help="terraform show -json plan output")
    parser.add_argument("--manifest", required=True, type=Path, help="client-approved exact resource manifest")
    args = parser.parse_args()
    try:
        plan = json.loads(args.plan.read_text())
        manifest = json.loads(args.manifest.read_text())
        for line in check_plan(plan, manifest):
            print(line)
    except (OSError, json.JSONDecodeError, PolicyError) as exc:
        parser.error(str(exc))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
