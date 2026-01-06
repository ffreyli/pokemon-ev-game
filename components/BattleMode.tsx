
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Pokemon, StatKey } from '../types';
import { POKEMON_SPECIES_LIST, calculateActualStat } from '../constants';

interface BattleModeProps {
  team: Pokemon[];
  opponentTeamProp?: Pokemon[];
  onClose: () => void;
}

interface BattleEntity {
  pokemon: Pokemon;
  currentHP: number;
  maxHP: number;
}

const BattleMode: React.FC<BattleModeProps> = ({ team, opponentTeamProp, onClose }) => {
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
      setLog(prev => [...prev, "Challenging a legendary Champion!"]);
    } else {
      const cpuTeam: BattleEntity[] = Array(team.length).fill(null).map(() => {
        const species = POKEMON_SPECIES_LIST[Math.floor(Math.random() * POKEMON_SPECIES_LIST.length)];
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
          evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
          ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
          moves: ["Tackle", "Quick Attack", "Swift", "Bite"],
          baseStats: species.base,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        const hp = calculateActualStat('hp', pkmn.baseStats.hp, pkmn.ivs.hp, pkmn.evs.hp, pkmn.level, pkmn.nature);
        return { pokemon: pkmn, currentHP: hp, maxHP: hp };
      });
      setOpponentTeam(cpuTeam);
    }
  }, [team, opponentTeamProp]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const activePlayer = team[playerIndex];
  const activeOpponent = opponentTeam[oppIndex];

  const getStat = (pkmn: Pokemon, key: StatKey) => {
    return calculateActualStat(key, pkmn.baseStats[key], pkmn.ivs[key], pkmn.evs[key], pkmn.level, pkmn.nature);
  };

  const executeMove = (moveName: string, isPlayer: boolean) => {
    if (isFinished || (isPlayer && turn !== 'player')) return;

    const attacker = isPlayer ? activePlayer : activeOpponent.pokemon;
    const defender = isPlayer ? activeOpponent.pokemon : activePlayer;
    
    const atkStat = attacker.baseStats.attack > attacker.baseStats.spAttack ? 'attack' : 'spAttack';
    const defStat = atkStat === 'attack' ? 'defense' : 'spDefense';
    
    const atk = getStat(attacker, atkStat);
    const def = getStat(defender, defStat);
    
    const baseDamage = Math.floor((((2 * attacker.level / 5 + 2) * 80 * (atk / def)) / 50) + 2);
    const damage = Math.max(1, Math.floor(baseDamage * (0.85 + Math.random() * 0.15)));

    setLog(prev => [...prev, `${isPlayer ? attacker.nickname : `Enemy ${attacker.species}`} used ${moveName || 'Struggle'}!`]);

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
        const move = activeOpponent.pokemon.moves[Math.floor(Math.random() * 4)];
        executeMove(move, false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [turn, isFinished]);

  useEffect(() => {
    if (activeOpponent?.currentHP === 0) {
      if (oppIndex < opponentTeam.length - 1) {
        setLog(prev => [...prev, `Enemy ${activeOpponent.pokemon.species} fainted! Next opponent ready.`]);
        setOppIndex(prev => prev + 1);
        setTurn('player');
      } else {
        setLog(prev => [...prev, "VICTORY! The arena is yours!"]);
        setIsFinished(true);
      }
    }
    if (playerHP[playerIndex] === 0) {
      const remainingIdx = playerHP.findIndex((hp) => hp > 0);
      if (remainingIdx !== -1) {
        setLog(prev => [...prev, `${activePlayer.nickname} fainted! Select next champion.`]);
        setIsSwitching(true);
      } else {
        setLog(prev => [...prev, "DEFEAT... re-train and return!"]);
        setIsFinished(true);
      }
    }
  }, [playerHP, opponentTeam, oppIndex, playerIndex]);

  if (team.length === 0) return <div className="p-20 text-center font-black text-slate-300 italic uppercase">Assemble a team first!</div>;
  if (opponentTeam.length === 0) return null;

  const playerHPPercent = (playerHP[playerIndex] / getStat(activePlayer, 'hp')) * 100;
  const oppHPPercent = (activeOpponent.currentHP / activeOpponent.maxHP) * 100;

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
        </div>
        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${activeOpponent.pokemon.shiny ? 'shiny/' : ''}${activeOpponent.pokemon.speciesNumber}.png`} className="absolute top-20 right-20 w-48 h-48 drop-shadow-xl" />

        <div className="absolute bottom-10 right-10 z-10 bg-white/90 p-4 rounded-3xl border-2 border-slate-100 w-72 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="font-black text-[10px] uppercase text-red-600">{activePlayer.nickname}</span>
            <span className="text-[10px] font-black text-slate-400">LV.{activePlayer.level}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className={`h-full rounded-full transition-all duration-1000 ${playerHPPercent > 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${playerHPPercent}%` }} />
          </div>
        </div>
        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${activePlayer.shiny ? 'shiny/' : ''}${activePlayer.speciesNumber}.png`} className="absolute bottom-10 left-20 w-64 h-64 drop-shadow-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white border-2 border-slate-200 rounded-[40px] p-6 h-60 overflow-y-auto font-bold text-xs text-slate-400 space-y-2">
          {log.map((line, i) => (
            <div key={i} className={i === log.length - 1 ? "text-red-600" : ""}>{">"} {line}</div>
          ))}
          <div ref={logEndRef} />
        </div>
        <div className="md:col-span-5 bg-white border-2 border-slate-200 rounded-[40px] p-6 flex flex-col gap-3">
          {isFinished ? (
            <button onClick={onClose} className="w-full h-full bg-slate-900 text-white font-black py-4 rounded-3xl text-xs uppercase tracking-widest">Return to Base</button>
          ) : isSwitching ? (
            <div className="grid grid-cols-2 gap-2">
              {team.map((pkmn, idx) => (
                <button key={idx} disabled={playerHP[idx] === 0 || idx === playerIndex} onClick={() => { setPlayerIndex(idx); setIsSwitching(false); setLog(p => [...p, `Go, ${pkmn.nickname}!`]); setTurn('cpu'); }} className={`p-2 rounded-xl text-[9px] font-black border-2 transition-all ${idx === playerIndex ? 'border-red-500 bg-red-50 text-red-600' : 'border-slate-100 bg-slate-50'}`}>
                  {pkmn.nickname}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 flex-1">
                {activePlayer.moves.map((move, i) => (
                  <button key={i} onClick={() => executeMove(move, true)} disabled={turn !== 'player' || !move} className="bg-slate-50 hover:bg-red-50 hover:border-red-400 disabled:opacity-30 border-2 border-slate-100 rounded-2xl p-4 font-black text-[10px] uppercase text-slate-800 transition-all">
                    {move || '---'}
                  </button>
                ))}
              </div>
              <button onClick={() => setIsSwitching(true)} disabled={turn !== 'player'} className="w-full bg-slate-100 text-slate-400 font-black py-3 rounded-2xl text-[9px] uppercase hover:bg-red-50 hover:text-red-600 transition-all">Switch</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleMode;
