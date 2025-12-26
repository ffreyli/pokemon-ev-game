import { describe, it, expect } from 'vitest';
import { MAX_TOTAL_EVS, MAX_STAT_EVS, type EVStats, type Pokemon, type Team } from './types';

describe('types', () => {
  describe('EVStats', () => {
    it('should calculate total EVs correctly', () => {
      const evs: EVStats = {
        hp: 100,
        attack: 50,
        defense: 75,
        spAttack: 80,
        spDefense: 60,
        speed: 90,
      };

      const total = Object.values(evs).reduce((sum, val) => sum + val, 0);
      expect(total).toBe(455);
    });

    it('should validate EV constraints', () => {
      const validEVs: EVStats = {
        hp: MAX_STAT_EVS,
        attack: MAX_STAT_EVS,
        defense: 6,
        spAttack: 0,
        spDefense: 0,
        speed: 0,
      };

      const total = Object.values(validEVs).reduce((sum, val) => sum + val, 0);
      expect(total).toBeLessThanOrEqual(MAX_TOTAL_EVS);
      expect(validEVs.hp).toBeLessThanOrEqual(MAX_STAT_EVS);
      expect(validEVs.attack).toBeLessThanOrEqual(MAX_STAT_EVS);
    });

    it('should detect when total EVs exceed maximum', () => {
      const invalidEVs: EVStats = {
        hp: MAX_STAT_EVS,
        attack: MAX_STAT_EVS,
        defense: MAX_STAT_EVS,
        spAttack: MAX_STAT_EVS,
        spDefense: MAX_STAT_EVS,
        speed: MAX_STAT_EVS,
      };

      const total = Object.values(invalidEVs).reduce((sum, val) => sum + val, 0);
      expect(total).toBeGreaterThan(MAX_TOTAL_EVS);
    });
  });

  describe('Pokemon', () => {
    it('should create a valid Pokemon object structure', () => {
      const pokemon: Pokemon = {
        id: 'test-1',
        nickname: 'TestMon',
        species: 'Pikachu',
        speciesNumber: 25,
        level: 50,
        evs: {
          hp: 100,
          attack: 50,
          defense: 75,
          spAttack: 80,
          spDefense: 60,
          speed: 90,
        },
        baseStats: {
          hp: 35,
          attack: 55,
          defense: 40,
          spAttack: 50,
          spDefense: 50,
          speed: 90,
        },
        description: 'A test Pokemon',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        achievements: [],
      };

      expect(pokemon.id).toBe('test-1');
      expect(pokemon.nickname).toBe('TestMon');
      expect(pokemon.level).toBeGreaterThanOrEqual(1);
      expect(pokemon.level).toBeLessThanOrEqual(100);
      expect(pokemon.createdAt).toBeLessThanOrEqual(pokemon.updatedAt);
    });

    it('should validate Pokemon level constraints', () => {
      const pokemon: Pokemon = {
        id: 'test-2',
        nickname: 'TestMon',
        species: 'Pikachu',
        speciesNumber: 25,
        level: 1,
        evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
        baseStats: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 },
        description: 'A test Pokemon',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        achievements: [],
      };

      expect(pokemon.level).toBeGreaterThanOrEqual(1);
      expect(pokemon.level).toBeLessThanOrEqual(100);
    });
  });

  describe('Team', () => {
    it('should create a valid Team object structure', () => {
      const team: Team = {
        id: 'team-1',
        name: 'Test Team',
        pokemonIds: ['pokemon-1', 'pokemon-2'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(team.id).toBe('team-1');
      expect(team.name).toBe('Test Team');
      expect(Array.isArray(team.pokemonIds)).toBe(true);
      expect(team.pokemonIds.length).toBeLessThanOrEqual(6);
      expect(team.createdAt).toBeLessThanOrEqual(team.updatedAt);
    });

    it('should enforce maximum team size of 6', () => {
      const team: Team = {
        id: 'team-2',
        name: 'Full Team',
        pokemonIds: ['1', '2', '3', '4', '5', '6'],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      expect(team.pokemonIds.length).toBeLessThanOrEqual(6);
    });
  });
});

describe('EV calculations', () => {
  it('should calculate remaining EV capacity', () => {
    const currentEVs: EVStats = {
      hp: 100,
      attack: 50,
      defense: 75,
      spAttack: 80,
      spDefense: 60,
      speed: 90,
    };

    const total = Object.values(currentEVs).reduce((sum, val) => sum + val, 0);
    const remaining = MAX_TOTAL_EVS - total;
    
    expect(remaining).toBe(55);
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('should calculate remaining stat EV capacity', () => {
    const currentStatEV = 200;
    const remaining = MAX_STAT_EVS - currentStatEV;
    
    expect(remaining).toBe(52);
    expect(remaining).toBeGreaterThanOrEqual(0);
  });

  it('should handle maxed out EVs', () => {
    const maxedEVs: EVStats = {
      hp: MAX_STAT_EVS,
      attack: MAX_STAT_EVS,
      defense: 6,
      spAttack: 0,
      spDefense: 0,
      speed: 0,
    };

    const total = Object.values(maxedEVs).reduce((sum, val) => sum + val, 0);
    expect(total).toBe(MAX_TOTAL_EVS);
    
    const remaining = MAX_TOTAL_EVS - total;
    expect(remaining).toBe(0);
  });
});

