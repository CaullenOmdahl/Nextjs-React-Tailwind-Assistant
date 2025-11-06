#!/usr/bin/env node

import { TextContent } from "@modelcontextprotocol/sdk/types.js";

// Type definitions for better type safety
export interface ToolRequest {
  params: {
    name: string;
    arguments?: Record<string, unknown>;
  };
}

export interface ContentResponse {
  content: TextContent[];
}

export interface SearchDocsArgs {
  query: string;
  limit?: number;
}

export interface CatalystComponentArgs {
  component_name: string;
}

export interface PatternArgs {
  category: string;
  pattern_name: string;
}

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  error?: string;
}

export interface CacheEntry {
  content: string;
  lastModified: number;
}

export interface ServerConfig {
  contentBasePath: string;
  nextjsDocsPath: string;
  tailwindDocsPath: string;
  catalystComponentsPath: string;
  patternsPath: string;
  maxFileSize: number;
  largeFileSize: number; // For large documentation files (5MB)
  cacheTimeout: number;
}
