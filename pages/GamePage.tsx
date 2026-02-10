
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button, CurrencyBadge, Card, QuickBuyModal } from '../components';
import { useStore } from '../store';
import { CurrencyType } from '../types';

const SYMBOLS = ['👑', '💎', '💰', '🎰', '🔱', '🍀', '🍒', '🔔', '7️⃣'];

const GamePage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { games, currentUser, processGameSpin } = useStore();
  
  const mode = new URLSearchParams(location.search).get('mode');
  const currencyType = mode === 'sc' ? CurrencyType.SC : CurrencyType.GC;
  const game = games.find(g => g.id === id);

  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<string[][]>(Array(5).fill(Array(3).fill('👑')));
  const [bet, setBet] = useState(mode === 'sc' ? 1 : 100);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [lastWin, setLastWin] = useState(0);

  if (!game || !currentUser) return null;

  const handleSpin = async () => {
    if (isSpinning) return;
    
    // Check funds
    const currencyField = currencyType === CurrencyType.GC ? 'goldCoins' : 'sweepCoins';
    if (currentUser[currencyField] < bet) {
      setShowQuickBuy(true);
      return;
    }

    setIsSpinning(true);
    setLastWin(0);

    // Visual Spin Animation
    const spinInterval = setInterval(() => {
      setReels(prev => prev.map(reel => reel.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])));
    }, 100);

    try {
      const result = await processGameSpin(game.id, bet, currencyType);
      
      setTimeout(() => {
        clearInterval(spinInterval);
        setIsSpinning(false);
        if (result.won) {
          setLastWin(result.amount);
          // Result matrix (mock visual)
          const finalSymbols = Array(5).fill(0).map(() => Array(3).fill(0).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]));
          // Force a "win" visual
          const winSym = SYMBOLS[0];
          finalSymbols[0][1] = winSym; finalSymbols[1][1] = winSym; finalSymbols[2][1] = winSym;
          setReels(finalSymbols);
        } else {
          setReels(prev => prev.map(reel => reel.map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])));
        }
      }, 2000);
    } catch (e) {
      clearInterval(spinInterval);
      setIsSpinning(false);
      alert("Kingdom server connection interrupted.");
    }
  };

  return (
    <Layout hideSidebar>
      <div className="max-w-6xl mx-auto flex flex-col gap-8 py-4 sm:py-8 h-full">
        <div className="flex items-center justify-between gap-4">
           <Button variant="ghost" onClick={() => navigate('/lobby')} className="px-4">← BACK TO LOBBY</Button>
           <div className="flex items-center gap-4">
              <CurrencyBadge type={currencyType} amount={currentUser[currencyType === CurrencyType.GC ? 'goldCoins' : 'sweepCoins']} hideLabelOnMobile={false} />
           </div>
        </div>

        <div className="relative flex-1 bg-zinc-900 rounded-[48px] border-4 border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center justify-center p-8">
           {/* Header Info */}
           <div className="absolute top-8 left-12 flex flex-col">
              <h1 className="text-4xl font-black italic tracking-tighter text-amber-500 uppercase leading-none">{game.name}</h1>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-2">Provider: {game.provider} | RTP: {(game.rtp*100).toFixed(1)}%</span>
           </div>

           {/* Reel Grid */}
           <div className="grid grid-cols-5 gap-4 w-full max-w-5xl h-[400px]">
              {reels.map((reel, i) => (
                <div key={i} className={`flex flex-col gap-4 h-full bg-zinc-950 rounded-3xl border-2 border-zinc-900 overflow-hidden shadow-inner ${isSpinning ? 'animate-pulse' : ''}`}>
                   {reel.map((sym, si) => (
                     <div key={si} className="flex-1 flex items-center justify-center text-6xl select-none transition-all duration-300">
                        <span className={isSpinning ? 'blur-sm grayscale opacity-30 scale-110' : 'animate-in zoom-in-75 duration-300'}>
                          {sym}
                        </span>
                     </div>
                   ))}
                </div>
              ))}
           </div>

           {/* Win Animation Overlay */}
           {lastWin > 0 && !isSpinning && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-amber-500/10 backdrop-blur-sm animate-in fade-in duration-500">
                <div className="text-center animate-bounce">
                   <div className="text-amber-500 text-9xl mb-4 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">👑</div>
                   <h2 className="text-6xl font-black italic tracking-tighter text-white uppercase drop-shadow-2xl">ROYAL WIN!</h2>
                   <p className="text-4xl font-black text-amber-400 mt-2">+{lastWin.toLocaleString()} {currencyType === CurrencyType.GC ? 'GC' : 'SC'}</p>
                </div>
             </div>
           )}

           {/* Controls Bar */}
           <div className="mt-12 w-full max-w-4xl bg-zinc-950 border-2 border-zinc-800 p-6 rounded-[32px] flex items-center justify-between gap-8 shadow-2xl relative z-10">
              <div className="flex items-center gap-6 shrink-0">
                 <div className="flex flex-col">
                    <span className="text-[10px) font-black text-zinc-500 uppercase tracking-widest mb-1 text-center">Bet Amount</span>
                    <div className="flex items-center gap-3">
                       {/* Fix: Comparing enum CurrencyType with string 'SC' is incorrect. Use CurrencyType.SC. */}
                       <button onClick={() => setBet(b => Math.max(game.minBet, b - (currencyType === CurrencyType.SC ? 1 : 100)))} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 font-black text-white hover:border-amber-500 transition-all">-</button>
                       <span className="text-2xl font-black text-white w-24 text-center italic">{bet.toLocaleString()}</span>
                       {/* Fix: Comparing enum CurrencyType with string 'SC' is incorrect. Use CurrencyType.SC. */}
                       <button onClick={() => setBet(b => Math.min(game.maxBet, b + (currencyType === CurrencyType.SC ? 1 : 100)))} className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 font-black text-white hover:border-amber-500 transition-all">+</button>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col items-center">
                 <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Win Meter</span>
                 <div className="text-3xl font-black text-emerald-400 italic">
                   {lastWin > 0 ? lastWin.toLocaleString() : '0'}
                 </div>
              </div>

              <div className="shrink-0">
                 <button 
                  onClick={handleSpin}
                  disabled={isSpinning}
                  className={`px-16 py-6 rounded-3xl font-black text-2xl uppercase tracking-[0.2em] transition-all shadow-[0_15px_40px_rgba(245,158,11,0.3)] active:scale-95 disabled:opacity-50 disabled:grayscale ${isSpinning ? 'bg-zinc-800 text-zinc-600' : 'bg-amber-500 text-zinc-950 hover:bg-amber-600 hover:scale-105'}`}
                 >
                   {isSpinning ? 'SPINNING...' : 'SPIN'}
                 </button>
              </div>
           </div>
        </div>

        <QuickBuyModal isOpen={showQuickBuy} onClose={() => setShowQuickBuy(false)} />
      </div>
    </Layout>
  );
};

export default GamePage;
