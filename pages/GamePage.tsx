
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
      let scattersFound = 0;
      
      [0, 1, 2, 3, 4].forEach((i, idx) => {
        let stopDelay = turboMode ? (idx * 150) : (1000 + idx * 500);
        if (scattersFound >= 2 && !turboMode) stopDelay += 2000;

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
      <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 py-2 sm:py-4 h-full select-none">
        
        <div className="flex items-center justify-between px-2 sm:px-6">
           <Button variant="ghost" onClick={() => navigate('/lobby')} className="px-3 sm:px-6 py-2 sm:py-3 border border-zinc-800 rounded-xl sm:rounded-2xl hover:bg-zinc-900 group">
             <span className="mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform inline-block">←</span> LOBBY
           </Button>
           
           <div className="flex items-center gap-2 sm:gap-8">
              <div className="hidden sm:flex flex-col items-center">
                 <div className="text-[8px] sm:text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-1">Crown-Certified</div>
                 <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => <div key={i} className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />)}
                 </div>
              </div>
              <CurrencyBadge type={currencyType} amount={currentUser[currencyType === CurrencyType.GC ? 'goldCoins' : 'sweepCoins']} />
           </div>
        </div>

        <div 
          className="relative flex-1 bg-zinc-950 rounded-[32px] sm:rounded-[64px] border-[6px] sm:border-[14px] border-zinc-900 shadow-[0_20px_100px_rgba(0,0,0,1)] overflow-hidden flex flex-col items-center justify-center p-2 sm:p-6 transition-all duration-1000"
          style={{ 
            boxShadow: `0 0 60px ${accentColor}10, inset 0 0 30px ${accentColor}05`,
          }}
        >
           <div className="absolute top-4 sm:top-12 left-4 sm:left-14 flex flex-col z-10">
              <div className="flex items-center gap-1.5 sm:gap-3 mb-1 sm:mb-2">
                <div className={`w-2 h-2 sm:w-3 h-3 rounded-full ${isSpinning ? 'animate-ping' : ''}`} style={{ backgroundColor: accentColor }} />
                <div className="font-black text-[7px] sm:text-[12px] uppercase tracking-[0.4em] sm:tracking-[0.6em] italic" style={{ color: accentColor }}>CrownPlay Neon</div>
              </div>
              <h1 className="text-2xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-xl">{game.name}</h1>
           </div>

           <div className="relative grid grid-cols-5 gap-1 sm:gap-4 md:gap-8 w-full max-w-5xl h-[300px] sm:h-[520px] mt-12 sm:mt-20 z-10 perspective-1000 px-2 sm:px-0">
              {reels.map((reel, i) => (
                <div 
                  key={i} 
                  className={`relative flex flex-col gap-2 sm:gap-6 h-full bg-zinc-900/50 rounded-[12px] sm:rounded-[48px] border overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] backdrop-blur-2xl transition-all duration-300
                    ${spinningReels[i] ? 'spinning-reel' : 'stopped-reel'}
                    ${teaseReel === i ? 'tease-reel' : ''}
                  `}
                  style={{ 
                    borderColor: teaseReel === i ? '#f59e0b' : (spinningReels[i] ? `${accentColor}44` : '#27272a'),
                  }}
                >
                   {reel.map((sym, si) => (
                     <div key={si} className="flex-1 flex items-center justify-center">
                        <div className={`text-4xl sm:text-8xl md:text-[10rem] select-none ${spinningReels[i] ? 'symbol-motion' : 'symbol-land'} ${lastWin > 0 && !isSpinning ? 'symbol-celebrate' : ''}`}>
                           {sym}
                        </div>
                     </div>
                   ))}
                </div>
              ))}
              {winLinesVisible && (
                 <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                    <polyline 
                      points="0,150 1024,150" 
                      className="stroke-amber-400 stroke-[3] sm:stroke-[6] fill-none animate-payline-pulse opacity-80"
                    />
                 </svg>
              )}
           </div>

           {lastWin > 0 && !isSpinning && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-3xl p-4">
                <div className="text-center">
                   <div className="text-6xl sm:text-[14rem] mb-2 sm:mb-6 animate-bounce" style={{ color: accentColor }}>👑</div>
                   <h2 className="text-4xl sm:text-8xl font-black italic tracking-tighter text-white uppercase mb-2 animate-flash-text">BIG WIN!</h2>
                   <div className="flex items-center gap-4 sm:gap-8 mb-8 sm:mb-16 justify-center">
                     <div className="text-5xl sm:text-9xl font-black italic tracking-tighter text-amber-400">
                       {displayWin.toLocaleString()}
                     </div>
                     <span className="text-xl sm:text-4xl font-black text-white italic">{currencyType === CurrencyType.GC ? 'GC' : 'SC'}</span>
                   </div>
                   <Button variant="primary" className="px-16 sm:px-32 py-4 sm:py-10 text-xl sm:text-4xl rounded-[20px] sm:rounded-[40px]" onClick={() => setLastWin(0)}>COLLECT</Button>
                </div>
             </div>
           )}

           <div className="mt-4 sm:mt-16 w-full max-w-5xl bg-zinc-900 border-2 border-zinc-800 p-3 sm:p-10 rounded-[24px] sm:rounded-[60px] flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-12 shadow-2xl relative z-20">
              <div className="flex items-center gap-4 sm:gap-12 w-full sm:w-auto justify-between sm:justify-start">
                 <div className="flex flex-col">
                    <span className="text-[8px] sm:text-[12px] font-black text-zinc-600 uppercase tracking-widest mb-1 sm:mb-4 italic">BET</span>
                    <div className="flex items-center gap-2 sm:gap-5 bg-zinc-950 p-1.5 sm:p-3 rounded-[20px] sm:rounded-[40px] border border-zinc-800">
                       <button onClick={() => adjustBet(0.5)} className="w-8 h-8 sm:w-14 sm:h-16 rounded-lg sm:rounded-[24px] bg-zinc-900 text-[8px] sm:text-xs text-zinc-500 font-black">½x</button>
                       <div className="px-4 sm:px-12 flex flex-col items-center min-w-[80px] sm:min-w-[160px]">
                          <span className="text-base sm:text-4xl font-black text-white italic tracking-tighter">{bet.toLocaleString()}</span>
                       </div>
                       <button onClick={() => adjustBet(2)} className="w-8 h-8 sm:w-14 sm:h-16 rounded-lg sm:rounded-[24px] bg-zinc-900 text-[8px] sm:text-xs text-zinc-500 font-black">2x</button>
                    </div>
                 </div>

                 <div className="flex gap-2 sm:gap-4">
                    <button onClick={() => setTurboMode(!turboMode)} className={`w-10 h-10 sm:w-16 sm:h-16 rounded-[12px] sm:rounded-[28px] border-2 sm:border-4 flex items-center justify-center text-xl sm:text-4xl ${turboMode ? 'bg-amber-500 border-amber-300 text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-zinc-800'}`}>⚡</button>
                    <button onClick={() => { if(autoSpinLimit <= 0) setAutoSpinLimit(10); setAutoSpinActive(!autoSpinActive); }} className={`w-10 h-10 sm:w-16 sm:h-16 rounded-[12px] sm:rounded-[28px] border-2 sm:border-4 flex items-center justify-center text-xl sm:text-4xl ${autoSpinActive ? 'bg-emerald-500 border-emerald-300 text-zinc-950' : 'bg-zinc-950 border-zinc-800 text-zinc-800'}`}>🔄</button>
                 </div>
              </div>

              <button 
                onClick={handleSpin}
                disabled={isSpinning}
                className={`w-full sm:w-auto h-16 sm:h-32 px-12 sm:px-28 rounded-[20px] sm:rounded-[48px] font-black text-2xl sm:text-5xl italic tracking-tighter uppercase transition-all shadow-xl
                  ${isSpinning ? 'bg-zinc-800 text-zinc-700' : 'text-zinc-950'}
                `}
                style={{ backgroundColor: isSpinning ? undefined : accentColor }}
              >
                {isSpinning ? '...' : 'SPIN'}
              </button>
           </div>
        </div>
        <QuickBuyModal isOpen={showQuickBuy} onClose={() => setShowQuickBuy(false)} />
        <style>{`
          .spinning-reel { animation: mechanical-vibrate 0.08s infinite linear; }
          @keyframes mechanical-vibrate { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(2px); } }
          .stopped-reel { animation: mechanical-snap 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
          @keyframes mechanical-snap { 0% { transform: translateY(-20px); } 100% { transform: translateY(0); } }
          .symbol-motion { filter: blur(8px); opacity: 0.5; }
          .symbol-land { animation: symbol-drop 0.3s ease-out; }
          @keyframes symbol-drop { 0% { transform: scale(0.8) translateY(-40px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
          .symbol-celebrate { animation: symbol-bounce 0.8s infinite; text-shadow: 0 0 20px ${accentColor}; }
          @keyframes symbol-bounce { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.2); } }
          @keyframes flash-text { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        `}</style>
      </div>
    </Layout>
  );
};

export default GamePage;
