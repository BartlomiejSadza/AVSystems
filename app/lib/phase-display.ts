import type { PhaseId } from './simulation-adapter';

export type DisplayPhase = PhaseId | `${PhaseId}_YELLOW` | 'ALL_RED';
export type LegacyDisplayPhase = 'NS_STRAIGHT' | 'EW_STRAIGHT';

export type SignalAxis = 'NS' | 'EW';
export type SignalLampMode = 'OFF' | 'GREEN' | 'YELLOW' | 'ALL_RED';

export interface SignalState {
  mode: SignalLampMode;
  activeAxis: SignalAxis | null;
}

const GREEN_PHASE_LABELS: Record<PhaseId | LegacyDisplayPhase, string> = {
  NS_STRAIGHT: 'NS',
  EW_STRAIGHT: 'EW',
  NS_THROUGH: 'NS thru',
  NS_LEFT: 'NS left',
  EW_THROUGH: 'EW thru',
  EW_LEFT: 'EW left',
};

const PHASE_AXIS: Record<PhaseId, SignalAxis> = {
  NS_THROUGH: 'NS',
  NS_LEFT: 'NS',
  EW_THROUGH: 'EW',
  EW_LEFT: 'EW',
};

/**
 * Human-readable traffic phase labels for HUD, step log, and similar UI.
 * Legacy coarse phases stay short; movement-qualified phases spell out thru vs left.
 */
export function formatPhaseForDisplay(phase: string | null): string {
  if (phase === null) return 'NONE';
  if (phase === 'ALL_RED') return 'ALL RED';

  if (phase.endsWith('_YELLOW')) {
    const greenPhase = phase.slice(0, -'_YELLOW'.length);
    const greenLabel = formatGreenPhaseForDisplay(greenPhase);
    return greenLabel === null ? phase : `${greenLabel} yellow`;
  }

  const greenLabel = formatGreenPhaseForDisplay(phase);
  return greenLabel ?? phase;
}

/**
 * Central mapping of display phase to traffic-light signal state used by canvas.
 */
export function resolveSignalStateForDisplayPhase(phase: DisplayPhase | null): SignalState {
  if (phase === null) return { mode: 'OFF', activeAxis: null };
  if (phase === 'ALL_RED') return { mode: 'ALL_RED', activeAxis: null };

  if (phase.endsWith('_YELLOW')) {
    const greenPhase = phase.slice(0, -'_YELLOW'.length) as PhaseId;
    const activeAxis = phaseAxis(greenPhase);
    return activeAxis === null ? { mode: 'OFF', activeAxis: null } : { mode: 'YELLOW', activeAxis };
  }

  const activeAxis = phaseAxis(phase);
  return activeAxis === null ? { mode: 'OFF', activeAxis: null } : { mode: 'GREEN', activeAxis };
}

function formatGreenPhaseForDisplay(phase: string): string | null {
  return GREEN_PHASE_LABELS[phase as keyof typeof GREEN_PHASE_LABELS] ?? null;
}

function phaseAxis(phase: string): SignalAxis | null {
  return PHASE_AXIS[phase as PhaseId] ?? null;
}
