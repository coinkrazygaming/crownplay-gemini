
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button, CurrencyBadge, Card, QuickBuyModal, Badge } from '../components';
import { useStore } from '../store';
import { CurrencyType } from '../types';

// Predefined Reel Strips for "Neon Hearts" - mimic mechanical slot behavior
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

  // Engine State
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>(Array(5).fill(Array(3).fill('🃏')));
  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);
  const [teaseReel, setTeaseReel] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState(0);
  const [displayWin, setDisplayWin] = useState(0);
  const [winLinesVisible, setWinLinesVisible] = useState(false);
  
  // Controls
  const [bet, setBet] = useState(mode === 'sc' ? 1 : 100);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [autoSpinLimit, setAutoSpinLimit] = useState<number>(0);
  const [autoSpinActive, setAutoSpinActive] = useState(false);
  const [turboMode, setTurboMode] = useState(false);

  // Win Roll-up Animation logic
  useEffect(() => {
    if (lastWin > displayWin) {
      const increment = Math.ceil((lastWin - displayWin) / 10);
      const timer = setTimeout(() => {
        setDisplayWin(prev => Math.min(lastWin, prev + increment));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [lastWin, displayWin]);

  // Auto-spin logic
  useEffect(() => {
    if (autoSpinActive && !isSpinning && autoSpinLimit > 0) {
      const timer = setTimeout(handleSpin, 1500);
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
    setSpinningReels([true, true, true, true, true]);

    if (autoSpinActive) {
      setAutoSpinLimit(prev => Math.max(0, prev - 1));
    }

    // Visual Shuffle Intervals
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
      }, turboMode ? 40 : 60);
    });

    try {
      const result = await processGameSpin(game.id, bet, currencyType);
      
      // Sequential stopping with mechanical "Tease" logic
      let scattersFound = 0;
      
      [0, 1, 2, 3, 4].forEach((i, idx) => {
        let stopDelay = turboMode ? (idx * 150) : (1000 + idx * 500);
        
        // Near-miss "Tease" logic: if 2 scatters land (using '💖' as scatter), delay following reels
        if (scattersFound >= 2 && !turboMode) {
          stopDelay += 2000; // Extend spin for tension
        }

        setTimeout(() => {
          clearInterval(intervals[i]);
          
          // Check if this reel contains scatters to trigger tease for NEXT reels
          if (result.reels[i].includes('💖')) scattersFound++;
          
          if (scattersFound >= 2 && i < 4 && !turboMode) {
            setTeaseReel(i + 1);
          } else {
            setTeaseReel(null);
          }

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

          // All stopped
          if (i === 4) {
            setIsSpinning(false);
            setTeaseReel(null);
            if (result.won) {
              setLastWin(result.amount);
              setWinLinesVisible(true);
            }
          }
        }, stopDelay);
      });

    } catch (e) {
      intervals.forEach(clearInterval);
      setIsSpinning(false);
      setSpinningReels([false, false, false, false, false]);
    }
  };

  const adjustBet = (multiplier: number) => {
    const newBet = Math.round(bet * multiplier);
    setBet(Math.min(game.maxBet, Math.max(game.minBet, newBet)));
  };

  const accentColor = game.themeColor || '#f59e0b';

  return (
    <Layout hideSidebar>
      <div className="max-w-6xl mx-auto flex flex-col gap-6 py-4 h-full select-none overflow-hidden">
        
        {/* Flash-Era Status Header */}
        <div className="flex items-center justify-between px-6 animate-in slide-in-from-top duration-500">
           <Button variant="ghost" onClick={() => navigate('/lobby')} className="px-6 py-3 border border-zinc-800 rounded-2xl hover:bg-zinc-900 group">
             <span className="mr-2 group-hover:-translate-x-1 transition-transform inline-block">←</span> LOBBY
           </Button>
           
           <div className="flex items-center gap-8">
              <div className="hidden lg:flex flex-col items-center">
                 <div className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1">Crown-Certified RNG</div>
                 <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
                 </div>
              </div>
              <CurrencyBadge type={currencyType} amount={currentUser[currencyType === CurrencyType.GC ? 'goldCoins' : 'sweepCoins']} />
           </div>
        </div>

        {/* The Slot Machine Cabinet */}
        <div 
          className={`relative flex-1 bg-zinc-950 rounded-[64px] border-[14px] border-zinc-900 shadow-[0_40px_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col items-center justify-center p-6 transition-all duration-1000 ${isSpinning ? 'brightness-[1.1]' : ''}`}
          style={{ 
            boxShadow: `0 0 120px ${accentColor}15, inset 0 0 60px ${accentColor}05`,
            borderColor: isSpinning ? '#1a1a1a' : '#0f0f0f'
          }}
        >
           {/* Background Particle Rays */}
           <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,white_10deg,transparent_20deg)] animate-[spin_60s_linear_infinite]" />
           </div>

           {/* Brand Branding Overlay */}
           <div className="absolute top-12 left-14 flex flex-col z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${isSpinning ? 'animate-ping' : ''}`} style={{ backgroundColor: accentColor }} />
                <div className="font-black text-[12px] uppercase tracking-[0.6em] italic" style={{ color: accentColor }}>CrownPlay Neon Royale</div>
              </div>
              <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)] outline-8">{game.name}</h1>
           </div>

           {/* Reel Grid Container */}
           <div className="relative grid grid-cols-5 gap-4 md:gap-8 w-full max-w-5xl h-[520px] mt-20 z-10 perspective-1000">
              {reels.map((reel, i) => (
                <div 
                  key={i} 
                  className={`relative flex flex-col gap-6 h-full bg-zinc-900/50 rounded-[48px] border-2 overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all duration-300
                    ${spinningReels[i] ? 'spinning-reel' : 'stopped-reel'}
                    ${teaseReel === i ? 'tease-reel' : ''}
                  `}
                  style={{ 
                    borderColor: teaseReel === i ? '#f59e0b' : (spinningReels[i] ? `${accentColor}44` : '#27272a'),
                    boxShadow: teaseReel === i ? '0 0 40px #f59e0b55, inset 0 0 40px #f59e0b33' : undefined
                  }}
                >
                   {reel.map((sym, si) => (
                     <div key={si} className="flex-1 flex items-center justify-center transition-transform duration-300">
                        <div className={`text-8xl md:text-[10rem] select-none ${spinningReels[i] ? 'symbol-motion' : 'symbol-land'} ${lastWin > 0 && !isSpinning ? 'symbol-celebrate' : ''}`}>
                           {sym}
                        </div>
                     </div>
                   ))}
                   {/* Mechanical Shine Overlay */}
                   <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
                </div>
              ))}

              {/* Animated Payline Overlay (Flash-style) */}
              {winLinesVisible && (
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                    <polyline 
                      points="0,260 1024,260" 
                      className="stroke-amber-400 stroke-[6] fill-none animate-payline-pulse opacity-80"
                      strokeDasharray="20,10"
                    />
                 </svg>
              )}
           </div>

           {/* Big Win Pop-up (MovieClip Style) */}
           {lastWin > 0 && !isSpinning && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-3xl animate-in zoom-in-75 duration-500">
                <div className="text-center relative">
                   <div className="absolute -inset-40 bg-amber-500/20 blur-[150px] rounded-full animate-pulse" />
                   
                   <div className="relative flex flex-col items-center">
                      <div className="text-[14rem] mb-6 drop-shadow-[0_0_60px_rgba(255,255,255,0.6)] animate-bounce" style={{ color: accentColor }}>👑</div>
                      <h2 className="text-8xl md:text-[10rem] font-black italic tracking-tighter text-white uppercase leading-none mb-4 animate-flash-text drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">MEGA WIN!</h2>
                      
                      <div className="flex items-center gap-8 mb-16">
                        <div className="text-9xl md:text-[12rem] font-black italic tracking-tighter text-amber-400 drop-shadow-[0_0_50px_rgba(245,158,11,0.5)]">
                          {displayWin.toLocaleString()}
                        </div>
                        <span className="text-4xl font-black text-white italic rotate-12 bg-zinc-800 px-4 py-2 rounded-2xl border-4 border-amber-500">
                          {currencyType === CurrencyType.GC ? 'GC' : 'SC'}
                        </span>
                      </div>
                      
                      <Button 
                        variant="primary" 
                        className="px-32 py-10 text-4xl shadow-[0_30px_100px_rgba(245,158,11,0.5)] border-b-[12px] border-amber-800 active:border-b-0 active:translate-y-3 transition-all rounded-[40px]" 
                        onClick={() => setLastWin(0)}
                      >
                        COLLECT
                      </Button>
                   </div>
                </div>
             </div>
           )}

           {/* Control Deck (Retro Dashboard Style) */}
           <div className="mt-16 w-full max-w-5xl bg-gradient-to-b from-zinc-900 to-black border-2 border-zinc-800 p-10 rounded-[60px] flex items-center justify-between gap-12 shadow-[0_60px_120px_rgba(0,0,0,1)] relative z-20 group-hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-12">
                 {/* Bet Interface */}
                 <div className="flex flex-col">
                    <span className="text-[12px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4 ml-4 italic">TOTAL WAGER</span>
                    <div className="flex items-center gap-5 bg-zinc-950 p-3 rounded-[40px] border-2 border-zinc-800 shadow-inner">
                       <button onClick={() => adjustBet(0.5)} className="w-14 h-16 rounded-[24px] bg-zinc-900 text-xs text-zinc-500 font-black hover:text-white border-b-4 border-black active:border-b-0 transition-all active:scale-95">½x</button>
                       <div className="px-12 flex flex-col items-center min-w-[160px]">
                          <span className="text-4xl font-black text-white italic tracking-tighter">{bet.toLocaleString()}</span>
                          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mt-1">{currencyType === CurrencyType.GC ? 'Gold Coins' : 'Sweep Coins'}</span>
                       </div>
                       <button onClick={() => adjustBet(2)} className="w-14 h-16 rounded-[24px] bg-zinc-900 text-xs text-zinc-500 font-black hover:text-white border-b-4 border-black active:border-b-0 transition-all active:scale-95">2x</button>
                    </div>
                 </div>

                 <div className="h-20 w-0.5 bg-zinc-800" />

                 {/* Advanced Mode Toggle */}
                 <div className="flex flex-col">
                    <span className="text-[12px] font-black text-zinc-600 uppercase tracking-[0.4em] mb-4 ml-4 italic">ENGINE</span>
                    <div className="flex gap-4">
                       <button 
                        onClick={() => setTurboMode(!turboMode)}
                        className={`w-16 h-16 rounded-[28px] border-4 flex items-center justify-center text-4xl transition-all active:scale-90 ${turboMode ? 'bg-amber-500 border-amber-300 text-zinc-950 shadow-xl' : 'bg-zinc-950 border-zinc-800 text-zinc-800 hover:text-zinc-600'}`}
                        title="Turbo Mode"
                       >
                         ⚡
                       </button>
                       <div className="flex items-center gap-4 bg-zinc-950 border-4 border-zinc-800 rounded-[28px] px-6 h-16 shadow-inner">
                         <input 
                            type="number" 
                            className="w-12 bg-transparent text-white text-center font-black text-2xl outline-none"
                            value={autoSpinLimit}
                            onChange={(e) => setAutoSpinLimit(parseInt(e.target.value) || 0)}
                         />
                         <button 
                          onClick={() => { if(autoSpinLimit <= 0) setAutoSpinLimit(10); setAutoSpinActive(!autoSpinActive); }}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-3xl transition-all active:scale-95 ${autoSpinActive ? 'bg-emerald-500 text-zinc-950 shadow-lg' : 'text-zinc-800 hover:text-zinc-600'}`}
                          title="Auto-Play"
                         >
                           🔄
                         </button>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Current Win Roll-up Display */}
              <div className="flex flex-col items-center flex-1">
                 <span className="text-[12px] font-black text-zinc-700 uppercase tracking-[0.4em] mb-3">LAST SPOIL</span>
                 <div className={`text-7xl font-black italic tracking-tighter transition-all duration-500 ${displayWin > 0 ? 'scale-110 drop-shadow-[0_0_30px_rgba(245,158,11,0.6)]' : 'text-zinc-800 opacity-20'}`} style={{ color: displayWin > 0 ? accentColor : undefined }}>
                   {displayWin.toLocaleString()}
                 </div>
              </div>

              {/* Master Spin Button (High-Octane Flash style) */}
              <button 
                onClick={handleSpin}
                disabled={isSpinning}
                className={`group relative h-32 px-28 rounded-[48px] font-black text-5xl italic tracking-tighter uppercase transition-all overflow-hidden active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed
                  ${isSpinning ? 'bg-zinc-800 text-zinc-700' : 'text-zinc-950 hover:brightness-110 shadow-[0_30px_100px_rgba(0,0,0,0.8)]'}
                `}
                style={{ 
                  backgroundColor: isSpinning ? undefined : accentColor,
                  boxShadow: !isSpinning ? `0 25px 80px ${accentColor}55, inset 0 8px 20px rgba(255,255,255,0.6)` : 'none'
                }}
              >
                <div className="relative z-10 flex items-center gap-6">
                  {isSpinning ? '...' : 'SPIN'}
                </div>
                {isSpinning && (
                   <div className="absolute inset-0 bg-white/10 animate-pulse" />
                )}
                {!isSpinning && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-180%] group-hover:translate-x-[180%] transition-transform duration-1000 ease-in-out" />
                )}
              </button>
           </div>
        </div>

        <QuickBuyModal isOpen={showQuickBuy} onClose={() => setShowQuickBuy(false)} />
        
        <style>{`
          .spinning-reel {
            animation: mechanical-vibrate 0.08s infinite linear;
          }
          @keyframes mechanical-vibrate {
            0% { transform: translateY(0); }
            50% { transform: translateY(4px); }
            100% { transform: translateY(0); }
          }
          .stopped-reel {
            animation: mechanical-snap 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          }
          @keyframes mechanical-snap {
            0% { transform: translateY(-40px); }
            60% { transform: translateY(10px); }
            100% { transform: translateY(0); }
          }
          .tease-reel {
            animation: tease-pulse 0.4s infinite alternate;
          }
          @keyframes tease-pulse {
            from { transform: scale(1.02); filter: brightness(1.1); }
            to { transform: scale(1.05); filter: brightness(1.5) contrast(1.2); }
          }
          .symbol-motion {
            filter: blur(16px);
            transform: scaleY(2.2) scaleX(0.8);
            opacity: 0.5;
          }
          .symbol-land {
            animation: symbol-drop 0.3s ease-out;
          }
          @keyframes symbol-drop {
            0% { transform: scale(0.6) translateY(-100px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
          .symbol-celebrate {
            animation: symbol-bounce 0.8s infinite cubic-bezier(0.175, 0.885, 0.32, 1.275);
            text-shadow: 0 0 40px ${accentColor}, 0 0 80px white;
            z-index: 30;
          }
          @keyframes symbol-bounce {
            0%, 100% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.4) rotate(10deg); }
          }
          @keyframes payline-pulse {
            0%, 100% { opacity: 0.2; stroke-width: 4; }
            50% { opacity: 1; stroke-width: 10; filter: blur(4px); }
          }
          .animate-flash-text {
            animation: flash-text 0.5s infinite;
          }
          @keyframes flash-text {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.05); filter: brightness(1.5); }
          }
          .perspective-1000 {
            perspective: 1500px;
          }
        `}</style>
      </div>
    </Layout>
  );
};

export default GamePage;
