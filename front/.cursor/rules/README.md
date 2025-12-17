# Cursor Rules - InsightHouse Project

This directory contains Cursor AI rules that enforce code standards, architectural patterns, and best practices throughout the InsightHouse project.

## What are Cursor Rules?

Cursor Rules are instructions that guide the Cursor AI assistant when helping you write code. They ensure consistency, maintainability, and adherence to project standards.

## Available Rules

### Always Applied

- **`architecture.mdc`** - Project architecture and code standards
  - Technology stack overview
  - Project structure
  - Naming conventions
  - Code organization principles
  - Clean Code principles
  - Performance and security best practices

- **`design-system.mdc`** - Complete design system standards
  - Typography (Geist Sans)
  - Color system and gradients
  - Component patterns (Button, Input, Card)
  - Layout patterns (Auth pages, Hero sections)
  - Spacing and borders
  - Transitions and animations
  - Illustration handling
  - Dark mode support
  - Dashboard refactoring guidelines

### Auto-Attached by File Type

These rules are automatically applied when working with specific file types:

- **`react-components.mdc`** - React component patterns
  - Applied to: `src/**/*.tsx`, `src/**/*.jsx`
  - Server vs Client components
  - Component structure and anatomy
  - Props and state management
  - Event handlers and styling

- **`api-routes.mdc`** - API route standards
  - Applied to: `src/app/api/**/*.ts`
  - Request/response patterns
  - Validation with Zod
  - Authentication and authorization
  - Error handling

- **`database-prisma.mdc`** - Database and Prisma ORM standards
  - Applied to: `prisma/**/*.prisma`, `src/lib/db.ts`
  - Schema design
  - Relationships and indexes
  - CRUD operations
  - Transactions and performance

- **`authentication-security.mdc`** - Authentication and security patterns
  - Applied to: `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/**/*.ts`
  - Session management
  - Password security
  - Route protection
  - Input validation

- **`typescript-utilities.mdc`** - TypeScript and utility functions
  - Applied to: `src/utils/**/*.ts`, `src/lib/**/*.ts`
  - Type safety and definitions
  - Utility patterns
  - Pure functions

- **`testing.mdc`** - Testing standards
  - Applied to: `**/*.test.ts`, `**/*.test.tsx`, `**/*.spec.ts`, `**/*.spec.tsx`
  - Test structure and naming
  - Unit, integration, and E2E tests
  - Mocking patterns

- **`documentation.mdc`** - Documentation guidelines
  - Applied to: `README.md`, `CONTRIBUTING.md`, `docs/**/*.md`
  - README structure
  - Code documentation
  - API documentation
  - Changelog maintenance

### Manual/Template Rules

These rules can be referenced explicitly using `@rule-name`:

- **`template-component.mdc`** - Templates for creating new React components
  - Server component template
  - Client component template
  - Form component template
  - List component template

- **`template-api-route.mdc`** - Templates for creating new API routes
  - CRUD route templates
  - Public API template
  - File upload template
  - Webhook template

## How to Use Rules

### Automatic Application

Most rules are applied automatically based on the files you're working with. For example:
- When editing a React component, `react-components.mdc` is auto-attached
- When creating an API route, `api-routes.mdc` is auto-attached

### Manual Reference

To explicitly reference a template rule, mention it in your prompt:

```
@template-component Create a new User Profile component
```

```
@template-api-route Create an API endpoint for user settings
```

### Viewing Active Rules

Active rules appear in the Cursor sidebar when you're working with relevant files.

## Rule Types

Rules use different application strategies:

| Type | Description | How to Use |
|------|-------------|------------|
| **Always** | Always included in context | Automatic |
| **Auto Attached** | Included when matching file patterns | Automatic |
| **Agent Requested** | AI decides if needed based on description | Automatic |
| **Manual** | Only when explicitly mentioned | Use `@rule-name` |

## Creating New Rules

To create a new rule:

1. Create a `.mdc` file in `.cursor/rules/`
2. Add frontmatter with metadata:
   ```yaml
   ---
   description: Brief description of what this rule covers
   globs:
     - path/to/files/**/*.ts
   alwaysApply: false
   ---
   ```
3. Write the rule content in Markdown
4. Save and the rule will be available

## Best Practices for Working with Rules

### Do's
✅ Trust the rules - they enforce proven patterns
✅ Reference templates when creating new files
✅ Follow naming conventions consistently
✅ Read rule content to understand patterns
✅ Update rules when project patterns evolve

### Don'ts
❌ Don't ignore rule suggestions without reason
❌ Don't create exceptions without documenting why
❌ Don't duplicate logic covered by existing rules
❌ Don't create overly specific rules (keep them general)

## Rule Maintenance

### When to Update Rules

Update rules when:
- New patterns emerge in the codebase
- Technology stack changes
- Team agrees on new conventions
- Security best practices evolve

### How to Update Rules

1. Edit the relevant `.mdc` file
2. Test changes by working with affected files
3. Verify Cursor AI applies rules correctly
4. Update this README if rule purposes change

## Troubleshooting

### Rules Not Applying

If rules aren't being applied:
1. Check file matches the `globs` pattern
2. Verify `.mdc` file has correct frontmatter
3. Try reloading Cursor window
4. Check Cursor settings → Rules

### Conflicting Rules

If multiple rules conflict:
1. The more specific rule takes precedence
2. Always Applied rules have highest priority
3. Manual rules override automatic ones

### Rule Suggestions Feel Wrong

If a rule suggestion doesn't fit:
1. Consider if there's a valid reason for the exception
2. Document the exception with a comment
3. If pattern emerges, update the rule
4. Discuss with team if it affects architecture

## Examples

### Creating a New Component

When you type:
```
Create a new UserCard component that displays user info
```

Cursor AI will:
1. Apply `architecture.mdc` (always applied)
2. Apply `react-components.mdc` (auto-attached for .tsx)
3. Suggest following component structure from rules
4. Use proper naming and type definitions

### Creating a New API Endpoint

When you type:
```
@template-api-route Create a GET endpoint for user profile
```

Cursor AI will:
1. Use the API route template
2. Include authentication checks
3. Add Zod validation
4. Follow error handling patterns
5. Use consistent response format

## Resources

- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [Clean Code Principles](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## Questions?

If you have questions about the rules:
1. Read the rule file content
2. Look for examples in the codebase
3. Check `AGENTS.md` for project context
4. Ask the team in discussions

