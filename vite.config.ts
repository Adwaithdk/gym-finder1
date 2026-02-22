
import React from 'react';
import { Gym } from '../types';

interface GymCardProps {
  gym: Gym;
  onCompare: (id: string) => void;
  isComparing: boolean;
  onBook: (gym: Gym) => void;
}

export const GymCard: React.FC<GymCardProps> = ({ gym, onCompare, isComparing, onBook }) => {
  return (
    <div className={`relative group glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${gym.isFeatured ? 'border-2 border-[#ccff00] neon-shadow' : 'border border-white/10'}`}>
      {gym.isFeatured && (
        <div className="absolute top-4 left-4 z-10 neon-bg text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
          Featured
        </div>
      )}
      
      <div className="aspect-video overflow-hidden">
        <img 
          src={gym.photos[0]} 
          alt={gym.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white group-hover:text-[#ccff00] transition-colors">{gym.name}</h3>
          <div className="flex items-center bg-white/10 px-2 py-1 rounded">
            <span className="text-[#ccff00] font-bold text-sm mr-1">★</span>
            <span className="text-white text-sm font-semibold">{gym.rating}</span>
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4 flex items-center">
          <svg className="w-4 h-4 mr-1 text-[#ccff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
          {gym.location}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {gym.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] bg-white/5 text-gray-300 px-2 py-1 rounded border border-white/10">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div>
            <span className="text-gray-500 text-xs">Starts at</span>
            <p className="text-[#ccff00] font-bold text-lg">₹{gym.price}<span className="text-xs text-gray-400">/mo</span></p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onCompare(gym.id)}
              className={`p-2 rounded-lg border transition-colors ${isComparing ? 'bg-[#ccff00] border-[#ccff00] text-black' : 'border-white/20 text-white hover:border-[#ccff00] hover:text-[#ccff00]'}`}
              title="Compare Gym"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </button>
            <button 
              onClick={() => onBook(gym)}
              className="bg-white text-black hover:bg-[#ccff00] font-bold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
