#!/usr/bin/env python3
"""
Skill Packager - Creates a distributable zip file of a skill folder

Usage:
    python3 package_skill.py <path/to/skill-folder> [output-directory]

Example:
    python3 package_skill.py .agents/skills/my-skill /tmp/skill-dist
"""

import sys
import zipfile
from pathlib import Path
from quick_validate import validate_skill

TRANSIENT_NAMES = {".DS_Store", "__pycache__"}
TRANSIENT_SUFFIXES = {".pyc", ".pyo"}


def package_skill(skill_path, output_dir=None):
    """
    Package a skill folder into a zip file.

    Args:
        skill_path: Path to the skill folder
        output_dir: Optional output directory for the zip file (defaults to current directory)

    Returns:
        Path to the created zip file, or None if error
    """
    skill_path = Path(skill_path).resolve()

    # Validate skill folder exists
    if not skill_path.exists():
        print(f"❌ Error: Skill folder not found: {skill_path}")
        return None

    if not skill_path.is_dir():
        print(f"❌ Error: Path is not a directory: {skill_path}")
        return None

    # Validate SKILL.md exists
    skill_md = skill_path / "SKILL.md"
    if not skill_md.exists():
        print(f"❌ Error: SKILL.md not found in {skill_path}")
        return None

    # Run validation before packaging
    print("🔍 Validating skill...")
    valid, message = validate_skill(skill_path)
    if not valid:
        print(f"❌ Validation failed: {message}")
        print("   Please fix the validation errors before packaging.")
        return None
    print(f"✅ {message}\n")

    # Determine output location
    skill_name = skill_path.name
    if output_dir:
        output_path = Path(output_dir).resolve()
        if output_path == skill_path or skill_path in output_path.parents:
            print("❌ Error: output directory cannot be inside the skill directory")
            return None
        output_path.mkdir(parents=True, exist_ok=True)
    else:
        output_path = Path.cwd()

    zip_filename = output_path / f"{skill_name}.zip"

    # Create the zip file
    try:
        with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as archive:
            # Walk through the skill directory
            for file_path in sorted(skill_path.rglob('*')):
                relative_parts = file_path.relative_to(skill_path).parts
                is_transient = any(part in TRANSIENT_NAMES for part in relative_parts) or (
                    file_path.suffix in TRANSIENT_SUFFIXES
                )
                if file_path.is_file() and not is_transient:
                    # Calculate the relative path within the zip
                    arcname = file_path.relative_to(skill_path.parent)
                    archive.write(file_path, arcname)
                    print(f"  Added: {arcname}")

        print(f"\n✅ Successfully packaged skill to: {zip_filename}")
        return zip_filename

    except Exception as e:
        print(f"❌ Error creating zip file: {e}")
        return None


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 package_skill.py <path/to/skill-folder> [output-directory]")
        print("\nExample:")
        print("  python3 package_skill.py .agents/skills/my-skill /tmp/skill-dist")
        sys.exit(1)

    skill_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else None

    print(f"📦 Packaging skill: {skill_path}")
    if output_dir:
        print(f"   Output directory: {output_dir}")
    print()

    result = package_skill(skill_path, output_dir)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
