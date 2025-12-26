
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pokemon, Team, EVStats, MAX_STAT_EVS, MAX_TOTAL_EVS } from './types';
import { POKEMON_SPECIES_LIST, ACHIEVEMENTS_DATA, getRandomNickname } from './constants';
import { getAICoaching, generatePokemonDescription } from './services/geminiService';
import StatChart from './components/StatChart';
import TrainingGame from './components/TrainingGame';
import TeamView from './components/TeamView';
import BattleMode from './components/BattleMode';

const STORAGE_KEY = 'pokemon-ev-trainer-data';

const App: React.FC = () => {
  const [view, setView] = useState<'trainer' | 'battle'>('trainer');
  
  const [pokemons, setPokemons] = useState<Pokemon[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.pokemons || [];
      } catch (e) {
        console.error("Failed to parse saved pokemons", e);
        return [];
      }
    }
    return [];
  });

  const [activePokemonId, setActivePokemonId] = useState<string | null>(null);
  
  const [team, setTeam] = useState<Team>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.team || { id: 'team-1', name: 'Champion Squad', pokemonIds: [], createdAt: Date.now(), updatedAt: Date.now() };
      } catch (e) {
        console.error("Failed to parse saved team", e);
      }
    }
    return {
      id: 'team-1',
      name: 'Champion Squad',
      pokemonIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  });

  const [coachingText, setCoachingText] = useState<string>("");
  const [isCoachingLoading, setIsCoachingLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingPokemon, setEditingPokemon] = useState<Pokemon | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setIsSaving(true);
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ pokemons, team }));
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [pokemons, team]);

  const activePokemon = useMemo(() => 
    pokemons.find(p => p.id === activePokemonId), [pokemons, activePokemonId]);

  const handleCreatePokemon = async (speciesName: string, nickname: string) => {
    const speciesInfo = POKEMON_SPECIES_LIST.find(s => s.name === speciesName);
    if (!speciesInfo) return;

    const desc = await generatePokemonDescription(speciesName);
    const finalNickname = nickname.trim() || getRandomNickname();
    
    const newPokemon: Pokemon = {
      id: Math.random().toString(36).substr(2, 9),
      nickname: finalNickname,
      species: speciesName,
      speciesNumber: speciesInfo.number,
      level: 1,
      evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
      baseStats: speciesInfo.base,
      description: desc,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      achievements: []
    };

    setPokemons(prev => [...prev, newPokemon]);
    setActivePokemonId(newPokemon.id);
    setShowNewModal(false);
  };

  const handleUpdatePokemon = async (id: string, speciesName: string, nickname: string) => {
    const speciesInfo = POKEMON_SPECIES_LIST.find(s => s.name === speciesName);
    if (!speciesInfo) return;

    setPokemons(prev => prev.map(p => {
      if (p.id !== id) return p;
      const finalNickname = nickname.trim() || getRandomNickname();
      return {
        ...p,
        species: speciesName,
        speciesNumber: speciesInfo.number,
        nickname: finalNickname,
        baseStats: speciesInfo.base,
        updatedAt: Date.now()
      };
    }));
    setEditingPokemon(null);
  };

  const handleDeletePokemon = (id: string) => {
    setPokemons(prev => prev.filter(p => p.id !== id));
    setTeam(prev => ({
      ...prev,
      pokemonIds: prev.pokemonIds.filter(pid => pid !== id)
    }));
    if (activePokemonId === id) setActivePokemonId(null);
    setShowDeleteConfirm(null);
  };

  const handleTrain = useCallback((stat: keyof EVStats, amount: number) => {
    if (!activePokemonId) return;

    setPokemons(prev => prev.map(p => {
      if (p.id !== activePokemonId) return p;

      const totalEVs = (Object.values(p.evs) as number[]).reduce((a, b) => a + b, 0);
      const remainingTotal = MAX_TOTAL_EVS - totalEVs;
      const remainingStat = MAX_STAT_EVS - p.evs[stat];
      const actualAmount = Math.min(amount, remainingTotal, remainingStat);

      if (actualAmount <= 0) return p;

      const newEvs = { ...p.evs, [stat]: p.evs[stat] + actualAmount };
      const newTotal = (Object.values(newEvs) as number[]).reduce((a, b) => a + b, 0);
      
      const newLevel = Math.min(100, p.level + (newTotal > p.level * 5 ? 1 : 0));

      return {
        ...p,
        evs: newEvs,
        level: newLevel,
        updatedAt: Date.now()
      };
    }));
  }, [activePokemonId]);

  const handleBattleWin = (id: string, evStat: keyof EVStats) => {
    setPokemons(prev => prev.map(p => {
      if (p.id !== id) return p;
      
      const totalEVs = (Object.values(p.evs) as number[]).reduce((a, b) => a + b, 0);
      const amount = Math.min(4, MAX_TOTAL_EVS - totalEVs, MAX_STAT_EVS - p.evs[evStat]);
      
      const newEvs = { ...p.evs, [evStat]: p.evs[evStat] + amount };
      const newTotal = (Object.values(newEvs) as number[]).reduce((a, b) => a + b, 0);
      const newLevel = Math.min(100, p.level + 1); // Reward level up on win

      return { ...p, evs: newEvs, level: newLevel, updatedAt: Date.now() };
    }));
  };

  const handleToggleTeam = (id: string) => {
    setTeam(prev => {
      const exists = prev.pokemonIds.includes(id);
      if (exists) {
        return { ...prev, pokemonIds: prev.pokemonIds.filter(pid => pid !== id) };
      } else if (prev.pokemonIds.length < 6) {
        return { ...prev, pokemonIds: [...prev.pokemonIds, id] };
      }
      return prev;
    });
  };

  const fetchCoaching = async () => {
    if (!activePokemon) return;
    setIsCoachingLoading(true);
    const text = await getAICoaching(activePokemon);
    setCoachingText(text);
    setIsCoachingLoading(false);
  };

  useEffect(() => {
    if (activePokemonId) {
      setCoachingText("");
    }
  }, [activePokemonId]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-red-600 text-white p-6 shadow-xl pixel-border mb-8 sticky top-0 z-40">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="pokemon-font text-xl md:text-2xl tracking-tighter">EV TRAINER</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm opacity-90 font-bold uppercase">Game Edition v2.0</p>
                {isSaving && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded animate-pulse">Saving...</span>}
              </div>
            </div>
            <nav className="flex bg-red-700 p-1 rounded-xl">
              <button 
                onClick={() => setView('trainer')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${view === 'trainer' ? 'bg-white text-red-600 shadow-md' : 'text-white/70 hover:text-white'}`}
              >
                Train
              </button>
              <button 
                onClick={() => setView('battle')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${view === 'battle' ? 'bg-white text-red-600 shadow-md' : 'text-white/70 hover:text-white'}`}
              >
                Battle
              </button>
            </nav>
          </div>
          <button 
            onClick={() => setShowNewModal(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-blue-800 font-black px-4 py-2 rounded-xl transition-all shadow-[4px_4px_0px_#1e3a8a] active:translate-y-1 active:shadow-none"
          >
            + NEW POKÉMON
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4">
        {view === 'trainer' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Team & List */}
            <div className="lg:col-span-4 space-y-8">
              <TeamView 
                team={team} 
                allPokemon={pokemons} 
                onRemove={handleToggleTeam} 
                onSelect={setActivePokemonId}
              />
              
              <div className="bg-white rounded-3xl p-6 shadow-lg border-b-8 border-gray-200">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="bg-red-100 p-1 rounded">📦</span> PC Storage
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {pokemons.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setActivePokemonId(p.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${activePokemonId === p.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:border-blue-200'}`}
                    >
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.speciesNumber}.png`} 
                        alt={p.species} 
                        className="w-12 h-12"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate text-gray-800">{p.nickname}</div>
                        <div className="text-xs text-gray-500 font-bold uppercase">LV.{p.level} • {p.species}</div>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingPokemon(p); }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-100 transition-colors"
                          title="Edit Profile"
                        >
                          ✎
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleTeam(p.id); }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xl transition-colors ${team.pokemonIds.includes(p.id) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                          title={team.pokemonIds.includes(p.id) ? "Remove from Team" : "Add to Team"}
                        >
                          {team.pokemonIds.includes(p.id) ? '✓' : '+'}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pokemons.length === 0 && (
                    <div className="text-center py-8 text-gray-400 font-bold italic">
                      Storage is empty. <br/>Add a Pokémon to start!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Training & Stats */}
            <div className="lg:col-span-8 space-y-8">
              {activePokemon ? (
                <>
                  <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-b-8 border-gray-200">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button 
                          onClick={() => setEditingPokemon(activePokemon)}
                          className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all text-sm font-bold px-3 py-1"
                          title="Edit Pokémon"
                        >
                          ✎ Edit
                        </button>
                        <button 
                          onClick={() => setShowDeleteConfirm(activePokemon.id)}
                          className="bg-red-500/80 hover:bg-red-500 p-2 rounded-lg transition-all text-sm font-bold px-3 py-1"
                          title="Release Pokémon"
                        >
                          🗑 Release
                        </button>
                      </div>
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
                          <img 
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${activePokemon.speciesNumber}.png`} 
                            alt={activePokemon.species}
                            className="w-40 h-40 relative z-10 drop-shadow-2xl"
                          />
                        </div>
                        <div className="text-center md:text-left">
                          <div className="flex items-center justify-center md:justify-start gap-3">
                            <h2 className="text-3xl font-black">{activePokemon.nickname}</h2>
                            <span className="bg-white/20 px-3 py-1 rounded-lg text-sm font-bold">LV. {activePokemon.level}</span>
                          </div>
                          <p className="mt-2 text-white/90 text-sm italic max-w-md">"{activePokemon.description}"</p>
                          <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase shadow-sm">#{activePokemon.speciesNumber.toString().padStart(3, '0')}</span>
                            <span className="bg-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase">TOTAL EVS: {(Object.values(activePokemon.evs) as number[]).reduce((a, b) => a + b, 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <span className="text-blue-500">📊</span> Stat Distribution
                        </h3>
                        <StatChart evs={activePokemon.evs} />
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {Object.entries(activePokemon.evs).map(([key, val]) => (
                            <div key={key} className="flex justify-between p-2 bg-gray-50 rounded-lg text-xs font-bold">
                              <span className="text-gray-500 uppercase">{key}</span>
                              <span className="text-blue-600">{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <span className="text-yellow-500">🏆</span> AI Coach Pro
                          </h3>
                          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-2xl min-h-[120px] flex flex-col justify-between">
                            {isCoachingLoading ? (
                              <div className="flex items-center justify-center h-full">
                                <div className="animate-bounce text-yellow-600 font-bold">Consulting the experts...</div>
                              </div>
                            ) : (
                              <>
                                <p className="text-gray-700 font-semibold leading-relaxed">
                                  {coachingText || "Ready for some expert advice on your training strategy?"}
                                </p>
                                {!coachingText && (
                                  <button 
                                    onClick={fetchCoaching}
                                    className="mt-4 self-end text-sm text-yellow-700 font-black hover:underline"
                                  >
                                    GET STRATEGY →
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <TrainingGame 
                          currentEVs={activePokemon.evs} 
                          onTrain={handleTrain} 
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-lg border-b-8 border-gray-200">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-5xl">🔍</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Pokémon Selected</h2>
                  <p className="text-gray-500 font-medium mb-8">Select a Pokémon from your storage or create a new one to start training.</p>
                  <button 
                    onClick={() => setShowNewModal(true)}
                    className="bg-blue-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
                  >
                    + ADD YOUR FIRST POKÉMON
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <BattleMode 
            team={team} 
            allPokemon={pokemons} 
            onWin={handleBattleWin}
            onClose={() => setView('trainer')}
          />
        )}
      </main>

      {/* Modals... (omitted for brevity, same as before) */}
      {(showNewModal || editingPokemon) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" onClick={() => { setShowNewModal(false); setEditingPokemon(null); }}></div>
          <div className="bg-white rounded-[40px] w-full max-w-md relative z-10 shadow-2xl pixel-border overflow-hidden">
            <div className="bg-blue-600 p-6 text-white text-center">
              <h2 className="pokemon-font text-lg uppercase tracking-tight">
                {editingPokemon ? 'Edit Profile' : 'New Pokémon'}
              </h2>
            </div>
            <form className="p-8 space-y-6" onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as any;
              if (editingPokemon) {
                handleUpdatePokemon(editingPokemon.id, form.species.value, form.nickname.value);
              } else {
                handleCreatePokemon(form.species.value, form.nickname.value);
              }
            }}>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Species</label>
                <select 
                  name="species" 
                  defaultValue={editingPokemon?.species || POKEMON_SPECIES_LIST[0].name}
                  className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-bold text-gray-700 focus:border-blue-500 outline-none appearance-none cursor-pointer"
                >
                  {POKEMON_SPECIES_LIST.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 flex justify-between">
                  <span>Nickname</span>
                  <span className="text-[10px] text-blue-500">Optional</span>
                </label>
                <input 
                  name="nickname"
                  type="text" 
                  defaultValue={editingPokemon?.nickname || ""}
                  placeholder="Leave empty for a surprise!" 
                  className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl font-bold text-gray-700 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => { setShowNewModal(false); setEditingPokemon(null); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-4 rounded-2xl transition-all"
                >
                  CANCEL
                </button>
                <button type="submit" className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg transition-all active:scale-95">
                  {editingPokemon ? 'SAVE CHANGES' : 'ADD TO PC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-900/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}></div>
          <div className="bg-white rounded-[40px] w-full max-w-sm relative z-10 shadow-2xl pixel-border p-8 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🍃</span>
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">Release Pokémon?</h2>
            <p className="text-gray-500 mb-8 font-medium">Are you sure you want to release {pokemons.find(p => p.id === showDeleteConfirm)?.nickname}? This cannot be undone.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-black py-3 rounded-2xl transition-all"
              >
                KEEP
              </button>
              <button 
                onClick={() => handleDeletePokemon(showDeleteConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-2xl shadow-lg transition-all"
              >
                RELEASE
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-6 right-6 lg:hidden">
        <button 
          onClick={() => setShowNewModal(true)}
          className="w-16 h-16 bg-yellow-400 rounded-full shadow-2xl flex items-center justify-center text-4xl text-blue-800 border-4 border-white"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default App;
