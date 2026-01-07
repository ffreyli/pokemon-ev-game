
import React, { useState, useEffect, useRef } from 'react';
import { Pokemon, StatKey, Generation, Move } from '../types';
import { POKEMON_SPECIES_LIST, calculateActualStat, MOVE_DATABASE, getEffectiveness, isSpecialTypeGen3 } from '../constants';

interface BattleModeProps {
  generation: Generation;
  team: Pokemon[];
  opponentTeamProp?: Pokemon[];
  onClose: () => void;
}

interface BattleEntity {
  pokemon: Pokemon;
  currentHP: number;
  maxHP: number;
}

const BattleMode: React.FC<BattleModeProps> = ({ generation, team, opponentTeamProp, onClose }) => {
  const [playerIndex, setPlayerIndex] = useState(0);
  const [playerHP, setPlayerHP] = useState<number[]>([]);
  const [opponentTeam, setOpponentTeam] = useState<BattleEntity[]>([]);
  const [oppIndex, setOppIndex] = useState(0);
  const [log, setLog] = useState<string[]>(["Battle Ready! Release your champions!"]);
  const [turn, setTurn] = useState<'player' | 'cpu'>('player');
  const [isFinished, setIsFinished] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (team.length === 0) return;

    const hps = team.map(p => calculateActualStat('hp', p.baseStats.hp, p.ivs.hp, p.evs.hp, p.level, p.nature));
    setPlayerHP(hps);

    if (opponentTeamProp) {
      const entities = opponentTeamProp.map(pkmn => {
        const hp = calculateActualStat('hp', pkmn.baseStats.hp, pkmn.ivs.hp, pkmn.evs.hp, pkmn.level, pkmn.nature);
        return { pokemon: pkmn, currentHP: hp, maxHP: hp };
      });
      setOpponentTeam(entities);
      setLog(prev => [...prev, `Gen ${generation} Champion has appeared!`]);
    } else {
      // Generate a diverse CPU team of 6
      const cpuTeam: BattleEntity[] = Array(6).fill(null).map(() => {
        const species = POKEMON_SPECIES_LIST[Math.floor(Math.random() * POKEMON_SPECIES_LIST.length)];
        
        // Pick 4 random moves from the database for the CPU (or defaults)
        const allMoves = Object.keys(MOVE_DATABASE);
        const cpuMoves = [];
        for(let i=0; i<4; i++) {
          cpuMoves.push(allMoves[Math.floor(Math.random() * allMoves.length)]);
        }

        const pkmn: Pokemon = {
          id: Math.random().toString(),
          nickname: species.name,
          species: species.name,
          speciesNumber: species.number,
          level: 100,
          item: "Sitrus Berry",
          ability: "Intimidate",
          nature: "Serious",
          gender: "M",
          shiny: Math.random() > 0.95,
          evs: { hp: 84, attack: 84, defense: 84, spAttack: 84, spDefense: 84, speed: 84 }, // Balanced CPU spread
          ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
          moves: cpuMoves,
          baseStats: species.base,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const hp = calculateActualStat('hp', pkmn.baseStats.hp, pkmn.ivs.hp, pkmn.evs.hp, pkmn.level, pkmn.nature);
        return { pokemon: pkmn, currentHP: hp, maxHP: hp };
      });
      setOpponentTeam(cpuTeam);
      setLog(prev => [...prev, `A computer trainer challenges you with a random Gen ${generation} squad!`]);
    }
  }, [team, opponentTeamProp, generation]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const activePlayer = team[playerIndex];
  const activeOpponent = opponentTeam[oppIndex];

  const getStat = (pkmn: Pokemon, key: StatKey) => {
    return calculateActualStat(key, pkmn.baseStats[key], pkmn.ivs[key], pkmn.evs[key], pkmn.level, pkmn.nature);
  };

  const calculateDamage = (attacker: Pokemon, defender: Pokemon, moveName: string): { damage: number, msg: string[] } => {
    const move = MOVE_DATABASE[moveName] || MOVE_DATABASE["Tackle"];
    const level = attacker.level;
    const power = move.power;
    
    let atkStat: StatKey = 'attack';
    let defStat: StatKey = 'defense';

    if (generation === 'GEN1' || generation === 'GEN3') {
      const isSpecial = isSpecialTypeGen3(move.type);
      atkStat = isSpecial ? 'spAttack' : 'attack';
      defStat = isSpecial ? 'spDefense' : 'defense';
    } else {
      atkStat = move.category === 'Special' ? 'spAttack' : 'attack';
      defStat = move.category === 'Special' ? 'spDefense' : 'defense';
    }

    const A = getStat(attacker, atkStat);
    const D = getStat(defender, defStat);
    
    let damage = Math.floor(Math.floor(Math.floor(2 * level / 5 + 2) * power * A / D) / 50) + 2;

    const msgs: string[] = [];

    const critChance = generation === 'GEN1' ? (attacker.baseStats.speed / 512) : 0.06;
    if (Math.random() < critChance) {
      damage *= generation === 'GEN1' ? 2 : 1.5;
      msgs.push("A critical hit!");
    }

    const eff = getEffectiveness(move.type, defender.species, generation);
    damage = Math.floor(damage * eff);
    if (eff > 1) msgs.push("It's super effective!");
    if (eff < 1 && eff > 0) msgs.push("It's not very effective...");
    if (eff === 0) msgs.push(`It doesn't affect ${defender.species}...`);

    if (move.type === attacker.species) {
       damage = Math.floor(damage * 1.5);
    }

    const random = (Math.floor(Math.random() * (100 - 85 + 1)) + 85) / 100;
    damage = Math.floor(damage * random);

    return { damage: Math.max(1, damage), msg: msgs };
  };

  const executeMove = (moveName: string, isPlayer: boolean) => {
    if (isFinished || (isPlayer && turn !== 'player')) return;

    const attacker = isPlayer ? activePlayer : activeOpponent.pokemon;
    const defender = isPlayer ? activeOpponent.pokemon : activePlayer;
    
    const { damage, msg } = calculateDamage(attacker, defender, moveName);

    setLog(prev => [...prev, `${isPlayer ? attacker.nickname : `Enemy ${attacker.species}`} used ${moveName || 'Struggle'}!`]);
    msg.forEach(m => setLog(prev => [...prev, m]));

    if (isPlayer) {
      setOpponentTeam(prev => {
        const next = [...prev];
        next[oppIndex].currentHP = Math.max(0, next[oppIndex].currentHP - damage);
        return next;
      });
      setTurn('cpu');
    } else {
      setPlayerHP(prev => {
        const next = [...prev];
        next[playerIndex] = Math.max(0, next[playerIndex] - damage);
        return next;
      });
      setTurn('player');
    }
  };

  useEffect(() => {
    if (turn === 'cpu' && !isFinished && activeOpponent?.currentHP > 0) {
      const timer = setTimeout(() => {
        const move = activeOpponent.pokemon.moves[Math.floor(Math.random() * activeOpponent.pokemon.moves.length)];
        executeMove(move, false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, isFinished]);

  useEffect(() => {
    if (activeOpponent?.currentHP === 0) {
      if (oppIndex < opponentTeam.length - 1) {
        setLog(prev => [...prev, `Enemy ${activeOpponent.pokemon.species} fainted! Next opponent released.`]);
        setOppIndex(prev => prev + 1);
        setTurn('player');
      } else {
        setLog(prev => [...prev, "VICTORY! The arena belongs to you!"]);
        setIsFinished(true);
      }
    }
    if (playerHP[playerIndex] === 0) {
      const remainingIdx = playerHP.findIndex((hp) => hp > 0);
      if (remainingIdx !== -1) {
        setLog(prev => [...prev, `${activePlayer.nickname} fainted! Choose your next champion.`]);
        setIsSwitching(true);
      } else {
        setLog(prev => [...prev, "DEFEAT... re-train and return to the Stadium!"]);
        setIsFinished(true);
      }
    }
  }, [playerHP, opponentTeam, oppIndex, playerIndex]);

  const playerHPPercent = activePlayer ? (playerHP[playerIndex] / getStat(activePlayer, 'hp')) * 100 : 0;
  const oppHPPercent = activeOpponent ? (activeOpponent.currentHP / activeOpponent.maxHP) * 100 : 0;

  if(!activePlayer || !activeOpponent) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="relative aspect-video rounded-[50px] overflow-hidden border-8 border-white shadow-2xl bg-gradient-to-b from-blue-100 to-green-200">
        <div className="absolute top-10 left-10 z-10 bg-white/90 p-4 rounded-3xl border-2 border-slate-100 w-64 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="font-black text-[10px] uppercase text-slate-800">{activeOpponent.pokemon.species}</span>
            <span className="text-[10px] font-black text-red-600">LV.{activeOpponent.pokemon.level}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className={`h-full rounded-full transition-all duration-1000 ${oppHPPercent > 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${oppHPPercent}%` }} />
          </div>
          <div className="text-[8px] font-black text-slate-400 mt-1 uppercase">CPU Champion {oppIndex + 1}/6</div>
        </div>
        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${activeOpponent.pokemon.speciesNumber}.png`} className="absolute top-20 right-20 w-48 h-48 drop-shadow-xl" />

        <div className="absolute bottom-10 right-10 z-10 bg-white/90 p-4 rounded-3xl border-2 border-slate-100 w-72 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="font-black text-[10px] uppercase text-red-600">{activePlayer.nickname}</span>
            <span className="text-[10px] font-black text-slate-400">LV.{activePlayer.level}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className={`h-full rounded-full transition-all duration-1000 ${playerHPPercent > 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${playerHPPercent}%` }} />
          </div>
          <div className="text-[8px] font-black text-slate-400 mt-1 uppercase">Your HP: {Math.ceil(playerHP[playerIndex])} / {getStat(activePlayer, 'hp')}</div>
        </div>
        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${activePlayer.speciesNumber}.png`} className="absolute bottom-10 left-20 w-64 h-64 drop-shadow-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white border-2 border-slate-200 rounded-[40px] p-6 h-60 overflow-y-auto font-bold text-xs text-slate-400 space-y-2 shadow-inner">
          {log.map((line, i) => (
            <div key={i} className={i === log.length - 1 ? "text-red-600 animate-pulse" : ""}>{">"} {line}</div>
          ))}
          <div ref={logEndRef} />
        </div>
        <div className="md:col-span-5 bg-white border-2 border-slate-200 rounded-[40px] p-6 flex flex-col gap-3 shadow-sm">
          {isFinished ? (
            <button onClick={onClose} className="w-full h-full bg-slate-900 text-white font-black py-4 rounded-3xl text-xs uppercase tracking-widest shadow-lg">Return to Stadium</button>
          ) : isSwitching ? (
            <div className="grid grid-cols-2 gap-2">
              {team.map((pkmn, idx) => (
                <button key={idx} disabled={playerHP[idx] === 0 || idx === playerIndex} onClick={() => { setPlayerIndex(idx); setIsSwitching(false); setLog(p => [...p, `Go, ${pkmn.nickname}!`]); setTurn('cpu'); }} className={`p-2 rounded-xl text-[9px] font-black border-2 transition-all ${idx === playerIndex ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}>
                  {pkmn.nickname}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 flex-1">
                {activePlayer.moves.map((move, i) => (
                  <button key={i} onClick={() => executeMove(move, true)} disabled={turn !== 'player' || !move} className="bg-slate-50 hover:bg-red-50 hover:border-red-400 disabled:opacity-30 border-2 border-slate-100 rounded-2xl p-4 font-black text-[10px] uppercase text-slate-800 transition-all flex flex-col items-center justify-center gap-1 group">
                    <span className="group-hover:text-red-600">{move || '---'}</span>
                    {MOVE_DATABASE[move] && (
                      <span className="text-[7px] text-slate-400">{MOVE_DATABASE[move].type} / {MOVE_DATABASE[move].category}</span>
                    )}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsSwitching(true)} disabled={turn !== 'player'} className="w-full bg-slate-100 text-slate-400 font-black py-3 rounded-2xl text-[9px] uppercase hover:bg-red-50 hover:text-red-600 transition-all">Switch Squad</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleMode;
