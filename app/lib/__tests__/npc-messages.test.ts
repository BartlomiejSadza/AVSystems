import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateWelcomeMessage,
  generateStepMessage,
  generateVehicleMessage,
  generatePhaseMessage,
  generateEmergencyMessage,
  generateQueueWarningMessage,
  generateMilestoneMessage,
  generateErrorMessage,
  generateIdleMessage,
  resetNpcMessageCounter,
} from '../npc-messages';
import type { NpcMessage } from '../npc-messages';

function isValidMessage(msg: NpcMessage): void {
  expect(msg.id).toMatch(/^msg-\d{3}$/);
  expect(typeof msg.text).toBe('string');
  expect(msg.text.length).toBeGreaterThan(0);
  expect(typeof msg.trigger).toBe('string');
  expect(typeof msg.priority).toBe('number');
  expect(msg.priority).toBeGreaterThanOrEqual(1);
  expect(msg.priority).toBeLessThanOrEqual(5);
}

describe('npc-messages', () => {
  beforeEach(() => {
    resetNpcMessageCounter();
  });

  // -------------------------------------------------------------------------
  // Structure
  // -------------------------------------------------------------------------

  describe('all generators return valid NpcMessage shape', () => {
    it('welcome message has correct shape', () => isValidMessage(generateWelcomeMessage()));
    it('step message has correct shape', () => isValidMessage(generateStepMessage(0)));
    it('vehicle message has correct shape', () => isValidMessage(generateVehicleMessage('north')));
    it('phase message has correct shape', () => isValidMessage(generatePhaseMessage('NS')));
    it('emergency message has correct shape', () => isValidMessage(generateEmergencyMessage()));
    it('queue warning message has correct shape', () =>
      isValidMessage(generateQueueWarningMessage('east', 5)));
    it('milestone message has correct shape', () => isValidMessage(generateMilestoneMessage(10)));
    it('error message has correct shape', () => isValidMessage(generateErrorMessage('test error')));
    it('idle message has correct shape', () => isValidMessage(generateIdleMessage()));
  });

  // -------------------------------------------------------------------------
  // Welcome
  // -------------------------------------------------------------------------

  describe('generateWelcomeMessage', () => {
    it('has trigger "welcome"', () => {
      expect(generateWelcomeMessage().trigger).toBe('welcome');
    });

    it('has priority 1', () => {
      expect(generateWelcomeMessage().priority).toBe(1);
    });

    it('mentions Officer Pixel', () => {
      expect(generateWelcomeMessage().text).toContain('Officer Pixel');
    });
  });

  // -------------------------------------------------------------------------
  // Step
  // -------------------------------------------------------------------------

  describe('generateStepMessage', () => {
    it('has trigger "step"', () => {
      expect(generateStepMessage(0).trigger).toBe('step');
    });

    it('has priority 4', () => {
      expect(generateStepMessage(0).priority).toBe(4);
    });

    it('returns different text for different stepCount values', () => {
      const texts = new Set<string>();
      for (let i = 0; i < 5; i++) {
        texts.add(generateStepMessage(i).text);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  // -------------------------------------------------------------------------
  // Vehicle
  // -------------------------------------------------------------------------

  describe('generateVehicleMessage', () => {
    it('has trigger "vehicle_added"', () => {
      expect(generateVehicleMessage('north').trigger).toBe('vehicle_added');
    });

    it('has priority 3', () => {
      expect(generateVehicleMessage('north').priority).toBe(3);
    });

    it('includes the road name in the text', () => {
      expect(generateVehicleMessage('south').text).toContain('south');
    });

    it('includes road name for different roads', () => {
      expect(generateVehicleMessage('east').text).toContain('east');
      expect(generateVehicleMessage('west').text).toContain('west');
    });
  });

  // -------------------------------------------------------------------------
  // Phase
  // -------------------------------------------------------------------------

  describe('generatePhaseMessage', () => {
    it('has trigger "phase_change"', () => {
      expect(generatePhaseMessage('NS').trigger).toBe('phase_change');
    });

    it('has priority 2', () => {
      expect(generatePhaseMessage('NS').priority).toBe(2);
    });

    it('returns a non-empty message for known phases', () => {
      expect(generatePhaseMessage('NS').text.length).toBeGreaterThan(0);
      expect(generatePhaseMessage('EW').text.length).toBeGreaterThan(0);
    });

    it('returns a non-empty message for unknown phases', () => {
      expect(generatePhaseMessage('XY').text.length).toBeGreaterThan(0);
    });
  });

  // -------------------------------------------------------------------------
  // Emergency
  // -------------------------------------------------------------------------

  describe('generateEmergencyMessage', () => {
    it('has trigger "emergency"', () => {
      expect(generateEmergencyMessage().trigger).toBe('emergency');
    });

    it('has priority 1', () => {
      expect(generateEmergencyMessage().priority).toBe(1);
    });

    it('text conveys urgency', () => {
      const text = generateEmergencyMessage().text.toLowerCase();
      const hasUrgentWord =
        text.includes('emergency') ||
        text.includes('clear') ||
        text.includes('pull over') ||
        text.includes('ambulance');
      expect(hasUrgentWord).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Queue warning
  // -------------------------------------------------------------------------

  describe('generateQueueWarningMessage', () => {
    it('has trigger "queue_warning"', () => {
      expect(generateQueueWarningMessage('north', 3).trigger).toBe('queue_warning');
    });

    it('has priority 2', () => {
      expect(generateQueueWarningMessage('north', 3).priority).toBe(2);
    });

    it('includes the vehicle count in the text', () => {
      expect(generateQueueWarningMessage('north', 7).text).toContain('7');
    });

    it('includes the road name in the text', () => {
      expect(generateQueueWarningMessage('south', 4).text).toContain('south');
    });

    it('includes both count and road for any combination', () => {
      const msg = generateQueueWarningMessage('east', 12);
      expect(msg.text).toContain('12');
      expect(msg.text).toContain('east');
    });
  });

  // -------------------------------------------------------------------------
  // Milestone
  // -------------------------------------------------------------------------

  describe('generateMilestoneMessage', () => {
    it('has trigger "milestone"', () => {
      expect(generateMilestoneMessage(10).trigger).toBe('milestone');
    });

    it('has priority 2', () => {
      expect(generateMilestoneMessage(10).priority).toBe(2);
    });

    it('returns a different celebration at 10 vs 50', () => {
      const at10 = generateMilestoneMessage(10).text;
      const at50 = generateMilestoneMessage(50).text;
      expect(at10).not.toBe(at50);
    });

    it('returns a different celebration at 25 vs 100', () => {
      const at25 = generateMilestoneMessage(25).text;
      const at100 = generateMilestoneMessage(100).text;
      expect(at25).not.toBe(at100);
    });

    it('includes the departed count in the text', () => {
      expect(generateMilestoneMessage(10).text).toContain('10');
      expect(generateMilestoneMessage(50).text).toContain('50');
      expect(generateMilestoneMessage(100).text).toContain('100');
    });
  });

  // -------------------------------------------------------------------------
  // Error
  // -------------------------------------------------------------------------

  describe('generateErrorMessage', () => {
    it('has trigger "error"', () => {
      expect(generateErrorMessage('timeout').trigger).toBe('error');
    });

    it('has priority 1', () => {
      expect(generateErrorMessage('timeout').priority).toBe(1);
    });

    it('includes the error string in the text', () => {
      expect(generateErrorMessage('invalid input').text).toContain('invalid input');
    });

    it('includes "try again" sentiment', () => {
      expect(generateErrorMessage('oops').text.toLowerCase()).toContain('try again');
    });
  });

  // -------------------------------------------------------------------------
  // Idle
  // -------------------------------------------------------------------------

  describe('generateIdleMessage', () => {
    it('has trigger "idle"', () => {
      expect(generateIdleMessage().trigger).toBe('idle');
    });

    it('has priority 5', () => {
      expect(generateIdleMessage().priority).toBe(5);
    });

    it('returns different messages on successive calls', () => {
      const texts = new Set<string>();
      for (let i = 0; i < 5; i++) {
        texts.add(generateIdleMessage().text);
      }
      expect(texts.size).toBeGreaterThan(1);
    });
  });

  // -------------------------------------------------------------------------
  // Unique message IDs
  // -------------------------------------------------------------------------

  describe('message IDs are unique', () => {
    it('no duplicate IDs across multiple generator calls', () => {
      const ids: string[] = [
        generateWelcomeMessage().id,
        generateStepMessage(0).id,
        generateVehicleMessage('north').id,
        generatePhaseMessage('NS').id,
        generateEmergencyMessage().id,
        generateQueueWarningMessage('east', 3).id,
        generateMilestoneMessage(10).id,
        generateErrorMessage('test').id,
        generateIdleMessage().id,
      ];
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    });

    it('IDs follow the msg-NNN format', () => {
      const msg = generateWelcomeMessage();
      expect(msg.id).toMatch(/^msg-\d{3}$/);
    });
  });
});
