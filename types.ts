
import React from 'react';
import { Gym } from '../types';

interface ComparisonBarProps {
  selectedGyms: Gym[];
  onRemove: (id: string) => void;
  onCompare: () => void;
  onClear: () => void;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({ selectedGyms, onRemove, onCompare, onClear }) => {
  if (selectedGyms.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-black border border-[#ccff00]/30 shadow-[0_0_30px_rgba(204,255,0,0.2)] rounded-2xl p-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {selectedGyms.map(gym => (
              <div key={gym.id} className="relative group">
                <img 
                  src={gym.photos[0]} 
                  alt={gym.name} 
                  className="w-10 h-10 rounded-full border-2 border-black object-cover cursor-pointer"
                />
                <button 
                  onClick={() => onRemove(gym.id)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
            {Array.from({ length: 3 - selectedGyms.length }).map((_, i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center text-white/20 text-xs">
                +
              </div>
            ))}
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-sm font-bold">{selectedGyms.length} Gyms Selected</p>
            <p className="text-gray-400 text-[10px]">Add up to 3 to compare</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={onClear}
            className="text-gray-400 hover:text-white text-xs px-3"
          >
            Clear
          </button>
          <button 
            disabled={selectedGyms.length < 2}
            onClick={onCompare}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${selectedGyms.length >= 2 ? 'bg-[#ccff00] text-black' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
};
