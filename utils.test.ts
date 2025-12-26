import { describe, it, expect } from 'vitest';
import { MAX_TOTAL_EVS, MAX_STAT_EVS, type EVStats } from './types';

// Utility functions for EV calculations
export const calculateTotalEVs = (evs: EVStats): number => {
  return Object.values(evs).reduce((sum, val) => sum + val, 0);
};

export const calculateRemainingEVs = (evs: EVStats): number => {
  return MAX_TOTAL_EVS - calculateTotalEVs(evs);
};

export const canAddEVs = (evs: EVStats, stat: keyof EVStats, amount: number): boolean => {
  const totalEVs = calculateTotalEVs(evs);
  const remainingTotal = MAX_TOTAL_EVS - totalEVs;
  const remainingStat = MAX_STAT_EVS - evs[stat];
  
  return amount > 0 && amount <= remainingTotal && amount <= remainingStat;
};

export const getMaxAddableEVs = (evs: EVStats, stat: keyof EVStats): number => {
  const totalEVs = calculateTotalEVs(evs);
  const remainingTotal = MAX_TOTAL_EVS - totalEVs;
  const remainingStat = MAX_STAT_EVS - evs[stat];
  
  return Math.min(remainingTotal, remainingStat);
};

describe('EV utility functions', () => {
  describe('calculateTotalEVs', () => {
    it('should calculate total EVs correctly', () => {
      const evs: EVStats = {
        hp: 100,
        attack: 50,
        defense: 75,
        spAttack: 80,
        spDefense: 60,
        speed: 90,
      };

      expect(calculateTotalEVs(evs)).toBe(455);
    });

    it('should return 0 for empty EVs', () => {
      const evs: EVStats = {
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      };

      expect(calculateTotalEVs(evs)).toBe(0);
    });
  });

  describe('calculateRemainingEVs', () => {
    it('should calculate remaining EVs correctly', () => {
      const evs: EVStats = {
        hp: 100,
        attack: 50,
        defense: 75,
        spAttack: 80,
        spDefense: 60,
        speed: 90,
      };

      expect(calculateRemainingEVs(evs)).toBe(55);
    });

    it('should return MAX_TOTAL_EVS for empty EVs', () => {
      const evs: EVStats = {
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      };

      expect(calculateRemainingEVs(evs)).toBe(MAX_TOTAL_EVS);
    });

    it('should return 0 for maxed out EVs', () => {
      const evs: EVStats = {
        hp: MAX_STAT_EVS,
        attack: MAX_STAT_EVS,
        defense: 6,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      };

      expect(calculateRemainingEVs(evs)).toBe(0);
    });
  });

  describe('canAddEVs', () => {
    it('should return true when EVs can be added', () => {
      const evs: EVStats = {
        hp: 100,
        attack: 50,
        defense: 75,
        spAttack: 80,
        spDefense: 60,
        speed: 90,
      };

      expect(canAddEVs(evs, 'hp', 10)).toBe(true);
    });

    it('should return false when total EVs would exceed maximum', () => {
      const evs: EVStats = {
        hp: MAX_STAT_EVS,
        attack: MAX_STAT_EVS,
        defense: 6,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      };

      expect(canAddEVs(evs, 'defense', 1)).toBe(false);
    });

    it('should return false when stat EV would exceed maximum', () => {
      const evs: EVStats = {
        hp: MAX_STAT_EVS - 10,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      };

      expect(canAddEVs(evs, 'hp', 20)).toBe(false);
    });

    it('should return false for zero or negative amounts', () => {
      const evs: EVStats = {
        hp: 100,
        attack: 50,
        defense: 75,
        spAttack: 80,
        spDefense: 60,
        speed: 90,
      };

      expect(canAddEVs(evs, 'hp', 0)).toBe(false);
      expect(canAddEVs(evs, 'hp', -10)).toBe(false);
    });
  });

  describe('getMaxAddableEVs', () => {
    it('should return correct max addable EVs', () => {
      const evs: EVStats = {
        hp: 100,
        attack: 50,
        defense: 75,
        spAttack: 80,
        spDefense: 60,
        speed: 90,
      };

      const maxAddable = getMaxAddableEVs(evs, 'hp');
      expect(maxAddable).toBe(55); // Limited by remaining total (55)
    });

    it('should be limited by stat maximum', () => {
      const evs: EVStats = {
        hp: 200,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      };

      const maxAddable = getMaxAddableEVs(evs, 'hp');
      expect(maxAddable).toBe(52); // Limited by stat max (252 - 200 = 52)
    });

    it('should return 0 when EVs are maxed', () => {
      const evs: EVStats = {
        hp: MAX_STAT_EVS,
        attack: MAX_STAT_EVS,
        defense: 6,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      };

      expect(getMaxAddableEVs(evs, 'hp')).toBe(0);
      expect(getMaxAddableEVs(evs, 'attack')).toBe(0);
    });
  });
});

