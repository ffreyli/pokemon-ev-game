
import React, { useState } from 'react';
import { SAMPLE_PUBLIC_TEAMS } from '../constants';
import { getAICoaching } from '../services/geminiService';

interface PublicGalleryProps {
  onAction: (teamData: any, action: 'draft' | 'battle') => void;
}

const PublicGallery: React.FC<PublicGalleryProps> = ({ onAction }) => {
  const [scouting, setScouting] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const handleScout = async (team: any) => {
    setLoading(team.id);
    // Use the first pokemon's species for the scouting prompt
    const firstPkmn = { 
      nickname: team.pokemons[0].species,
      species: team.pokemons[0].species,
      level: 100,
      evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
      ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
      baseStats: { hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 }
    };
    const report = await getAICoaching(firstPkmn as any);
    setScouting(prev => ({ ...prev, [team.id]: `SYNERGY REPORT: This team relies on ${team.name} core strengths. ${report}` }));
    setLoading(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom duration-700">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">CHAMPION'S EXHIBIT</h2>
        <p className="text-slate-500 font-medium">Browse and battle against community-curated teams from the Hall of Fame.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {SAMPLE_PUBLIC_TEAMS.map((team) => (
          <div key={team.id} className="bg-white rounded-[40px] border-2 border-slate-200 shadow-sm overflow-hidden flex flex-col group">
            <div className="p-8 border-b-2 border-slate-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{team.name}</h3>
                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mt-1">Drafted by {team.author}</p>
              </div>
              <div className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase">
                VGC S1
              </div>
            </div>

            <div className="p-8 space-y-8 flex-1">
              <div className="flex flex-wrap gap-4">
                {team.pokemons.map((p, i) => (
                  <div key={i} className="flex flex-col items-center bg-slate-50 p-3 rounded-2xl border-2 border-transparent group-hover:border-red-100 transition-all">
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.number}.png`} 
                      className="w-12 h-12 object-contain"
                      alt={p.species}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png' }}
                    />
                    <span className="text-[9px] font-black text-slate-500 uppercase mt-1">{p.species}</span>
                  </div>
                ))}
              </div>

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
                  {loading === team.id ? 'Analyzing Team Synergy...' : 'GET SCOUTING REPORT →'}
                </button>
              )}
            </div>

            <div className="p-8 bg-slate-50 flex gap-4">
              <button 
                onClick={() => onAction(team, 'draft')}
                className="flex-1 bg-white border-2 border-slate-200 py-4 rounded-2xl font-black text-xs uppercase hover:bg-slate-100 transition-all"
              >
                Draft Squad
              </button>
              <button 
                onClick={() => onAction(team, 'battle')}
                className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-red-200 hover:bg-red-700 transition-all"
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
