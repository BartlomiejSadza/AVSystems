/**
 * Input JSON parser.
 *
 * Reads and validates the raw JSON string against `InputSchema`.
 * Returns commands and optional simulate options (only fields present in JSON).
 */

import { ZodError } from 'zod';
import { InputSchema, type InputSchemaType } from './schemas.js';
import type { Command, SimulateOptions } from '../simulator/types.js';

export class ParseError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ParseError';
    this.cause = cause;
  }
}

/** Result of parsing and validating simulator input JSON. */
export interface ParseResult {
  commands: Command[];
  /**
   * Present when `options` included at least one non-empty field among
   * `signalTimings` or `roadPriorities`.
   */
  options?: SimulateOptions;
}

function simulateOptionsFromParsed(data: InputSchemaType): SimulateOptions | undefined {
  const opts = data.options;
  if (opts === undefined) {
    return undefined;
  }

  const st = opts.signalTimings;
  const hasSignalTimings = st !== undefined && Object.keys(st).length > 0;

  const rp = opts.roadPriorities;
  const hasRoadPriorities = rp !== undefined && Object.keys(rp).length > 0;

  if (!hasSignalTimings && !hasRoadPriorities) {
    return undefined;
  }

  const out: SimulateOptions = {};
  if (hasSignalTimings) {
    out.signalTimings = st;
  }
  if (hasRoadPriorities) {
    out.roadPriorities = rp;
  }
  return out;
}

/**
 * Parse a raw JSON string into validated commands and optional simulate options.
 *
 * @throws {ParseError} if the string is not valid JSON or fails schema validation.
 */
export function parseInput(rawJson: string): ParseResult {
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

  const options = simulateOptionsFromParsed(result.data);
  return {
    commands: result.data.commands as Command[],
    ...(options !== undefined ? { options } : {}),
  };
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
