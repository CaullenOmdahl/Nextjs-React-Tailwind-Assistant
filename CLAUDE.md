# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Model Context Protocol (MCP) server that provides Next.js, React, and Tailwind CSS documentation, Catalyst UI components, and abstracted template patterns. Built with TypeScript using ES modules, it features security-hardened file operations, input validation, and caching.

**Key Technology Stack:**
- MCP SDK v1.17+ with Smithery deployment
- TypeScript 5.3+ with strict mode
- Node.js 20+ (ES modules required)
- Zod for schema validation

**Content Sources:**
- Next.js 15+ complete documentation (~2.5MB, 77k+ lines)
- Tailwind CSS complete documentation (~2.1MB)
- Catalyst UI kit (28 TypeScript components)
- Abstracted patterns from professional templates (layouts, pages, features)

## Build and Development Commands

### Standard Development
```bash
npm run build          # Build using Smithery CLI (outputs to dist/)
npm run dev            # Development mode with hot reload
npm run watch          # TypeScript watch mode
npm run inspector      # Launch MCP inspector for testing
```

### Maintenance
```bash
npm run security-audit # Run security audit (moderate level)
npm run outdated-check # Check for outdated dependencies
```

## Architecture

### Module System
- **ES Modules Only**: Uses `"type": "module"` in package.json
- All imports must use `.js` extensions even for `.ts` files (TypeScript requirement)
- No CommonJS `require()` - use `import` statements

### Core Architecture Pattern

The server follows a modular security-first design:

```
src/index.ts                    # Smithery HTTP transport server factory
  ↓ creates
McpServer instance
  ↓ registers tools with
SecureFileService              # Handles all file I/O with caching
  ↓ uses
validateToolInput()            # Input validation (security.ts)
sanitizeAndValidatePath()      # Path traversal protection
ErrorHandler                   # Safe error formatting
```

### Key Architectural Principles

1. **Smithery Integration**: The server uses `createServer()` factory pattern that accepts config from smithery.yaml and returns an MCP server instance

2. **Path Resolution**: All paths use `process.cwd()` as base (not `__dirname`) for Smithery compatibility - the working directory is the project root when deployed

3. **Security Layers**:
   - Input validation with regex patterns (alphanumeric + `-_.` only)
   - Path sanitization to prevent `../` traversal
   - Base path boundary checking
   - File size limits (5MB for large docs, 1MB default)
   - Safe error messages (no internal details exposed)

4. **Caching Strategy**: LRU cache with 5-minute timeout in SecureFileService - cache keys are full resolved file paths

5. **Error Handling Hierarchy**:
   ```
   McpError (from SDK)
     ← thrown by tools
     ← converted by ErrorHandler.formatSafeErrorMessage()
     ← catches: ValidationErrors, FileSystemErrors, UnknownErrors
   ```

### Content Organization

```
content/
├── docs/
│   ├── nextjs/
│   │   └── nextjs-full.txt        # Complete Next.js 15+ documentation (~2.5MB)
│   ├── react/                     # (Reserved for future React-specific docs)
│   └── tailwind/
│       └── tailwind-docs-full.txt # Complete Tailwind CSS docs (~2.1MB)
├── components/
│   └── catalyst/                  # 28 Catalyst UI components (.tsx files)
│       ├── alert.tsx
│       ├── button.tsx
│       ├── dialog.tsx
│       └── ... (25 more)
├── patterns/
│   ├── layouts/                   # Layout patterns
│   │   ├── app-header.md
│   │   └── sidebar-layout.md
│   ├── pages/                     # Page patterns
│   │   └── hero-section.md
│   └── features/                  # Feature patterns (reserved)
└── content-summary.json           # Catalog of all available resources
```

File naming: Use kebab-case with alphanumeric characters, hyphens, underscores, and dots only.

## MCP Tools Available

The server exposes 8 tools with full parameter descriptions and annotations:

**Full Documentation Tools** (complete coverage, large context):
- `get_nextjs_full_docs` - Complete Next.js 15+ documentation (~2.5MB, ~320k tokens)
  - **WARNING**: Returns ~320,000 tokens. Use with LLMs supporting 100k+ token contexts. For smaller contexts, use `search_nextjs_docs`.
- `get_tailwind_full_docs` - Complete Tailwind CSS documentation (~2.1MB, ~730k tokens)
  - **WARNING**: Returns ~730,000 tokens. Use with LLMs supporting 200k+ token contexts. For smaller contexts, use `search_tailwind_docs`.

**Search Tools** (recommended for most use cases):
- `search_nextjs_docs` - Search within Next.js documentation with keyword matching
  - Parameters: `query` (required), `limit` (optional, default 5, max 20)
- `search_tailwind_docs` - Search within Tailwind CSS documentation with keyword matching
  - Parameters: `query` (required), `limit` (optional, default 5, max 20)

**Catalyst Component Tools**:
- `get_catalyst_component` - Retrieve specific Catalyst UI component TypeScript source
  - Parameters: `component_name` (e.g., "button", "dialog", "table")
- `list_catalyst_components` - List all 28 available Catalyst UI components with categories

**Pattern Tools**:
- `get_pattern` - Get abstracted template pattern documentation
  - Parameters: `category` ("layouts", "pages", or "features"), `pattern_name`
- `list_patterns` - List all available abstracted patterns by category

All tools include:
- Comprehensive parameter descriptions
- Read-only, non-destructive, idempotent annotations
- Audit logging and structured error handling
- Input validation and security checks

## Code Patterns and Conventions

### TypeScript Strictness
- No `any` types allowed
- All parameters must have explicit types
- Use `as const` for literal type assertions
- Return types are explicit on public methods

### Security Validation Pattern
Every tool that accepts user input follows this pattern:
```typescript
validateToolInput(toolName, request);  // Throws McpError if invalid
const content = await fileService.readSecureFile(basePath, userInput, extension);
```

### Audit Logging Pattern
All tool executions log:
```typescript
createAuditLog('info', 'tool_request', { tool: 'name', timestamp, argsProvided });
// ... operation ...
createAuditLog('info', 'operation_completed', { details });
// ... or on error ...
createAuditLog('error', 'tool_request_failed', { tool, error, code });
```

### Error Handling Pattern
```typescript
try {
  // operation
} catch (error: any) {
  createAuditLog('error', 'tool_request_failed', { tool, error: error.message, code: error.code });

  if (error instanceof McpError) {
    throw error;  // Re-throw MCP errors as-is
  }

  throw new McpError(
    ErrorCode.InternalError,
    ErrorHandler.formatSafeErrorMessage(error, toolName)
  );
}
```

## Smithery Deployment

This server is deployed via Smithery with HTTP transport:
- Configuration: `smithery.yaml` defines runtime and startCommand
- Build: `npx @smithery/cli build` creates production bundle
- The server factory returns an MCP server instance compatible with Smithery's HTTP transport layer

### Version Management (CRITICAL)

**ALWAYS increment the version number before pushing ANY changes to the repository.** Smithery may cache builds based on version numbers, so failing to increment can cause deployment issues where changes don't take effect.

Version numbers must be updated in TWO locations:
1. `package.json` - the `"version"` field
2. `src/index.ts` - the `McpServer` version parameter

Follow semantic versioning (semver):
- **Patch version** (0.1.x → 0.1.x+1): Bug fixes, minor corrections, no functionality changes
- **Minor version** (0.x.0 → 0.x+1.0): New features, backward-compatible changes
- **Major version** (x.0.0 → x+1.0.0): Breaking changes, incompatible API changes

Example workflow for any change:
```bash
# 1. Make your code changes
# 2. Update version in package.json (e.g., 0.1.1 → 0.1.2)
# 3. Update version in src/index.ts McpServer constructor
# 4. Build, commit, and push
npm run build
git add -A
git commit -m "chore: Bump version to 0.1.2"
git commit -m "fix: Your actual change description"
git push origin main
```

## Content Details

### Next.js Documentation
- **Source**: https://nextjs.org/docs/llms-full.txt
- **Coverage**: 100% - Complete Next.js 15+ documentation including:
  - App Router architecture
  - Server Components and Client Components
  - Routing, layouts, and pages
  - Data fetching patterns
  - Server Actions
  - Middleware
  - Deployment and optimization
- **Size**: ~2.5MB, 77,480 lines
- **Token estimate**: ~320,000 tokens

### Tailwind CSS Documentation
- **Coverage**: 100% - All utility classes and concepts
- **Size**: ~2.1MB
- **Token estimate**: ~730,000 tokens

### Catalyst UI Components
28 production-ready TypeScript React components with Tailwind styling:

**Categories:**
- **Forms**: button, checkbox, fieldset, input, radio, select, switch, textarea
- **Navigation**: navbar, sidebar, sidebar-layout, dropdown, link
- **Layout**: divider, heading, stacked-layout, auth-layout
- **Feedback**: alert, badge, dialog
- **Data Display**: avatar, description-list, listbox, pagination, table, text
- **Advanced**: combobox

All components are TypeScript files (.tsx) with:
- Full type definitions
- Tailwind CSS styling
- Headless UI integration where applicable
- Accessibility features
- Responsive design patterns

### Abstracted Template Patterns
Documentation of common patterns abstracted from professional templates:

**Layouts:**
- `app-header.md` - Responsive header with scroll effects, mobile menu, dark mode
- `sidebar-layout.md` - Documentation/dashboard sidebar with mobile support

**Pages:**
- `hero-section.md` - Landing page hero variants with gradients and CTAs

**Features:** (Reserved for future expansion)

**Pattern Philosophy:**
- Patterns are abstracted concepts, not copied code
- Focus on common architectural approaches
- Include dependencies, accessibility, and dark mode considerations
- Provide multiple implementation variants

## Testing with MCP Inspector

```bash
npm run inspector
```

This launches the MCP inspector connected to `dist/index.js` for interactive testing of all tools.

## Important Notes

- **Never use `__dirname`**: Use `process.cwd()` or `import.meta.url` conversions for path resolution
- **File extensions in imports**: Always use `.js` in imports even for TypeScript files
- **No writes from tools**: All MCP tools are read-only operations
- **Validation first**: Always validate and sanitize user inputs before file operations
- **Cache awareness**: File content is cached for 5 minutes, so rapid changes may not be immediately visible
- **Large docs**: The full documentation tools return very large responses (320k-730k tokens). Always prefer search tools unless complete context is required.
