
export enum StatName {
  HP = 'HP',
  Attack = 'Attack',
  Defense = 'Defense',
  SpAttack = 'Sp. Atk',
  SpDefense = 'Sp. Def',
  Speed = 'Speed'
}

export interface EVStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface Pokemon {
  id: string;
  nickname: string;
  species: string;
  speciesNumber: number;
  level: number;
  evs: EVStats;
  baseStats: BaseStats;
  description: string;
  createdAt: number;
  updatedAt: number;
  achievements: string[];
}

export interface Team {
  id: string;
  name: string;
  pokemonIds: string[];
  createdAt: number;
  updatedAt: number;
}

export const MAX_TOTAL_EVS = 510;
export const MAX_STAT_EVS = 252; // Modern competitive standard is 252, though 255 is hardware limit
