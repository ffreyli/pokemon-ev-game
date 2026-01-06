
export type StatKey = 'hp' | 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed';

export interface Stats {
  hp: number;
  attack: number;
  defense: number;
  spAttack: number;
  spDefense: number;
  speed: number;
}

export interface Nature {
  name: string;
  plus?: StatKey;
  minus?: StatKey;
}

export interface Pokemon {
  id: string;
  nickname: string;
  species: string;
  speciesNumber: number;
  level: number;
  item: string;
  ability: string;
  nature: string;
  gender: string;
  shiny: boolean;
  evs: Stats;
  ivs: Stats;
  moves: string[];
  baseStats: Stats;
  createdAt: number;
  updatedAt: number;
}

export interface Team {
  id: string;
  name: string;
  pokemons: Pokemon[];
  updatedAt: number;
}

export const MAX_TOTAL_EVS = 510;
export const MAX_STAT_EVS = 252;
export const MAX_IV = 31;
