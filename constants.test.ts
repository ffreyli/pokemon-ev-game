import { describe, it, expect, vi } from 'vitest';
import { getRandomNickname, POKEMON_SPECIES_LIST, ACHIEVEMENTS_DATA } from './constants';
import { MAX_TOTAL_EVS, MAX_STAT_EVS } from './types';

describe('constants', () => {
  describe('getRandomNickname', () => {
    it('should return a string', () => {
      const nickname = getRandomNickname();
      expect(typeof nickname).toBe('string');
      expect(nickname.length).toBeGreaterThan(0);
    });

    it('should return different nicknames on multiple calls', () => {
      const nicknames = new Set();
      for (let i = 0; i < 10; i++) {
        nicknames.add(getRandomNickname());
      }
      // With 10 calls, we should get at least a few different values
      expect(nicknames.size).toBeGreaterThan(1);
    });
  });

  describe('POKEMON_SPECIES_LIST', () => {
    it('should contain pokemon with required properties', () => {
      expect(POKEMON_SPECIES_LIST.length).toBeGreaterThan(0);
      
      POKEMON_SPECIES_LIST.forEach(pokemon => {
        expect(pokemon).toHaveProperty('name');
        expect(pokemon).toHaveProperty('number');
        expect(pokemon).toHaveProperty('base');
        expect(typeof pokemon.name).toBe('string');
        expect(typeof pokemon.number).toBe('number');
        expect(pokemon.number).toBeGreaterThan(0);
      });
    });

    it('should have valid base stats for all pokemon', () => {
      POKEMON_SPECIES_LIST.forEach(pokemon => {
        const stats = pokemon.base;
        expect(stats).toHaveProperty('hp');
        expect(stats).toHaveProperty('attack');
        expect(stats).toHaveProperty('defense');
        expect(stats).toHaveProperty('spAttack');
        expect(stats).toHaveProperty('spDefense');
        expect(stats).toHaveProperty('speed');
        
        Object.values(stats).forEach(stat => {
          expect(typeof stat).toBe('number');
          expect(stat).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('ACHIEVEMENTS_DATA', () => {
    it('should contain achievements with required properties', () => {
      expect(ACHIEVEMENTS_DATA.length).toBeGreaterThan(0);
      
      ACHIEVEMENTS_DATA.forEach(achievement => {
        expect(achievement).toHaveProperty('id');
        expect(achievement).toHaveProperty('title');
        expect(achievement).toHaveProperty('description');
        expect(typeof achievement.id).toBe('string');
        expect(typeof achievement.title).toBe('string');
        expect(typeof achievement.description).toBe('string');
      });
    });

    it('should have unique achievement IDs', () => {
      const ids = ACHIEVEMENTS_DATA.map(a => a.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});

describe('EV Constants', () => {
  it('should have valid MAX_TOTAL_EVS', () => {
    expect(MAX_TOTAL_EVS).toBe(510);
    expect(MAX_TOTAL_EVS).toBeGreaterThan(0);
  });

  it('should have valid MAX_STAT_EVS', () => {
    expect(MAX_STAT_EVS).toBe(252);
    expect(MAX_STAT_EVS).toBeGreaterThan(0);
    expect(MAX_STAT_EVS).toBeLessThanOrEqual(255);
  });

  it('should allow maxing out 2 stats with some leftover', () => {
    const twoMaxedStats = MAX_STAT_EVS * 2;
    expect(twoMaxedStats).toBeLessThanOrEqual(MAX_TOTAL_EVS);
    expect(MAX_TOTAL_EVS - twoMaxedStats).toBeGreaterThanOrEqual(0);
  });
});

