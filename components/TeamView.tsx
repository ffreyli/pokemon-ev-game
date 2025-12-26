
import React from 'react';
import { Pokemon, Team } from '../types';

interface TeamViewProps {
  team: Team;
  allPokemon: Pokemon[];
  onRemove: (pokemonId: string) => void;
  onSelect: (pokemonId: string) => void;
}

const TeamView: React.FC<TeamViewProps> = ({ team, allPokemon, onRemove, onSelect }) => {
  const teamPokemon = team.pokemonIds.map(id => allPokemon.find(p => p.id === id)).filter(Boolean) as Pokemon[];

  return (
    <div className="bg-blue-600 p-6 rounded-3xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <svg className="w-8 h-8" fill="white" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
          {team.name}
        </h2>
        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
          {teamPokemon.length} / 6
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {teamPokemon.map((pkmn) => (
          <div 
            key={pkmn.id} 
            className="bg-white/10 hover:bg-white/20 rounded-2xl p-4 transition-all group relative cursor-pointer"
            onClick={() => onSelect(pkmn.id)}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); onRemove(pkmn.id); }}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              ×
            </button>
            <img 
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pkmn.speciesNumber}.png`} 
              alt={pkmn.species}
              className="w-16 h-16 mx-auto drop-shadow-lg"
            />
            <div className="text-center mt-2">
              <div className="font-bold truncate text-sm">{pkmn.nickname || pkmn.species}</div>
              <div className="text-[10px] opacity-75 uppercase font-black">LV.{pkmn.level}</div>
            </div>
          </div>
        ))}

        {teamPokemon.length === 0 && (
          <div className="col-span-full py-8 text-center text-white/50 border-2 border-dashed border-white/20 rounded-2xl">
            No Pokémon in this team.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamView;
