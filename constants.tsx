
import React from 'react';

export const POKEMON_SPECIES_LIST = [
  { name: "Pikachu", number: 25, base: { hp: 35, attack: 55, defense: 40, spAttack: 50, spDefense: 50, speed: 90 } },
  { name: "Charizard", number: 6, base: { hp: 78, attack: 84, defense: 78, spAttack: 109, spDefense: 85, speed: 100 } },
  { name: "Lucario", number: 448, base: { hp: 70, attack: 110, defense: 70, spAttack: 115, spDefense: 70, speed: 90 } },
  { name: "Garchomp", number: 445, base: { hp: 108, attack: 130, defense: 95, spAttack: 80, spDefense: 85, speed: 102 } },
  { name: "Greninja", number: 658, base: { hp: 72, attack: 95, defense: 67, spAttack: 103, spDefense: 71, speed: 122 } },
  { name: "Gardevoir", number: 282, base: { hp: 68, attack: 65, defense: 65, spAttack: 125, spDefense: 115, speed: 80 } },
  { name: "Snorlax", number: 143, base: { hp: 160, attack: 110, defense: 65, spAttack: 65, spDefense: 110, speed: 30 } },
  { name: "Umbreon", number: 197, base: { hp: 95, attack: 65, defense: 110, spAttack: 60, spDefense: 130, speed: 65 } },
];

const RANDOM_NICKNAMES = [
  "Bubbles", "Tiny", "Sparky", "Tank", "Zoomer", "Bean", "Noodle", "Potato", 
  "Shadow", "Ace", "Goliath", "Mochi", "Churro", "Pickle", "Sushi", "Boba", 
  "Kiwi", "Mango", "Nugget", "Waffle", "Cookie", "Donut", "Puff", "Spicy",
  "Chonky", "Gizmo", "Peanut", "Zippy", "Turbo", "Champ", "Buddy", "Chief"
];

export const getRandomNickname = () => {
  return RANDOM_NICKNAMES[Math.floor(Math.random() * RANDOM_NICKNAMES.length)];
};

export const ACHIEVEMENTS_DATA = [
  { id: 'first_train', title: 'First Steps', description: 'Gain your first EV.' },
  { id: 'max_stat', title: 'Specialist', description: 'Max out a single stat EV.' },
  { id: 'full_spread', title: 'Master Trainer', description: 'Reach 510 total EVs.' },
  { id: 'team_complete', title: 'Squad Goals', description: 'Form a full team of 6.' },
];

export const ICONS = {
  HP: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>,
  Attack: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.5 18l-2.5 2.5L10 18l-4-4 2.5-2.5L10 13l2.5-2.5L10 8l4-4 4 4-2.5 2.5L18 13l-3.5 5z"/></svg>,
  Defense: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>,
  Speed: <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3l-1.5 1.5 3 3L2 12l12.5 4.5-3 3L13 21l8-9-8-9z"/></svg>
};
