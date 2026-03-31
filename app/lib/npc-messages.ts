let messageCounter = 0;

function nextId(): string {
  messageCounter += 1;
  return `msg-${String(messageCounter).padStart(3, '0')}`;
}

export type NpcTrigger =
  | 'welcome'
  | 'first_vehicle'
  | 'step'
  | 'phase_change'
  | 'vehicle_added'
  | 'emergency'
  | 'queue_warning'
  | 'milestone'
  | 'error'
  | 'idle';

export interface NpcMessage {
  id: string;
  text: string;
  trigger: NpcTrigger;
  priority: number; // 1 = highest, 5 = lowest
}

// ---------------------------------------------------------------------------
// Welcome
// ---------------------------------------------------------------------------

export function generateWelcomeMessage(): NpcMessage {
  return {
    id: nextId(),
    text: "Welcome! I'm Officer Pixel. I'll help you learn about traffic lights!",
    trigger: 'welcome',
    priority: 1,
  };
}

// ---------------------------------------------------------------------------
// Step
// ---------------------------------------------------------------------------

const STEP_MESSAGES: readonly string[] = [
  'Each step moves time forward by one cycle. Watch which cars get to go!',
  'During a step, vehicles on green-light roads leave the queue first.',
  'Notice how the traffic light phases rotate so every road gets a turn.',
  'A well-timed step keeps traffic flowing and avoids big queues.',
  "Stepping forward is like pressing the 'next second' button at a real intersection!",
];

export function generateStepMessage(stepCount: number): NpcMessage {
  const index = stepCount % STEP_MESSAGES.length;
  const text = STEP_MESSAGES[index] ?? STEP_MESSAGES[0]!;
  return {
    id: nextId(),
    text,
    trigger: 'step',
    priority: 4,
  };
}

// ---------------------------------------------------------------------------
// Vehicle added
// ---------------------------------------------------------------------------

const VEHICLE_PREFIXES: readonly string[] = [
  'A new car joined the',
  'Another vehicle pulled into the',
  'Someone just arrived at the',
  'A driver joined the',
];

const VEHICLE_SUFFIXES: readonly string[] = [
  "queue! It'll wait for the green light.",
  'lane! It will move when the light turns green.',
  'queue and is waiting patiently for its turn.',
  'line — traffic rules keep everyone safe!',
];

let vehicleMsgIndex = 0;

export function generateVehicleMessage(road: string): NpcMessage {
  const prefix =
    VEHICLE_PREFIXES[vehicleMsgIndex % VEHICLE_PREFIXES.length] ?? VEHICLE_PREFIXES[0]!;
  const suffix =
    VEHICLE_SUFFIXES[vehicleMsgIndex % VEHICLE_SUFFIXES.length] ?? VEHICLE_SUFFIXES[0]!;
  vehicleMsgIndex += 1;
  return {
    id: nextId(),
    text: `${prefix} ${road} ${suffix}`,
    trigger: 'vehicle_added',
    priority: 3,
  };
}

// ---------------------------------------------------------------------------
// Phase change
// ---------------------------------------------------------------------------

const PHASE_MESSAGES: ReadonlyMap<string, string> = new Map([
  ['NS', 'Now the north-south roads have green! Cars can go straight through.'],
  ['EW', 'Green light for east and west! Those drivers have been waiting patiently.'],
  ['north-south', 'North and south roads are clear to go. Watch the queue shrink!'],
  ['east-west', 'East-west traffic gets its turn now. Every road deserves fair time.'],
  [
    'NS_THROUGH',
    'North and south: straight and right turns may go. Left turns wait for their protected phase.',
  ],
  [
    'NS_LEFT',
    'Protected left on north and south — left turns and U-turns from those approaches may go.',
  ],
  [
    'EW_THROUGH',
    'East and west: straight and right turns may go. Left turns wait for their protected phase.',
  ],
  [
    'EW_LEFT',
    'Protected left on east and west — left turns and U-turns from those approaches may go.',
  ],
]);

const PHASE_FALLBACK_TEMPLATES: readonly ((phase: string) => string)[] = [
  (phase: string) => `The "${phase}" phase is now active. New roads have the green light!`,
  () => 'Phase change! Different roads now have the right of way.',
  () => 'The lights have switched — a new set of roads can move.',
  () => 'Time for the next phase. Traffic lights rotate to keep things fair.',
];

let phaseMsgIndex = 0;

export function generatePhaseMessage(phase: string): NpcMessage {
  const known = PHASE_MESSAGES.get(phase);
  let text: string;
  if (known !== undefined) {
    text = known;
  } else {
    const idx = phaseMsgIndex % PHASE_FALLBACK_TEMPLATES.length;
    const fn = PHASE_FALLBACK_TEMPLATES[idx] ?? PHASE_FALLBACK_TEMPLATES[0]!;
    text = fn(phase);
    phaseMsgIndex += 1;
  }
  return {
    id: nextId(),
    text,
    trigger: 'phase_change',
    priority: 2,
  };
}

// ---------------------------------------------------------------------------
// Emergency
// ---------------------------------------------------------------------------

const EMERGENCY_MESSAGES: readonly string[] = [
  'Emergency vehicle incoming! All cars must clear the way immediately!',
  'Lights and sirens ahead! Everyone pull over — let the emergency vehicle through!',
  'An ambulance or fire truck is approaching. Real traffic lights have special sensors for this!',
];

let emergencyMsgIndex = 0;

export function generateEmergencyMessage(): NpcMessage {
  const text =
    EMERGENCY_MESSAGES[emergencyMsgIndex % EMERGENCY_MESSAGES.length] ?? EMERGENCY_MESSAGES[0]!;
  emergencyMsgIndex += 1;
  return {
    id: nextId(),
    text,
    trigger: 'emergency',
    priority: 1,
  };
}

// ---------------------------------------------------------------------------
// Queue warning
// ---------------------------------------------------------------------------

const QUEUE_WARNING_TEMPLATES: readonly ((road: string, count: number) => string)[] = [
  (road: string, count: number) =>
    `${count} cars waiting on the ${road} road. That's getting busy!`,
  (road: string, count: number) =>
    `The ${road} queue has ${count} vehicles — time to give them a green light soon!`,
  (road: string, count: number) =>
    `Heads up! ${count} cars are backed up on ${road}. Long queues slow everyone down.`,
  (road: string, count: number) =>
    `${road} road is filling up with ${count} cars. Good traffic engineers watch for this!`,
];

export function generateQueueWarningMessage(road: string, count: number): NpcMessage {
  const fnIndex = count % QUEUE_WARNING_TEMPLATES.length;
  const fn = QUEUE_WARNING_TEMPLATES[fnIndex] ?? QUEUE_WARNING_TEMPLATES[0]!;
  const text = fn(road, count);
  return {
    id: nextId(),
    text,
    trigger: 'queue_warning',
    priority: 2,
  };
}

// ---------------------------------------------------------------------------
// Milestone
// ---------------------------------------------------------------------------

function getMilestoneText(departed: number): string {
  if (departed >= 100) {
    return `Incredible! ${departed} vehicles have made it through. You're a traffic champion!`;
  }
  if (departed >= 50) {
    return `Half a century! ${departed} cars have passed through your intersection — amazing work!`;
  }
  if (departed >= 25) {
    return `${departed} vehicles cleared already! You're getting the hang of traffic management.`;
  }
  if (departed >= 10) {
    return `${departed} cars through! The intersection is running smoothly. Keep it up!`;
  }
  return `${departed} vehicles have left the intersection. Nice start, keep going!`;
}

export function generateMilestoneMessage(departed: number): NpcMessage {
  return {
    id: nextId(),
    text: getMilestoneText(departed),
    trigger: 'milestone',
    priority: 2,
  };
}

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

const ERROR_PREFIXES: readonly string[] = ['Oops!', 'Uh oh!', 'Hold on!', 'Wait a moment!'];

let errorMsgIndex = 0;

export function generateErrorMessage(error: string): NpcMessage {
  const prefix = ERROR_PREFIXES[errorMsgIndex % ERROR_PREFIXES.length] ?? ERROR_PREFIXES[0]!;
  errorMsgIndex += 1;
  return {
    id: nextId(),
    text: `${prefix} Something went wrong: ${error}. Let's try again!`,
    trigger: 'error',
    priority: 1,
  };
}

// ---------------------------------------------------------------------------
// Idle
// ---------------------------------------------------------------------------

const IDLE_MESSAGES: readonly string[] = [
  'Try adding a car using the controls below!',
  'Click Step to move time forward and watch the lights change.',
  'Did you know? Real traffic lights use sensors to detect waiting cars.',
  'Add vehicles to different roads and see which phase clears them first.',
  "An intersection with no cars is peaceful — but let's make it interesting!",
];

let idleMsgIndex = 0;

export function generateIdleMessage(): NpcMessage {
  const text = IDLE_MESSAGES[idleMsgIndex % IDLE_MESSAGES.length] ?? IDLE_MESSAGES[0]!;
  idleMsgIndex += 1;
  return {
    id: nextId(),
    text,
    trigger: 'idle',
    priority: 5,
  };
}

// ---------------------------------------------------------------------------
// Counter reset (test helper)
// ---------------------------------------------------------------------------

export function resetNpcMessageCounter(): void {
  messageCounter = 0;
  vehicleMsgIndex = 0;
  phaseMsgIndex = 0;
  emergencyMsgIndex = 0;
  errorMsgIndex = 0;
  idleMsgIndex = 0;
}
