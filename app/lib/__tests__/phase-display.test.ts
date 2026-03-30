import { describe, it, expect } from 'vitest';
import { formatPhaseForDisplay, resolveSignalStateForDisplayPhase } from '../phase-display';

describe('formatPhaseForDisplay', () => {
  it('returns NONE for null', () => {
    expect(formatPhaseForDisplay(null)).toBe('NONE');
  });

  it('keeps legacy coarse phases short', () => {
    expect(formatPhaseForDisplay('NS_STRAIGHT')).toBe('NS');
    expect(formatPhaseForDisplay('EW_STRAIGHT')).toBe('EW');
  });

  it('distinguishes through vs left for each axis', () => {
    expect(formatPhaseForDisplay('NS_THROUGH')).toBe('NS thru');
    expect(formatPhaseForDisplay('NS_LEFT')).toBe('NS left');
    expect(formatPhaseForDisplay('EW_THROUGH')).toBe('EW thru');
    expect(formatPhaseForDisplay('EW_LEFT')).toBe('EW left');
  });

  it('formats yellow transition and all-red explicitly', () => {
    expect(formatPhaseForDisplay('NS_THROUGH_YELLOW')).toBe('NS thru yellow');
    expect(formatPhaseForDisplay('EW_LEFT_YELLOW')).toBe('EW left yellow');
    expect(formatPhaseForDisplay('ALL_RED')).toBe('ALL RED');
  });

  it('passes through unknown phase strings unchanged', () => {
    expect(formatPhaseForDisplay('CUSTOM_PHASE')).toBe('CUSTOM_PHASE');
  });
});

describe('resolveSignalStateForDisplayPhase', () => {
  it('maps green phases to GREEN mode with proper axis', () => {
    expect(resolveSignalStateForDisplayPhase('NS_LEFT')).toEqual({
      mode: 'GREEN',
      activeAxis: 'NS',
    });
    expect(resolveSignalStateForDisplayPhase('EW_THROUGH')).toEqual({
      mode: 'GREEN',
      activeAxis: 'EW',
    });
  });

  it('maps yellow phases to YELLOW mode with proper axis', () => {
    expect(resolveSignalStateForDisplayPhase('NS_THROUGH_YELLOW')).toEqual({
      mode: 'YELLOW',
      activeAxis: 'NS',
    });
    expect(resolveSignalStateForDisplayPhase('EW_LEFT_YELLOW')).toEqual({
      mode: 'YELLOW',
      activeAxis: 'EW',
    });
  });

  it('maps null and ALL_RED explicitly', () => {
    expect(resolveSignalStateForDisplayPhase(null)).toEqual({ mode: 'OFF', activeAxis: null });
    expect(resolveSignalStateForDisplayPhase('ALL_RED')).toEqual({
      mode: 'ALL_RED',
      activeAxis: null,
    });
  });
});
