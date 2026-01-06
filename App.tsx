
import React, { useState, useEffect, useRef } from 'react';
import { Pokemon, Team, StatKey, MAX_STAT_EVS, MAX_IV, MAX_TOTAL_EVS } from './types';
import { POKEMON_SPECIES_LIST, NATURES, calculateActualStat, STAT_LABELS } from './constants';
import { exportToShowdown, parseShowdown } from './services/showdownParser';
import BattleMode from './components/BattleMode';
import PublicGallery from './components/PublicGallery';
import LandingPage from './components/LandingPage';

const TEAMS_STORAGE_KEY = 'champion-lab-teams-v4';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'lab' | 'arena' | 'gallery'>('home');
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [{ id: 'default', name: 'My First Team', pokemons: [], updatedAt: Date.now() }];
  });

  const [activeTeamId, setActiveTeamId] = useState<string>(teams[0]?.id || 'default');
  const [activePkmnIndex, setActivePkmnIndex] = useState<number>(0);
  const [showImportExport, setShowImportExport] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [challengeTeam, setChallengeTeam] = useState<Pokemon[] | null>(null);
  
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [allSpeciesNames, setAllSpeciesNames] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const currentTeam = teams.find(t => t.id === activeTeamId) || teams[0];
  const activePkmn = currentTeam.pokemons[activePkmnIndex];

  useEffect(() => {
    const fetchAllNames = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1302');
        const data = await res.json();
        setAllSpeciesNames(data.results.map((r: any) => r.name));
      } catch (e) {
        console.error("Failed to fetch species list", e);
      }
    };
    fetchAllNames();
  }, []);

  useEffect(() => {
    if (speciesSearch.length > 1) {
      const filtered = allSpeciesNames
        .filter(name => name.toLowerCase().includes(speciesSearch.toLowerCase()))
        .slice(0, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [speciesSearch, allSpeciesNames]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
  }, [teams]);

  const createDefaultPokemon = (speciesData: any): Pokemon => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      nickname: speciesData.name.charAt(0).toUpperCase() + speciesData.name.slice(1),
      species: speciesData.name,
      speciesNumber: speciesData.id,
      level: 100,
      item: "",
      ability: speciesData.abilities?.[0]?.ability?.name || "",
      nature: "Serious",
      gender: "M",
      shiny: false,
      evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
      ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
      moves: ["", "", "", ""],
      baseStats: {
        hp: speciesData.stats.find((s: any) => s.stat.name === 'hp').base_stat,
        attack: speciesData.stats.find((s: any) => s.stat.name === 'attack').base_stat,
        defense: speciesData.stats.find((s: any) => s.stat.name === 'defense').base_stat,
        spAttack: speciesData.stats.find((s: any) => s.stat.name === 'special-attack').base_stat,
        spDefense: speciesData.stats.find((s: any) => s.stat.name === 'special-defense').base_stat,
        speed: speciesData.stats.find((s: any) => s.stat.name === 'speed').base_stat,
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  };

  const fetchAndAddSpecies = async (name: string) => {
    if (currentTeam.pokemons.length >= 6) return;
    setIsSearching(true);
    setShowSuggestions(false);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      if (!res.ok) throw new Error("Species not found");
      const data = await res.json();
      if (data) {
        const newPkmn = createDefaultPokemon(data);
        const updatedTeams = teams.map(t => t.id === activeTeamId ? {
          ...t,
          pokemons: [...t.pokemons, newPkmn],
          updatedAt: Date.now()
        } : t);
        setTeams(updatedTeams);
        setActivePkmnIndex(currentTeam.pokemons.length);
        setSpeciesSearch("");
      }
    } catch (err) {
      alert("Could not find that Pokémon. Check spelling!");
    } finally {
      setIsSearching(false);
    }
  };

  const updateActivePkmn = (patch: Partial<Pokemon>) => {
    const updatedTeams = teams.map(t => t.id === activeTeamId ? {
      ...t,
      pokemons: t.pokemons.map((p, i) => i === activePkmnIndex ? { ...p, ...patch, updatedAt: Date.now() } : p),
      updatedAt: Date.now()
    } : t);
    setTeams(updatedTeams);
  };

  const updateStat = (type: 'evs' | 'ivs', key: StatKey, val: number) => {
    const current = activePkmn[type];
    if (type === 'evs') {
      const otherTotal = (Object.entries(current) as [StatKey, number][]).filter(([k]) => k !== key).reduce((a, b) => a + b[1], 0);
      val = Math.min(val, MAX_STAT_EVS, MAX_TOTAL_EVS - otherTotal);
    } else {
      val = Math.min(val, MAX_IV);
    }
    updateActivePkmn({ [type]: { ...current, [key]: val } });
  };

  const createNewTeam = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTeam: Team = { id: newId, name: 'Untitled Team', pokemons: [], updatedAt: Date.now() };
    setTeams([...teams, newTeam]);
    setActiveTeamId(newId);
    setActivePkmnIndex(0);
  };

  const deleteTeam = (id: string) => {
    if (teams.length <= 1) return;
    const filtered = teams.filter(t => t.id !== id);
    setTeams(filtered);
    if (activeTeamId === id) setActiveTeamId(filtered[0].id);
  };

  const handleImport = (text: string = pasteText) => {
    const parsed = parseShowdown(text);
    const valid = parsed.map(p => ({
      id: Math.random().toString(36).substr(2, 9),
      nickname: p.nickname || p.species || 'Unknown',
      species: p.species || 'unknown',
      speciesNumber: p.speciesNumber || 1,
      level: p.level || 100,
      item: p.item || "",
      ability: p.ability || "",
      nature: p.nature || "Serious",
      gender: "M",
      shiny: p.shiny || false,
      evs: p.evs || { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
      ivs: p.ivs || { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
      moves: p.moves || ["", "", "", ""],
      baseStats: p.baseStats || { hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }));
    
    const updatedTeams = teams.map(t => t.id === activeTeamId ? {
      ...t,
      pokemons: valid as Pokemon[],
      updatedAt: Date.now()
    } : t);
    setTeams(updatedTeams);
    setShowImportExport(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Dynamic Header */}
      <header className="bg-red-600 text-white shadow-md z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => setView('home')} 
              className="text-xl font-black italic border-2 border-white px-2 py-0.5 tracking-tighter hover:bg-white hover:text-red-600 transition-colors"
            >
              CHAMPION HUB
            </button>
            <nav className="hidden sm:flex items-center gap-1 bg-red-700/40 p-1 rounded-xl">
              <button onClick={() => setView('home')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'home' ? 'bg-white text-red-600 shadow-sm' : 'text-white/70 hover:text-white'}`}>Home</button>
              <button onClick={() => setView('lab')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'lab' ? 'bg-white text-red-600 shadow-sm' : 'text-white/70 hover:text-white'}`}>The Lab</button>
              <button onClick={() => setView('gallery')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'gallery' ? 'bg-white text-red-600 shadow-sm' : 'text-white/70 hover:text-white'}`}>The Exhibit</button>
              <button onClick={() => { setChallengeTeam(null); setView('arena'); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'arena' ? 'bg-white text-red-600 shadow-sm' : 'text-white/70 hover:text-white'}`}>The Stadium</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {view === 'lab' && (
              <>
                <button onClick={() => setShowImportExport(true)} className="text-white/80 hover:text-white font-bold text-xs uppercase">IO</button>
                <div className="h-6 w-px bg-white/20"></div>
                <button onClick={createNewTeam} className="bg-white text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md active:translate-y-0.5 transition-all">New Team</button>
              </>
            )}
            {view !== 'lab' && (
              <button 
                onClick={() => setView('lab')}
                className="bg-white text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md active:translate-y-0.5 transition-all"
              >
                Go to Lab
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Teams Sidebar (Conditional for Lab view) */}
        {view === 'lab' && (
          <aside className="w-64 bg-white border-r-2 border-slate-200 flex flex-col p-4 gap-4 overflow-y-auto hidden lg:flex">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Saved Squads</h3>
            <div className="flex flex-col gap-2">
              {teams.map(team => (
                <div 
                  key={team.id}
                  onClick={() => setActiveTeamId(team.id)}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer group flex flex-col gap-1 ${activeTeamId === team.id ? 'bg-red-50 border-red-500 shadow-sm' : 'bg-slate-50 border-transparent hover:border-slate-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`font-black text-xs truncate ${activeTeamId === team.id ? 'text-red-700' : 'text-slate-600'}`}>{team.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteTeam(team.id); }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 text-xs">✕</button>
                  </div>
                  <div className="flex gap-1 overflow-hidden">
                    {team.pokemons.slice(0, 6).map((p, idx) => (
                      <img key={idx} src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.speciesNumber}.png`} className="w-5 h-5 grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100" alt="" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          {view === 'home' ? (
            <LandingPage 
              onNavigate={(v) => setView(v)} 
              teamCount={currentTeam.pokemons.length}
            />
          ) : view === 'lab' ? (
            <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
              {/* Team Identity Bar with Search Suggestions */}
              <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 flex justify-between items-center shadow-sm relative">
                <input 
                  value={currentTeam.name} 
                  onChange={(e) => setTeams(teams.map(t => t.id === activeTeamId ? {...t, name: e.target.value} : t))}
                  className="bg-transparent text-xl font-black text-slate-800 outline-none focus:text-red-600 w-1/2"
                />
                
                <div className="flex items-center gap-3 relative" ref={searchContainerRef}>
                  <div className="relative">
                    <input 
                      placeholder="Search any Pokémon..." 
                      className="bg-slate-100 border-2 border-transparent focus:border-red-400 focus:bg-white px-4 py-2 rounded-xl text-xs font-bold outline-none w-48 transition-all"
                      value={speciesSearch}
                      onChange={(e) => setSpeciesSearch(e.target.value)}
                      onFocus={() => speciesSearch.length > 1 && setShowSuggestions(true)}
                      onKeyDown={(e) => e.key === 'Enter' && fetchAndAddSpecies(speciesSearch)}
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 w-full bg-white border-2 border-slate-100 rounded-2xl shadow-xl mt-2 py-2 z-[100] animate-in fade-in zoom-in duration-200">
                        {filteredSuggestions.map(name => (
                          <button
                            key={name}
                            onClick={() => fetchAndAddSpecies(name)}
                            className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-600 text-[10px] font-black uppercase transition-colors flex items-center gap-3"
                          >
                            <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                            {name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    disabled={isSearching || currentTeam.pokemons.length >= 6}
                    onClick={() => fetchAndAddSpecies(speciesSearch)}
                    className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase disabled:opacity-50 min-w-[64px]"
                  >
                    {isSearching ? '...' : 'Add'}
                  </button>
                </div>
              </div>

              {/* Squad Bar */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {[...Array(6)].map((_, i) => (
                  <div 
                    key={i} 
                    onClick={() => currentTeam.pokemons[i] && setActivePkmnIndex(i)}
                    className={`h-24 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center p-2 ${activePkmnIndex === i ? 'bg-red-50 border-red-500 shadow-md ring-4 ring-red-500/10' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}
                  >
                    {currentTeam.pokemons[i] ? (
                      <>
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentTeam.pokemons[i].shiny ? 'shiny/' : ''}${currentTeam.pokemons[i].speciesNumber}.png`} 
                          className="w-14 h-14 object-contain drop-shadow-md"
                          onError={(e) => { (e.target as HTMLImageElement).src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${currentTeam.pokemons[i].speciesNumber}.png` }}
                        />
                        <span className="text-[10px] font-black uppercase truncate w-full text-center px-2">{currentTeam.pokemons[i].nickname}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setTeams(teams.map(t => t.id === activeTeamId ? {...t, pokemons: t.pokemons.filter((_, idx) => idx !== i)} : t)); }}
                          className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors"
                        >✕</button>
                      </>
                    ) : (
                      <span className="text-[9px] font-black text-slate-200 uppercase">Slot {i+1}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Editor Section */}
              {activePkmn ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-[40px] border-2 border-slate-200 p-8 shadow-sm flex flex-col items-center">
                      <div className="relative group mb-6">
                        <div className="absolute inset-0 bg-red-500/5 rounded-full blur-3xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${activePkmn.speciesNumber}.png`} 
                          className={`w-48 h-48 relative z-10 drop-shadow-2xl ${activePkmn.shiny ? 'brightness-110 saturate-125 hue-rotate-15' : ''}`}
                        />
                      </div>
                      <div className="w-full space-y-4">
                        <div className="flex gap-2">
                          <input 
                            value={activePkmn.nickname} 
                            onChange={(e) => updateActivePkmn({ nickname: e.target.value })}
                            className="bg-slate-50 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-2xl px-4 py-3 text-xl font-black w-full outline-none transition-all"
                          />
                          <button 
                            onClick={() => updateActivePkmn({ shiny: !activePkmn.shiny })}
                            className={`px-4 rounded-2xl font-black text-[10px] uppercase border-2 transition-all ${activePkmn.shiny ? 'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-[0_3px_0_#ca8a04]' : 'bg-slate-100 border-slate-200 text-slate-400'}`}
                          >
                            Shiny
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Level</label>
                            <input type="number" value={activePkmn.level} onChange={(e) => updateActivePkmn({ level: parseInt(e.target.value) || 1 })} className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-2.5 font-bold text-sm outline-none" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Nature</label>
                            <select value={activePkmn.nature} onChange={(e) => updateActivePkmn({ nature: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-2.5 font-bold text-sm outline-none">
                              {NATURES.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Held Item</label>
                          <input value={activePkmn.item} onChange={(e) => updateActivePkmn({ item: e.target.value })} placeholder="Focus Sash" className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Ability</label>
                          <input value={activePkmn.ability} onChange={(e) => updateActivePkmn({ ability: e.target.value })} placeholder="Levitate" className="w-full bg-slate-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-sm outline-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="xl:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-[40px] border-2 border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-600 rounded-full"></span> 
                          EV/IV Optimization
                        </h4>
                        <div className="space-y-5">
                          {(Object.keys(activePkmn.baseStats) as StatKey[]).map(key => {
                            const actual = calculateActualStat(key, activePkmn.baseStats[key], activePkmn.ivs[key], activePkmn.evs[key], activePkmn.level, activePkmn.nature);
                            return (
                              <div key={key} className="grid grid-cols-12 items-center gap-2 group">
                                <span className="col-span-2 font-black text-[9px] text-slate-400 uppercase">{STAT_LABELS[key]}</span>
                                <input 
                                  type="range" min="0" max={MAX_STAT_EVS} 
                                  value={activePkmn.evs[key]} 
                                  onChange={(e) => updateStat('evs', key, parseInt(e.target.value))} 
                                  className="col-span-4 accent-red-600 h-1" 
                                />
                                <div className="col-span-3 flex gap-1">
                                  <input type="number" value={activePkmn.evs[key]} onChange={(e) => updateStat('evs', key, parseInt(e.target.value) || 0)} className="w-full bg-slate-50 border-transparent rounded-lg py-1 px-1.5 text-center text-[10px] font-black" />
                                </div>
                                <div className="col-span-3 text-right font-black text-red-600 text-sm">{actual}</div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-400 uppercase">EV Total</span>
                          <span className="text-xs font-black text-slate-800">{(Object.values(activePkmn.evs) as number[]).reduce((a, b) => a + b, 0)} / {MAX_TOTAL_EVS}</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
                          <span className="w-2 h-2 bg-slate-800 rounded-full"></span> 
                          Tactical Moveset
                        </h4>
                        <div className="flex flex-col gap-3">
                          {activePkmn.moves.map((move, i) => (
                            <div key={i} className="relative group">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300">{i+1}</span>
                              <input 
                                value={move} 
                                onChange={(e) => {
                                  const newMoves = [...activePkmn.moves];
                                  newMoves[i] = e.target.value;
                                  updateActivePkmn({ moves: newMoves });
                                }} 
                                placeholder="Add Move..." 
                                className="w-full bg-slate-50 border-2 border-transparent hover:border-slate-200 focus:border-red-500 rounded-2xl py-3.5 pl-10 pr-4 font-bold text-sm outline-none transition-all"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[500px] flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border-4 border-dashed border-slate-200">
                  <h2 className="text-2xl font-black text-slate-300 uppercase tracking-tighter">Laboratory Empty</h2>
                  <button onClick={() => fetchAndAddSpecies('pikachu')} className="bg-slate-100 text-slate-400 px-6 py-3 rounded-2xl font-black text-xs uppercase hover:bg-red-50 hover:text-red-500 transition-all">Quick Start: Pikachu</button>
                </div>
              )}
            </div>
          ) : view === 'gallery' ? (
            <PublicGallery onAction={(teamData, action) => {
              if (action === 'draft') {
                const newId = Math.random().toString(36).substr(2, 9);
                const draftedMons = teamData.pokemons.map((p: any) => ({
                  id: Math.random().toString(36).substr(2, 9),
                  nickname: p.species,
                  species: p.species,
                  speciesNumber: p.number || 1,
                  level: 100,
                  item: p.item,
                  ability: p.ability,
                  nature: "Serious",
                  gender: "M",
                  shiny: false,
                  evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
                  ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
                  moves: p.moves,
                  baseStats: { hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 },
                  createdAt: Date.now(),
                  updatedAt: Date.now()
                }));
                const newTeam: Team = { id: newId, name: `Drafted ${teamData.name}`, pokemons: draftedMons, updatedAt: Date.now() };
                setTeams([...teams, newTeam]);
                setActiveTeamId(newId);
                setView('lab');
              } else {
                setChallengeTeam(teamData.pokemons.map((p: any) => ({
                   species: p.species,
                   nickname: p.species,
                   speciesNumber: p.number || 1,
                   moves: p.moves,
                   baseStats: { hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 },
                   level: 100,
                   evs: { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
                   ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
                   nature: "Serious"
                })) as Pokemon[]);
                setView('arena');
              }
            }} />
          ) : (
            <BattleMode team={currentTeam.pokemons} opponentTeamProp={challengeTeam || undefined} onClose={() => setView('home')} />
          )}
        </main>
      </div>

      {showImportExport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowImportExport(false)}></div>
          <div className="bg-white w-full max-w-xl relative z-10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b-2 border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-red-600 italic">IO DATA PORT</h2>
              <button onClick={() => setShowImportExport(false)} className="text-slate-400 font-bold hover:text-red-600 transition-colors">✕</button>
            </div>
            <div className="p-8 flex-1 overflow-y-auto">
              <textarea 
                value={pasteText} 
                onChange={(e) => setPasteText(e.target.value)} 
                placeholder="Paste Showdown/PokéPaste here..." 
                className="w-full h-64 bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 font-mono text-xs text-red-800 outline-none focus:border-red-500 transition-all resize-none"
              />
            </div>
            <div className="p-8 bg-slate-50 flex gap-4">
              <button onClick={() => { 
                const text = currentTeam.pokemons.map(exportToShowdown).join('\n\n');
                navigator.clipboard.writeText(text);
                alert("Copied Team!");
              }} className="flex-1 bg-white border-2 border-slate-200 text-slate-800 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-slate-100 transition-all">Copy Current</button>
              <button onClick={() => handleImport()} className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-red-200 active:translate-y-1 transition-all">Import to Active</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
