---
name: skill-creator
description: Designs, creates, audits, and packages repository skills with accurate trigger metadata, executable workflows, minimal resources, and validation. Use when adding or materially revising a SKILL.md package.
license: Complete terms in LICENSE.txt
---

# Skill creator

Create skills that another Codex instance can execute safely with the tools and repository state it actually has.

## Design workflow

1. Gather concrete trigger examples and expected outcomes. Distinguish tasks that should trigger the skill from nearby tasks that should not.
2. Inspect the target environment: `AGENTS.md`, available tools, filesystem paths, schemas, commands, and current examples.
3. Separate reusable content:
   - keep essential decisions and ordered workflow in `SKILL.md`;
   - put detailed specifications in `references/`;
   - put deterministic, directly runnable helpers in `scripts/`;
   - put copyable output resources in `assets/`.
4. Design safe defaults. Read-only preview/check modes should precede destructive or external writes. State required approval and credential boundaries.
5. Write precise frontmatter. `name` must equal the directory name; `description` must say what the skill does and when it triggers.
6. Test every documented path and command. Do not claim that a helper browses, writes, validates, or integrates with a tool unless it demonstrably does so.
7. Run validation and at least one representative smoke test. Review the skill as a new agent would: all required references must be discoverable and the stopping conditions must be clear.

## Initialize

For a new skill, create a minimal scaffold:

```bash
python3 .agents/skills/skill-creator/scripts/init_skill.py my-skill --path .agents/skills
```

Create resource directories only when already justified:

```bash
python3 .agents/skills/skill-creator/scripts/init_skill.py my-skill --path .agents/skills --resources scripts,references
```

For an existing skill, edit it in place; do not reinitialize it.

## Authoring rules

- Keep instructions imperative, concise, and ordered around decisions.
- Use repository-relative paths in skill documentation unless a user-level path is inherently required.
- Prefer current schemas/configuration as authority over copied examples.
- Avoid hardcoded model catalogs, URLs, locale lists, or tool names when they change frequently; either derive them or require current verification.
- Do not embed secrets, request users to paste credentials, or store placeholders that resemble real credentials.
- Avoid duplicate guidance between `SKILL.md` and references.
- Delete unused resources and generated caches before handoff.

## Validate and package

```bash
python3 .agents/skills/skill-creator/scripts/quick_validate.py .agents/skills/my-skill
```

Packaging is optional for repository-local skills. When a distributable archive is requested:

```bash
python3 .agents/skills/skill-creator/scripts/package_skill.py .agents/skills/my-skill /tmp/skill-dist
```

The validator checks structure and common unfinished-state errors; it cannot prove that workflow facts or external integrations are correct. Perform semantic review and smoke tests separately.
