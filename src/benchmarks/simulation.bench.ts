/**
 * Performance benchmarks for the traffic-lights simulation engine (T13).
 *
 * Uses tinybench to measure throughput and latency at four scales:
 *   100 commands, 1 000 commands, 10 000 commands, 100 000 commands.
 *
 * Each scenario is a realistic mix of addVehicle and step commands
 * so the engine exercises queue management and phase selection together.
 *
 * Run via:
 *   pnpm bench
 */

import { Bench } from 'tinybench';
import { simulate } from '../simulator/engine.js';
import type { Command } from '../simulator/types.js';

// ---------------------------------------------------------------------------
// Command-set generators
// ---------------------------------------------------------------------------

const ROADS = ['north', 'south', 'east', 'west'] as const;
type Road = (typeof ROADS)[number];

/**
 * Build a command list of `totalCommands` length.
 * Ratio: 2 addVehicle commands for every 1 step command.
 * This keeps queues populated, exercising both enqueue and dequeue paths.
 */
function buildCommands(totalCommands: number): Command[] {
  const cmds: Command[] = [];
  let vehicleCounter = 0;

  for (let i = 0; i < totalCommands; i++) {
    if (i % 3 === 2) {
      cmds.push({ type: 'step' });
    } else {
      const road: Road = ROADS[vehicleCounter % 4]!;
      const endRoad: Road = ROADS[(vehicleCounter + 2) % 4]!;
      cmds.push({
        type: 'addVehicle',
        vehicleId: `V${vehicleCounter}`,
        startRoad: road,
        endRoad: endRoad,
      });
      vehicleCounter++;
    }
  }

  return cmds;
}

/**
 * Build commands with a mix of emergency vehicles (~10% emergency rate).
 */
function buildCommandsWithEmergency(totalCommands: number): Command[] {
  const cmds: Command[] = [];
  let vehicleCounter = 0;

  for (let i = 0; i < totalCommands; i++) {
    if (i % 3 === 2) {
      cmds.push({ type: 'step' });
    } else {
      const road: Road = ROADS[vehicleCounter % 4]!;
      const endRoad: Road = ROADS[(vehicleCounter + 2) % 4]!;
      const priority = vehicleCounter % 10 === 0 ? 'emergency' : 'normal';
      cmds.push({
        type: 'addVehicle',
        vehicleId: `V${vehicleCounter}`,
        startRoad: road,
        endRoad: endRoad,
        priority,
      });
      vehicleCounter++;
    }
  }

  return cmds;
}

// ---------------------------------------------------------------------------
// Pre-build command sets (outside benchmark loop to isolate engine perf)
// ---------------------------------------------------------------------------

const commands100 = buildCommands(100);
const commands1000 = buildCommands(1_000);
const commands10000 = buildCommands(10_000);
const commands100000 = buildCommands(100_000);

const commandsEmergency1000 = buildCommandsWithEmergency(1_000);
const commandsWithPriorities1000 = buildCommands(1_000);
const roadPriorities = { north: 2.0, south: 1.5, east: 1.0, west: 0.75 };

// ---------------------------------------------------------------------------
// Benchmark suite
// ---------------------------------------------------------------------------

const bench = new Bench({
  iterations: 100,
  warmupIterations: 10,
  time: 0, // use iterations, not time-based
});

bench
  .add('simulate — 100 commands', () => {
    simulate(commands100);
  })
  .add('simulate — 1 000 commands', () => {
    simulate(commands1000);
  })
  .add('simulate — 10 000 commands', () => {
    simulate(commands10000);
  })
  .add('simulate — 100 000 commands', () => {
    simulate(commands100000);
  })
  .add('simulate — 1 000 commands with emergency vehicles (~10%)', () => {
    simulate(commandsEmergency1000);
  })
  .add('simulate — 1 000 commands with road priorities', () => {
    simulate(commandsWithPriorities1000, { roadPriorities });
  })
  .add('simulateWithTelemetry — 1 000 commands', async () => {
    const { simulateWithTelemetry } = await import('../simulator/engine.js');
    simulateWithTelemetry(commands1000);
  });

// ---------------------------------------------------------------------------
// Run and report
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('\nTraffic Lights Simulation — Performance Benchmarks');
  console.log('====================================================\n');

  await bench.run();

  console.log('Results (lower is better):');
  console.log('');

  const table = bench.table();
  console.table(table);

  console.log('');
  console.log('Detailed results:');
  for (const task of bench.tasks) {
    const { name, result } = task;
    if (!result) continue;

    const opsPerSec = result.hz.toFixed(2);
    const mean = (result.mean * 1000).toFixed(3); // convert s → ms
    const p99 = ((result.p99 ?? result.max) * 1000).toFixed(3);
    const samples = result.samples.length;

    console.log(`  ${name}`);
    console.log(`    ops/sec: ${opsPerSec}`);
    console.log(`    mean:    ${mean} ms`);
    console.log(`    p99:     ${p99} ms`);
    console.log(`    samples: ${samples}`);
    console.log('');
  }
}

main().catch((err: unknown) => {
  console.error('Benchmark error:', err);
  process.exit(1);
});
