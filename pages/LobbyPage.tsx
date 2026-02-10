
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Card, GameCard } from '../components';
import { useStore } from '../store';
import { getAIGameRecommendation } from '../aiService';
import { TransactionType } from '../types';

const LobbyPage: React.FC = () => {
  const { categories, currentUser, transactions, games, claimDailyReward } = useStore();
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('cat-featured');
  const [aiPick, setAiPick] = useState<{ name: string, reason: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [useSweepCoins, setUseSweepCoins] = useState(false);

  const filteredGames = games.filter(g => g.categoryId === activeCategoryId);

  const handleClaimDaily = () => {
    const err = claimDailyReward();
    if (err) alert(err);
    else alert("The Royal Bounty has been added to your vault!");
  };

  const handleAiPick = async () => {
    setIsAiLoading(true);
    const recommendation = await getAIGameRecommendation(games, transactions);
    setAiPick(recommendation);
    setIsAiLoading(false);
  };

  return (
    <Layout>
      <div className="space-y-12">
        {/* Banner */}
        <div className="h-64 sm:h-96 rounded-[48px] overflow-hidden relative group">
          <img src="https://images.unsplash.com/photo-1596838132731-dd36a1f3ec72?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover brightness-[0.3]" alt="Lobby Banner" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent p-12 flex flex-col justify-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-amber-500/20">
               👑 Official Partner of Royal Wins
             </div>
             <h2 className="text-5xl font-black mb-2 tracking-tighter uppercase leading-none">The Royal Lobby</h2>
             <p className="text-zinc-400 max-w-md text-lg mb-8 leading-relaxed">Play 25+ premium games designed for maximum excitement and SC redemptions.</p>
             <div className="flex items-center gap-4">
               <Button variant="ai" onClick={handleAiPick} disabled={isAiLoading}>
                 {isAiLoading ? 'CONSULTING ORACLE...' : "AI PERSONA PICK ✨"}
               </Button>
               {currentUser && (
                 <Button variant="secondary" onClick={handleClaimDaily}>CLAIM DAILY BOUNTY</Button>
               )}
             </div>
          </div>
        </div>

        {/* AI Pick Result */}
        {aiPick && (
          <Card className="p-8 bg-gradient-to-r from-amber-500/20 to-zinc-900 border-amber-500/40 animate-in slide-in-from-top duration-700">
             <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 bg-amber-500 rounded-3xl flex items-center justify-center text-5xl shrink-0 italic font-black shadow-2xl">O</div>
                <div className="flex-1 text-center md:text-left">
                   <h3 className="text-amber-500 font-black text-[10px] uppercase tracking-[0.3em] mb-2">CONCIERGE RECOMMENDS:</h3>
                   <p className="text-3xl font-black text-white mb-2 tracking-tighter uppercase italic">{aiPick.name}</p>
                   <p className="text-zinc-400 italic text-sm leading-relaxed max-w-2xl border-l-2 border-amber-500/30 pl-4">"{aiPick.reason}"</p>
                </div>
                <Button variant="primary" className="px-12 py-5" onClick={() => {
                   const g = games.find(g => g.name === aiPick.name);
                   if (g) navigate(`/game/${g.id}`);
                }}>PLAY NOW</Button>
                <button onClick={() => setAiPick(null)} className="text-zinc-600 hover:text-white transition-colors p-2 text-xl">✕</button>
             </div>
          </Card>
        )}

        {/* Currency Master Toggle */}
        <div className="flex items-center justify-between bg-zinc-900/50 p-6 rounded-[32px] border border-zinc-800/50">
           <div className="flex items-center gap-4">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Currency Mode</span>
                 <span className={`text-sm font-black italic tracking-tight ${useSweepCoins ? 'text-emerald-400' : 'text-amber-400'}`}>
                   {useSweepCoins ? 'SWEEPSTAKES COINS (SC)' : 'SOCIAL GOLD COINS (GC)'}
                 </span>
              </div>
           </div>
           <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 shadow-inner">
              <button onClick={() => setUseSweepCoins(false)} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!useSweepCoins ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}>GC Mode</button>
              <button onClick={() => setUseSweepCoins(true)} className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${useSweepCoins ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:text-white'}`}>SC Mode</button>
           </div>
        </div>

        {/* Categories Navbar */}
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all border ${
                activeCategoryId === cat.id 
                  ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-xl scale-105' 
                  : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Game Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
           {filteredGames.map((game) => (
              <GameCard 
                key={game.id} 
                game={game} 
                useSweepCoins={useSweepCoins} 
                onClick={() => navigate(`/game/${game.id}${useSweepCoins ? '?mode=sc' : ''}`)} 
              />
           ))}
        </div>
      </div>
    </Layout>
  );
};

export default LobbyPage;
