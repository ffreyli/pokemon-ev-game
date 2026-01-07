
import React, { useState, useEffect, useRef } from 'react';
import { Pokemon, MultiplayerBattleState, BattleMessage, StatKey, Generation } from '../types';
import { calculateActualStat, MOVE_DATABASE, isSpecialTypeGen3, getEffectiveness } from '../constants';

interface MultiplayerBattleProps {
  generation: Generation;
  team: Pokemon[];
  roomId: string;
  onClose: () => void;
}

const MultiplayerBattle: React.FC<MultiplayerBattleProps> = ({ generation, team, roomId, onClose }) => {
  const [battleState, setBattleState] = useState<MultiplayerBattleState | null>(null);
  const [playerRole, setPlayerRole] = useState<'player1' | 'player2' | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const channel = new BroadcastChannel(`poke-battle-${roomId}`);
    channelRef.current = channel;

    channel.postMessage({ type: 'JOIN', name: 'Trainer', team } as BattleMessage);

    channel.onmessage = (event) => {
      const msg = event.data as BattleMessage;
      handleMessage(msg);
    };

    return () => channel.close();
  }, [roomId, team]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [battleState?.log]);

  const handleMessage = (msg: BattleMessage) => {
    switch (msg.type) {
      case 'JOIN':
        if (!battleState) {
          const initialState: MultiplayerBattleState = {
            roomId,
            generation,
            player1: { 
              name: 'Me', team, ready: false, activeIndex: 0, 
              hp: team.map(p => calculateActualStat('hp', p.baseStats.hp, p.ivs.hp, p.evs.hp, p.level, p.nature)) 
            },
            player2: { 
              name: msg.name, team: msg.team, ready: false, activeIndex: 0, 
              hp: msg.team.map(p => calculateActualStat('hp', p.baseStats.hp, p.ivs.hp, p.evs.hp, p.level, p.nature)) 
            },
            turn: 1,
            phase: 'lobby',
            log: [`${msg.name} connected. Battle Gen: ${generation}`]
          };
          setBattleState(initialState);
          setPlayerRole('player1');
          channelRef.current?.postMessage({ type: 'SYNC', state: initialState } as BattleMessage);
        }
        break;
      case 'SYNC':
        if (!playerRole) {
          setBattleState(msg.state);
          setPlayerRole('player2');
        }
        break;
      case 'SET_GEN':
        if (battleState) setBattleState({ ...battleState, generation: msg.gen });
        break;
      case 'MOVE_SELECT':
        setBattleState(prev => {
          if (!prev) return prev;
          const role = playerRole === 'player1' ? 'player2' : 'player1';
          const newState = { ...prev };
          newState[role] = { ...newState[role], selectedMove: msg.move };
          if (newState.player1.selectedMove && newState.player2.selectedMove) return resolveTurn(newState);
          return newState;
        });
        break;
      case 'READY':
        setBattleState(prev => {
          if (!prev) return prev;
          const role = playerRole === 'player1' ? 'player2' : 'player1';
          const newState = { ...prev };
          newState[role] = { ...newState[role], ready: true };
          if (newState.player1.ready && newState.player2.ready) {
            newState.phase = 'selecting';
            newState.log.push('Engage! Selecting moves...');
          }
          return newState;
        });
        break;
    }
  };

  const calculateDamage = (attacker: Pokemon, defender: Pokemon, moveName: string, gen: Generation): number => {
    const move = MOVE_DATABASE[moveName] || MOVE_DATABASE["Tackle"];
    const level = attacker.level;
    const power = move.power;
    let atkStat: StatKey = 'attack';
    let defStat: StatKey = 'defense';
    if (gen === 'GEN1' || gen === 'GEN3') {
      const isSpecial = isSpecialTypeGen3(move.type);
      atkStat = isSpecial ? 'spAttack' : 'attack';
      defStat = isSpecial ? 'spDefense' : 'defense';
    } else {
      atkStat = move.category === 'Special' ? 'spAttack' : 'attack';
      defStat = move.category === 'Special' ? 'spDefense' : 'defense';
    }
    const A = calculateActualStat(atkStat, attacker.baseStats[atkStat], attacker.ivs[atkStat], attacker.evs[atkStat], attacker.level, attacker.nature);
    const D = calculateActualStat(defStat, defender.baseStats[defStat], defender.ivs[defStat], defender.evs[defStat], defender.level, defender.nature);
    let damage = Math.floor(Math.floor(Math.floor(2 * level / 5 + 2) * power * A / D) / 50) + 2;
    damage = Math.floor(damage * getEffectiveness(move.type, defender.species, gen));
    return Math.max(1, damage);
  };

  const resolveTurn = (state: MultiplayerBattleState): MultiplayerBattleState => {
    const newState = { ...state };
    const p1Active = newState.player1.team[newState.player1.activeIndex];
    const p2Active = newState.player2.team[newState.player2.activeIndex];
    const p1Speed = calculateActualStat('speed', p1Active.baseStats.speed, p1Active.ivs.speed, p1Active.evs.speed, p1Active.level, p1Active.nature);
    const p2Speed = calculateActualStat('speed', p2Active.baseStats.speed, p2Active.ivs.speed, p2Active.evs.speed, p2Active.level, p2Active.nature);

    const order = p1Speed >= p2Speed ? ['player1', 'player2'] : ['player2', 'player1'];
    order.forEach(atkKey => {
      const defKey = atkKey === 'player1' ? 'player2' : 'player1';
      const atk = newState[atkKey as 'player1'|'player2'];
      const def = newState[defKey as 'player1'|'player2'];
      if (def.hp[def.activeIndex] > 0) {
        const damage = calculateDamage(atk.team[atk.activeIndex], def.team[def.activeIndex], atk.selectedMove!, newState.generation);
        def.hp[def.activeIndex] = Math.max(0, def.hp[def.activeIndex] - damage);
        newState.log.push(`${atk.name}'s ${atk.team[atk.activeIndex].species} used ${atk.selectedMove}!`);
      }
    });

    newState.player1.selectedMove = undefined;
    newState.player2.selectedMove = undefined;
    newState.turn += 1;
    if (newState.player1.hp.every(h => h === 0) || newState.player2.hp.every(h => h === 0)) newState.phase = 'finished';
    return newState;
  };

  const selectMove = (move: string) => {
    if (!battleState || !playerRole || battleState.phase !== 'selecting') return;
    const newState = { ...battleState };
    newState[playerRole].selectedMove = move;
    setBattleState(newState);
    channelRef.current?.postMessage({ type: 'MOVE_SELECT', move, index: activeIdx } as BattleMessage);
    if (newState.player1.selectedMove && newState.player2.selectedMove) setBattleState(resolveTurn(newState));
  };

  if (!battleState) return <div className="p-20 text-center font-black animate-pulse">Establishing Connection...</div>;

  const me = battleState[playerRole!];
  const opponent = battleState[playerRole === 'player1' ? 'player2' : 'player1'];
  const activeIdx = me.activeIndex;
  const oppIdx = opponent.activeIndex;

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-3xl border-2 border-slate-200">
        <span className="font-black text-xs uppercase text-slate-400">Gen: {battleState.generation} / Room: {roomId}</span>
        <span className="text-xs font-black text-orange-600 uppercase">{battleState.phase}</span>
      </div>

      <div className="relative aspect-video rounded-[50px] overflow-hidden border-8 border-white shadow-2xl bg-gradient-to-b from-slate-100 to-slate-200">
        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${opponent.team[oppIdx].speciesNumber}.png`} className="absolute top-20 right-20 w-48 h-48 drop-shadow-xl" />
        <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${me.team[activeIdx].speciesNumber}.png`} className="absolute bottom-10 left-20 w-64 h-64 drop-shadow-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 bg-white border-2 border-slate-200 rounded-[40px] p-6 h-60 overflow-y-auto font-bold text-xs space-y-2">
          {battleState.log.map((line, i) => <div key={i}>{">"} {line}</div>)}
          <div ref={logEndRef} />
        </div>
        <div className="md:col-span-4 flex flex-col gap-3">
          {battleState.phase === 'lobby' ? (
            <button onClick={() => { 
              const newState = { ...battleState }; newState[playerRole!].ready = true; 
              setBattleState(newState); channelRef.current?.postMessage({ type: 'READY' } as BattleMessage);
            }} disabled={me.ready} className="bg-orange-500 text-white font-black py-4 rounded-3xl uppercase">{me.ready ? 'Waiting...' : 'Ready up'}</button>
          ) : battleState.phase === 'selecting' ? (
            <div className="grid grid-cols-2 gap-2">
              {me.team[activeIdx].moves.map((move, i) => (
                <button key={i} onClick={() => selectMove(move)} disabled={!!me.selectedMove || !move} className="bg-white border-2 border-slate-100 rounded-2xl p-4 font-black text-[10px] uppercase">{move || '---'}</button>
              ))}
            </div>
          ) : (
            <button onClick={onClose} className="bg-slate-900 text-white font-black py-4 rounded-3xl uppercase">Exit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerBattle;
