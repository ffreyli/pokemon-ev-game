
import { Pokemon, Stats, StatKey } from '../types';
import { POKEMON_SPECIES_LIST, NATURES } from '../constants';

const STAT_MAP: Record<string, StatKey> = {
  'HP': 'hp', 'Atk': 'attack', 'Def': 'defense', 'SpA': 'spAttack', 'SpD': 'spDefense', 'Spe': 'speed'
};

const REV_STAT_MAP: Record<StatKey, string> = {
  'hp': 'HP', 'attack': 'Atk', 'defense': 'Def', 'spAttack': 'SpA', 'spDefense': 'SpD', 'speed': 'Spe'
};

export const exportToShowdown = (pkmn: Pokemon): string => {
  let text = `${pkmn.nickname}${pkmn.nickname !== pkmn.species ? ` (${pkmn.species})` : ''}${pkmn.item ? ` @ ${pkmn.item}` : ''}\n`;
  if (pkmn.ability) text += `Ability: ${pkmn.ability}\n`;
  if (pkmn.level !== 100) text += `Level: ${pkmn.level}\n`;
  if (pkmn.shiny) text += `Shiny: Yes\n`;
  
  const evLines: string[] = [];
  (Object.keys(pkmn.evs) as StatKey[]).forEach(k => {
    if (pkmn.evs[k] > 0) evLines.push(`${pkmn.evs[k]} ${REV_STAT_MAP[k]}`);
  });
  if (evLines.length > 0) text += `EVs: ${evLines.join(' / ')}\n`;
  
  text += `${pkmn.nature} Nature\n`;
  
  const ivLines: string[] = [];
  (Object.keys(pkmn.ivs) as StatKey[]).forEach(k => {
    if (pkmn.ivs[k] < 31) ivLines.push(`${pkmn.ivs[k]} ${REV_STAT_MAP[k]}`);
  });
  if (ivLines.length > 0) text += `IVs: ${ivLines.join(' / ')}\n`;
  
  pkmn.moves.filter(m => m.trim()).forEach(m => {
    text += `- ${m}\n`;
  });
  
  return text;
};

export const parseShowdown = (text: string): Partial<Pokemon>[] => {
  const blocks = text.split(/\n\s*\n/);
  return blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return {};

    const pkmn: Partial<Pokemon> = {
      evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
      ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
      moves: [],
      level: 100,
      shiny: false,
      nature: 'Serious'
    };

    // First line: Nickname (Species) @ Item
    const firstLine = lines[0];
    const itemSplit = firstLine.split('@');
    if (itemSplit[1]) pkmn.item = itemSplit[1].trim();
    
    const namePart = itemSplit[0].trim();
    const speciesMatch = namePart.match(/(.+)\s\((.+)\)/);
    if (speciesMatch) {
      pkmn.nickname = speciesMatch[1];
      pkmn.species = speciesMatch[2];
    } else {
      pkmn.nickname = namePart;
      pkmn.species = namePart;
    }

    const speciesInfo = POKEMON_SPECIES_LIST.find(s => s.name.toLowerCase() === pkmn.species?.toLowerCase());
    if (speciesInfo) {
      pkmn.speciesNumber = speciesInfo.number;
      pkmn.baseStats = speciesInfo.base;
    }

    lines.slice(1).forEach(line => {
      if (line.startsWith('Ability:')) pkmn.ability = line.replace('Ability:', '').trim();
      if (line.startsWith('Level:')) pkmn.level = parseInt(line.replace('Level:', '')) || 100;
      if (line.startsWith('Shiny:')) pkmn.shiny = line.includes('Yes');
      if (line.startsWith('EVs:')) {
        const parts = line.replace('EVs:', '').split('/');
        parts.forEach(p => {
          const [val, stat] = p.trim().split(' ');
          if (STAT_MAP[stat]) pkmn.evs![STAT_MAP[stat]] = parseInt(val);
        });
      }
      if (line.startsWith('IVs:')) {
        const parts = line.replace('IVs:', '').split('/');
        parts.forEach(p => {
          const [val, stat] = p.trim().split(' ');
          if (STAT_MAP[stat]) pkmn.ivs![STAT_MAP[stat]] = parseInt(val);
        });
      }
      if (line.includes('Nature')) pkmn.nature = line.replace('Nature', '').trim();
      if (line.startsWith('-')) pkmn.moves?.push(line.replace('-', '').trim());
    });

    while (pkmn.moves!.length < 4) pkmn.moves!.push('');
    return pkmn;
  });
};
