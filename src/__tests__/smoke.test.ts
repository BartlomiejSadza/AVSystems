/**
 * T15 — CLI Smoke Test
 *
 * Exercises the full CLI pipeline end-to-end by:
 *  1. Writing a temporary input.json to disk.
 *  2. Invoking scripts/simulate.ts via child_process (tsx).
 *  3. Reading and validating the resulting output.json.
 *
 * These tests are the final gate before release — they catch regressions
 * in argument parsing, file I/O, JSON validation, and the engine itself.
 */

import { describe, it, expect, afterEach } from 'vitest';
import { execSync, spawnSync } from 'child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { tmpdir } from 'os';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PROJECT_ROOT = resolve(new URL('../../', import.meta.url).pathname);
const SIMULATE_SCRIPT = join(PROJECT_ROOT, 'scripts', 'simulate.ts');

/** Temp directory scoped to this test run. */
const TEST_TMP = join(tmpdir(), `traffic-lights-smoke-${process.pid}`);

function ensureTmp(): void {
  if (!existsSync(TEST_TMP)) {
    mkdirSync(TEST_TMP, { recursive: true });
  }
}

function tempPath(name: string): string {
  return join(TEST_TMP, name);
}

/** Write JSON to a temp file and return its path. */
function writeTempInput(name: string, data: unknown): string {
  ensureTmp();
  const filePath = tempPath(name);
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  return filePath;
}

/** Read and parse a JSON file from the temp directory. */
function readTempOutput(name: string): unknown {
  const filePath = tempPath(name);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

/**
 * Run the CLI and return { exitCode, stdout, stderr }.
 * Uses spawnSync for synchronous execution; no shell expansion needed.
 */
function runCli(
  inputPath: string,
  outputPath: string
): {
  exitCode: number;
  stdout: string;
  stderr: string;
} {
  const result = spawnSync(
    'npx',
    ['tsx', SIMULATE_SCRIPT, '--input', inputPath, '--output', outputPath],
    {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 30_000,
    }
  );

  return {
    exitCode: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

afterEach(() => {
  try {
    if (existsSync(TEST_TMP)) {
      rmSync(TEST_TMP, { recursive: true, force: true });
    }
  } catch {
    // Best-effort cleanup — do not fail tests on cleanup errors
  }
});

// ---------------------------------------------------------------------------
// Smoke Test 1: Canonical specification example
// ---------------------------------------------------------------------------

describe('CLI smoke test — canonical spec example', () => {
  it('produces correct output for V1/V2 canonical example', () => {
    const input = {
      commands: [
        { type: 'addVehicle', vehicleId: 'V1', startRoad: 'south', endRoad: 'north' },
        { type: 'step' },
        { type: 'addVehicle', vehicleId: 'V2', startRoad: 'north', endRoad: 'south' },
        { type: 'step' },
      ],
    };

    const inputPath = writeTempInput('canonical-input.json', input);
    const outputPath = tempPath('canonical-output.json');

    const { exitCode, stdout } = runCli(inputPath, outputPath);

    // CLI must exit with code 0
    expect(exitCode).toBe(0);

    // Confirm success message
    expect(stdout).toContain('2 step(s) written');

    // Read and validate output
    const output = readTempOutput('canonical-output.json') as {
      stepStatuses: Array<{ leftVehicles: string[] }>;
    };

    expect(output).toHaveProperty('stepStatuses');
    expect(output.stepStatuses).toHaveLength(2);
    expect(output.stepStatuses[0]?.leftVehicles).toContain('V1');
    expect(output.stepStatuses[1]?.leftVehicles).toContain('V2');
  });
});

// ---------------------------------------------------------------------------
// Smoke Test 2: Empty command list
// ---------------------------------------------------------------------------

describe('CLI smoke test — empty commands', () => {
  it('handles an empty command list gracefully', () => {
    const input = { commands: [] };

    const inputPath = writeTempInput('empty-input.json', input);
    const outputPath = tempPath('empty-output.json');

    const { exitCode } = runCli(inputPath, outputPath);
    expect(exitCode).toBe(0);

    const output = readTempOutput('empty-output.json') as {
      stepStatuses: unknown[];
    };
    expect(output.stepStatuses).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Smoke Test 3: Multiple vehicles, multiple steps
// ---------------------------------------------------------------------------

describe('CLI smoke test — multi-vehicle scenario', () => {
  it('correctly processes multiple vehicles and steps', () => {
    const input = {
      commands: [
        { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
        { type: 'addVehicle', vehicleId: 'N2', startRoad: 'north', endRoad: 'south' },
        { type: 'addVehicle', vehicleId: 'E1', startRoad: 'east', endRoad: 'west' },
        { type: 'step' }, // NS wins (2 vs 1)
        { type: 'step' }, // N2 remains, E1 remains; NS still has more
        { type: 'step' }, // E1 finally departs
      ],
    };

    const inputPath = writeTempInput('multi-input.json', input);
    const outputPath = tempPath('multi-output.json');

    const { exitCode } = runCli(inputPath, outputPath);
    expect(exitCode).toBe(0);

    const output = readTempOutput('multi-output.json') as {
      stepStatuses: Array<{ leftVehicles: string[] }>;
    };

    expect(output.stepStatuses).toHaveLength(3);

    // All vehicles should depart across the three steps
    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);
    expect(allLeft).toContain('N1');
    expect(allLeft).toContain('N2');
    expect(allLeft).toContain('E1');

    // No vehicle departs more than once
    expect(new Set(allLeft).size).toBe(allLeft.length);
  });
});

// ---------------------------------------------------------------------------
// Smoke Test 4: Emergency vehicle
// ---------------------------------------------------------------------------

describe('CLI smoke test — emergency vehicle priority', () => {
  it('emergency vehicle departs before normal vehicles on same road', () => {
    const input = {
      commands: [
        { type: 'addVehicle', vehicleId: 'N1', startRoad: 'north', endRoad: 'south' },
        { type: 'addVehicle', vehicleId: 'N2', startRoad: 'north', endRoad: 'south' },
        {
          type: 'addVehicle',
          vehicleId: 'EMG',
          startRoad: 'north',
          endRoad: 'south',
          priority: 'emergency',
        },
        { type: 'step' },
      ],
    };

    const inputPath = writeTempInput('emergency-input.json', input);
    const outputPath = tempPath('emergency-output.json');

    const { exitCode } = runCli(inputPath, outputPath);
    expect(exitCode).toBe(0);

    const output = readTempOutput('emergency-output.json') as {
      stepStatuses: Array<{ leftVehicles: string[] }>;
    };

    expect(output.stepStatuses[0]?.leftVehicles).toContain('EMG');
    expect(output.stepStatuses[0]?.leftVehicles).not.toContain('N1');
    expect(output.stepStatuses[0]?.leftVehicles).not.toContain('N2');
  });
});

// ---------------------------------------------------------------------------
// Smoke Test 5: Step-only commands (no vehicles)
// ---------------------------------------------------------------------------

describe('CLI smoke test — steps with no vehicles', () => {
  it('returns empty leftVehicles arrays for all steps', () => {
    const input = {
      commands: [{ type: 'step' }, { type: 'step' }, { type: 'step' }],
    };

    const inputPath = writeTempInput('steps-only-input.json', input);
    const outputPath = tempPath('steps-only-output.json');

    const { exitCode } = runCli(inputPath, outputPath);
    expect(exitCode).toBe(0);

    const output = readTempOutput('steps-only-output.json') as {
      stepStatuses: Array<{ leftVehicles: string[] }>;
    };

    expect(output.stepStatuses).toHaveLength(3);
    output.stepStatuses.forEach((s) => expect(s.leftVehicles).toHaveLength(0));
  });
});

// ---------------------------------------------------------------------------
// Smoke Test 6: Large input (100 vehicles, 60 steps)
// ---------------------------------------------------------------------------

describe('CLI smoke test — large input', () => {
  it('handles 100 vehicles and 60 steps without error', () => {
    const roads = ['north', 'south', 'east', 'west'] as const;
    const commands: unknown[] = [];

    for (let i = 0; i < 100; i++) {
      commands.push({
        type: 'addVehicle',
        vehicleId: `V${i}`,
        startRoad: roads[i % 4],
        endRoad: roads[(i + 2) % 4],
      });
    }
    for (let i = 0; i < 60; i++) {
      commands.push({ type: 'step' });
    }

    const input = { commands };
    const inputPath = writeTempInput('large-input.json', input);
    const outputPath = tempPath('large-output.json');

    const { exitCode, stdout } = runCli(inputPath, outputPath);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('60 step(s) written');

    const output = readTempOutput('large-output.json') as {
      stepStatuses: Array<{ leftVehicles: string[] }>;
    };

    expect(output.stepStatuses).toHaveLength(60);

    // No vehicle ID appears more than once
    const allLeft = output.stepStatuses.flatMap((s) => s.leftVehicles);
    expect(new Set(allLeft).size).toBe(allLeft.length);
  });
});

// ---------------------------------------------------------------------------
// Smoke Test 7: Error — invalid JSON input
// ---------------------------------------------------------------------------

describe('CLI smoke test — error handling', () => {
  it('exits with code 1 and error message for invalid JSON', () => {
    ensureTmp();
    const inputPath = tempPath('invalid.json');
    writeFileSync(inputPath, '{ not valid json !!', 'utf-8');
    const outputPath = tempPath('invalid-output.json');

    const { exitCode, stderr } = runCli(inputPath, outputPath);
    expect(exitCode).toBe(1);
    expect(stderr.toLowerCase()).toMatch(/error|json|invalid/i);
  });

  it('exits with code 1 for invalid road name in schema', () => {
    const input = {
      commands: [{ type: 'addVehicle', vehicleId: 'V1', startRoad: 'northeast', endRoad: 'south' }],
    };

    const inputPath = writeTempInput('bad-road-input.json', input);
    const outputPath = tempPath('bad-road-output.json');

    const { exitCode, stderr } = runCli(inputPath, outputPath);
    expect(exitCode).toBe(1);
    expect(stderr).toMatch(/error/i);
  });

  it('exits with code 1 when --input flag is missing', () => {
    const result = spawnSync('npx', ['tsx', SIMULATE_SCRIPT, '--output', tempPath('out.json')], {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 10_000,
    });
    expect(result.status).toBe(1);
  });

  it('exits with code 1 when --output flag is missing', () => {
    const input = { commands: [] };
    const inputPath = writeTempInput('no-output-flag-input.json', input);

    const result = spawnSync('npx', ['tsx', SIMULATE_SCRIPT, '--input', inputPath], {
      cwd: PROJECT_ROOT,
      encoding: 'utf-8',
      timeout: 10_000,
    });
    expect(result.status).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Smoke Test 8: Output schema conformance
// ---------------------------------------------------------------------------

describe('CLI smoke test — output schema conformance', () => {
  it('output JSON contains stepStatuses array', () => {
    const input = {
      commands: [
        { type: 'addVehicle', vehicleId: 'A', startRoad: 'north', endRoad: 'south' },
        { type: 'step' },
      ],
    };

    const inputPath = writeTempInput('schema-input.json', input);
    const outputPath = tempPath('schema-output.json');

    runCli(inputPath, outputPath);

    const raw = readFileSync(outputPath, 'utf-8');
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    // Must have stepStatuses key
    expect(parsed).toHaveProperty('stepStatuses');
    expect(Array.isArray(parsed.stepStatuses)).toBe(true);

    // Each entry must have leftVehicles array
    const statuses = parsed.stepStatuses as Array<Record<string, unknown>>;
    for (const status of statuses) {
      expect(status).toHaveProperty('leftVehicles');
      expect(Array.isArray(status.leftVehicles)).toBe(true);
    }
  });

  it('output is valid pretty-printed JSON (indented)', () => {
    const input = {
      commands: [
        { type: 'addVehicle', vehicleId: 'X', startRoad: 'west', endRoad: 'east' },
        { type: 'step' },
      ],
    };

    const inputPath = writeTempInput('pretty-input.json', input);
    const outputPath = tempPath('pretty-output.json');

    runCli(inputPath, outputPath);

    const raw = readFileSync(outputPath, 'utf-8');
    // Pretty-printed JSON contains newlines and spaces
    expect(raw).toContain('\n');
    expect(raw).toContain('  ');
  });
});
