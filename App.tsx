
import React, { useState, useEffect, useRef } from 'react';
import { Pokemon, Team, StatKey, MAX_STAT_EVS, MAX_IV, MAX_TOTAL_EVS, Stats, Generation } from './types';
import { POKEMON_SPECIES_LIST, NATURES, calculateActualStat, STAT_LABELS, SAMPLE_PUBLIC_TEAMS } from './constants';
import { exportToShowdown, parseShowdown } from './services/showdownParser';
import BattleMode from './components/BattleMode';
import PublicGallery from './components/PublicGallery';
import LandingPage from './components/LandingPage';
import MultiplayerBattle from './components/MultiplayerBattle';

const TEAMS_STORAGE_KEY = 'champion-lab-teams-v4';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'lab' | 'gallery' | 'stadium'>('home');
  const [stadiumMode, setStadiumMode] = useState<'select' | 'ai' | 'pvp'>('select');
  const [currentGen, setCurrentGen] = useState<Generation>('GEN9');
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
  const [challengeTeam, setChallengeTeam] = useState<Pokemon[] | null>(null);
  
  const [speciesSearch, setSpeciesSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [allSpeciesNames, setAllSpeciesNames] = useState<string[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [availableMoves, setAvailableMoves] = useState<string[]>([]);
  const [availableAbilities, setAvailableAbilities] = useState<string[]>([]);
  const [moveSelectorSlot, setMoveSelectorSlot] = useState<number | null>(null);

  const [multiplayerRoomId, setMultiplayerRoomId] = useState("");
  const [activeMultiplayerRoom, setActiveMultiplayerRoom] = useState<string | null>(null);

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
    if (activePkmn) {
      const fetchPkmnData = async () => {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${activePkmn.species.toLowerCase()}`);
          const data = await res.json();
          setAvailableMoves(data.moves.map((m: any) => m.move.name.replace(/-/g, ' ')));
          setAvailableAbilities(data.abilities.map((a: any) => a.ability.name.replace(/-/g, ' ')));
        } catch (e) {
          console.error("Failed to fetch moves", e);
        }
      };
      fetchPkmnData();
    }
  }, [activePkmn?.species]);

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
      ability: speciesData.abilities?.[0]?.ability?.name.replace(/-/g, ' ') || "",
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

  const joinMultiplayerRoom = () => {
    if (multiplayerRoomId.trim()) {
      setActiveMultiplayerRoom(multiplayerRoomId.trim());
    }
  };

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setMultiplayerRoomId(code);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      <header className="bg-red-600 text-white shadow-md z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => { setView('home'); setActiveMultiplayerRoom(null); setStadiumMode('select'); }} 
              className="text-xl font-black italic border-2 border-white px-2 py-0.5 tracking-tighter hover:bg-white hover:text-red-600 transition-colors"
            >
              CHAMPION HUB
            </button>
            <nav className="hidden sm:flex items-center gap-1 bg-red-700/40 p-1 rounded-xl">
              <button onClick={() => { setView('home'); setActiveMultiplayerRoom(null); setStadiumMode('select'); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'home' ? 'bg-white text-red-600 shadow-sm' : 'text-white/70 hover:text-white'}`}>Home</button>
              <button onClick={() => { setView('lab'); setActiveMultiplayerRoom(null); setStadiumMode('select'); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'lab' ? 'bg-white text-red-600 shadow-sm' : 'text-white/70 hover:text-white'}`}>Lab</button>
              <button onClick={() => { setView('gallery'); setActiveMultiplayerRoom(null); setStadiumMode('select'); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'gallery' ? 'bg-white text-red-600 shadow-sm' : 'text-white/70 hover:text-white'}`}>Exhibit</button>
              <button onClick={() => { setView('stadium'); setActiveMultiplayerRoom(null); setStadiumMode('select'); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${view === 'stadium' ? 'bg-white text-red-600 shadow-sm' : 'text-white/70 hover:text-white'}`}>Stadium</button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
             {view === 'stadium' && stadiumMode === 'select' && (
              <div className="flex bg-red-700/40 rounded-xl p-1 gap-1">
                {(['GEN1', 'GEN3', 'GEN9'] as Generation[]).map(gen => (
                  <button 
                    key={gen} 
                    onClick={() => setCurrentGen(gen)}
                    className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all ${currentGen === gen ? 'bg-white text-red-600' : 'text-white/50 hover:text-white'}`}
                  >
                    {gen}
                  </button>
                ))}
              </div>
            )}
            {view === 'lab' && (
              <>
                <button onClick={() => setShowImportExport(true)} className="text-white/80 hover:text-white font-bold text-xs uppercase">IO</button>
                <div className="h-6 w-px bg-white/20"></div>
                <button onClick={createNewTeam} className="bg-white text-red-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase shadow-md active:translate-y-0.5 transition-all">New Team</button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
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

        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          {view === 'home' ? (
            <LandingPage onNavigate={(v) => setView(v)} teamCount={currentTeam.pokemons.length} />
          ) : view === 'lab' ? (
            <div className="p-6 max-w-[1400px] mx-auto w-full flex flex-col gap-6">
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
                </div>
              </div>

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
                        />
                        <span className="text-[10px] font-black uppercase truncate w-full text-center px-2">{currentTeam.pokemons[i].nickname}</span>
                      </>
                    ) : (
                      <span className="text-[9px] font-black text-slate-200 uppercase">Slot {i+1}</span>
                    )}
                  </div>
                ))}
              </div>

              {activePkmn ? (
                 <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="xl:col-span-4 flex flex-col gap-6">
                    <div className="bg-white rounded-[40px] border-2 border-slate-200 p-8 shadow-sm flex flex-col items-center">
                      <div className="relative group mb-6">
                        <img 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${activePkmn.speciesNumber}.png`} 
                          className={`w-48 h-48 relative z-10 drop-shadow-2xl ${activePkmn.shiny ? 'brightness-110' : ''}`}
                        />
                      </div>
                      <div className="w-full space-y-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Nickname</label>
                          <input 
                            value={activePkmn.nickname} 
                            onChange={(e) => updateActivePkmn({ nickname: e.target.value })}
                            className="bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-2xl px-4 py-3 text-lg font-black w-full outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Nature</label>
                            <select value={activePkmn.nature} onChange={(e) => updateActivePkmn({ nature: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-xl px-3 py-2 text-[10px] font-black uppercase outline-none">
                              {NATURES.map(n => <option key={n.name} value={n.name}>{n.name}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Shiny</label>
                            <button onClick={() => updateActivePkmn({ shiny: !activePkmn.shiny })} className={`w-full py-2 rounded-xl font-black text-[10px] uppercase border-2 ${activePkmn.shiny ? 'bg-yellow-400 text-yellow-900 border-yellow-500' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                              {activePkmn.shiny ? '✨ Shiny' : 'Regular'}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Item</label>
                          <input value={activePkmn.item} placeholder="e.g. Life Orb" onChange={(e) => updateActivePkmn({ item: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-xl px-4 py-3 text-xs font-black uppercase outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2">Ability</label>
                          <select value={activePkmn.ability} onChange={(e) => updateActivePkmn({ ability: e.target.value })} className="w-full bg-slate-50 border-2 border-transparent focus:border-red-500 rounded-xl px-4 py-3 text-xs font-black uppercase outline-none">
                            {availableAbilities.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="xl:col-span-8 flex flex-col gap-6">
                    <div className="bg-white rounded-[40px] border-2 border-slate-200 p-8 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">EV Distribution</h4>
                        <span className="text-[10px] font-black text-red-600">{(Object.values(activePkmn.evs) as number[]).reduce((a,b)=>a+b, 0)} / 510</span>
                      </div>
                      <div className="space-y-4">
                        {(Object.keys(activePkmn.baseStats) as StatKey[]).map(key => (
                          <div key={key} className="grid grid-cols-12 items-center gap-4">
                            <span className="col-span-2 font-black text-[9px] text-slate-400 uppercase">{STAT_LABELS[key]}</span>
                            <input type="range" min="0" max={MAX_STAT_EVS} value={activePkmn.evs[key]} onChange={(e) => updateStat('evs', key, parseInt(e.target.value))} className="col-span-8 accent-red-600" />
                            <span className="col-span-2 text-right font-black text-red-600 text-xs">
                               {calculateActualStat(key, activePkmn.baseStats[key], activePkmn.ivs[key], activePkmn.evs[key], activePkmn.level, activePkmn.nature)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-[40px] border-2 border-slate-200 p-8 shadow-sm">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6">Moveset</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {activePkmn.moves.map((move, idx) => (
                          <div key={idx} className="relative">
                            <button onClick={() => setMoveSelectorSlot(idx)} className="w-full bg-slate-50 border-2 border-dashed border-slate-200 hover:border-red-400 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all text-center">
                              {move || `Move ${idx + 1}`}
                            </button>
                            {moveSelectorSlot === idx && (
                              <div className="absolute top-full left-0 w-full z-[100] bg-white border-2 border-slate-100 rounded-2xl shadow-2xl mt-2 p-2 max-h-48 overflow-y-auto">
                                {availableMoves.map(m => (
                                  <button key={m} onClick={() => { const newMoves = [...activePkmn.moves]; newMoves[idx] = m; updateActivePkmn({ moves: newMoves }); setMoveSelectorSlot(null); }} className="w-full text-left px-3 py-1.5 hover:bg-red-50 rounded-lg text-[9px] font-black uppercase transition-colors">{m}</button>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : view === 'gallery' ? (
             <PublicGallery onAction={(teamData, action) => {
              const draftedMons = teamData.pokemons.map((p: any) => {
                const speciesInfo = POKEMON_SPECIES_LIST.find(s => s.name === p.species);
                return {
                  id: Math.random().toString(36).substr(2, 9),
                  nickname: p.species,
                  species: p.species,
                  speciesNumber: p.number || 1,
                  level: 100,
                  item: p.item || "",
                  ability: p.ability || "",
                  nature: p.nature || "Serious",
                  gender: "M",
                  shiny: false,
                  evs: p.evs || { hp: 0, attack: 0, defense: 0, spAttack: 0, spDefense: 0, speed: 0 },
                  ivs: { hp: 31, attack: 31, defense: 31, spAttack: 31, spDefense: 31, speed: 31 },
                  moves: p.moves || ["", "", "", ""],
                  baseStats: speciesInfo?.base || { hp: 100, attack: 100, defense: 100, spAttack: 100, spDefense: 100, speed: 100 },
                  createdAt: Date.now(),
                  updatedAt: Date.now()
                };
              });
              if (action === 'draft') {
                const newId = Math.random().toString(36).substr(2, 9);
                const newTeam: Team = { id: newId, name: `Drafted: ${teamData.name}`, pokemons: draftedMons, updatedAt: Date.now() };
                setTeams([...teams, newTeam]);
                setActiveTeamId(newId);
                setView('lab');
              } else {
                setChallengeTeam(draftedMons);
                setStadiumMode('ai');
                setView('stadium');
              }
            }} />
          ) : view === 'stadium' ? (
            currentTeam.pokemons.length === 0 ? (
              <div className="p-8 max-w-xl mx-auto w-full py-20">
                <div className="bg-white p-12 rounded-[50px] border-4 border-slate-200 shadow-2xl text-center space-y-8">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Team Required</h2>
                  <p className="text-slate-500 font-bold">You need a squad to enter the Stadium.</p>
                  <button onClick={() => setView('gallery')} className="w-full bg-red-600 text-white py-5 rounded-3xl font-black uppercase text-sm">Draft from Exhibit</button>
                </div>
              </div>
            ) : stadiumMode === 'select' ? (
              <div className="p-8 max-w-4xl mx-auto w-full py-16">
                <div className="text-center mb-12">
                  <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter uppercase">Stadium Selection</h2>
                  <p className="text-slate-400 font-bold mt-2">Active Generation: <span className="text-red-600">{currentGen}</span></p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div onClick={() => { setChallengeTeam(null); setStadiumMode('ai'); }} className="bg-white p-10 rounded-[50px] border-4 border-transparent hover:border-blue-500 transition-all cursor-pointer group shadow-xl hover:shadow-2xl flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-[35px] flex items-center justify-center text-5xl group-hover:rotate-12 transition-transform">🤖</div>
                    <h3 className="text-2xl font-black text-slate-900">OFFLINE AI</h3>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed px-4">Battle against a randomized squad generated by the computer.</p>
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs">Start Training</button>
                  </div>
                  <div onClick={() => setStadiumMode('pvp')} className="bg-white p-10 rounded-[50px] border-4 border-transparent hover:border-orange-500 transition-all cursor-pointer group shadow-xl hover:shadow-2xl flex flex-col items-center text-center space-y-6">
                    <div className="w-24 h-24 bg-orange-100 rounded-[35px] flex items-center justify-center text-5xl group-hover:rotate-12 transition-transform">⚔️</div>
                    <h3 className="text-2xl font-black text-slate-900">GLOBAL PVP</h3>
                    <p className="text-slate-400 text-xs font-bold leading-relaxed px-4">Challenge other trainers in real-time by sharing or joining a room code.</p>
                    <button className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs">Join Lobby</button>
                  </div>
                </div>
              </div>
            ) : stadiumMode === 'ai' ? (
              <BattleMode generation={currentGen} team={currentTeam.pokemons} opponentTeamProp={challengeTeam || undefined} onClose={() => { setStadiumMode('select'); setChallengeTeam(null); }} />
            ) : (
              activeMultiplayerRoom ? (
                <MultiplayerBattle generation={currentGen} roomId={activeMultiplayerRoom} team={currentTeam.pokemons} onClose={() => { setActiveMultiplayerRoom(null); setStadiumMode('select'); }} />
              ) : (
                <div className="p-8 max-w-lg mx-auto w-full space-y-8 py-20">
                  <div className="bg-white p-10 rounded-[40px] border-2 border-slate-200 shadow-xl space-y-6">
                    <button onClick={() => setStadiumMode('select')} className="text-[10px] font-black uppercase text-slate-400 hover:text-red-600 transition-colors">← Back</button>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Room Code</label>
                        <input value={multiplayerRoomId} onChange={(e) => setMultiplayerRoomId(e.target.value)} placeholder="e.g. 1234" className="w-full bg-slate-50 border-2 border-transparent focus:border-orange-500 rounded-2xl px-6 py-4 text-2xl font-black text-center outline-none tracking-widest" />
                      </div>
                      <button 
                        onClick={generateRoomCode}
                        className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-orange-500 transition-colors"
                      >
                        Generate Random Code
                      </button>
                    </div>
                    <button onClick={joinMultiplayerRoom} className="w-full bg-orange-500 text-white py-5 rounded-3xl font-black text-sm uppercase shadow-lg shadow-orange-200 hover:bg-orange-600 transition-all active:scale-95">Enter Battle</button>
                  </div>
                </div>
              )
            )
          ) : null}
        </main>
      </div>
    </div>
  );
};

export default App;
