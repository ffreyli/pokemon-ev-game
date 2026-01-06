
import React from 'react';
import { Nature, StatKey, Stats, Pokemon } from './types';

export const POKEMON_SPECIES_LIST = [
  { name: "Pikachu", number: 25, base: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 } },
  { name: "Charizard", number: 6, base: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 } },
  { name: "Lucario", number: 448, base: { hp: 70, attack: 110, defense: 70, spAttack: 115, spDefense: 70, speed: 90 } },
  { name: "Garchomp", number: 445, base: { hp: 108, attack: 130, defense: 95, spAttack: 80, spDefense: 85, speed: 102 } },
  { name: "Greninja", number: 658, base: { hp: 72, attack: 95, defense: 67, spAttack: 103, spDefense: 71, speed: 122 } },
  { name: "Gardevoir", number: 282, base: { hp: 68, attack: 65, defense: 65, spAttack: 125, spDefense: 115, speed: 80 } },
  { name: "Snorlax", number: 143, base: { hp: 160, attack: 110, defense: 65, spAttack: 65, spDefense: 110, speed: 30 } },
  { name: "Umbreon", number: 197, base: { hp: 95, attack: 65, defense: 110, spAttack: 60, spDefense: 130, speed: 65 } },
  { name: "Dragapult", number: 887, base: { hp: 88, attack: 120, defense: 75, spAttack: 100, spDefense: 75, speed: 142 } },
  { name: "Tinkaton", number: 959, base: { hp: 85, attack: 75, defense: 77, spAttack: 70, spDefense: 105, speed: 94 } },
];

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
  hp: "HP",
  attack: "Atk",
  defense: "Def",
  spAttack: "SpA",
  spDefense: "SpD",
  speed: "Spe"
};

export const SAMPLE_PUBLIC_TEAMS = [
  {
    id: "pub-vgc-1",
    name: "Standard Balance Core",
    author: "VGC_Expert",
    pokemons: [
      { species: "Incineroar", number: 727, item: "Sitrus Berry", ability: "Intimidate", moves: ["Fake Out", "Flare Blitz", "Parting Shot", "Knock Off"] },
      { species: "Rillaboom", number: 812, item: "Assault Vest", ability: "Grassy Surge", moves: ["Fake Out", "Wood Hammer", "Grassy Glide", "U-turn"] },
      { species: "Flutter Mane", number: 987, item: "Choice Specs", ability: "Protosynthesis", moves: ["Moonblast", "Shadow Ball", "Dazzling Gleam", "Thunderbolt"] },
      { species: "Urshifu-Rapid-Strike", number: 892, item: "Focus Sash", ability: "Unseen Fist", moves: ["Surging Strikes", "Aqua Jet", "Close Combat", "Detect"] },
      { species: "Amoonguss", number: 591, item: "Rocky Helmet", ability: "Regenerator", moves: ["Spore", "Rage Powder", "Pollun Puff", "Protect"] },
      { species: "Farigiraf", number: 981, item: "Safety Goggles", ability: "Armor Tail", moves: ["Trick Room", "Psychic Noise", "Helping Hand", "Protect"] },
    ]
  },
  {
    id: "pub-rain-1",
    name: "Pelagic Storm (Rain)",
    author: "Showdown_Ace",
    pokemons: [
      { species: "Pelipper", number: 279, item: "Damp Rock", ability: "Drizzle", moves: ["Hurricane", "Weather Ball", "U-turn", "Roost"] },
      { species: "Archaludon", number: 1022, item: "Power Herb", ability: "Stamina", moves: ["Electro Shot", "Flash Cannon", "Draco Meteor", "Body Press"] },
      { species: "Basculegion-M", number: 902, item: "Choice Band", ability: "Swift Swim", moves: ["Last Respects", "Wave Crash", "Flip Turn", "Aqua Jet"] },
      { species: "Zapdos", number: 145, item: "Heavy-Duty Boots", ability: "Static", moves: ["Thunder", "Hurricane", "Volt Switch", "Roost"] },
      { species: "Iron Tread", number: 990, item: "Booster Energy", ability: "Quark Drive", moves: ["Earthquake", "Iron Head", "Rapid Spin", "Volt Switch"] },
      { species: "Amoonguss", number: 591, item: "Black Sludge", ability: "Regenerator", moves: ["Spore", "Giga Drain", "Sludge Bomb", "Foul Play"] },
    ]
  },
  {
    id: "pub-trick-1",
    name: "Lunar Eclipse (Hard TR)",
    author: "GymLeader_Morty",
    pokemons: [
      { species: "Indeedee-F", number: 876, item: "Psychic Seed", ability: "Psychic Surge", moves: ["Follow Me", "Helping Hand", "Psychic Noise", "Trick Room"] },
      { species: "Torkoal", number: 324, item: "Charcoal", ability: "Drought", moves: ["Eruption", "Heat Wave", "Solar Beam", "Protect"] },
      { species: "Ursaluna-Bloodmoon", number: 1013, item: "Life Orb", ability: "Mind's Eye", moves: ["Blood Moon", "Earth Power", "Hyper Voice", "Protect"] },
      { species: "Hatterene", number: 858, item: "Focus Sash", ability: "Magic Bounce", moves: ["Psychic", "Dazzling Gleam", "Trick Room", "Mystical Fire"] },
      { species: "Gallade", number: 475, item: "Clear AMulet", ability: "Sharpness", moves: ["Sacred Sword", "Psycho Cutter", "Leaf Blade", "Protect"] },
      { species: "Iron Hands", number: 992, item: "Assault Vest", ability: "Quark Drive", moves: ["Wild Charge", "Drain Punch", "Fake Out", "Volt Switch"] },
    ]
  },
  {
    id: "pub-sun-1",
    name: "Solar Flare Offense",
    author: "VGC_Regional_Finalist",
    pokemons: [
      { species: "Torkoal", number: 324, item: "Heat Rock", ability: "Drought", moves: ["Lava Plume", "Solar Beam", "Stealth Rock", "Yawn"] },
      { species: "Venusaur", number: 3, item: "Life Orb", ability: "Chlorophyll", moves: ["Solar Beam", "Sludge Bomb", "Earth Power", "Weather Ball"] },
      { species: "Walking Wake", number: 1009, item: "Choice Specs", ability: "Protosynthesis", moves: ["Hydro Steam", "Draco Meteor", "Flamethrower", "Dragon Pulse"] },
      { species: "Flutter Mane", number: 987, item: "Booster Energy", ability: "Protosynthesis", moves: ["Moonblast", "Shadow Ball", "Mystical Fire", "Taunt"] },
      { species: "Gouging Fire", number: 1020, item: "Leftovers", ability: "Protosynthesis", moves: ["Flare Blitz", "Dragon Claw", "Morning Sun", "Dragon Dance"] },
      { species: "Kingambit", number: 983, item: "Black Glasses", ability: "Supreme Overlord", moves: ["Kowtow Cleave", "Sucker Punch", "Iron Head", "Swords Dance"] },
    ]
  },
  {
    id: "pub-gold-1",
    name: "Gold Standard Balance",
    author: "Showdown_Ladder_Hero",
    pokemons: [
      { species: "Gholdengo", number: 1000, item: "Choice Scarf", ability: "Good as Gold", moves: ["Make It Rain", "Shadow Ball", "Focus Blast", "Trick"] },
      { species: "Dragonite", number: 149, item: "Heavy-Duty Boots", ability: "Multiscale", moves: ["Extreme Speed", "Earthquake", "Dragon Dance", "Roost"] },
      { species: "Iron Valiant", number: 1006, item: "Booster Energy", ability: "Quark Drive", moves: ["Moonblast", "Close Combat", "Thunderbolt", "Shadow Ball"] },
      { species: "Ting-Lu", number: 1003, item: "Leftovers", ability: "Vessel of Ruin", moves: ["Earthquake", "Ruination", "Stealth Rock", "Whirlwind"] },
      { species: "Corviknight", number: 823, item: "Rocky Helmet", ability: "Mirror Armor", moves: ["Brave Bird", "U-turn", "Defog", "Roost"] },
      { species: "Garganacl", number: 934, item: "Leftovers", ability: "Purifying Salt", moves: ["Salt Cure", "Recover", "Iron Defense", "Body Press"] },
    ]
  }
];
