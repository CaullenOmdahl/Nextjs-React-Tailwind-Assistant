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

export interface StarterKitArgs {
  id: string;
}

export interface RecommendTemplateArgs {
  purpose?: string;
  colorPreference?: string;
  animations?: string;
  features?: string[];
  complexity?: string;
}

export interface QuestionnaireArgs {
  answers: Record<string, string | string[]>;
}

export interface LibraryDocsArgs {
  library_name: string;
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
  templatesPath: string;
  libraryDocsPath: string;
  maxFileSize: number;
  largeFileSize: number; // For large documentation files (5MB)
  cacheTimeout: number;
}
