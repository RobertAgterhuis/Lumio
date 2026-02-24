## Description

<!-- Describe your changes briefly -->

## Type of Change

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to change)
- [ ] 📝 Documentation update
- [ ] ♻️ Refactoring (no functional changes)
- [ ] 🧪 Test addition/update

## Related Issue

<!-- Link to the issue this PR addresses, if any -->
Fixes #

## Checklist

### Code Quality
- [ ] All TypeScript/ESLint errors are resolved
- [ ] No `any` types without justification
- [ ] Functions are reasonably sized

### Design System
- [ ] Uses design tokens (no hardcoded colors/spacing)
- [ ] `npm run validate-tokens` passes
- [ ] No arbitrary Tailwind values

### Testing
- [ ] Unit tests added for new logic
- [ ] `npm run test` passes
- [ ] Storybook stories added for new components

### API Changes (if applicable)
- [ ] `npm run detect-breaking-changes` passes
- [ ] Frontend adapted for any changes

### Internationalization (if UI changes)
- [ ] Translation keys added to `nl.json` and `en.json`
- [ ] No hardcoded user-visible strings

### Electron (if applicable)
- [ ] IPC channels have input validation
- [ ] No security regressions

## Screenshots (if applicable)

<!-- Add screenshots demonstrating the change -->

## Additional Notes

<!-- Any additional context or information -->
