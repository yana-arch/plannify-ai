// Utility functions for AI service response handling
import type { APIProvider } from '../types';

/**
 * Extracts text content from various AI provider response formats
 * Handles differences between Gemini SDK, custom proxies, OpenRouter, Anthropic, etc.
 */
export function extractTextFromProviderResponse(
  response: any,
  providerType: APIProvider['type'],
): string {
  if (!response) {
    return '';
  }

  // Handle Gemini responses
  if (providerType === 'gemini') {
    // Official SDK returns response with text() method
    if (typeof response.text === 'function') {
      return response.text();
    }
    // Nested response object (some SDK versions)
    if (response.response && typeof response.response.text === 'function') {
      return response.response.text();
    }
    // Custom proxy format (returns text as property)
    if (typeof response.text === 'string') {
      return response.text;
    }
    // Fallback for unexpected formats
    return '';
  }

  // Handle OpenRouter, OpenAI, and similar chat completion APIs
  if (providerType === 'openrouter' || providerType === 'openai' || providerType === 'custom') {
    return (
      response.choices?.[0]?.message?.content ||
      response.choices?.[0]?.text ||
      response.message?.content ||
      ''
    );
  }

  // Handle Anthropic responses
  if (providerType === 'anthropic') {
    return response.content?.[0]?.text || response.choices?.[0]?.message?.content || '';
  }

  // Handle Ollama responses
  if (providerType === 'ollama') {
    return response.response || response.text || '';
  }

  // Generic fallback
  return response.text || response.content || response.message || '';
}

/**
 * Validates and sanitizes user prompts before sending to AI
 */
export function validateAndSanitizePrompt(
  prompt: string,
  options?: {
    maxLength?: number;
    minLength?: number;
  },
): { isValid: boolean; sanitized: string; error?: string } {
  const maxLength = options?.maxLength || 10000;
  const minLength = options?.minLength || 1;

  // Trim whitespace
  const trimmed = prompt.trim();

  // Check minimum length
  if (trimmed.length < minLength) {
    return {
      isValid: false,
      sanitized: trimmed,
      error: `Prompt must be at least ${minLength} character${minLength > 1 ? 's' : ''} long`,
    };
  }

  // Check maximum length
  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      sanitized: trimmed.slice(0, maxLength),
      error: `Prompt too long. Maximum ${maxLength} characters allowed (${trimmed.length} provided)`,
    };
  }

  // Basic sanitization - remove potential injection attempts
  // Remove control characters using safer Unicode properties
  const sanitized = trimmed
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();

  return {
    isValid: true,
    sanitized,
  };
}

/**
 * Handles errors from dynamic imports with helpful user messages
 */
export async function safelyImportModule<T>(
  importFn: () => Promise<T>,
  moduleName: string,
): Promise<T> {
  try {
    return await importFn();
  } catch (error: any) {
    const userMessage = `Failed to load the ${moduleName} library. This might be due to a network issue or browser compatibility problem. Please refresh the page and try again.`;
    console.error(`Module import error for ${moduleName}:`, error);
    throw new Error(userMessage);
  }
}
