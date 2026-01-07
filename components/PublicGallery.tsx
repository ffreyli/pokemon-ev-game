
import React, { useState } from 'react';
import { SAMPLE_PUBLIC_TEAMS, STAT_LABELS } from '../constants';
import { getAICoaching } from '../services/geminiService';
import { StatKey } from '../types';

interface PublicGalleryProps {
  onAction: (teamData: any, action: 'draft' | 'battle') => void;
}

const PublicGallery: React.FC<PublicGalleryProps> = ({ onAction }) => {
  const [scouting, setScouting] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [inspectingTeam, setInspectingTeam] = useState<string | null>(null);

  const handleScout = async (team: any) => {
    setLoading(team.id);
    const firstPkmn = { 
      nickname: team.pokemons[0].species,
      species: team.pokemons[0].species,
      level: 100,
      evs: team.pokemons[0].evs,
      ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
      baseStats: { hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 }
    };
    const report = await getAICoaching(firstPkmn as any);
    setScouting(prev => ({ ...prev, [team.id]: `SYNERGY REPORT: ${report}` }));
    setLoading(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-700 p-4 md:p-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">CHAMPION'S EXHIBIT</h2>
        <p className="text-slate-500 font-bold text-lg">Browse and battle against community-curated teams from the Hall of Fame.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {SAMPLE_PUBLIC_TEAMS.map((team) => (
          <div key={team.id} className="bg-white rounded-[50px] border-4 border-slate-200 shadow-xl overflow-hidden flex flex-col group transition-all hover:border-red-400">
            <div className="p-8 border-b-4 border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">{team.name}</h3>
                <p className="text-xs font-black text-red-600 uppercase tracking-widest mt-1">Compiled by {team.author}</p>
              </div>
              <button 
                onClick={() => setInspectingTeam(inspectingTeam === team.id ? null : team.id)}
                className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-tighter hover:bg-red-600 transition-colors"
              >
                {inspectingTeam === team.id ? 'Hide Details' : 'Inspect Squad'}
              </button>
            </div>

            <div className="p-8 space-y-8 flex-1">
              {/* Squad Preview Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {team.pokemons.map((p, i) => (
                  <div key={i} className="flex flex-col items-center bg-slate-50 p-3 rounded-3xl border-2 border-transparent hover:border-red-200 transition-all">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.number}.png`} 
                      className="w-16 h-16 object-contain drop-shadow-md"
                      alt={p.species}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png' }}
                    />
                    <span className="text-[9px] font-black text-slate-500 uppercase mt-1 truncate w-full text-center">{p.species}</span>
                  </div>
                ))}
              </div>

              {/* Detailed View - Triggered by Inspect */}
              {inspectingTeam === team.id && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top duration-500 border-t-2 border-slate-100 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {team.pokemons.map((p, i) => (
                      <div key={i} className="bg-slate-50 p-5 rounded-3xl border-2 border-slate-200 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                          <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.number}.png`} className="w-12 h-12" />
                          <div>
                            <h4 className="font-black text-xs uppercase text-slate-900">{p.species} <span className="text-slate-400">@ {p.item}</span></h4>
                            <p className="text-[9px] font-bold text-red-600 uppercase">{p.ability} / {p.nature}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {p.moves.map((m, mi) => (
                            <div key={mi} className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-[8px] font-black uppercase text-slate-500 truncate">{m || '---'}</div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {(Object.keys(p.evs) as StatKey[]).filter(k => p.evs[k] > 0).map(k => (
                            <span key={k} className="text-[7px] font-black bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                              {p.evs[k]} {STAT_LABELS[k]}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {scouting[team.id] ? (
                <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 animate-in zoom-in duration-300">
                  <p className="text-sm font-bold text-red-900 leading-relaxed italic">"{scouting[team.id]}"</p>
                </div>
              ) : (
                <button 
                  onClick={() => handleScout(team)}
                  disabled={loading === team.id}
                  className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 font-black text-xs uppercase hover:border-red-400 hover:text-red-600 transition-all rounded-3xl"
                >
                  {loading === team.id ? 'Analyzing Team Synergy...' : 'CONSULT AI SCOUT →'}
                </button>
              )}
            </div>

            <div className="p-8 bg-slate-50 flex gap-4 border-t-4 border-slate-100">
              <button 
                onClick={() => onAction(team, 'draft')}
                className="flex-1 bg-white border-2 border-slate-200 py-5 rounded-3xl font-black text-sm uppercase hover:bg-slate-900 hover:text-white transition-all shadow-sm"
              >
                Draft Squad
              </button>
              <button 
                onClick={() => onAction(team, 'battle')}
                className="flex-1 bg-red-600 text-white py-5 rounded-3xl font-black text-sm uppercase shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
              >
                Battle Team
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicGallery;
