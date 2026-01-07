
import { Nature, StatKey, Move, Generation } from './types';

export const POKEMON_SPECIES_LIST = [
  { name: "Pikachu", number: 25, base: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 } },
  { name: "Charizard", number: 6, base: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 } },
  { name: "Lucario", number: 448, base: { hp: 70, attack: 110, defense: 70, spAttack: 115, spDefense: 70, speed: 90 } },
  { name: "Garchomp", number: 445, base: { hp: 108, attack: 130, defense: 95, spAttack: 80, spDefense: 85, speed: 102 } },
  { name: "Greninja", number: 658, base: { hp: 72, attack: 95, defense: 67, spAttack: 103, spDefense: 71, speed: 122 } },
  { name: "Gardevoir", number: 282, base: { hp: 68, attack: 65, defense: 65, spAttack: 125, spDefense: 115, speed: 80 } },
  { name: "Snorlax", number: 143, base: { hp: 160, attack: 110, defense: 65, spAttack: 65, spDefense: 110, speed: 30 } },
  { name: "Umbreon", number: 197, base: { hp: 95, attack: 65, defense: 110, spAttack: 60, spDefense: 130, speed: 65 } },
  { name: "Incineroar", number: 727, base: { hp: 95, attack: 115, defense: 90, spAttack: 80, spDefense: 90, speed: 60 } },
  { name: "Amoonguss", number: 591, base: { hp: 114, attack: 85, defense: 70, spAttack: 85, spDefense: 80, speed: 30 } },
  { name: "Rillaboom", number: 812, base: { hp: 100, attack: 125, defense: 90, spAttack: 60, spDefense: 70, speed: 85 } },
  { name: "Flutter Mane", number: 987, base: { hp: 55, attack: 55, defense: 55, spAttack: 135, spDefense: 135, speed: 135 } },
  { name: "Urshifu", number: 892, base: { hp: 100, attack: 130, defense: 100, spAttack: 63, spDefense: 60, speed: 97 } },
  { name: "Farigiraf", number: 981, base: { hp: 120, attack: 90, defense: 70, spAttack: 110, spDefense: 70, speed: 60 } },
];

export const MOVE_DATABASE: Record<string, Move> = {
  "Tackle": { name: "Tackle", type: "Normal", category: "Physical", power: 40, accuracy: 100, pp: 35 },
  "Quick Attack": { name: "Quick Attack", type: "Normal", category: "Physical", power: 40, accuracy: 100, pp: 30 },
  "Thunderbolt": { name: "Thunderbolt", type: "Electric", category: "Special", power: 90, accuracy: 100, pp: 15 },
  "Flamethrower": { name: "Flamethrower", type: "Fire", category: "Special", power: 90, accuracy: 100, pp: 15 },
  "Hydro Pump": { name: "Hydro Pump", type: "Water", category: "Special", power: 110, accuracy: 80, pp: 5 },
  "Wood Hammer": { name: "Wood Hammer", type: "Grass", category: "Physical", power: 120, accuracy: 100, pp: 15 },
  "Flare Blitz": { name: "Flare Blitz", type: "Fire", category: "Physical", power: 120, accuracy: 100, pp: 15 },
  "Shadow Ball": { name: "Shadow Ball", type: "Ghost", category: "Special", power: 80, accuracy: 100, pp: 15 },
  "Moonblast": { name: "Moonblast", type: "Fairy", category: "Special", power: 95, accuracy: 100, pp: 15 },
  "Close Combat": { name: "Close Combat", type: "Fighting", category: "Physical", power: 120, accuracy: 100, pp: 5 },
  "Surging Strikes": { name: "Surging Strikes", type: "Water", category: "Physical", power: 25, accuracy: 100, pp: 5 },
  "Fake Out": { name: "Fake Out", type: "Normal", category: "Physical", power: 40, accuracy: 100, pp: 10 },
  "Knock Off": { name: "Knock Off", type: "Dark", category: "Physical", power: 65, accuracy: 100, pp: 20 },
  "Last Respects": { name: "Last Respects", type: "Ghost", category: "Physical", power: 50, accuracy: 100, pp: 10 },
  "Surge": { name: "Surge", type: "Water", category: "Special", power: 80, accuracy: 100, pp: 15 },
  "Earthquake": { name: "Earthquake", type: "Ground", category: "Physical", power: 100, accuracy: 100, pp: 10 },
  "Dragon Claw": { name: "Dragon Claw", type: "Dragon", category: "Physical", power: 80, accuracy: 100, pp: 15 },
  "Rock Slide": { name: "Rock Slide", type: "Rock", category: "Physical", power: 75, accuracy: 90, pp: 10 },
  "Protect": { name: "Protect", type: "Normal", category: "Status", power: 0, accuracy: 100, pp: 10 },
  "Spore": { name: "Spore", type: "Grass", category: "Status", power: 0, accuracy: 100, pp: 15 },
  "Rage Powder": { name: "Rage Powder", type: "Bug", category: "Status", power: 0, accuracy: 100, pp: 20 },
  "Pollen Puff": { name: "Pollen Puff", type: "Bug", category: "Special", power: 90, accuracy: 100, pp: 15 },
};

export const TYPE_CHART: Record<string, Record<string, number>> = {
  "Normal": { "Ghost": 0, "Rock": 0.5, "Steel": 0.5 },
  "Fire": { "Grass": 2, "Ice": 2, "Bug": 2, "Steel": 2, "Fire": 0.5, "Water": 0.5, "Rock": 0.5, "Dragon": 0.5 },
  "Water": { "Fire": 2, "Ground": 2, "Rock": 2, "Water": 0.5, "Grass": 0.5, "Dragon": 0.5 },
  "Electric": { "Water": 2, "Flying": 2, "Electric": 0.5, "Grass": 0.5, "Dragon": 0.5, "Ground": 0 },
  "Grass": { "Water": 2, "Ground": 2, "Rock": 2, "Fire": 0.5, "Grass": 0.5, "Poison": 0.5, "Flying": 0.5, "Bug": 0.5, "Dragon": 0.5, "Steel": 0.5 },
  "Fairy": { "Fighting": 2, "Dragon": 2, "Dark": 2, "Poison": 0.5, "Steel": 0.5, "Fire": 0.5 },
  "Ghost": { "Psychic": 2, "Ghost": 2, "Dark": 0.5, "Normal": 0 },
  "Dark": { "Psychic": 2, "Ghost": 2, "Fighting": 0.5, "Dark": 0.5, "Fairy": 0.5 },
};

export const NATURES: Nature[] = [
  { name: "Adamant", plus: "attack", minus: "spAttack" },
  { name: "Bashful" },
  { name: "Bold", plus: "defense", minus: "attack" },
  { name: "Brave", plus: "attack", minus: "speed" },
  { name: "Calm", plus: "spDefense", minus: "attack" },
  { name: "Careful", plus: "spDefense", minus: "spAttack" },
  { name: "Docile" },
  { name: "Gentle", plus: "spDefense", minus: "defense" },
  { name: "Hardy" },
  { name: "Hasty", plus: "speed", minus: "defense" },
  { name: "Impish", plus: "defense", minus: "spAttack" },
  { name: "Jolly", plus: "speed", minus: "spAttack" },
  { name: "Lax", plus: "defense", minus: "spDefense" },
  { name: "Lonely", plus: "attack", minus: "defense" },
  { name: "Mild", plus: "spAttack", minus: "defense" },
  { name: "Modest", plus: "spAttack", minus: "attack" },
  { name: "Naive", plus: "speed", minus: "spDefense" },
  { name: "Naughty", plus: "attack", minus: "spDefense" },
  { name: "Quiet", plus: "spAttack", minus: "speed" },
  { name: "Quirky" },
  { name: "Rash", plus: "spAttack", minus: "spDefense" },
  { name: "Relaxed", plus: "defense", minus: "speed" },
  { name: "Sassy", plus: "spDefense", minus: "speed" },
  { name: "Serious" },
  { name: "Timid", plus: "speed", minus: "attack" }
];

export const calculateActualStat = (statKey: StatKey, base: number, iv: number, ev: number, level: number, natureName: string): number => {
  const nature = NATURES.find(n => n.name === natureName);
  const common = Math.floor(0.01 * (2 * base + iv + Math.floor(0.25 * ev)) * level);
  
  if (statKey === 'hp') {
    return common + level + 10;
  }
  
  let modifier = 1.0;
  if (nature?.plus === statKey) modifier = 1.1;
  if (nature?.minus === statKey) modifier = 0.9;
  
  return Math.floor((common + 5) * modifier);
};

export const STAT_LABELS: Record<StatKey, string> = {
  hp: "HP", attack: "Atk", defense: "Def", spAttack: "SpA", spDefense: "SpD", speed: "Spe"
};

export const getEffectiveness = (moveType: string, targetSpecies: string, gen: Generation): number => {
  const chart = TYPE_CHART[moveType];
  if (!chart) return 1;
  return chart[targetSpecies] !== undefined ? chart[targetSpecies] : 1;
};

export const isSpecialTypeGen3 = (type: string): boolean => {
  return ["Fire", "Water", "Electric", "Grass", "Ice", "Psychic", "Dragon", "Dark"].includes(type);
};

export const SAMPLE_PUBLIC_TEAMS = [
  {
    id: "pub-vgc-1",
    name: "World Championship Balance",
    author: "RayRizzo",
    pokemons: [
      { species: "Incineroar", number: 727, item: "Sitrus Berry", ability: "Intimidate", nature: "Careful", evs: { hp: 252, attack: 4, defense: 76, spAttack: 0, spDefense: 156, speed: 20 }, moves: ["Fake Out", "Flare Blitz", "Parting Shot", "Knock Off"] },
      { species: "Amoonguss", number: 591, item: "Rocky Helmet", ability: "Regenerator", nature: "Bold", evs: { hp: 252, attack: 0, defense: 156, spAttack: 0, spDefense: 100, speed: 0 }, moves: ["Spore", "Rage Powder", "Pollen Puff", "Protect"] },
      { species: "Garchomp", number: 445, item: "Life Orb", ability: "Rough Skin", nature: "Jolly", evs: { hp: 0, attack: 252, defense: 4, spAttack: 0, spDefense: 0, speed: 252 }, moves: ["Earthquake", "Dragon Claw", "Rock Slide", "Protect"] },
      { species: "Flutter Mane", number: 987, item: "Choice Specs", ability: "Protosynthesis", nature: "Timid", evs: { hp: 124, attack: 0, defense: 148, spAttack: 36, spDefense: 4, speed: 196 }, moves: ["Moonblast", "Shadow Ball", "Dazzling Gleam", "Thunderbolt"] },
      { species: "Rillaboom", number: 812, item: "Assault Vest", ability: "Grassy Surge", nature: "Adamant", evs: { hp: 252, attack: 116, defense: 4, spAttack: 0, spDefense: 132, speed: 4 }, moves: ["Fake Out", "Wood Hammer", "Grassy Glide", "U-turn"] },
      { species: "Urshifu", number: 892, item: "Focus Sash", ability: "Unseen Fist", nature: "Jolly", evs: { hp: 0, attack: 252, defense: 4, spAttack: 0, spDefense: 0, speed: 252 }, moves: ["Surging Strikes", "Close Combat", "Aqua Jet", "Detect"] },
    ]
  },
  {
    id: "pub-vgc-2",
    name: "Trick Room Offense",
    author: "WolfeyVGC",
    pokemons: [
      { species: "Farigiraf", number: 981, item: "Safety Goggles", ability: "Armor Tail", nature: "Quiet", evs: { hp: 252, attack: 0, defense: 100, spAttack: 156, spDefense: 0, speed: 0 }, moves: ["Trick Room", "Psychic Noise", "Helping Hand", "Protect"] },
      { species: "Snorlax", number: 143, item: "Iapapa Berry", ability: "Gluttony", nature: "Brave", evs: { hp: 252, attack: 252, defense: 4, spAttack: 0, spDefense: 0, speed: 0 }, moves: ["Facade", "High Horsepower", "Belly Drum", "Recycle"] },
      { species: "Incineroar", number: 727, item: "Sitrus Berry", ability: "Intimidate", nature: "Sassy", evs: { hp: 252, attack: 0, defense: 100, spAttack: 0, spDefense: 156, speed: 0 }, moves: ["Fake Out", "Flare Blitz", "Parting Shot", "Knock Off"] },
      { species: "Amoonguss", number: 591, item: "Eject Button", ability: "Regenerator", nature: "Sassy", evs: { hp: 252, attack: 0, defense: 156, spAttack: 0, spDefense: 100, speed: 0 }, moves: ["Spore", "Rage Powder", "Clear Smog", "Protect"] },
      { species: "Ursaluna", number: 901, item: "Flame Orb", ability: "Guts", nature: "Brave", evs: { hp: 252, attack: 252, defense: 4, spAttack: 0, spDefense: 0, speed: 0 }, moves: ["Facade", "Headlong Rush", "Fire Punch", "Protect"] },
      { species: "Cresselia", number: 488, item: "Mental Herb", ability: "Levitate", nature: "Relaxed", evs: { hp: 252, attack: 0, defense: 252, spAttack: 0, spDefense: 4, speed: 0 }, moves: ["Trick Room", "Lunar Blessing", "Ice Beam", "Helping Hand"] },
    ]
  }
];
