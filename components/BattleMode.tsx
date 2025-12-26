import React, { useState, useEffect, useMemo } from 'react';
import { Pokemon, Team, EVStats, BaseStats } from '../types';
import { POKEMON_SPECIES_LIST } from '../constants';

interface BattleModeProps {
  team: Team;
  allPokemon: Pokemon[];
  onWin: (id: string, evStat: keyof EVStats) => void;
  onClose: () => void;
}

interface BattleState {
  playerHP: number;
  playerMaxHP: number;
  opponentHP: number;
  opponentMaxHP: number;
  opponent: any;
  log: string[];
  isBattleOver: boolean;
  turn: 'player' | 'opponent';
}

const BattleMode: React.FC<BattleModeProps> = ({ team, allPokemon, onWin, onClose }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [battle, setBattle] = useState<BattleState | null>(null);
  const [shake, setShake] = useState(false);

  const teamPokemon = useMemo(() => 
    team.pokemonIds.map(id => allPokemon.find(p => p.id === id)).filter(Boolean) as Pokemon[], 
  [team, allPokemon]);

  const calculateStat = (base: number, ev: number, level: number) => {
    return Math.floor(((base * 2 + ev / 4) * level) / 100) + 5;
  };

  const calculateHP = (base: number, ev: number, level: number) => {
    return Math.floor(((base * 2 + ev / 4) * level) / 100) + level + 10;
  };

  const startBattle = (pkmn: Pokemon) => {
    const randomOpponent = POKEMON_SPECIES_LIST[Math.floor(Math.random() * POKEMON_SPECIES_LIST.length)];
    const oppLevel = Math.max(1, pkmn.level + Math.floor(Math.random() * 5) - 2);
    
    const pMaxHP = calculateHP(pkmn.baseStats.hp, pkmn.evs.hp, pkmn.level);
    // Fix: Access the .hp property instead of passing the entire base stats object
    const oMaxHP = calculateHP(randomOpponent.base.hp, 0, oppLevel);

    setBattle({
      playerHP: pMaxHP,
      playerMaxHP: pMaxHP,
      opponentHP: oMaxHP,
      opponentMaxHP: oMaxHP,
      opponent: { ...randomOpponent, level: oppLevel },
      log: [`A wild ${randomOpponent.name} appeared!`],
      isBattleOver: false,
      turn: pkmn.baseStats.speed > randomOpponent.base.speed ? 'player' : 'opponent'
    });
  };

  const handleAction = (action: 'attack' | 'special' | 'focus') => {
    if (!battle || battle.isBattleOver || battle.turn !== 'player') return;

    const pkmn = teamPokemon.find(p => p.id === selectedId)!;
    let damage = 0;
    let message = "";

    if (action === 'attack') {
      const atk = calculateStat(pkmn.baseStats.attack, pkmn.evs.attack, pkmn.level);
      const def = calculateStat(battle.opponent.base.defense, 0, battle.opponent.level);
      damage = Math.max(1, Math.floor((atk / def) * 10 + Math.random() * 5));
      message = `${pkmn.nickname} used Physical Attack!`;
    } else if (action === 'special') {
      const spa = calculateStat(pkmn.baseStats.spAttack, pkmn.evs.spAttack, pkmn.level);
      const spd = calculateStat(battle.opponent.base.spDefense, 0, battle.opponent.level);
      damage = Math.max(1, Math.floor((spa / spd) * 12 + Math.random() * 5));
      message = `${pkmn.nickname} used Special Blast!`;
    } else {
      message = `${pkmn.nickname} focused their energy! (Def buff)`;
    }

    applyDamage('opponent', damage, message);
  };

  const applyDamage = (target: 'player' | 'opponent', damage: number, message: string) => {
    setShake(true);
    setTimeout(() => setShake(false), 500);

    setBattle(prev => {
      if (!prev) return null;
      const newHP = Math.max(0, target === 'opponent' ? prev.opponentHP - damage : prev.playerHP - damage);
      const isOver = newHP === 0;
      
      const newLog = [...prev.log, message];
      if (damage > 0) newLog.push(`${target === 'opponent' ? prev.opponent.name : 'Your Pokemon'} took ${damage} damage!`);
      
      if (isOver) {
        newLog.push(target === 'opponent' ? 'Victory! You gained EVs and Exp!' : 'Defeat... your Pokemon fainted.');
        if (target === 'opponent' && selectedId) {
          // Reward: Defeating Pikachu gives Speed EVs, Charizard gives SpA, etc.
          // For simplicity, we just pick the opponent's highest base stat as the reward category
          const base = prev.opponent.base;
          const stats: (keyof EVStats)[] = ['hp', 'attack', 'defense', 'spAttack', 'spDefense', 'speed'];
          const rewardStat = stats.reduce((a, b) => (base[a] > base[b] ? a : b));
          onWin(selectedId, rewardStat);
        }
      }

      return {
        ...prev,
        [target === 'opponent' ? 'opponentHP' : 'playerHP']: newHP,
        log: newLog,
        isBattleOver: isOver,
        turn: target === 'opponent' ? 'opponent' : 'player'
      };
    });
  };

  // Opponent AI
  useEffect(() => {
    if (battle && !battle.isBattleOver && battle.turn === 'opponent') {
      const timer = setTimeout(() => {
        const pkmn = teamPokemon.find(p => p.id === selectedId)!;
        const oppAtk = calculateStat(battle.opponent.base.attack, 0, battle.opponent.level);
        const playerDef = calculateStat(pkmn.baseStats.defense, pkmn.evs.defense, pkmn.level);
        const damage = Math.max(1, Math.floor((oppAtk / playerDef) * 8 + Math.random() * 5));
        
        applyDamage('player', damage, `${battle.opponent.name} used Tackle!`);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [battle?.turn, selectedId, teamPokemon]);

  if (!selectedId) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-xl border-b-8 border-gray-200 text-center">
        <h2 className="text-2xl font-black mb-6">Choose your Champion</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {teamPokemon.map(p => (
            <button 
              key={p.id}
              onClick={() => { setSelectedId(p.id); startBattle(p); }}
              className="p-6 rounded-2xl border-4 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-2 group"
            >
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.speciesNumber}.png`} 
                alt={p.species} 
                className="w-20 h-20 group-hover:scale-110 transition-transform"
              />
              <span className="font-bold text-gray-800">{p.nickname}</span>
              <span className="text-[10px] font-black uppercase bg-gray-200 px-2 py-0.5 rounded">LV. {p.level}</span>
            </button>
          ))}
        </div>
        {teamPokemon.length === 0 && (
          <div className="py-12">
            <p className="text-gray-400 font-bold mb-4">You need at least one Pokemon in your team to battle!</p>
            <button onClick={onClose} className="text-blue-600 font-black underline">Return to PC</button>
          </div>
        )}
      </div>
    );
  }

  if (!battle) return null;

  const playerHPPercent = (battle.playerHP / battle.playerMaxHP) * 100;
  const opponentHPPercent = (battle.opponentHP / battle.opponentMaxHP) * 100;

  const getHPColor = (percent: number) => {
    if (percent > 50) return 'bg-green-500';
    if (percent > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className={`bg-gradient-to-b from-blue-300 to-green-100 rounded-[40px] aspect-[16/10] relative overflow-hidden border-8 border-white shadow-2xl ${shake ? 'animate-shake' : ''}`}>
        {/* Arena Stage */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between">
          {/* Opponent Side */}
          <div className="flex justify-end items-start gap-4">
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl shadow-lg border-2 border-gray-200 w-48">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-xs uppercase">{battle.opponent.name}</span>
                <span className="text-[10px] font-bold">Lv.{battle.opponent.level}</span>
              </div>
              <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${getHPColor(opponentHPPercent)}`}
                  style={{ width: `${opponentHPPercent}%` }}
                />
              </div>
            </div>
            <img 
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${battle.opponent.number}.png`} 
              alt="Opponent" 
              className="w-32 h-32 drop-shadow-2xl"
            />
          </div>

          {/* Player Side */}
          <div className="flex justify-start items-end gap-4">
            <img 
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${teamPokemon.find(p => p.id === selectedId)?.speciesNumber}.png`} 
              alt="Player" 
              className="w-48 h-48 drop-shadow-2xl"
            />
            <div className="bg-white/80 backdrop-blur p-4 rounded-2xl shadow-lg border-2 border-gray-200 w-64 mb-10">
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-xs uppercase">{teamPokemon.find(p => p.id === selectedId)?.nickname}</span>
                <span className="text-[10px] font-bold">Lv.{teamPokemon.find(p => p.id === selectedId)?.level}</span>
              </div>
              <div className="w-full bg-gray-300 h-2 rounded-full overflow-hidden mb-1">
                <div 
                  className={`h-full transition-all duration-500 ${getHPColor(playerHPPercent)}`}
                  style={{ width: `${playerHPPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-right font-black text-gray-600">
                {battle.playerHP} / {battle.playerMaxHP} HP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Battle Controls & Log */}
      <div className="bg-white rounded-3xl p-6 shadow-xl border-b-8 border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-gray-50 rounded-2xl p-4 border-2 border-gray-100 h-40 overflow-y-auto font-bold text-gray-700 space-y-1">
          {battle.log.map((line, i) => (
            <div key={i} className={i === battle.log.length - 1 ? "text-blue-600 animate-pulse" : ""}>
              {">"} {line}
            </div>
          ))}
          <div id="battle-log-end"></div>
        </div>

        <div className="md:col-span-4 grid grid-cols-2 gap-2">
          {!battle.isBattleOver ? (
            <>
              <button 
                onClick={() => handleAction('attack')}
                disabled={battle.turn !== 'player'}
                className="bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-xl shadow-lg active:translate-y-1 disabled:opacity-50 transition-all text-xs uppercase"
              >
                Physical
              </button>
              <button 
                onClick={() => handleAction('special')}
                disabled={battle.turn !== 'player'}
                className="bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg active:translate-y-1 disabled:opacity-50 transition-all text-xs uppercase"
              >
                Special
              </button>
              <button 
                onClick={() => handleAction('focus')}
                disabled={battle.turn !== 'player'}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-black py-4 rounded-xl shadow-lg active:translate-y-1 disabled:opacity-50 transition-all text-xs uppercase"
              >
                Focus
              </button>
              <button 
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white font-black py-4 rounded-xl shadow-lg active:translate-y-1 transition-all text-xs uppercase"
              >
                Run
              </button>
            </>
          ) : (
            <button 
              onClick={onClose}
              className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg active:translate-y-1 transition-all uppercase"
            >
              Close Arena
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.5s;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default BattleMode;