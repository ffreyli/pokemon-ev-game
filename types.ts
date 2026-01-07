
export type StatKey = 'hp' | 'attack' | 'defense' | 'spAttack' | 'spDefense' | 'speed';

export type Generation = 'GEN1' | 'GEN3' | 'GEN9';

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

export interface Move {
  name: string;
  type: string;
  category: 'Physical' | 'Special' | 'Status';
  power: number;
  accuracy: number;
  pp: number;
  description?: string;
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
  moves: string[]; // Names of moves
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

export interface MultiplayerBattleState {
  roomId: string;
  generation: Generation;
  player1: { name: string; team: Pokemon[]; ready: boolean; selectedMove?: string; activeIndex: number; hp: number[] };
  player2: { name: string; team: Pokemon[]; ready: boolean; selectedMove?: string; activeIndex: number; hp: number[] };
  turn: number;
  phase: 'lobby' | 'selecting' | 'resolving' | 'finished';
  log: string[];
}

export type BattleMessage = 
  | { type: 'JOIN'; name: string; team: Pokemon[] }
  | { type: 'SYNC'; state: MultiplayerBattleState }
  | { type: 'MOVE_SELECT'; move: string; index: number }
  | { type: 'READY' }
  | { type: 'SET_GEN'; gen: Generation }
  | { type: 'CHAT'; msg: string };
