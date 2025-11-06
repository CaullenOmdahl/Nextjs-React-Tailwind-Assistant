import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import path from 'path';
import { promises as fs } from 'fs';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

// Import our existing types and utilities
import {
  SearchDocsArgs,
  CatalystComponentArgs,
  PatternArgs,
  StarterKitArgs,
  RecommendTemplateArgs,
  QuestionnaireArgs,
  LibraryDocsArgs,
  ServerConfig
} from './types.js';
import { validateToolInput } from './utils/security.js';
import { ErrorHandler, createAuditLog } from './utils/errorHandler.js';
import { SecureFileService } from './services/fileService.js';

// No configSchema export - this server doesn't require user configuration
// Per Smithery docs: "If your server doesn't require configuration, simply omit the configSchema export entirely"

export default function createServer() {
  // Server configuration with secure defaults - using process.cwd() for Smithery compatibility
  const CONFIG: ServerConfig = {
    contentBasePath: path.join(process.cwd(), 'content'),
    nextjsDocsPath: path.join(process.cwd(), 'content', 'docs', 'nextjs', 'nextjs-full.txt'),
    tailwindDocsPath: path.join(process.cwd(), 'content', 'docs', 'tailwind', 'tailwind-docs-full.txt'),
    catalystComponentsPath: path.join(process.cwd(), 'content', 'components', 'catalyst'),
    patternsPath: path.join(process.cwd(), 'content', 'patterns'),
    templatesPath: path.join(process.cwd(), 'content', 'templates', 'starter-kits.json'),
    libraryDocsPath: path.join(process.cwd(), 'content', 'docs', 'libraries'),
    maxFileSize: 1 * 1024 * 1024, // 1MB for components and patterns
    largeFileSize: 5 * 1024 * 1024, // 5MB for large documentation files
    cacheTimeout: 5 * 60 * 1000 // 5 minutes cache timeout
  };

  // Initialize secure file service
  const fileService = new SecureFileService(CONFIG.maxFileSize, CONFIG.cacheTimeout);

  const server = new McpServer({
    name: "nextjs-react-tailwind-assistant-mcp-server",
    version: "0.4.1",
  });

  // Register resources for documentation
  server.registerResource(
    "nextjs-docs",
    "docs://nextjs-full",
    {
      name: "Complete Next.js 15+ Documentation",
      description: "Full Next.js documentation in LLM-optimized format (~2.5MB, 77k+ lines)",
      mimeType: "text/plain"
    },
    async () => {
      const content = await fileService.readFullDocsFile(CONFIG.nextjsDocsPath, CONFIG.largeFileSize);
      return {
        text: content
      };
    }
  );

  server.registerResource(
    "tailwind-docs",
    "docs://tailwind-docs-full",
    {
      name: "Complete Tailwind CSS Documentation",
      description: "Full Tailwind CSS documentation extracted from official docs (2.1MB)",
      mimeType: "text/plain"
    },
    async () => {
      const content = await fileService.readFullDocsFile(CONFIG.tailwindDocsPath, CONFIG.largeFileSize);
      return {
        text: content
      };
    }
  );

  server.registerResource(
    "content-summary",
    "docs://content-summary",
    {
      name: "Content Summary",
      description: "Summary of available documentation, components, and patterns",
      mimeType: "application/json"
    },
    async () => {
      const summaryPath = path.join(CONFIG.contentBasePath, 'content-summary.json');
      try {
        const content = await fileService.readFullDocsFile(summaryPath, CONFIG.maxFileSize);
        return {
          text: content
        };
      } catch (error) {
        return {
          text: JSON.stringify({
            error: "Content summary not available",
            message: "Content summary file not found"
          }, null, 2)
        };
      }
    }
  );

  // Register prompts for common use cases
  server.registerPrompt(
    "search-nextjs-routing",
    {
      title: "Search Next.js Routing Documentation",
      description: "Search the Next.js documentation for routing and navigation information",
      arguments: []
    },
    async () => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: "Search the Next.js documentation for information about routing and navigation. Use search_nextjs_docs with query 'routing'."
        }
      }]
    })
  );

  server.registerPrompt(
    "get-catalyst-component",
    {
      title: "Get Catalyst UI Component",
      description: "Retrieve a specific Catalyst UI component source code",
      arguments: [{
        name: "component_name",
        description: "Name of the Catalyst component (e.g., 'button', 'dialog', 'table')",
        required: true
      }]
    },
    async (args) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Get the Catalyst UI component '${args.component_name}'. Use get_catalyst_component with component_name '${args.component_name}'.`
        }
      }]
    })
  );

  server.registerPrompt(
    "find-pattern",
    {
      title: "Find Abstracted Pattern",
      description: "Browse patterns for layouts, pages, or features",
      arguments: [{
        name: "category",
        description: "Pattern category: 'layouts', 'pages', or 'features'",
        required: true
      }]
    },
    async (args) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Show me available patterns in the '${args.category}' category. Use list_patterns.`
        }
      }]
    })
  );

  // =========================
  // TOOL IMPLEMENTATIONS
  // =========================

  /**
   * Tool: get_nextjs_full_docs
   * Returns the complete Next.js 15+ documentation
   * WARNING: ~2.5MB, ~320k tokens - use with LLMs supporting 100k+ token contexts
   */
  server.registerTool(
    "get_nextjs_full_docs",
    {
      title: "Get Complete Next.js Documentation",
      description: "Get the complete Next.js 15+ documentation (~2.5MB, ~320,000 tokens). WARNING: This returns ~320,000 tokens. Only use with LLMs that support large context windows (100k+ tokens). For smaller contexts, use 'search_nextjs_docs' instead. Covers: App Router, Server Components, Client Components, routing, layouts, pages, data fetching, Server Actions, middleware, deployment, and optimization.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {}
    },
    async (request) => {
      createAuditLog('info', 'tool_request', {
        tool: 'get_nextjs_full_docs',
        timestamp: new Date().toISOString()
      });

      try {
        const content = await fileService.readFullDocsFile(CONFIG.nextjsDocsPath, CONFIG.largeFileSize);

        createAuditLog('info', 'operation_completed', {
          tool: 'get_nextjs_full_docs',
          contentSize: content.length
        });

        return {
          content: [{
            type: "text" as const,
            text: content
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'get_nextjs_full_docs',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'get_nextjs_full_docs')
        );
      }
    }
  );

  /**
   * Tool: get_tailwind_full_docs
   * Returns the complete Tailwind CSS documentation
   * WARNING: ~2.1MB, ~730k tokens - use with LLMs supporting 200k+ token contexts
   */
  server.registerTool(
    "get_tailwind_full_docs",
    {
      title: "Get Complete Tailwind CSS Documentation",
      description: "Get the complete Tailwind CSS documentation (~2.1MB, ~730,000 tokens). WARNING: This returns ~730,000 tokens. Only use with LLMs that support very large context windows (200k+ tokens). For smaller contexts, use 'search_tailwind_docs' instead. Covers all utility classes, concepts, responsive design, dark mode, customization, and plugins.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {}
    },
    async (request) => {
      createAuditLog('info', 'tool_request', {
        tool: 'get_tailwind_full_docs',
        timestamp: new Date().toISOString()
      });

      try {
        const content = await fileService.readFullDocsFile(CONFIG.tailwindDocsPath, CONFIG.largeFileSize);

        createAuditLog('info', 'operation_completed', {
          tool: 'get_tailwind_full_docs',
          contentSize: content.length
        });

        return {
          content: [{
            type: "text" as const,
            text: content
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'get_tailwind_full_docs',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'get_tailwind_full_docs')
        );
      }
    }
  );

  /**
   * Tool: search_nextjs_docs
   * Searches within Next.js documentation with keyword matching
   */
  server.registerTool(
    "search_nextjs_docs",
    {
      title: "Search Next.js Documentation",
      description: "Search within the Next.js documentation for specific topics or keywords. Returns relevant excerpts matching the query. Recommended for most use cases as it provides targeted results without the full 320k token context.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {
        query: z.string().min(2).max(100).describe("The search query (e.g., 'routing', 'server actions', 'middleware')"),
        limit: z.number().min(1).max(20).optional().default(5).describe("Maximum number of results to return (default: 5, max: 20)")
      }
    },
    async (request) => {
      const args = request.params.arguments as SearchDocsArgs;

      createAuditLog('info', 'tool_request', {
        tool: 'search_nextjs_docs',
        query: args.query,
        limit: args.limit,
        timestamp: new Date().toISOString()
      });

      try {
        validateToolInput('search_nextjs_docs', args);

        const content = await fileService.readFullDocsFile(CONFIG.nextjsDocsPath, CONFIG.largeFileSize);
        const results = searchInContent(content, args.query, args.limit || 5);

        createAuditLog('info', 'operation_completed', {
          tool: 'search_nextjs_docs',
          resultsFound: results.length
        });

        return {
          content: [{
            type: "text" as const,
            text: results.length > 0
              ? `Found ${results.length} result(s) for "${args.query}":\n\n${results.join('\n\n---\n\n')}`
              : `No results found for "${args.query}". Try different keywords or use get_nextjs_full_docs for complete documentation.`
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'search_nextjs_docs',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'search_nextjs_docs')
        );
      }
    }
  );

  /**
   * Tool: search_tailwind_docs
   * Searches within Tailwind CSS documentation with keyword matching
   */
  server.registerTool(
    "search_tailwind_docs",
    {
      title: "Search Tailwind CSS Documentation",
      description: "Search within the Tailwind CSS documentation for specific utility classes or concepts. Returns relevant excerpts matching the query. Recommended for most use cases as it provides targeted results without the full 730k token context.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {
        query: z.string().min(2).max(100).describe("The search query (e.g., 'padding', 'flex', 'dark mode')"),
        limit: z.number().min(1).max(20).optional().default(5).describe("Maximum number of results to return (default: 5, max: 20)")
      }
    },
    async (request) => {
      const args = request.params.arguments as SearchDocsArgs;

      createAuditLog('info', 'tool_request', {
        tool: 'search_tailwind_docs',
        query: args.query,
        limit: args.limit,
        timestamp: new Date().toISOString()
      });

      try {
        validateToolInput('search_tailwind_docs', args);

        const content = await fileService.readFullDocsFile(CONFIG.tailwindDocsPath, CONFIG.largeFileSize);
        const results = searchInContent(content, args.query, args.limit || 5);

        createAuditLog('info', 'operation_completed', {
          tool: 'search_tailwind_docs',
          resultsFound: results.length
        });

        return {
          content: [{
            type: "text" as const,
            text: results.length > 0
              ? `Found ${results.length} result(s) for "${args.query}":\n\n${results.join('\n\n---\n\n')}`
              : `No results found for "${args.query}". Try different keywords or use get_tailwind_full_docs for complete documentation.`
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'search_tailwind_docs',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'search_tailwind_docs')
        );
      }
    }
  );

  /**
   * Tool: get_catalyst_component
   * Retrieves a specific Catalyst UI component TypeScript source
   */
  server.registerTool(
    "get_catalyst_component",
    {
      title: "Get Catalyst UI Component",
      description: "Retrieve the TypeScript source code for a specific Catalyst UI component. Components include forms (button, checkbox, input, etc.), navigation (navbar, sidebar, dropdown), layout (divider, heading), feedback (alert, badge, dialog), and data display (avatar, table, pagination). All components are production-ready TypeScript React components with Tailwind styling and Headless UI integration.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {
        component_name: z.string().min(1).max(50).describe("Name of the Catalyst component (e.g., 'button', 'dialog', 'table')")
      }
    },
    async (request) => {
      const args = request.params.arguments as CatalystComponentArgs;

      createAuditLog('info', 'tool_request', {
        tool: 'get_catalyst_component',
        component_name: args.component_name,
        timestamp: new Date().toISOString()
      });

      try {
        validateToolInput('get_catalyst_component', args);

        const componentPath = path.join(CONFIG.catalystComponentsPath, `${args.component_name}.tsx`);
        const content = await fs.readFile(componentPath, 'utf-8');

        createAuditLog('info', 'operation_completed', {
          tool: 'get_catalyst_component',
          component: args.component_name,
          contentSize: content.length
        });

        return {
          content: [{
            type: "text" as const,
            text: `# Catalyst UI Component: ${args.component_name}\n\n\`\`\`typescript\n${content}\n\`\`\``
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'get_catalyst_component',
          error: error.message,
          code: error.code
        });

        if (error.code === 'ENOENT') {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Catalyst component '${args.component_name}' not found. Use list_catalyst_components to see available components.`
          );
        }

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'get_catalyst_component')
        );
      }
    }
  );

  /**
   * Tool: list_catalyst_components
   * Lists all 28 available Catalyst UI components with categories
   */
  server.registerTool(
    "list_catalyst_components",
    {
      title: "List Catalyst UI Components",
      description: "List all 28 available Catalyst UI components organized by category. Categories include: forms (button, checkbox, fieldset, input, radio, select, switch, textarea), navigation (navbar, sidebar, dropdown, link), layout (divider, heading, stacked-layout, auth-layout), feedback (alert, badge, dialog), data-display (avatar, description-list, listbox, pagination, table, text), and advanced (combobox).",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {}
    },
    async (request) => {
      createAuditLog('info', 'tool_request', {
        tool: 'list_catalyst_components',
        timestamp: new Date().toISOString()
      });

      try {
        const files = await fs.readdir(CONFIG.catalystComponentsPath);
        const components = files
          .filter(file => file.endsWith('.tsx'))
          .map(file => file.replace('.tsx', ''))
          .sort();

        // Organize by category based on content-summary.json knowledge
        const categories = {
          forms: ['button', 'checkbox', 'fieldset', 'input', 'radio', 'select', 'switch', 'textarea'],
          navigation: ['navbar', 'sidebar', 'sidebar-layout', 'dropdown', 'link'],
          layout: ['divider', 'heading', 'stacked-layout', 'auth-layout'],
          feedback: ['alert', 'badge', 'dialog'],
          'data-display': ['avatar', 'description-list', 'listbox', 'pagination', 'table', 'text'],
          advanced: ['combobox']
        };

        let output = `# Catalyst UI Components (${components.length} total)\n\n`;
        output += `All components are TypeScript React components with Tailwind CSS styling and Headless UI integration.\n\n`;

        for (const [category, categoryComponents] of Object.entries(categories)) {
          const available = categoryComponents.filter(c => components.includes(c));
          if (available.length > 0) {
            output += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
            output += available.map(c => `- ${c}`).join('\n');
            output += '\n\n';
          }
        }

        output += `\nUse get_catalyst_component with component_name to retrieve the source code.`;

        createAuditLog('info', 'operation_completed', {
          tool: 'list_catalyst_components',
          componentCount: components.length
        });

        return {
          content: [{
            type: "text" as const,
            text: output
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'list_catalyst_components',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'list_catalyst_components')
        );
      }
    }
  );

  /**
   * Tool: get_pattern
   * Retrieves a specific abstracted template pattern
   */
  server.registerTool(
    "get_pattern",
    {
      title: "Get Abstracted Pattern",
      description: "Retrieve documentation for a specific abstracted pattern. Patterns are organized into: layouts (app-header, sidebar-layout, auth-layout, overlay-navigation), pages (hero-section, pricing-page, blog-layout), and features (animations, dark-mode). Patterns include implementation details, code examples, accessibility considerations, and dependencies.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {
        category: z.enum(['layouts', 'pages', 'features']).describe("Pattern category: 'layouts', 'pages', or 'features'"),
        pattern_name: z.string().min(1).max(50).describe("Name of the pattern (e.g., 'app-header', 'pricing-page', 'dark-mode')")
      }
    },
    async (request) => {
      const args = request.params.arguments as PatternArgs;

      createAuditLog('info', 'tool_request', {
        tool: 'get_pattern',
        category: args.category,
        pattern_name: args.pattern_name,
        timestamp: new Date().toISOString()
      });

      try {
        validateToolInput('get_pattern', args);

        const patternPath = path.join(CONFIG.patternsPath, args.category, `${args.pattern_name}.md`);
        const content = await fs.readFile(patternPath, 'utf-8');

        createAuditLog('info', 'operation_completed', {
          tool: 'get_pattern',
          category: args.category,
          pattern: args.pattern_name,
          contentSize: content.length
        });

        return {
          content: [{
            type: "text" as const,
            text: content
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'get_pattern',
          error: error.message,
          code: error.code
        });

        if (error.code === 'ENOENT') {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Pattern '${args.pattern_name}' not found in category '${args.category}'. Use list_patterns to see available patterns.`
          );
        }

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'get_pattern')
        );
      }
    }
  );

  /**
   * Tool: list_patterns
   * Lists all available abstracted patterns organized by category
   */
  server.registerTool(
    "list_patterns",
    {
      title: "List Available Patterns",
      description: "List all available abstracted template patterns organized by category (layouts, pages, features). Patterns are abstracted from professional Next.js templates and include common architectural approaches, not template-specific implementations. Each pattern includes multiple variants, dependencies, accessibility guidelines, and dark mode support.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {}
    },
    async (request) => {
      createAuditLog('info', 'tool_request', {
        tool: 'list_patterns',
        timestamp: new Date().toISOString()
      });

      try {
        const categories = ['layouts', 'pages', 'features'];
        let output = '# Available Abstracted Patterns\n\n';
        output += 'Patterns abstracted from professional Next.js templates. Focus on common architectural approaches.\n\n';

        for (const category of categories) {
          const categoryPath = path.join(CONFIG.patternsPath, category);
          try {
            const files = await fs.readdir(categoryPath);
            const patterns = files
              .filter(file => file.endsWith('.md'))
              .map(file => file.replace('.md', ''))
              .sort();

            if (patterns.length > 0) {
              output += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
              output += patterns.map(p => `- ${p}`).join('\n');
              output += '\n\n';
            }
          } catch (error: any) {
            // Category directory might not exist or be empty
            continue;
          }
        }

        output += `\nUse get_pattern with category and pattern_name to retrieve the full documentation.`;

        createAuditLog('info', 'operation_completed', {
          tool: 'list_patterns'
        });

        return {
          content: [{
            type: "text" as const,
            text: output
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'list_patterns',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'list_patterns')
        );
      }
    }
  );

  /**
   * Tool: get_color_design_guidance
   * Retrieves comprehensive color design patterns and psychology guide
   * RECOMMENDED: Use with a subagent for color selection workflow
   */
  server.registerTool(
    "get_color_design_guidance",
    {
      title: "Get Color Design Guidance",
      description: "Retrieve comprehensive color design patterns documentation (~20KB). Covers color psychology, premium vs cheap distinctions, harmony systems, industry-specific guidance, and 2024-2025 modern trends. **RECOMMENDED WORKFLOW**: Due to the comprehensive nature of this content, consider using a subagent to execute the color selection workflow with full context. The subagent can analyze the guidance and make informed color decisions for your specific project.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {}
    },
    async (request) => {
      createAuditLog('info', 'tool_request', {
        tool: 'get_color_design_guidance',
        timestamp: new Date().toISOString()
      });

      try {
        const colorPatternsPath = path.join(CONFIG.patternsPath, 'features', 'color-design-patterns.md');
        const content = await fs.readFile(colorPatternsPath, 'utf-8');

        // Add subagent recommendation header
        const header = `# Color Design Guidance\n\n` +
          `> **💡 RECOMMENDED WORKFLOW**: This is comprehensive guidance (~20KB) for making professional color choices.\n` +
          `> For best results, consider using a subagent/agent workflow:\n` +
          `> 1. Launch an agent with access to this color design guidance\n` +
          `> 2. Provide the agent with your project context (industry, mood, target audience)\n` +
          `> 3. Let the agent analyze the guidance and recommend specific color palettes\n` +
          `> 4. The agent can explain rationale, show alternatives, and help refine choices\n` +
          `>\n` +
          `> This approach leverages the full context effectively without overwhelming the main conversation.\n\n` +
          `---\n\n`;

        createAuditLog('info', 'operation_completed', {
          tool: 'get_color_design_guidance',
          contentSize: content.length
        });

        return {
          content: [{
            type: "text" as const,
            text: header + content
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'get_color_design_guidance',
          error: error.message,
          code: error.code
        });

        if (error.code === 'ENOENT') {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Color design patterns documentation not found. Please ensure color-design-patterns.md exists in the features directory.`
          );
        }

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'get_color_design_guidance')
        );
      }
    }
  );

  /**
   * Tool: list_starter_kits
   * Lists all available template starter kits with details
   */
  server.registerTool(
    "list_starter_kits",
    {
      title: "List Template Starter Kits",
      description: "List all available template starter kits with their features, use cases, and complexity levels. Each template includes architectural decision guidance that teaches you how to choose the right libraries and patterns for your needs, rather than prescribing specific solutions. Includes: Documentation Site, SaaS Marketing, Portfolio & Blog, Agency/Studio, Content Platform, Event/Conference, App Marketing, Podcast/Media, CMS-Integrated, Pitch Deck, Admin Dashboard, and E-commerce templates.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {}
    },
    async (request) => {
      createAuditLog('info', 'tool_request', {
        tool: 'list_starter_kits',
        timestamp: new Date().toISOString()
      });

      try {
        const content = await fs.readFile(CONFIG.templatesPath, 'utf-8');
        const data = JSON.parse(content);
        const kits = data.starterKits;

        let output = `# Template Starter Kits (${kits.length} total)\n\n`;
        output += `Template starter kits with architectural decision guidance. Each template teaches you how to make informed choices about libraries, patterns, and approaches rather than prescribing specific solutions.\n\n`;

        for (const kit of kits) {
          output += `## ${kit.name}\n`;
          output += `**ID**: \`${kit.id}\`\n`;
          output += `**Description**: ${kit.description}\n`;
          output += `**Use Cases**: ${kit.useCases.join(', ')}\n`;
          output += `**Complexity**: ${kit.complexity}\n`;
          output += `**Animations**: ${kit.animations}\n`;
          output += `**Color Scheme**: ${kit.colorScheme}\n`;
          output += `**Key Features**: ${kit.features.slice(0, 3).join(', ')}${kit.features.length > 3 ? '...' : ''}\n\n`;
        }

        output += `\nUse \`get_starter_kit\` with the template ID to get full details including all libraries and dependencies.`;

        createAuditLog('info', 'operation_completed', {
          tool: 'list_starter_kits',
          kitsCount: kits.length
        });

        return {
          content: [{
            type: "text" as const,
            text: output
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'list_starter_kits',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'list_starter_kits')
        );
      }
    }
  );

  /**
   * Tool: get_starter_kit
   * Gets detailed information about a specific starter kit
   */
  server.registerTool(
    "get_starter_kit",
    {
      title: "Get Starter Kit Details",
      description: "Get detailed information about a specific template starter kit including features, architectural decisions with tradeoffs, alternative approaches, and implementation guidance. Each template teaches decision-making frameworks rather than prescribing specific libraries. Use list_starter_kits to see available template IDs.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {
        id: z.string().min(1).max(50).describe("The starter kit ID (e.g., 'documentation', 'saas-marketing', 'portfolio-blog')")
      }
    },
    async (request) => {
      const args = request.params.arguments as StarterKitArgs;

      createAuditLog('info', 'tool_request', {
        tool: 'get_starter_kit',
        id: args.id,
        timestamp: new Date().toISOString()
      });

      try {
        validateToolInput('get_starter_kit', args);

        const content = await fs.readFile(CONFIG.templatesPath, 'utf-8');
        const data = JSON.parse(content);
        const kit = data.starterKits.find((k: any) => k.id === args.id);

        if (!kit) {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Starter kit '${args.id}' not found. Use list_starter_kits to see available templates.`
          );
        }

        let output = `# ${kit.name}\n\n`;
        output += `**ID**: \`${kit.id}\`\n\n`;
        output += `## Description\n${kit.description}\n\n`;
        output += `## Use Cases\n${kit.useCases.map((u: string) => `- ${u}`).join('\n')}\n\n`;

        output += `## Project Specifications\n`;
        output += `- **Complexity**: ${kit.complexity}\n`;
        output += `- **Animation Level**: ${kit.animations}\n`;
        output += `- **Color Scheme**: ${kit.colorScheme}\n`;
        if (kit.basedOn) {
          output += `- **Template References**: ${kit.basedOn.join(', ')}\n`;
        }
        output += `\n`;

        output += `## Features\n${kit.features.map((f: string) => `- ${f}`).join('\n')}\n\n`;

        // Architectural Decisions (new format)
        if (kit.architecturalDecisions) {
          output += `## Architectural Decisions\n\n`;
          output += `This template requires key architectural choices. Below are the main decisions with guidance on choosing the right approach for your needs.\n\n`;

          for (const [decisionKey, decisionData] of Object.entries(kit.architecturalDecisions)) {
            const decision = decisionData as any;
            const title = decisionKey.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase());

            output += `### ${title}\n\n`;
            output += `**Decision**: ${decision.decision}\n\n`;
            output += `**Rationale**: ${decision.rationale}\n\n`;

            if (decision.patternReference && decision.patternReference !== "None (framework choice)" && !decision.patternReference.startsWith("None")) {
              output += `📚 **Learn more**: See \`${decision.patternReference}\` in the patterns documentation\n\n`;
            }

            if (decision.alternativeApproaches && decision.alternativeApproaches.length > 0) {
              output += `**Alternative approaches**:\n`;
              decision.alternativeApproaches.forEach((alt: string) => {
                output += `- ${alt}\n`;
              });
              output += `\n`;
            }

            if (decision.tradeoffs) {
              output += `**Tradeoffs**: ${decision.tradeoffs}\n\n`;
            }

            output += `---\n\n`;
          }
        }

        // Recommended Libraries (as examples, not requirements)
        if (kit.recommendedLibraries) {
          output += `## Recommended Libraries\n\n`;
          output += `> **Note**: ${kit.recommendedLibraries.note || "These are examples based on common choices. Choose based on your architectural decisions above."}\n\n`;

          for (const [category, libs] of Object.entries(kit.recommendedLibraries)) {
            if (category === 'note') continue; // Skip the note field
            output += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
            output += `\`\`\`bash\n# Example: ${(libs as string[]).join(' ')}\n\`\`\`\n\n`;
          }
        } else if (kit.libraries) {
          // Fallback for templates not yet refactored
          output += `## Libraries\n\n`;
          for (const [category, libs] of Object.entries(kit.libraries)) {
            output += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n`;
            output += `\`\`\`bash\nnpm install ${(libs as string[]).join(' ')}\n\`\`\`\n\n`;
          }
        }

        output += `## Implementation Guidance\n\n`;
        output += `1. Review the architectural decisions above and choose approaches that fit your requirements\n`;
        output += `2. Use the pattern documentation (referenced above) for deeper understanding\n`;
        output += `3. Install your chosen libraries based on the decisions you made\n`;
        output += `4. Use \`get_catalyst_component\` to retrieve pre-built UI components\n`;
        output += `5. Use \`get_library_docs\` to learn about specific libraries you choose\n`;
        output += `6. Refer to Next.js, React, and Tailwind documentation via the search tools\n`;

        createAuditLog('info', 'operation_completed', {
          tool: 'get_starter_kit',
          id: args.id
        });

        return {
          content: [{
            type: "text" as const,
            text: output
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'get_starter_kit',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'get_starter_kit')
        );
      }
    }
  );

  /**
   * Tool: recommend_template
   * Recommends templates based on user criteria
   */
  server.registerTool(
    "recommend_template",
    {
      title: "Get Template Recommendations",
      description: "Get template recommendations based on your project requirements. Provide criteria like purpose, color preferences, animation level, required features, and complexity. Returns ranked template suggestions with explanations.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {
        purpose: z.string().optional().describe("Primary purpose: documentation, marketing, portfolio, agency, learning, event, app, media, content"),
        colorPreference: z.string().optional().describe("Color preference: professional, vibrant, creative, minimal, warm, modern"),
        animations: z.string().optional().describe("Animation level: minimal, moderate, high"),
        features: z.array(z.string()).optional().describe("Required features: blog, search, darkmode, forms, cms, auth, media, ecommerce"),
        complexity: z.string().optional().describe("Complexity preference: beginner, intermediate, advanced")
      }
    },
    async (request) => {
      const args = request.params.arguments as RecommendTemplateArgs;

      createAuditLog('info', 'tool_request', {
        tool: 'recommend_template',
        criteria: args,
        timestamp: new Date().toISOString()
      });

      try {
        const content = await fs.readFile(CONFIG.templatesPath, 'utf-8');
        const data = JSON.parse(content);
        const recommendations = calculateRecommendations(data, args);

        let output = `# Template Recommendations\n\n`;
        output += `Based on your criteria:\n`;
        if (args.purpose) output += `- Purpose: ${args.purpose}\n`;
        if (args.colorPreference) output += `- Colors: ${args.colorPreference}\n`;
        if (args.animations) output += `- Animations: ${args.animations}\n`;
        if (args.features && args.features.length > 0) output += `- Features: ${args.features.join(', ')}\n`;
        if (args.complexity) output += `- Complexity: ${args.complexity}\n`;
        output += `\n`;

        for (let i = 0; i < Math.min(3, recommendations.length); i++) {
          const rec = recommendations[i];
          output += `## ${i + 1}. ${rec.kit.name} (${rec.score}% match)\n\n`;
          output += `**ID**: \`${rec.kit.id}\`\n`;
          output += `${rec.kit.description}\n\n`;
          output += `**Why this matches:**\n${rec.reasons.map((r: string) => `- ${r}`).join('\n')}\n\n`;
          output += `**Key Features**: ${rec.kit.features.slice(0, 4).join(', ')}\n\n`;
        }

        if (recommendations.length === 0) {
          output += `No perfect matches found. Try using \`list_starter_kits\` to browse all available templates.\n`;
        } else {
          output += `\nUse \`get_starter_kit\` with the template ID to get full implementation details.\n`;
        }

        createAuditLog('info', 'operation_completed', {
          tool: 'recommend_template',
          recommendationsCount: recommendations.length
        });

        return {
          content: [{
            type: "text" as const,
            text: output
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'recommend_template',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'recommend_template')
        );
      }
    }
  );

  /**
   * Tool: answer_questionnaire
   * Processes questionnaire answers and returns recommendations
   */
  server.registerTool(
    "answer_questionnaire",
    {
      title: "Answer Template Questionnaire",
      description: "Submit answers to the template selection questionnaire and receive personalized recommendations. Provide answers as a key-value object where keys are question IDs (purpose, colorPreference, animations, features, complexity) and values are your choices.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {
        answers: z.record(z.union([z.string(), z.array(z.string())])).describe("Questionnaire answers as key-value pairs. Keys: purpose, colorPreference, animations, features (array), complexity")
      }
    },
    async (request) => {
      const args = request.params.arguments as QuestionnaireArgs;

      createAuditLog('info', 'tool_request', {
        tool: 'answer_questionnaire',
        answersProvided: Object.keys(args.answers),
        timestamp: new Date().toISOString()
      });

      try {
        const content = await fs.readFile(CONFIG.templatesPath, 'utf-8');
        const data = JSON.parse(content);

        // Convert answers to recommendation criteria
        const criteria: RecommendTemplateArgs = {
          purpose: args.answers.purpose as string,
          colorPreference: args.answers.colorPreference as string,
          animations: args.answers.animations as string,
          features: args.answers.features as string[],
          complexity: args.answers.complexity as string
        };

        const recommendations = calculateRecommendations(data, criteria);

        let output = `# Your Template Recommendations\n\n`;
        output += `Thank you for completing the questionnaire! Based on your answers, here are our top recommendations:\n\n`;

        for (let i = 0; i < Math.min(3, recommendations.length); i++) {
          const rec = recommendations[i];
          output += `## ${i + 1}. ${rec.kit.name} (${rec.score}% match)\n\n`;
          output += `**ID**: \`${rec.kit.id}\`\n`;
          output += `**Description**: ${rec.kit.description}\n\n`;
          output += `**Why we recommend this:**\n${rec.reasons.map((r: string) => `- ${r}`).join('\n')}\n\n`;
          output += `**Key Features**:\n${rec.kit.features.slice(0, 5).map((f: string) => `- ${f}`).join('\n')}\n\n`;
          output += `**Complexity**: ${rec.kit.complexity} | **Animations**: ${rec.kit.animations}\n\n`;
        }

        output += `\nNext steps:\n`;
        output += `1. Use \`get_starter_kit\` with your chosen template ID for full implementation details\n`;
        output += `2. Use \`get_library_docs\` to learn about the required libraries\n`;
        output += `3. Use \`get_catalyst_component\` to get UI component code\n`;

        createAuditLog('info', 'operation_completed', {
          tool: 'answer_questionnaire',
          recommendationsCount: recommendations.length
        });

        return {
          content: [{
            type: "text" as const,
            text: output
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'answer_questionnaire',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'answer_questionnaire')
        );
      }
    }
  );

  /**
   * Tool: get_library_docs
   * Retrieves documentation for a specific library
   */
  server.registerTool(
    "get_library_docs",
    {
      title: "Get Library Documentation",
      description: "Get comprehensive documentation for commonly used libraries in Next.js projects. Available: framer-motion, mdx, headless-ui, next-themes, clsx, tailwind-plugins. Includes installation, usage examples, patterns, and best practices.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {
        library_name: z.string().min(1).max(50).describe("Library name (e.g., 'framer-motion', 'mdx', 'headless-ui', 'next-themes', 'clsx', 'tailwind-plugins')")
      }
    },
    async (request) => {
      const args = request.params.arguments as LibraryDocsArgs;

      createAuditLog('info', 'tool_request', {
        tool: 'get_library_docs',
        library: args.library_name,
        timestamp: new Date().toISOString()
      });

      try {
        validateToolInput('get_library_docs', args);

        const libraryPath = path.join(CONFIG.libraryDocsPath, `${args.library_name}.txt`);
        const content = await fs.readFile(libraryPath, 'utf-8');

        createAuditLog('info', 'operation_completed', {
          tool: 'get_library_docs',
          library: args.library_name,
          contentSize: content.length
        });

        return {
          content: [{
            type: "text" as const,
            text: content
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'get_library_docs',
          error: error.message,
          code: error.code
        });

        if (error.code === 'ENOENT') {
          throw new McpError(
            ErrorCode.InvalidRequest,
            `Library documentation for '${args.library_name}' not found. Use list_library_docs to see available libraries.`
          );
        }

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'get_library_docs')
        );
      }
    }
  );

  /**
   * Tool: list_library_docs
   * Lists all available library documentation
   */
  server.registerTool(
    "list_library_docs",
    {
      title: "List Available Library Documentation",
      description: "List all available library documentation files. Includes commonly used libraries like Framer Motion, MDX, Headless UI, next-themes, clsx, and Tailwind plugins. Each provides installation, usage examples, and best practices.",
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true
      },
      inputSchema: {}
    },
    async (request) => {
      createAuditLog('info', 'tool_request', {
        tool: 'list_library_docs',
        timestamp: new Date().toISOString()
      });

      try {
        const files = await fs.readdir(CONFIG.libraryDocsPath);
        const libraries = files
          .filter(file => file.endsWith('.txt'))
          .map(file => file.replace('.txt', ''))
          .sort();

        const descriptions: Record<string, string> = {
          'framer-motion': 'Animation library for React with spring physics and gestures',
          'mdx': 'Markdown with JSX components for rich content',
          'headless-ui': 'Unstyled, accessible UI components by Tailwind Labs',
          'next-themes': 'Perfect dark mode implementation for Next.js',
          'clsx': 'Tiny utility for conditional className strings',
          'tailwind-plugins': 'Official Tailwind CSS plugins (Typography, Forms, etc.)'
        };

        let output = `# Available Library Documentation (${libraries.length} libraries)\n\n`;
        output += `Comprehensive documentation for commonly used libraries in Next.js + Tailwind projects.\n\n`;

        for (const lib of libraries) {
          output += `## ${lib}\n`;
          if (descriptions[lib]) {
            output += `${descriptions[lib]}\n`;
          }
          output += `Use \`get_library_docs\` with library_name \`"${lib}"\` to retrieve full documentation.\n\n`;
        }

        createAuditLog('info', 'operation_completed', {
          tool: 'list_library_docs',
          librariesCount: libraries.length
        });

        return {
          content: [{
            type: "text" as const,
            text: output
          }]
        };
      } catch (error: any) {
        createAuditLog('error', 'tool_request_failed', {
          tool: 'list_library_docs',
          error: error.message,
          code: error.code
        });

        if (error instanceof McpError) {
          throw error;
        }

        throw new McpError(
          ErrorCode.InternalError,
          ErrorHandler.formatSafeErrorMessage(error, 'list_library_docs')
        );
      }
    }
  );

  return server.server;
}

// =========================
// HELPER FUNCTIONS
// =========================

/**
 * Calculates template recommendations based on user criteria
 */
function calculateRecommendations(data: any, criteria: RecommendTemplateArgs): any[] {
  const kits = data.starterKits;
  const matching = data.questionnaire.matching;
  const recommendations: any[] = [];

  for (const kit of kits) {
    let score = 0;
    const reasons: string[] = [];
    const matchData = matching[kit.id];

    if (!matchData) continue;

    // Purpose matching (highest weight)
    if (criteria.purpose && matchData.purpose && matchData.purpose.includes(criteria.purpose)) {
      score += 40;
      reasons.push(`Perfect match for ${criteria.purpose} use case`);
    }

    // Color preference matching
    if (criteria.colorPreference && matchData.colorPreference && matchData.colorPreference.includes(criteria.colorPreference)) {
      score += 15;
      reasons.push(`Matches ${criteria.colorPreference} color scheme preference`);
    }

    // Animation level matching
    if (criteria.animations && matchData.animations && matchData.animations.includes(criteria.animations)) {
      score += 20;
      reasons.push(`Has ${criteria.animations} animation level`);
    }

    // Feature matching
    if (criteria.features && criteria.features.length > 0 && matchData.features) {
      const matchedFeatures = criteria.features.filter(f => matchData.features.includes(f));
      const featureScore = (matchedFeatures.length / criteria.features.length) * 15;
      score += featureScore;
      if (matchedFeatures.length > 0) {
        reasons.push(`Includes ${matchedFeatures.length} of your requested features`);
      }
    }

    // Complexity matching
    if (criteria.complexity && matchData.complexity && matchData.complexity.includes(criteria.complexity)) {
      score += 10;
      reasons.push(`Matches ${criteria.complexity} complexity level`);
    }

    if (score > 0) {
      recommendations.push({
        kit,
        score: Math.round(score),
        reasons
      });
    }
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

// =========================
// HELPER FUNCTIONS
// =========================

/**
 * Searches content for query and returns relevant excerpts
 * @param content - The full content to search
 * @param query - The search query
 * @param limit - Maximum number of results
 * @returns Array of relevant excerpts
 */
function searchInContent(content: string, query: string, limit: number): string[] {
  const lines = content.split('\n');
  const queryLower = query.toLowerCase();
  const results: string[] = [];
  const contextLines = 3; // Lines of context before and after match

  for (let i = 0; i < lines.length && results.length < limit; i++) {
    if (lines[i].toLowerCase().includes(queryLower)) {
      // Get context around the match
      const start = Math.max(0, i - contextLines);
      const end = Math.min(lines.length, i + contextLines + 1);
      const excerpt = lines.slice(start, end).join('\n');
      results.push(`\`\`\`\n${excerpt}\n\`\`\``);

      // Skip ahead to avoid duplicate context
      i += contextLines;
    }
  }

  return results;
}
