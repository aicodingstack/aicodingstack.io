## Description

<!-- Provide a clear and concise description of your changes -->

## Type of Change

<!-- Please check the relevant option(s) -->

- [ ] 📝 Metadata contribution (add/update tool, model, or provider information)
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📚 Documentation update
- [ ] 🎨 UI/UX improvement
- [ ] ♻️ Code refactoring
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update

## Related Issue

<!-- Link to the related issue(s) -->

Closes #(issue number)

## Changes Made

<!-- List the specific changes you've made -->

-
-
-

## Metadata Contribution Checklist

<!-- If this is a metadata contribution, please complete this checklist -->

**Only complete this section if adding/updating manifest files:**

- [ ] All required fields are filled in according to the schema
- [ ] All URLs are accessible and point to official sources
- [ ] JSON syntax is valid (no syntax errors)
- [ ] No duplicate entries exist
- [ ] Manifest file is in the correct directory (`manifests/ides/`, `manifests/clis/`, etc.)
- [ ] ID field follows naming convention (lowercase, hyphenated)
- [ ] Description is clear, concise, and accurate
- [ ] Verified information from official documentation/website

**For model contributions, additionally:**
- [ ] Size, context length, and max output are accurate
- [ ] Pricing information is current and verified
- [ ] URLs include website, documentation, and relevant analysis sites

## Testing

<!-- Describe how you tested your changes -->

- [ ] Local build passes (`npm run build`)
- [ ] All validation checks pass (`npm run validate:manifests`)
- [ ] URL validation passes (`npm run validate:urls`)
- [ ] Linting passes (`npm run lint`)
- [ ] Spell check passes (`npm run spell`)

## Screenshots (if applicable)

<!-- Add screenshots to demonstrate UI changes -->

## Additional Notes

<!-- Any additional information that reviewers should know -->

---

## Reviewer Checklist

<!-- For maintainers reviewing this PR -->

- [ ] Code/manifest follows project conventions
- [ ] Changes are well-documented
- [ ] All CI checks pass
- [ ] No security concerns
- [ ] Documentation is updated (if needed)
