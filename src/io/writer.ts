/**
 * Output JSON writer.
 *
 * Serialises simulation results into the expected JSON output format.
 * The output is validated against `OutputSchema` before serialisation
 * so structural regressions are caught at the boundary.
 */

import { OutputSchema } from './schemas.js';
import type { StepStatus } from '../simulator/types.js';

export class WriteError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'WriteError';
    this.cause = cause;
  }
}

/**
 * Serialise an array of StepStatus values to a formatted JSON string.
 *
 * @param stepStatuses - Results produced by the simulation engine.
 * @param pretty - When true (default), output is indented with 2 spaces.
 * @throws {WriteError} if the data fails output schema validation (programming error).
 */
export function writeOutput(stepStatuses: StepStatus[], pretty = true): string {
  const output = { stepStatuses };

  const result = OutputSchema.safeParse(output);
  if (!result.success) {
    throw new WriteError(
      `Output failed schema validation (this is a bug): ${result.error.message}`,
      result.error
    );
  }

  return pretty ? JSON.stringify(result.data, null, 2) : JSON.stringify(result.data);
}
