
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MOCK_GYMS, MOCK_REVIEWS } from './constants';
import { Gym, Review } from './types';
import { GymCard } from './components/GymCard';
import { ComparisonBar } from './components/ComparisonBar';
import { getGymComparisonInsight, getAreaMarketInsight } from './services/geminiService';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedGymIds, setSelectedGymIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonInsight, setComparisonInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [bookingGym, setBookingGym] = useState<Gym | null>(null);
  const [isBooked, setIsBooked] = useState(false);
  
  // Area Insight State
  const [areaInsight, setAreaInsight] = useState<string | null>(null);
  const [isLoadingAreaInsight, setIsLoadingAreaInsight] = useState(false);
  const insightTimeoutRef = useRef<number | null>(null);

  const categories = ['All', 'Premium', 'Affordable', 'Bodybuilding', 'CrossFit', 'Wellness'];

  const filteredGyms = useMemo(() => {
    return MOCK_GYMS.filter(gym => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = gym.name.toLowerCase().includes(query) || 
                            gym.location.toLowerCase().includes(query) ||
                            gym.tags.some(t => t.toLowerCase().includes(query));
      const matchesCategory = selectedCategory === 'All' || 
                              gym.tags.some(t => t.toLowerCase().includes(selectedCategory.toLowerCase())) ||
                              (selectedCategory === 'Affordable' && gym.price < 1200);
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Handle Area Insight on Search
  useEffect(() => {
    if (insightTimeoutRef.current) window.clearTimeout(insightTimeoutRef.current);
    
    if (searchQuery.length > 2 && filteredGyms.length >= 1) {
      setIsLoadingAreaInsight(true);
      insightTimeoutRef.current = window.setTimeout(async () => {
        const insight = await getAreaMarketInsight(searchQuery, filteredGyms);
        setAreaInsight(insight);
        setIsLoadingAreaInsight(false);
      }, 800); 
    } else {
      setAreaInsight(null);
      setIsLoadingAreaInsight(false);
    }
  }, [searchQuery, selectedCategory]);

  const handleToggleCompare = (id: string) => {
    setSelectedGymIds(prev => {
      if (prev.includes(id)) return prev.filter(gid => gid !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selectedGymsData = useMemo(() => 
    MOCK_GYMS.filter(g => selectedGymIds.includes(g.id)),
  [selectedGymIds]);

  const handleRunComparison = async (gymsToCompare?: Gym[]) => {
    const targetGyms = gymsToCompare || selectedGymsData;
    if (targetGyms.length < 2) return;

    setShowComparison(true);
    setIsLoadingInsight(true);
    if (gymsToCompare) {
      setSelectedGymIds(gymsToCompare.map(g => g.id));
    }
    const insight = await getGymComparisonInsight(targetGyms);
    setComparisonInsight(insight);
    setIsLoadingInsight(false);
  };

  const handleCompareAllInArea = () => {
    const gymsInArea = filteredGyms.slice(0, 3);
    handleRunComparison(gymsInArea);
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Location', 'Monthly Price', 'Rating', 'Reviews', 'Timings', 'Tags', 'Description'];
    const rows = MOCK_GYMS.map(gym => [
      `"${gym.name}"`,
      `"${gym.location}"`,
      `₹${gym.price}`,
      gym.rating,
      gym.reviewCount,
      `"${gym.timings}"`,
      `"${gym.tags.join('; ')}"`,
      `"${gym.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `thrissur_gym_database_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      setBookingGym(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-lg border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 neon-bg rounded-lg flex items-center justify-center font-black text-black text-xl italic">
            TG
          </div>
          <span className="text-xl font-bold tracking-tighter uppercase hidden sm:block">
            Thrissur<span className="neon-accent">Gyms</span>
          </span>
        </div>
        
        <div className="flex gap-6 items-center">
          <a href="#" className="text-sm font-medium hover:text-[#ccff00] transition-colors">Compare</a>
          <button 
            onClick={handleExportCSV}
            className="text-sm font-medium hover:text-[#ccff00] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Export All Details
          </button>
          <button className="bg-[#ccff00] text-black px-4 py-2 rounded-xl text-sm font-bold border-none transition-all hover:bg-white">
            Partner Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 md:px-12 bg-[radial-gradient(circle_at_top_right,_#1a1a1a,_#0a0a0a)] border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-7xl font-black mb-4 tracking-tight leading-tight uppercase italic">
              Discovery. Compare. <span className="neon-accent">Dominate.</span>
            </h1>
            <p className="body-text text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
              Access the largest curated index of fitness heritage in Thrissur.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-3xl p-1 md:p-2 flex flex-col md:flex-row items-stretch shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative z-10 overflow-hidden">
            <div className="flex-grow flex items-center px-6 py-4 md:py-0 border-b md:border-b-0 md:border-r border-gray-100 min-w-0">
               <svg className="w-5 h-5 text-[#ccff00] mr-3 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
               <input 
                  type="text" 
                  readOnly 
                  className="bg-transparent border-none focus:outline-none text-gray-800 text-sm font-bold w-full truncate"
                  value="Thrissur District, Kerala"
               />
            </div>
            <div className="flex-[3] flex items-center px-6 py-4 md:py-0 min-w-0">
               <svg className="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
               <input 
                  type="text" 
                  placeholder="Area (e.g. Kuriachira, Guruvayur, Potta, Mannuthy...)" 
                  className="bg-transparent border-none focus:outline-none text-gray-800 text-sm w-full placeholder-gray-400 font-medium"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <button className="bg-black text-[#ccff00] hover:bg-gray-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shrink-0">
              Search Area
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selectedCategory === cat ? 'bg-[#ccff00] border-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic AI Area Insight Card */}
      {(isLoadingAreaInsight || areaInsight) && (
        <section className="px-6 md:px-12 -mt-10 relative z-20">
           <div className="max-w-4xl mx-auto bg-[#0a0a0a] border border-[#ccff00]/40 rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-[0_30px_60px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-top-6 duration-700">
              <div className="w-14 h-14 bg-[#ccff00] rounded-2xl flex-shrink-0 flex items-center justify-center neon-shadow transform -rotate-3">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-[10px] font-black uppercase text-[#ccff00] tracking-[0.3em]">Area Market Insight</h4>
                  {isLoadingAreaInsight && <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-ping"></span>}
                </div>
                {isLoadingAreaInsight ? (
                   <p className="text-gray-500 italic text-sm">Analyzing local battle for {searchQuery}...</p>
                ) : (
                   <div className="space-y-4">
                     <p className="text-white body-text text-base leading-relaxed font-semibold italic">"{areaInsight}"</p>
                     {filteredGyms.length >= 2 && (
                       <button 
                        onClick={handleCompareAllInArea}
                        className="flex items-center gap-2 text-[#ccff00] text-xs font-black uppercase tracking-widest hover:underline group"
                       >
                         Side-by-Side Area Showdown
                         <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                       </button>
                     )}
                   </div>
                )}
              </div>
           </div>
        </section>
      )}

      {/* Gym Listings */}
      <main className="px-6 md:px-12 py-20 flex-grow bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl font-black italic uppercase mb-2">
                {searchQuery ? `Verified in "${searchQuery}"` : "The Elite Database"}
              </h2>
              <p className="text-gray-500 text-sm tracking-wide">Showing {filteredGyms.length} curated facilities from our master list</p>
            </div>
            <div className="flex gap-4">
               {filteredGyms.length >= 2 && searchQuery && (
                <button 
                  onClick={handleCompareAllInArea}
                  className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#ccff00] hover:text-black transition-all"
                >
                  Area Comparison
                </button>
              )}
              <button 
                onClick={handleExportCSV}
                className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Export Database
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {filteredGyms.length > 0 ? (
              filteredGyms.map(gym => (
                <GymCard 
                  key={gym.id} 
                  gym={gym} 
                  onCompare={handleToggleCompare} 
                  isComparing={selectedGymIds.includes(gym.id)}
                  onBook={setBookingGym}
                />
              ))
            ) : (
              <div className="col-span-full py-32 text-center glass-card rounded-[40px] border-dashed border-2 border-white/5">
                <div className="w-20 h-20 mx-auto bg-white/5 rounded-3xl flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
                <h3 className="text-2xl font-black mb-2 uppercase italic text-gray-300">No Area Match</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto">We couldn't find gyms in that specific area. Try searching for "Guruvayur", "Kuriachira", or "Potta".</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black py-20 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
                <div className="w-10 h-10 neon-bg rounded-xl flex items-center justify-center font-black text-black text-sm italic">TG</div>
                <span className="text-2xl font-black uppercase tracking-tighter">Thrissur<span className="neon-accent">Gyms</span></span>
            </div>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em] mb-10">MASTER DATABASE • FULL EXPORT ENABLED • CULTURAL CAPITAL EDITION</p>
            <div className="flex flex-wrap justify-center gap-10">
               <a href="#" className="text-gray-500 hover:text-[#ccff00] text-[10px] font-black uppercase tracking-widest transition-colors">Privacy Policy</a>
               <a href="#" className="text-gray-500 hover:text-[#ccff00] text-[10px] font-black uppercase tracking-widest transition-colors">Terms of Service</a>
               <button onClick={handleExportCSV} className="text-gray-500 hover:text-[#ccff00] text-[10px] font-black uppercase tracking-widest transition-colors">Download Master List</button>
               <a href="#" className="text-gray-500 hover:text-[#ccff00] text-[10px] font-black uppercase tracking-widest transition-colors">Help Center</a>
            </div>
        </div>
      </footer>

      {/* Comparison Modal */}
      {showComparison && (
        <div className="fixed inset-0 z-[60] bg-black/98 overflow-y-auto animate-in fade-in duration-300">
          <div className="min-h-screen p-4 md:p-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-between items-center mb-16">
                <div>
                  <h2 className="text-4xl md:text-5xl font-black italic uppercase leading-none">The Side-By-Side <span className="neon-accent">Showdown</span></h2>
                  <p className="text-gray-500 text-xs mt-2 font-bold tracking-widest uppercase">Expert AI Comparison Report</p>
                </div>
                <button 
                  onClick={() => {
                    setShowComparison(false);
                    setComparisonInsight(null);
                  }}
                  className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-white transition-all border border-white/10 group"
                >
                  <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              {/* AI Comparison Summary */}
              <div className="mb-16 glass-card border-2 border-[#ccff00]/30 rounded-[40px] p-10 overflow-hidden relative shadow-[0_0_50px_rgba(204,255,0,0.15)]">
                <h3 className="text-[#ccff00] font-black text-[12px] mb-6 uppercase tracking-[0.4em] flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Comparison Verdict
                </h3>
                {isLoadingInsight ? (
                  <div className="flex items-center gap-6 py-4">
                    <div className="w-6 h-6 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Running detailed benchmarks...</span>
                  </div>
                ) : (
                  <p className="text-2xl md:text-3xl body-text leading-tight text-white font-medium italic">
                    {comparisonInsight}
                  </p>
                )}
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto rounded-[40px] border border-white/10 bg-[#0a0a0a] shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="p-8 text-gray-500 uppercase text-[10px] tracking-widest font-black min-w-[150px]">Features</th>
                      {selectedGymsData.map(gym => (
                        <th key={gym.id} className="p-8 min-w-[280px]">
                           <h4 className="text-2xl font-black text-[#ccff00] uppercase italic tracking-tighter mb-1">{gym.name}</h4>
                           <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{gym.location}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    <tr>
                      <td className="p-8 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-white/2">Monthly Fees</td>
                      {selectedGymsData.map(gym => (
                        <td key={gym.id} className="p-8">
                          <span className="text-3xl font-black text-white">₹{gym.price}</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-8 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-white/2">Reputation</td>
                      {selectedGymsData.map(gym => (
                        <td key={gym.id} className="p-8">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-white">{gym.rating}</span>
                            <div className="flex text-[#ccff00]">★</div>
                          </div>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{gym.reviewCount} Reviews</span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-8 font-black text-[10px] uppercase tracking-[0.2em] text-gray-500 bg-white/2">Details</td>
                      {selectedGymsData.map(gym => (
                        <td key={gym.id} className="p-8 text-xs text-gray-400 font-medium leading-relaxed">
                          {gym.description}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingGym && (
        <div className="fixed inset-0 z-[70] bg-black/95 flex items-center justify-center p-4">
          <div className="bg-[#111] border-2 border-[#ccff00]/40 rounded-[40px] p-10 max-w-lg w-full relative shadow-[0_0_150px_rgba(204,255,0,0.15)] animate-in zoom-in duration-300">
            {isBooked ? (
              <div className="text-center py-10">
                <div className="w-24 h-24 bg-[#ccff00] rounded-[30px] flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(204,255,0,0.4)]">
                  <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-4xl font-black mb-2 italic uppercase">GRIND SECURED!</h3>
                <p className="text-gray-400 font-medium">Check your phone for your entry pass. Master the workout.</p>
              </div>
            ) : (
              <>
                <button onClick={() => setBookingGym(null)} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div className="mb-10">
                  <div className="inline-block bg-[#ccff00] text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4">Priority Access</div>
                  <h3 className="text-4xl font-black mb-1 italic uppercase leading-none">FREE <span className="neon-accent">TRIAL</span></h3>
                  <p className="text-gray-500 font-bold text-xs tracking-widest uppercase mt-2">{bookingGym.name}</p>
                </div>
                <form onSubmit={handleBooking} className="space-y-6">
                  <input required type="text" className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-5 text-white font-bold focus:outline-none focus:border-[#ccff00] transition-all" placeholder="Full Name" />
                  <input required type="tel" className="w-full bg-white/5 border-2 border-white/5 rounded-2xl p-5 text-white font-bold focus:outline-none focus:border-[#ccff00] transition-all" placeholder="Phone Number" />
                  <button type="submit" className="w-full bg-[#ccff00] hover:bg-white text-black font-black py-6 rounded-2xl transition-all uppercase tracking-widest text-sm shadow-[0_15px_30px_rgba(204,255,0,0.2)]">
                    Activate Trial Pass
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Comparison Bar */}
      <ComparisonBar 
        selectedGyms={selectedGymsData}
        onRemove={(id) => setSelectedGymIds(prev => prev.filter(gid => gid !== id))}
        onClear={() => setSelectedGymIds([])}
        onCompare={() => handleRunComparison()}
      />
    </div>
  );
};

export default App;
