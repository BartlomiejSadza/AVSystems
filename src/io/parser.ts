/**
 * Input JSON parser.
 *
 * Reads and validates the raw JSON string against `InputSchema`.
 * Returns strongly-typed `Command[]` ready for the simulation engine.
 */

import { ZodError } from 'zod';
import { InputSchema } from './schemas.js';
import type { Command } from '../simulator/types.js';

export class ParseError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ParseError';
    this.cause = cause;
  }
}

/**
 * Parse a raw JSON string into a validated list of commands.
 *
 * @throws {ParseError} if the string is not valid JSON or fails schema validation.
 */
export function parseInput(rawJson: string): Command[] {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawJson);
  } catch (err) {
    throw new ParseError(`Input is not valid JSON: ${(err as Error).message}`, err);
  }

  const result = InputSchema.safeParse(parsed);
  if (!result.success) {
    const message = formatZodError(result.error);
    throw new ParseError(`Input failed schema validation:\n${message}`, result.error);
  }

  // Zod ensures the shape matches Command[] — cast is safe here.
  return result.data.commands as Command[];
}

/**
 * Format a ZodError into a human-readable multi-line string.
 */
function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
      return `  [${path}] ${issue.message}`;
    })
    .join('\n');
}
