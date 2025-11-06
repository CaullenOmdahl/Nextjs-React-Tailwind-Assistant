import path from 'path';
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { ValidationResult } from '../types.js';

/**
 * Sanitizes and validates file paths to prevent directory traversal attacks
 * @param userInput - The user-provided path component
 * @param maxLength - Maximum allowed length for the input
 * @returns ValidationResult with sanitized path or error
 */
export function sanitizeAndValidatePath(
  userInput: string,
  maxLength: number = 100
): ValidationResult {
  // Check if input exists and is a string
  if (!userInput || typeof userInput !== 'string') {
    return {
      isValid: false,
      error: 'Input must be a non-empty string'
    };
  }

  // Check length constraints
  if (userInput.length > maxLength) {
    return {
      isValid: false,
      error: `Input exceeds maximum length of ${maxLength} characters`
    };
  }

  // Remove any path traversal attempts
  const normalized = path.normalize(userInput).replace(/^(\.\.[\\/\\])+/, '');

  // Check for remaining dangerous patterns
  if (normalized.includes('..') ||
      normalized.includes('/') ||
      normalized.includes('\\') ||
      normalized.includes('\0')) {
    return {
      isValid: false,
      error: 'Invalid characters detected in path'
    };
  }

  // Allow only alphanumeric characters, hyphens, underscores, and dots
  const allowedPattern = /^[a-zA-Z0-9\-_.]+$/;
  if (!allowedPattern.test(normalized)) {
    return {
      isValid: false,
      error: 'Path contains invalid characters. Only alphanumeric, hyphens, underscores, and dots are allowed'
    };
  }

  return {
    isValid: true,
    sanitizedValue: normalized
  };
}

/**
 * Validates that a resolved file path is within the allowed base directory
 * @param requestedPath - The full resolved path to validate
 * @param basePath - The base directory that should contain the file
 * @returns boolean indicating if path is safe
 */
export function isPathWithinBase(requestedPath: string, basePath: string): boolean {
  const resolvedBase = path.resolve(basePath);
  const resolvedRequested = path.resolve(requestedPath);

  return resolvedRequested.startsWith(resolvedBase + path.sep) ||
         resolvedRequested === resolvedBase;
}

/**
 * Validates tool input parameters with comprehensive checks
 * @param toolName - Name of the tool being called
 * @param args - Arguments provided to the tool
 * @throws McpError if validation fails
 */
export function validateToolInput(toolName: string, args: any): void {
  if (!args || typeof args !== 'object') {
    throw new McpError(ErrorCode.InvalidParams, `Invalid arguments for tool ${toolName}`);
  }

  switch (toolName) {
    case 'search_nextjs_docs':
    case 'search_tailwind_docs':
      validateSearchDocsArgs(args);
      break;
    case 'get_catalyst_component':
      validateCatalystComponentArgs(args);
      break;
    case 'get_pattern':
      validatePatternArgs(args);
      break;
    default:
      // For list operations and full doc retrieval without parameters, no validation needed
      break;
  }
}

function validateSearchDocsArgs(args: any): void {
  if (!args.query || typeof args.query !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing or invalid 'query' argument");
  }

  // Validate query string - allow more characters for search but still prevent injection
  if (args.query.length < 2) {
    throw new McpError(ErrorCode.InvalidParams, "Search query must be at least 2 characters");
  }

  if (args.query.length > 100) {
    throw new McpError(ErrorCode.InvalidParams, "Search query exceeds maximum length of 100 characters");
  }

  // Check for null bytes and control characters
  if (args.query.includes('\0') || /[\x00-\x1F\x7F]/.test(args.query)) {
    throw new McpError(ErrorCode.InvalidParams, "Search query contains invalid characters");
  }

  // Validate limit if provided
  if (args.limit !== undefined) {
    if (typeof args.limit !== 'number' || args.limit < 1 || args.limit > 20) {
      throw new McpError(ErrorCode.InvalidParams, "Limit must be a number between 1 and 20");
    }
  }
}

function validateCatalystComponentArgs(args: any): void {
  if (!args.component_name || typeof args.component_name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing or invalid 'component_name' argument");
  }

  const validation = sanitizeAndValidatePath(args.component_name, 50);
  if (!validation.isValid) {
    throw new McpError(ErrorCode.InvalidParams, `Invalid component_name: ${validation.error}`);
  }
}

function validatePatternArgs(args: any): void {
  if (!args.category || typeof args.category !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing or invalid 'category' argument");
  }

  if (!args.pattern_name || typeof args.pattern_name !== 'string') {
    throw new McpError(ErrorCode.InvalidParams, "Missing or invalid 'pattern_name' argument");
  }

  // Validate category
  const allowedCategories = ['layouts', 'pages', 'features'];
  if (!allowedCategories.includes(args.category)) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Invalid category. Must be one of: ${allowedCategories.join(', ')}`
    );
  }

  // Validate pattern name
  const validation = sanitizeAndValidatePath(args.pattern_name, 50);
  if (!validation.isValid) {
    throw new McpError(ErrorCode.InvalidParams, `Invalid pattern_name: ${validation.error}`);
  }
}
