
import React, { useState, useEffect, useCallback } from 'react';
import { Stats, MAX_STAT_EVS, MAX_TOTAL_EVS } from '../types';

interface TrainingGameProps {
  // Fix: Changed EVStats to Stats and removed unused StatName
  onTrain: (stat: keyof Stats, amount: number) => void;
  currentEVs: Stats;
}

const TrainingGame: React.FC<TrainingGameProps> = ({ onTrain, currentEVs }) => {
  // Fix: Changed EVStats to Stats
  const [activeStat, setActiveStat] = useState<keyof Stats | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);

  // Fix: Use a type assertion to ensure Object.values returns a number array for calculation
  const totalEVs = (Object.values(currentEVs) as number[]).reduce((a, b) => a + b, 0);

  const startTraining = (stat: keyof Stats) => {
    setActiveStat(stat);
    setClickCount(0);
    setTimer(10);
    setIsGameRunning(true);
  };

  useEffect(() => {
    let interval: any;
    if (isGameRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isGameRunning) {
      setIsGameRunning(false);
      const evGained = Math.min(Math.floor(clickCount / 3), 10);
      if (activeStat) onTrain(activeStat, evGained);
    }
    return () => clearInterval(interval);
  }, [timer, isGameRunning, activeStat, clickCount, onTrain]);

  const handleClick = () => {
    if (isGameRunning) {
      setClickCount((prev) => prev + 1);
    }
  };

  const statsList: { label: string; key: keyof Stats; color: string }[] = [
    { label: 'HP', key: 'hp', color: 'bg-red-500' },
    { label: 'Attack', key: 'attack', color: 'bg-orange-500' },
    { label: 'Defense', key: 'defense', color: 'bg-yellow-500' },
    { label: 'Sp. Atk', key: 'spAttack', color: 'bg-blue-500' },
    { label: 'Sp. Def', key: 'spDefense', color: 'bg-green-500' },
    { label: 'Speed', key: 'speed', color: 'bg-pink-500' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-b-8 border-gray-200">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span className="bg-yellow-400 p-1 rounded">⚡</span> 
        Training Grounds
      </h2>

      {!isGameRunning ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statsList.map((stat) => {
            // Fix: totalEVs is now properly typed as number
            const canTrain = currentEVs[stat.key] < MAX_STAT_EVS && totalEVs < MAX_TOTAL_EVS;
            return (
              <button
                key={stat.key}
                onClick={() => startTraining(stat.key)}
                disabled={!canTrain}
                className={`p-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale ${stat.color} shadow-lg`}
              >
                {stat.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl font-black mb-2 pokemon-font text-blue-600">
            {timer}s
          </div>
          <div className="text-lg font-bold mb-4 uppercase tracking-widest text-gray-500">
            Training {activeStat}
          </div>
          <button
            onClick={handleClick}
            className="w-32 h-32 rounded-full bg-red-600 border-8 border-red-800 text-white font-black text-2xl shadow-xl active:translate-y-2 transition-all flex items-center justify-center mx-auto"
          >
            TAP!
          </button>
          <div className="mt-4 text-gray-600 font-bold">
            Clicks: {clickCount}
          </div>
        </div>
      )}

      <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between text-sm font-bold text-gray-500 mb-1">
          <span>TOTAL EVS</span>
          <span>{totalEVs} / {MAX_TOTAL_EVS}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            // Fix: totalEVs is now properly typed as number for arithmetic
            style={{ width: `${(totalEVs / MAX_TOTAL_EVS) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrainingGame;
