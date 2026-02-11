
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Card, GameCard, CrownLogo } from '../components';
import { useStore } from '../store';
import { getAIGameRecommendation } from '../aiService';
import { TransactionType } from '../types';

const LobbyPage: React.FC = () => {
  const { categories, currentUser, transactions, games, claimDailyReward, settings } = useStore();
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('cat-featured');
  const [aiPick, setAiPick] = useState<{ name: string, reason: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [useSweepCoins, setUseSweepCoins] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyRewardResult, setDailyRewardResult] = useState<{ gc: number, sc: number, streak: number } | null>(null);

  const filteredGames = games.filter(g => g.categoryId === activeCategoryId);

  useEffect(() => {
    if (currentUser) {
      const now = new Date();
      const lastClaim = currentUser.lastDailyClaim ? new Date(currentUser.lastDailyClaim) : null;
      if (!lastClaim || (now.getTime() - lastClaim.getTime()) >= 86400000) {
        setShowDailyModal(true);
      }
    }
  }, [currentUser]);

  const handleClaimDaily = () => {
    const result = claimDailyReward();
    if (result.error) {
      alert(result.error);
    } else {
      setDailyRewardResult({ gc: result.gc, sc: result.sc, streak: result.streak });
    }
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
        {/* Daily Reward Modal */}
        {showDailyModal && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-zinc-950/90 backdrop-blur-2xl animate-in fade-in duration-500">
             <Card className="w-full max-w-lg p-10 border-amber-500/40 relative shadow-[0_50px_150px_rgba(0,0,0,1)] text-center overflow-hidden">
                {!dailyRewardResult ? (
                  <>
                    <div className="flex justify-center mb-8">
                       <div className="w-24 h-24 bg-amber-500 rounded-[32px] flex items-center justify-center text-5xl shadow-2xl animate-bounce">🎁</div>
                    </div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white mb-2">Royal Attendance</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-8">Your presence is valued, Monarch. Claim your tribute.</p>
                    
                    <div className="grid grid-cols-7 gap-1.5 mb-10">
                       {[1, 2, 3, 4, 5, 6, 7].map(day => {
                         const isToday = (currentUser?.loginStreak || 0) + 1 === day;
                         const isPast = (currentUser?.loginStreak || 0) >= day;
                         return (
                           <div key={day} className={`flex flex-col items-center gap-2 p-2 rounded-xl border ${isToday ? 'bg-amber-500 border-amber-400' : isPast ? 'bg-zinc-800 border-zinc-700 opacity-50' : 'bg-zinc-900 border-zinc-800'}`}>
                              <span className={`text-[8px] font-black uppercase ${isToday ? 'text-zinc-950' : 'text-zinc-500'}`}>Day {day}</span>
                              <span className="text-sm">{day === 7 ? '👑' : '💎'}</span>
                           </div>
                         );
                       })}
                    </div>

                    <Button variant="primary" className="w-full py-5 text-xl font-black italic shadow-amber-500/20 shadow-2xl" onClick={handleClaimDaily}>
                      CLAIM ROYAL BOUNTY
                    </Button>
                    <button onClick={() => setShowDailyModal(false)} className="mt-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest hover:text-white transition-colors">MAYBE LATER</button>
                  </>
                ) : (
                  <div className="animate-in zoom-in-95 duration-700">
                    <div className="flex justify-center mb-8">
                       <div className="w-32 h-32 bg-emerald-500 rounded-full flex items-center justify-center text-6xl shadow-[0_0_80px_rgba(16,185,129,0.4)]">✨</div>
                    </div>
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter text-white mb-6">Tribute Accepted!</h2>
                    <div className="space-y-4 mb-10">
                       <div className="p-6 bg-zinc-950 rounded-[32px] border border-zinc-800 shadow-inner">
                          <div className="text-4xl font-black text-amber-500 italic mb-1">+{dailyRewardResult.gc.toLocaleString()} GC</div>
                          <div className="text-2xl font-black text-emerald-400 italic">+{dailyRewardResult.sc} SC</div>
                       </div>
                       <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest italic">Current Streak: {dailyRewardResult.streak} Days</p>
                    </div>
                    <Button variant="primary" className="w-full py-6 text-xl font-black" onClick={() => setShowDailyModal(false)}>
                      CONTINUE TO KINGDOM
                    </Button>
                  </div>
                )}
             </Card>
          </div>
        )}

        {/* Banner */}
        <div className="h-64 sm:h-[500px] rounded-[48px] overflow-hidden relative group border-2 border-zinc-900">
          <img src="https://images.unsplash.com/photo-1596838132731-dd36a1f3ec72?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover brightness-[0.2]" alt="Lobby Banner" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent p-12 flex flex-col justify-center">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-amber-500/20">
               💎 ROYAL PROGRESSIVE JACKPOT
             </div>
             <div className="mb-10">
                <div className="text-7xl font-black text-white italic tracking-tighter mb-2">
                   {useSweepCoins ? settings.jackpotSC.toLocaleString() : settings.jackpotGC.toLocaleString()}
                   <span className="text-3xl ml-4 font-black uppercase tracking-widest text-amber-500">{useSweepCoins ? 'SC' : 'GC'}</span>
                </div>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Accumulating in real-time across the kingdom</p>
             </div>
             <div className="flex items-center gap-4">
               <Button variant="ai" className="py-4 px-8" onClick={handleAiPick} disabled={isAiLoading}>
                 {isAiLoading ? 'CONSULTING ORACLE...' : "AI PERSONA PICK ✨"}
               </Button>
               {currentUser && (
                 <Button variant="secondary" className="py-4 px-8" onClick={() => setShowDailyModal(true)}>VIEW DAILY BOUNTY</Button>
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
                   if (g) navigate(`/game/${g.id}${useSweepCoins ? '?mode=sc' : ''}`);
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

        {/* Game Grid with Staggered Entry */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
           {filteredGames.map((game, idx) => (
              <div 
                key={game.id} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <GameCard 
                  game={game} 
                  useSweepCoins={useSweepCoins} 
                  onClick={() => navigate(`/game/${game.id}${useSweepCoins ? '?mode=sc' : ''}`)} 
                />
              </div>
           ))}
        </div>
      </div>
    </Layout>
  );
};

export default LobbyPage;
