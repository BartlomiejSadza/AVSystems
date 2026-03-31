#!/usr/bin/env tsx
/**
 * CLI entry point for the Traffic Lights Simulation.
 *
 * Usage:
 *   pnpm simulate --input ./input.json --output ./output.json
 *
 * Flags:
 *   --input  <path>   Path to the input JSON file (required)
 *   --output <path>   Path to write the output JSON file (required)
 *   --help            Print usage information
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { parseInput } from '../src/io/parser.js';
import { writeOutput } from '../src/io/writer.js';
import { simulate } from '../src/simulator/engine.js';
import type { SimulateOptions } from '../src/simulator/types.js';
import { DEGENERATE_SIGNAL_TIMINGS } from '../src/simulator/degenerate-signal-timings.js';

const CLI_DEFAULT_OPTIONS: SimulateOptions = {
  enableInvariantChecks: false,
  enableTelemetry: false,
  signalTimings: DEGENERATE_SIGNAL_TIMINGS, // backward-compatible default (minGreen=1)
};

// ---------------------------------------------------------------------------
// Argument parsing (no external dep — keep it simple for a CLI script)
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): { input: string; output: string } | null {
  const args = argv.slice(2); // drop node + script path

  if (args.includes('--help') || args.includes('-h')) {
    return null;
  }

  const inputIdx = args.indexOf('--input');
  const outputIdx = args.indexOf('--output');

  const inputPath = inputIdx !== -1 ? args[inputIdx + 1] : undefined;
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : undefined;

  if (!inputPath || !outputPath) {
    return null;
  }

  return { input: inputPath, output: outputPath };
}

function printUsage(): void {
  console.error(
    `
Traffic Lights Simulation CLI

Usage:
  pnpm simulate --input <path> --output <path>

Options:
  --input  <path>   Path to input JSON file (required)
  --output <path>   Path to output JSON file (required)
  --help            Show this help message

Example:
  pnpm simulate --input ./input.json --output ./output.json
`.trim()
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  const args = parseArgs(process.argv);

  if (!args) {
    printUsage();
    process.exit(1);
  }

  const inputPath = resolve(args.input);
  const outputPath = resolve(args.output);

  // Read input
  let rawJson: string;
  try {
    rawJson = readFileSync(inputPath, 'utf-8');
  } catch (err) {
    console.error(`Error: Cannot read input file "${inputPath}": ${(err as Error).message}`);
    process.exit(1);
  }

  // Parse + validate
  let commands;
  let mergedOptions: SimulateOptions;
  try {
    const parsed = parseInput(rawJson);
    commands = parsed.commands;
    mergedOptions = {
      ...CLI_DEFAULT_OPTIONS,
      ...parsed.options,
      signalTimings: parsed.options?.signalTimings ?? DEGENERATE_SIGNAL_TIMINGS,
    };
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }

  // Simulate
  const stepStatuses = simulate(commands, mergedOptions);

  // Serialise
  let outputJson: string;
  try {
    outputJson = writeOutput(stepStatuses);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }

  // Write output
  try {
    writeFileSync(outputPath, outputJson, 'utf-8');
  } catch (err) {
    console.error(`Error: Cannot write output file "${outputPath}": ${(err as Error).message}`);
    process.exit(1);
  }

  console.log(`Simulation complete. ${stepStatuses.length} step(s) written to "${outputPath}".`);
}

main();
