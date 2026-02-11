
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button, CurrencyBadge, Card, QuickBuyModal, Badge } from '../components';
import { useStore } from '../store';
import { CurrencyType } from '../types';

const REEL_STRIPS = [
  ['🃏', '💖', '💎', '👑', '🃏', '💰', '✨', '💖', '🔱', '💎', '🃏', '🔥', '💖', '👑', '⚡', '💰'],
  ['💰', '🃏', '💎', '💖', '⚡', '🃏', '👑', '✨', '💎', '💖', '🃏', '🔱', '💰', '🔥', '💎', '👑'],
  ['👑', '💎', '🃏', '💖', '🔥', '⚡', '🃏', '💰', '✨', '💎', '💖', '🔱', '🃏', '👑', '⚡', '💎'],
  ['⚡', '💖', '💎', '🃏', '👑', '💰', '🃏', '✨', '🔥', '💖', '💎', '🔱', '⚡', '🃏', '💰', '👑'],
  ['🃏', '💎', '💖', '👑', '✨', '🃏', '💰', '⚡', '🔥', '💎', '💖', '🔱', '🃏', '💎', '👑', '💰']
];

const GamePage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { games, currentUser, processGameSpin } = useStore();
  
  const mode = new URLSearchParams(location.search).get('mode');
  const currencyType = mode === 'sc' ? CurrencyType.SC : CurrencyType.GC;
  const game = games.find(g => g.id === id);

  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>(Array(5).fill(Array(3).fill('🃏')));
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);
  const [teaseReel, setTeaseReel] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState(0);
  const [displayWin, setDisplayWin] = useState(0);
  const [winLinesVisible, setWinLinesVisible] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  const [bet, setBet] = useState(mode === 'sc' ? 1 : 100);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [autoSpinLimit, setAutoSpinLimit] = useState<number>(0);
  const [autoSpinActive, setAutoSpinActive] = useState(false);
  const [turboMode, setTurboMode] = useState(false);

  useEffect(() => {
    if (lastWin > displayWin) {
      const increment = Math.ceil((lastWin - displayWin) / 10);
      const timer = setTimeout(() => {
        setDisplayWin(prev => Math.min(lastWin, prev + increment));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [lastWin, displayWin]);

  useEffect(() => {
    if (autoSpinActive && !isSpinning && autoSpinLimit > 0) {
      const timer = setTimeout(handleSpin, 1200);
      return () => clearTimeout(timer);
    } else if (autoSpinLimit === 0 && autoSpinActive) {
      setAutoSpinActive(false);
    }
  }, [autoSpinActive, isSpinning, autoSpinLimit]);

  if (!game || !currentUser) return null;

  const handleSpin = async () => {
    if (isSpinning) return;
    
    const currencyField = currencyType === CurrencyType.GC ? 'goldCoins' : 'sweepCoins';
    if (currentUser[currencyField] < bet) {
      setShowQuickBuy(true);
      setAutoSpinActive(false);
      return;
    }

    setIsSpinning(true);
    setLastWin(0);
    setDisplayWin(0);
    setWinLinesVisible(false);
    setTeaseReel(null);
    setMessage(null);
    setSpinningReels([true, true, true, true, true]);

    if (autoSpinActive) {
      setAutoSpinLimit(prev => Math.max(0, prev - 1));
    }

    const intervals = [0, 1, 2, 3, 4].map(i => {
      const strip = REEL_STRIPS[i];
      return setInterval(() => {
        setReels(prev => {
          const next = [...prev];
          const stopIdx = Math.floor(Math.random() * strip.length);
          next[i] = [
            strip[stopIdx],
            strip[(stopIdx + 1) % strip.length],
            strip[(stopIdx + 2) % strip.length]
          ];
          return next;
        });
      }, turboMode ? 40 : 70);
    });

    try {
      const result = await processGameSpin(game.id, bet, currencyType);
      let scattersFound = 0;
      
      [0, 1, 2, 3, 4].forEach((i, idx) => {
        let stopDelay = turboMode ? (idx * 120) : (800 + idx * 400);
        
        // Tease logic for big potential wins or scatters
        if (scattersFound >= 2 && !turboMode) stopDelay += 1500;

        setTimeout(() => {
          clearInterval(intervals[i]);
          if (result.reels[i].includes('💖')) scattersFound++;
          if (scattersFound >= 2 && i < 4 && !turboMode) setTeaseReel(i + 1);
          else setTeaseReel(null);

          setSpinningReels(prev => {
            const next = [...prev];
            next[i] = false;
            return next;
          });
          setReels(prev => {
            const next = [...prev];
            next[i] = result.reels[i];
            return next;
          });

          if (i === 4) {
            setIsSpinning(false);
            setTeaseReel(null);
            setMessage(result.message);
            if (result.won) {
              setLastWin(result.amount);
              setWinLinesVisible(true);
            }
          }
        }, stopDelay);
      });
    } catch (e: any) {
      intervals.forEach(clearInterval);
      setIsSpinning(false);
      setSpinningReels([false, false, false, false, false]);
      alert(e.message);
    }
  };

  const adjustBet = (multiplier: number) => {
    const newBet = Math.round(bet * multiplier);
    setBet(Math.min(game.maxBet, Math.max(game.minBet, newBet)));
  };

  const accentColor = game.themeColor || '#f59e0b';

  return (
    <Layout hideSidebar>
      <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-8 py-2 sm:py-8 h-full select-none">
        
        {/* Game Header */}
        <div className="flex items-center justify-between px-4 sm:px-10">
           <Button variant="ghost" onClick={() => navigate('/lobby')} className="px-4 sm:px-8 py-2 sm:py-4 border border-zinc-800 rounded-2xl hover:bg-zinc-900 group text-[10px] sm:text-sm">
             <span className="mr-2 group-hover:-translate-x-2 transition-transform inline-block">←</span> LOBBY
           </Button>
           
           <div className="flex items-center gap-4 sm:gap-12">
              <div className="hidden lg:flex flex-col items-center">
                 <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.5em] mb-2 italic">Monarch Grade Gaming</div>
                 <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_#f59e0b]" />)}
                 </div>
              </div>
              <CurrencyBadge type={currencyType} amount={currentUser[currencyType === CurrencyType.GC ? 'goldCoins' : 'sweepCoins']} />
           </div>
        </div>

        {/* Main Machine Area */}
        <div 
          className="relative flex-1 bg-zinc-950 rounded-[32px] sm:rounded-[80px] border-[6px] sm:border-[20px] border-zinc-900 shadow-[0_40px_120px_rgba(0,0,0,1)] overflow-hidden flex flex-col items-center justify-center p-2 sm:p-10 transition-all duration-1000 transform-gpu"
          style={{ 
            boxShadow: `0 0 60px ${accentColor}15, inset 0 0 40px ${accentColor}08`,
          }}
        >
           {/* Decorative Lighting */}
           <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent blur-md" />
           <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent blur-md" />

           {/* Brand Plate */}
           <div className="absolute top-4 sm:top-16 left-6 sm:left-20 flex flex-col z-20">
              <div className="flex items-center gap-2 sm:gap-4 mb-1 sm:mb-4">
                <div className={`w-2 sm:w-4 h-2 sm:h-4 rounded-full ${isSpinning ? 'animate-ping' : ''}`} style={{ backgroundColor: accentColor }} />
                <div className="font-black text-[8px] sm:text-[14px] uppercase tracking-[0.3em] sm:tracking-[0.8em] italic" style={{ color: accentColor }}>CrownPlay Original</div>
              </div>
              <h1 className="text-xl sm:text-7xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-2xl">{game.name}</h1>
           </div>

           {/* Reels Grid */}
           <div className="relative grid grid-cols-5 gap-1 sm:gap-6 md:gap-10 w-full max-w-6xl h-[280px] sm:h-[650px] mt-12 sm:mt-28 z-10 perspective-2000 px-2 sm:px-0">
              {reels.map((reel, i) => (
                <div 
                  key={i} 
                  className={`relative flex flex-col gap-2 sm:gap-8 h-full bg-zinc-900/60 rounded-[12px] sm:rounded-[64px] border-2 overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,1)] backdrop-blur-2xl transition-all duration-500 transform-gpu
                    ${spinningReels[i] ? 'spinning-reel' : 'stopped-reel'}
                    ${teaseReel === i ? 'tease-reel ring-4 ring-amber-500 ring-opacity-50' : ''}
                  `}
                  style={{ 
                    borderColor: teaseReel === i ? '#f59e0b' : (spinningReels[i] ? `${accentColor}55` : '#27272a'),
                    transform: spinningReels[i] ? 'scale(1.02)' : 'scale(1)',
                  }}
                >
                   {reel.map((sym, si) => (
                     <div key={si} className="flex-1 flex items-center justify-center relative">
                        <div className={`text-4xl sm:text-[9rem] md:text-[12rem] select-none transition-all
                          ${spinningReels[i] ? 'symbol-motion' : 'symbol-land'} 
                          ${lastWin > 0 && !isSpinning ? 'symbol-celebrate drop-shadow-[0_0_20px_#f59e0b]' : ''}
                        `}>
                           {sym}
                        </div>
                     </div>
                   ))}
                   {spinningReels[i] && <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/20 to-transparent pointer-events-none" />}
                </div>
              ))}
              
              {/* Payline visualization */}
              {winLinesVisible && (
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                    <polyline 
                      points="0,150 1200,150" 
                      className="stroke-amber-400 stroke-[4] sm:stroke-[12] fill-none animate-payline-pulse opacity-90 shadow-[0_0_20px_#f59e0b]"
                    />
                 </svg>
              )}
           </div>

           {/* Big Win Celebratory Overlay */}
           {lastWin > 0 && !isSpinning && (
             <div className="absolute inset-0 z-[100] flex items-center justify-center bg-zinc-950/95 backdrop-blur-3xl p-6 animate-in fade-in zoom-in duration-500">
                <div className="text-center relative">
                   <div className="absolute -inset-40 bg-amber-500/10 blur-[120px] rounded-full animate-pulse" />
                   <div className="text-6xl sm:text-[20rem] mb-2 sm:mb-12 animate-bounce transform-gpu" style={{ color: accentColor }}>👑</div>
                   <h2 className="text-4xl sm:text-[10rem] font-black italic tracking-tighter text-white uppercase mb-2 animate-pulse leading-none">{message}</h2>
                   <div className="flex flex-col items-center gap-1 sm:gap-6 mb-8 sm:mb-24">
                     <div className="text-5xl sm:text-[14rem] font-black italic tracking-tighter text-amber-400 drop-shadow-[0_0_40px_#f59e0b] leading-none">
                       {displayWin.toLocaleString()}
                     </div>
                     <span className="text-lg sm:text-5xl font-black text-white italic opacity-60 tracking-[0.2em] uppercase">{currencyType === CurrencyType.GC ? 'Gold Coins' : 'Sweep Credits'}</span>
                   </div>
                   <Button variant="primary" className="px-12 sm:px-48 py-4 sm:py-12 text-xl sm:text-5xl rounded-[24px] sm:rounded-[60px] shadow-[0_30px_90px_rgba(245,158,11,0.5)]" onClick={() => setLastWin(0)}>COLLECT TRIBUTE</Button>
                </div>
             </div>
           )}

           {/* Game Footer / Controls */}
           <div className="mt-8 sm:mt-24 w-full max-w-6xl bg-zinc-900/90 border-2 border-zinc-800/50 p-3 sm:p-14 rounded-[28px] sm:rounded-[80px] flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-16 shadow-2xl relative z-20 backdrop-blur-3xl">
              
              {/* Bet Controls */}
              <div className="flex items-center gap-4 sm:gap-16 w-full sm:w-auto justify-between sm:justify-start">
                 <div className="flex flex-col">
                    <span className="text-[9px] sm:text-[14px] font-black text-zinc-600 uppercase tracking-[0.5em] mb-2 sm:mb-6 italic">Current Bet</span>
                    <div className="flex items-center gap-2 sm:gap-8 bg-black/60 p-1.5 sm:p-5 rounded-[16px] sm:rounded-[48px] border-2 border-zinc-800 shadow-inner">
                       <button onClick={() => adjustBet(0.5)} className="w-9 h-9 sm:w-20 sm:h-20 rounded-xl sm:rounded-[32px] bg-zinc-900 text-[10px] sm:text-lg text-zinc-500 font-black hover:text-white transition-colors">½</button>
                       <div className="px-4 sm:px-14 flex flex-col items-center min-w-[80px] sm:min-w-[220px]">
                          <span className="text-lg sm:text-6xl font-black text-white italic tracking-tighter">{bet.toLocaleString()}</span>
                          <span className="text-[7px] sm:text-[12px] font-black text-zinc-700 uppercase">{currencyType === CurrencyType.GC ? 'GC' : 'SC'}</span>
                       </div>
                       <button onClick={() => adjustBet(2)} className="w-9 h-9 sm:w-20 sm:h-20 rounded-xl sm:rounded-[32px] bg-zinc-900 text-[10px] sm:text-lg text-zinc-500 font-black hover:text-white transition-colors">2×</button>
                    </div>
                 </div>

                 {/* Extra Toggles */}
                 <div className="flex gap-2 sm:gap-6">
                    <div className="flex flex-col items-center">
                       <span className="text-[8px] font-black text-zinc-700 uppercase mb-2">Turbo</span>
                       <button onClick={() => setTurboMode(!turboMode)} className={`w-10 h-10 sm:w-20 sm:h-20 rounded-[12px] sm:rounded-[32px] border-2 sm:border-4 flex items-center justify-center text-lg sm:text-5xl transition-all ${turboMode ? 'bg-amber-500 border-amber-300 text-zinc-950 shadow-[0_0_15px_#f59e0b]' : 'bg-zinc-950 border-zinc-800 text-zinc-800'}`}>⚡</button>
                    </div>
                    <div className="flex flex-col items-center">
                       <span className="text-[8px] font-black text-zinc-700 uppercase mb-2">Auto</span>
                       <button onClick={() => { if(autoSpinLimit <= 0) setAutoSpinLimit(25); setAutoSpinActive(!autoSpinActive); }} className={`w-10 h-10 sm:w-20 sm:h-20 rounded-[12px] sm:rounded-[32px] border-2 sm:border-4 flex items-center justify-center text-lg sm:text-5xl transition-all ${autoSpinActive ? 'bg-emerald-500 border-emerald-300 text-zinc-950 shadow-[0_0_15px_#10b981]' : 'bg-zinc-950 border-zinc-800 text-zinc-800'}`}>
                          {autoSpinActive ? <span className="text-sm sm:text-2xl font-black">{autoSpinLimit}</span> : '🔄'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Main Spin Button */}
              <button 
                onClick={handleSpin}
                disabled={isSpinning}
                className={`group relative w-full sm:w-auto h-16 sm:h-36 px-14 sm:px-36 rounded-[24px] sm:rounded-[64px] font-black text-2xl sm:text-6xl italic tracking-tighter uppercase transition-all shadow-2xl active:scale-95 transform-gpu
                  ${isSpinning ? 'bg-zinc-800 text-zinc-700' : 'text-zinc-950 hover:brightness-110'}
                `}
                style={{ backgroundColor: isSpinning ? undefined : accentColor }}
              >
                {!isSpinning && (
                  <div className="absolute inset-0 rounded-[24px] sm:rounded-[64px] bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                )}
                {isSpinning ? (
                  <div className="flex gap-1.5 sm:gap-3">
                     {[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 sm:w-4 h-4 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: `${i * 100}ms` }} />)}
                  </div>
                ) : 'SPIN'}
              </button>
           </div>
        </div>
        <QuickBuyModal isOpen={showQuickBuy} onClose={() => setShowQuickBuy(false)} />
        <style>{`
          .spinning-reel { animation: reel-blur-vibrate 0.1s infinite linear; }
          @keyframes reel-blur-vibrate { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(2px); } }
          
          .stopped-reel { animation: reel-snap 0.5s cubic-bezier(0.25, 1.5, 0.5, 1); }
          @keyframes reel-snap { 0% { transform: translateY(-20px); } 100% { transform: translateY(0); } }
          
          .symbol-motion { filter: blur(10px); opacity: 0.4; transform: scaleY(1.4); }
          
          .symbol-land { animation: symbol-entry 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
          @keyframes symbol-entry { 0% { transform: scale(0.6) translateY(-40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
          
          .symbol-celebrate { animation: symbol-win-wiggle 1s infinite; z-index: 30; }
          @keyframes symbol-win-wiggle { 
            0%, 100% { transform: scale(1) rotate(0); } 
            25% { transform: scale(1.2) rotate(5deg); } 
            75% { transform: scale(1.2) rotate(-5deg); } 
          }
          
          .tease-reel { animation: tease-glow 0.8s infinite alternate; }
          @keyframes tease-glow { from { box-shadow: 0 0 5px #f59e0b; } to { box-shadow: 0 0 30px #f59e0b; } }
          
          .animate-payline-pulse { animation: payline-pulse 1s infinite; }
          @keyframes payline-pulse { 0%, 100% { opacity: 0.9; stroke-width: 12px; } 50% { opacity: 0.4; stroke-width: 24px; } }
          
          .animate-flash-text { animation: flash-text 0.5s infinite; }
          @keyframes flash-text { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.98); } }
          
          .transform-gpu { transform-style: preserve-3d; backface-visibility: hidden; }
        `}</style>
      </div>
    </Layout>
  );
};

export default GamePage;
