# Next.js + React + Tailwind Assistant MCP Server

Your comprehensive AI companion for building modern Next.js applications with React and Tailwind CSS.

[![smithery badge](https://smithery.ai/badge/@CaullenOmdahl/nextjs-react-tailwind-assistant)](https://smithery.ai/server/@CaullenOmdahl/nextjs-react-tailwind-assistant)

## Features

### 📚 Complete Documentation
- **Next.js 15+**: App Router, Server Components, Server Actions, routing, data fetching
- **Tailwind CSS 3+**: All utility classes, responsive design, dark mode, customization
- **Smart Search**: Targeted results without overwhelming context

### 🎨 27 Catalyst UI Components
- Production-ready TypeScript React components
- Built with Tailwind CSS and Headless UI
- Fully accessible, responsive, and customizable
- Categories: forms, navigation, layout, feedback, data display

### ✨ 13 Design Patterns
Abstracted from 11 professional Next.js templates:

**Visual Effects**: Gradients, glows, animations, bento grids, decorative SVGs
**Component Library**: Buttons, cards, badges, inputs, avatars, alerts, tooltips
**Color Systems**: 8 palette strategies (Professional, SaaS, Bold, Minimal, Semantic, Dark Mode)
**Typography**: Font systems, type scales, responsive patterns
**Layouts**: App headers, auth pages, sidebars, overlay navigation
**Pages**: Hero sections, pricing tables, blog layouts

All patterns include accessibility, performance, and dark mode support.

## Installation

### Via Smithery

```bash
npx @smithery/cli install @username/nextjs-react-tailwind-assistant --client claude
```

### Manual Installation

1. Clone the repository:
```bash
git clone https://github.com/CaullenOmdahl/Nextjs-React-Tailwind-Assistant.git
cd Nextjs-React-Tailwind-Assistant
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

This will:
- Build the MCP server using Smithery CLI → `.smithery/index.cjs` (1.67 MB)
- Copy the content directory → `.smithery/content/` (5.3 MB)

## Development

```bash
npm run dev          # Start development server with hot reload
npm run inspector    # Launch MCP inspector for testing
npm run build        # Build production bundle
npm run watch        # TypeScript watch mode
```

## Available Tools

- `search_nextjs_docs` - Search Next.js documentation
- `search_tailwind_docs` - Search Tailwind CSS utilities and concepts
- `get_nextjs_full_docs` - Complete Next.js documentation (large)
- `get_tailwind_full_docs` - Complete Tailwind documentation (large)
- `get_catalyst_component` - Retrieve production-ready components
- `list_catalyst_components` - Browse available components
- `list_patterns` - Browse design patterns
- `get_pattern` - Get detailed pattern implementations

## Content Structure

```
content/
├── components/
│   └── catalyst/          # 27 TypeScript React components
├── docs/
│   ├── nextjs/           # Complete Next.js 15+ docs (2.9 MB)
│   └── tailwind/         # Complete Tailwind CSS docs (2.1 MB)
├── patterns/
│   ├── features/         # 6 feature patterns
│   ├── layouts/          # 4 layout patterns
│   └── pages/            # 3 page patterns
└── content-summary.json  # Catalog of all content
```

## Deployment to Smithery

### Important: Content Directory Deployment

The server requires the `content/` directory (5.3 MB) to be available at runtime. Smithery deploys from your GitHub repository and includes files listed in `package.json` "files" array.

**Deployment Process:**

1. Ensure content is committed to git:
```bash
git add content/
git commit -m "Add documentation and pattern content"
```

2. Push to GitHub:
```bash
git push origin main
```

3. Deploy to Smithery:
- Smithery clones your repository
- Runs `npm install`
- Runs `npm run build` (which copies content to `.smithery/content/`)
- Deploys the server

**Note**: The server uses `process.cwd() + '/content'` to locate files. When deployed to Smithery, the content directory from your repository should be available in the working directory.

### Troubleshooting Deployment

If you get a 500 error on Smithery:

1. **Verify content is in repository**:
```bash
git ls-files content/ | wc -l  # Should show files
du -sh content/                # Should show ~5.3M
```

2. **Check package.json "files" array includes "content"**:
```json
"files": ["dist", "content", "icon.png", "icon.svg"]
```

3. **Ensure build copies content**:
```bash
npm run build
ls -la .smithery/content/  # Should show content directory
```

4. **Test locally**:
```bash
cd .smithery && node index.cjs
# Should start without errors
```

## Architecture

### Module System
- ES Modules only (`"type": "module"` in package.json)
- All imports use `.js` extensions for TypeScript files
- No CommonJS

### Security Features
- Input validation with regex patterns (alphanumeric + `-_.` only)
- Path sanitization to prevent `../` traversal
- Base path boundary checking
- File size limits (3MB for docs, 1MB for components)
- Safe error messages (no internal details exposed)

### Caching
- LRU cache with 5-minute timeout
- Cache keys use full resolved file paths
- Improves performance for repeated documentation queries

## License

MIT

## Credits

- Design patterns abstracted from professional Next.js templates
- Catalyst components from Tailwind Labs
- Documentation from official Next.js and Tailwind CSS sources