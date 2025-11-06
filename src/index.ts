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
    maxFileSize: 1 * 1024 * 1024, // 1MB for components and patterns
    largeFileSize: 5 * 1024 * 1024, // 5MB for large documentation files
    cacheTimeout: 5 * 60 * 1000 // 5 minutes cache timeout
  };

  // Initialize secure file service
  const fileService = new SecureFileService(CONFIG.maxFileSize, CONFIG.cacheTimeout);

  const server = new McpServer({
    name: "nextjs-react-tailwind-assistant-mcp-server",
    version: "0.1.3",
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
  server.setToolHandler(
    "get_nextjs_full_docs",
    z.object({}),
    {
      title: "Get Complete Next.js Documentation",
      description: "Get the complete Next.js 15+ documentation (~2.5MB, ~320,000 tokens). WARNING: This returns ~320,000 tokens. Only use with LLMs that support large context windows (100k+ tokens). For smaller contexts, use 'search_nextjs_docs' instead. Covers: App Router, Server Components, Client Components, routing, layouts, pages, data fetching, Server Actions, middleware, deployment, and optimization.",
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true
      }
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
  server.setToolHandler(
    "get_tailwind_full_docs",
    z.object({}),
    {
      title: "Get Complete Tailwind CSS Documentation",
      description: "Get the complete Tailwind CSS documentation (~2.1MB, ~730,000 tokens). WARNING: This returns ~730,000 tokens. Only use with LLMs that support very large context windows (200k+ tokens). For smaller contexts, use 'search_tailwind_docs' instead. Covers all utility classes, concepts, responsive design, dark mode, customization, and plugins.",
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true
      }
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
  server.setToolHandler(
    "search_nextjs_docs",
    z.object({
      query: z.string().min(2).max(100).describe("The search query (e.g., 'routing', 'server actions', 'middleware')"),
      limit: z.number().min(1).max(20).optional().default(5).describe("Maximum number of results to return (default: 5, max: 20)")
    }),
    {
      title: "Search Next.js Documentation",
      description: "Search within the Next.js documentation for specific topics or keywords. Returns relevant excerpts matching the query. Recommended for most use cases as it provides targeted results without the full 320k token context.",
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true
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
  server.setToolHandler(
    "search_tailwind_docs",
    z.object({
      query: z.string().min(2).max(100).describe("The search query (e.g., 'padding', 'flex', 'dark mode')"),
      limit: z.number().min(1).max(20).optional().default(5).describe("Maximum number of results to return (default: 5, max: 20)")
    }),
    {
      title: "Search Tailwind CSS Documentation",
      description: "Search within the Tailwind CSS documentation for specific utility classes or concepts. Returns relevant excerpts matching the query. Recommended for most use cases as it provides targeted results without the full 730k token context.",
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true
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
  server.setToolHandler(
    "get_catalyst_component",
    z.object({
      component_name: z.string().min(1).max(50).describe("Name of the Catalyst component (e.g., 'button', 'dialog', 'table')")
    }),
    {
      title: "Get Catalyst UI Component",
      description: "Retrieve the TypeScript source code for a specific Catalyst UI component. Components include forms (button, checkbox, input, etc.), navigation (navbar, sidebar, dropdown), layout (divider, heading), feedback (alert, badge, dialog), and data display (avatar, table, pagination). All components are production-ready TypeScript React components with Tailwind styling and Headless UI integration.",
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true
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
  server.setToolHandler(
    "list_catalyst_components",
    z.object({}),
    {
      title: "List Catalyst UI Components",
      description: "List all 28 available Catalyst UI components organized by category. Categories include: forms (button, checkbox, fieldset, input, radio, select, switch, textarea), navigation (navbar, sidebar, dropdown, link), layout (divider, heading, stacked-layout, auth-layout), feedback (alert, badge, dialog), data-display (avatar, description-list, listbox, pagination, table, text), and advanced (combobox).",
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true
      }
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
  server.setToolHandler(
    "get_pattern",
    z.object({
      category: z.enum(['layouts', 'pages', 'features']).describe("Pattern category: 'layouts', 'pages', or 'features'"),
      pattern_name: z.string().min(1).max(50).describe("Name of the pattern (e.g., 'app-header', 'pricing-page', 'dark-mode')")
    }),
    {
      title: "Get Abstracted Pattern",
      description: "Retrieve documentation for a specific abstracted pattern. Patterns are organized into: layouts (app-header, sidebar-layout, auth-layout, overlay-navigation), pages (hero-section, pricing-page, blog-layout), and features (animations, dark-mode). Patterns include implementation details, code examples, accessibility considerations, and dependencies.",
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true
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
  server.setToolHandler(
    "list_patterns",
    z.object({}),
    {
      title: "List Available Patterns",
      description: "List all available abstracted template patterns organized by category (layouts, pages, features). Patterns are abstracted from professional Next.js templates and include common architectural approaches, not template-specific implementations. Each pattern includes multiple variants, dependencies, accessibility guidelines, and dark mode support.",
      annotations: {
        readOnly: true,
        destructive: false,
        idempotent: true
      }
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

  return server.server;
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
