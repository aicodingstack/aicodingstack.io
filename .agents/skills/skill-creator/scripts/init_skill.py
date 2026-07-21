#!/usr/bin/env python3
"""Create a minimal skill scaffold."""

import argparse
import re
from pathlib import Path

VALID_RESOURCES = {"scripts", "references", "assets"}
NAME_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

TEMPLATE = """---
name: {name}
description: TODO describe what this skill does and the concrete situations that trigger it.
---

# {title}

TODO replace this scaffold with executable instructions, safety boundaries, and validation steps.
"""


def main():
    parser = argparse.ArgumentParser(description="Create a minimal skill scaffold")
    parser.add_argument("name")
    parser.add_argument("--path", required=True, help="Parent directory for the skill")
    parser.add_argument(
        "--resources",
        default="",
        help="Comma-separated optional directories: scripts,references,assets",
    )
    args = parser.parse_args()

    if not NAME_PATTERN.fullmatch(args.name) or len(args.name) > 64:
        parser.error("name must be hyphen-case and at most 64 characters")

    resources = {item.strip() for item in args.resources.split(",") if item.strip()}
    unknown = resources - VALID_RESOURCES
    if unknown:
        parser.error(f"unknown resources: {', '.join(sorted(unknown))}")

    skill_dir = Path(args.path).resolve() / args.name
    if skill_dir.exists():
        parser.error(f"skill directory already exists: {skill_dir}")

    skill_dir.mkdir(parents=True)
    title = " ".join(word.capitalize() for word in args.name.split("-"))
    (skill_dir / "SKILL.md").write_text(
        TEMPLATE.format(name=args.name, title=title), encoding="utf-8"
    )
    for resource in sorted(resources):
        (skill_dir / resource).mkdir()

    print(f"Created minimal skill scaffold: {skill_dir}")
    if resources:
        print(f"Created resource directories: {', '.join(sorted(resources))}")
    print("Replace TODOs, then run quick_validate.py and representative smoke tests.")


if __name__ == "__main__":
    main()
