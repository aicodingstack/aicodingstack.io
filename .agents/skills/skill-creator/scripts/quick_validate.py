#!/usr/bin/env python3
"""Fast structural validation for a skill directory."""

import re
import sys
from pathlib import Path

NAME_PATTERN = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def parse_frontmatter(content: str):
    match = re.match(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|\Z)", content, re.DOTALL)
    if not match:
        return None, "SKILL.md must start with a closed YAML frontmatter block"

    values = {}
    for line in match.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        field = re.match(r"^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$", line)
        if not field:
            return None, f"Unsupported frontmatter line: {line}"
        key, value = field.groups()
        values[key] = value.strip().strip('"\'')
    return (values, match.end()), None


def validate_skill(skill_path):
    skill_path = Path(skill_path)
    errors = []
    if not skill_path.exists() or not skill_path.is_dir():
        return False, f"Skill directory not found: {skill_path}"

    skill_md = skill_path / "SKILL.md"
    if not skill_md.is_file():
        return False, "SKILL.md not found"

    content = skill_md.read_text(encoding="utf-8")
    parsed, error = parse_frontmatter(content)
    if error:
        return False, error
    frontmatter, body_start = parsed

    name = frontmatter.get("name", "")
    description = frontmatter.get("description", "")
    if not NAME_PATTERN.fullmatch(name) or len(name) > 64:
        errors.append("name must be a hyphen-case identifier of at most 64 characters")
    if name != skill_path.name:
        errors.append(f"frontmatter name '{name}' must match directory name '{skill_path.name}'")
    if not 20 <= len(description) <= 1024:
        errors.append("description must be 20-1024 characters")
    if "<" in description or ">" in description:
        errors.append("description cannot contain angle brackets")
    if "TODO" in description or "[TODO" in content:
        errors.append("replace all TODO placeholders before validation")
    if not content[body_start:].strip():
        errors.append("SKILL.md must contain instructions after frontmatter")

    for item in skill_path.rglob("*"):
        if item.is_symlink():
            errors.append(f"symbolic links are not allowed in packaged skills: {item.relative_to(skill_path)}")
    if errors:
        return False, "\n- ".join(["Skill validation failed:", *errors])
    return True, "Skill structure is valid"


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python3 quick_validate.py <skill-directory>")
        sys.exit(1)
    valid, message = validate_skill(sys.argv[1])
    print(message)
    sys.exit(0 if valid else 1)
