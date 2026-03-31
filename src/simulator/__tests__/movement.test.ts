import { describe, it, expect } from 'vitest';
import { classifyMovement } from '../movement.js';

describe('classifyMovement', () => {
  it('matches §2 quick reference for north', () => {
    expect(classifyMovement('north', 'south')).toBe('straight');
    expect(classifyMovement('north', 'west')).toBe('left');
    expect(classifyMovement('north', 'east')).toBe('right');
    expect(classifyMovement('north', 'north')).toBe('u_turn');
  });

  it('matches §2 quick reference for south', () => {
    expect(classifyMovement('south', 'north')).toBe('straight');
    expect(classifyMovement('south', 'east')).toBe('left');
    expect(classifyMovement('south', 'west')).toBe('right');
    expect(classifyMovement('south', 'south')).toBe('u_turn');
  });

  it('matches §2 quick reference for east and west', () => {
    expect(classifyMovement('east', 'west')).toBe('straight');
    expect(classifyMovement('east', 'north')).toBe('left');
    expect(classifyMovement('west', 'east')).toBe('straight');
    expect(classifyMovement('west', 'south')).toBe('left');
  });
});
