#!/usr/bin/env tsx
/**
 * Benchmark entry point.
 *
 * Delegates to the benchmark suite in src/benchmarks/simulation.bench.ts.
 * Run via:
 *   pnpm bench
 */

// Re-export is not needed — just import the module which runs main() as a side-effect.
import '../src/benchmarks/simulation.bench.js';
