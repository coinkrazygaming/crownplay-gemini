
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button, CurrencyBadge, Card, QuickBuyModal, Badge } from '../components';
import { useStore } from '../store';
import { CurrencyType, UserRole } from '../types';

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
  
  // Advanced Controls
  const [autoSpinLimit, setAutoSpinLimit] = useState<number>(0);
  const [autoSpinActive, setAutoSpinActive] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const autoSpinRef = useRef(autoSpinActive);

  useEffect(() => {
    autoSpinRef.current = autoSpinActive;
    if (autoSpinActive && !isSpinning && autoSpinLimit > 0) {
      const timer = setTimeout(handleSpin, 1000);
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
    if (autoSpinActive) {
      setAutoSpinLimit(prev => Math.max(0, prev - 1));
    }

    const pool = game.reelsConfig && game.reelsConfig.length > 0 ? game.reelsConfig : ['👑', '💎', '💰', '🎰', '🔱', '🍀', '🍒', '🔔', '7️⃣'];
    const intervalTime = turboMode ? 40 : 80;
    const spinDuration = turboMode ? 800 : 1800;

    const spinInterval = setInterval(() => {
      setReels(prev => prev.map(reel => reel.map(() => pool[Math.floor(Math.random() * pool.length)])));
    }, intervalTime);

    try {
      const result = await processGameSpin(game.id, bet, currencyType);
      
      setTimeout(() => {
        clearInterval(spinInterval);
        setIsSpinning(false);
        setReels(result.reels);
        if (result.won) {
          setLastWin(result.amount);
        }
      }, spinDuration);
    } catch (e) {
      clearInterval(spinInterval);
      setIsSpinning(false);
      setAutoSpinActive(false);
      alert("Kingdom server connection interrupted.");
    }
  };

  const handleShare = () => {
    const text = `I just won ${lastWin.toLocaleString()} ${currencyType === CurrencyType.GC ? 'GC' : 'SC'} playing ${game.name} at CrownPlay! 👑✨`;
    const url = `https://crownplay.com/#/lobby`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank');
  };

  const toggleAutoSpin = () => {
    if (autoSpinLimit <= 0) {
      setAutoSpinLimit(10); // Default to 10 if none set
    }
    setAutoSpinActive(!autoSpinActive);
  };

  const adjustBet = (multiplier: number) => {
    const newBet = Math.round(bet * multiplier);
    setBet(Math.min(game.maxBet, Math.max(game.minBet, newBet)));
  };

  const setMaxBet = () => setBet(game.maxBet);

  const accentColor = game.themeColor || '#f59e0b';
  const isAdmin = currentUser.role === UserRole.ADMIN;

  const renderSymbol = (sym: string, isSpinning: boolean, lastWin: number) => {
    const isImage = sym.startsWith('data:image') || sym.startsWith('http');
    const symbolStyle = { 
      textShadow: lastWin > 0 && !isSpinning ? `0 0 20px ${accentColor}, 0 0 40px ${accentColor}` : 'none',
      filter: isSpinning ? 'blur(10px)' : 'none'
    };

    if (isImage) {
      return (
        <img 
          src={sym} 
          className={`max-w-[70%] max-h-[70%] object-contain transition-all duration-300 ${isSpinning ? 'opacity-30 scale-125' : 'opacity-100 scale-100'}`} 
          style={{ filter: symbolStyle.filter }}
          alt="Slot Symbol"
        />
      );
    }

    return (
      <span 
        className={isSpinning ? 'grayscale opacity-20 scale-125 transition-all' : 'animate-in zoom-in-75 duration-300'}
        style={symbolStyle}
      >
        {sym}
      </span>
    );
  };

  return (
    <Layout hideSidebar>
      <div className="max-w-6xl mx-auto flex flex-col gap-8 py-4 sm:py-8 h-full">
        <div className="flex items-center justify-between gap-4">
           <Button variant="ghost" onClick={() => navigate('/lobby')} className="px-4">← EXIT TO LOBBY</Button>
           
           <div className="flex items-center gap-4">
              {isAdmin && (
                <Button 
                  variant="outline" 
                  className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
                  onClick={() => navigate('/admin')}
                >
                  👑 CONFIG
                </Button>
              )}
              <CurrencyBadge type={currencyType} amount={currentUser[currencyType === CurrencyType.GC ? 'goldCoins' : 'sweepCoins']} hideLabelOnMobile={false} />
           </div>
        </div>

        <div 
          className="relative flex-1 bg-zinc-950 rounded-[64px] border-[12px] border-zinc-900 shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center justify-center p-12 transition-colors duration-1000"
          style={{ borderColor: `${accentColor}1A` }}
        >
           {/* CrownPlay Original Branding */}
           <div className="absolute top-10 left-12 flex flex-col">
              <div className="font-black text-[10px] uppercase tracking-[0.5em] mb-1" style={{ color: accentColor }}>CrownPlay Original</div>
              <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none drop-shadow-2xl">{game.name}</h1>
              <div className="flex items-center gap-3 mt-4">
                <div 
                  className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border transition-all"
                  style={{ backgroundColor: `${accentColor}1A`, color: accentColor, borderColor: `${accentColor}33` }}
                >
                  {game.volatility} VOLATILITY
                </div>
                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Certified RTP: {(game.rtp*100).toFixed(1)}%</span>
              </div>
           </div>

           {/* High Fidelity Reels */}
           <div className="grid grid-cols-5 gap-6 w-full max-w-5xl h-[420px] perspective-1000">
              {reels.map((reel, i) => (
                <div key={i} className={`flex flex-col gap-4 h-full bg-zinc-900/40 rounded-3xl border-2 border-zinc-800/50 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-md ${isSpinning ? 'animate-pulse scale-[0.98]' : 'scale-100'} transition-all duration-300`}>
                   {reel.map((sym, si) => (
                     <div key={si} className={`flex-1 flex items-center justify-center text-7xl select-none transition-all duration-500 drop-shadow-xl hover:scale-110 ${lastWin > 0 && !isSpinning ? 'animate-pulse' : ''}`}>
                        {renderSymbol(sym, isSpinning, lastWin)}
                     </div>
                   ))}
                </div>
              ))}
           </div>

           {/* Win Celebration */}
           {lastWin > 0 && !isSpinning && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-500">
                <div className="text-center animate-bounce">
                   <div className="text-9xl mb-8 drop-shadow-[0_0_50px_rgba(255,255,255,0.2)]" style={{ color: accentColor }}>✨👑✨</div>
                   <h2 className="text-7xl font-black italic tracking-tighter text-white uppercase leading-none">TREASURY WIN!</h2>
                   <div className="text-5xl font-black mt-4 tracking-widest" style={{ color: accentColor }}>
                     {currencyType === CurrencyType.GC ? 'GC' : 'SC'} {lastWin.toLocaleString()}
                   </div>
                   <div className="mt-12 flex flex-col items-center gap-4">
                     <div className="flex gap-4">
                        <Button variant="primary" className="px-16 py-5 text-xl" style={{ backgroundColor: accentColor }} onClick={() => setLastWin(0)}>
                          COLLECT
                        </Button>
                        <Button variant="outline" className="px-8 flex items-center gap-3 border-blue-500/50 text-blue-400" onClick={handleShare}>
                           <span>🔵</span> SHARE
                        </Button>
                     </div>
                     <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Claim your spoils and share with the world</p>
                   </div>
                </div>
             </div>
           )}

           {/* Interactive Controls Bar */}
           <div className="mt-16 w-full max-w-5xl bg-zinc-900 border-2 border-zinc-800/50 p-6 rounded-[40px] flex items-center justify-between gap-6 shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative z-10">
              <div className="flex items-center gap-6">
                 {/* Bet Controls */}
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Bet Controls</span>
                    <div className="flex items-center gap-2">
                       <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                          <button onClick={() => adjustBet(0.5)} className="w-8 h-10 rounded-lg bg-zinc-900 text-[10px] text-zinc-400 font-black hover:bg-zinc-800 hover:text-white transition-all">½x</button>
                          <button onClick={() => setBet(b => Math.max(game.minBet, b - (currencyType === CurrencyType.SC ? 1 : 100)))} className="w-8 h-10 rounded-lg bg-zinc-900 text-white font-black hover:bg-zinc-800 transition-all">-</button>
                          <span className="text-xl font-black text-white w-24 text-center italic">{bet.toLocaleString()}</span>
                          <button onClick={() => setBet(b => Math.min(game.maxBet, b + (currencyType === CurrencyType.SC ? 1 : 100)))} className="w-8 h-10 rounded-lg bg-zinc-900 text-white font-black hover:bg-zinc-800 transition-all">+</button>
                          <button onClick={() => adjustBet(2)} className="w-8 h-10 rounded-lg bg-zinc-900 text-[10px] text-zinc-400 font-black hover:bg-zinc-800 hover:text-white transition-all">2x</button>
                       </div>
                       <button 
                        onClick={setMaxBet} 
                        className="h-12 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all"
                       >
                         MAX
                       </button>
                    </div>
                 </div>

                 <div className="h-12 w-px bg-zinc-800 mx-2" />

                 {/* Mode Controls */}
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Auto/Turbo</span>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => setTurboMode(!turboMode)}
                        className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-xl transition-all ${turboMode ? 'border-amber-400 text-zinc-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500'}`}
                        style={{ backgroundColor: turboMode ? accentColor : undefined }}
                        title="Turbo Mode"
                       >
                         ⚡
                       </button>
                       <div className="flex items-center gap-1 bg-zinc-950 border-2 border-zinc-800 rounded-xl px-2">
                         <input 
                            type="number" 
                            className="w-10 bg-transparent text-white text-center font-black text-xs outline-none"
                            value={autoSpinLimit}
                            onChange={(e) => setAutoSpinLimit(parseInt(e.target.value) || 0)}
                         />
                         <button 
                          onClick={toggleAutoSpin}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${autoSpinActive ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-zinc-500'}`}
                          title="Auto Spin"
                         >
                           🔄
                         </button>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col items-center flex-1">
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Current Win</span>
                 <div className={`text-4xl font-black italic tracking-tighter transition-all duration-700 ${lastWin > 0 ? 'scale-110' : 'text-zinc-700 scale-100'}`} style={{ color: lastWin > 0 ? accentColor : undefined }}>
                   {lastWin > 0 ? lastWin.toLocaleString() : '0'}
                 </div>
              </div>

              <button 
                onClick={handleSpin}
                disabled={isSpinning}
                className={`group relative h-20 px-16 rounded-2xl font-black text-2xl italic tracking-tighter uppercase transition-all overflow-hidden active:scale-95 disabled:opacity-50 ${isSpinning ? 'bg-zinc-800 text-zinc-700' : 'text-zinc-950 hover:brightness-110 shadow-[0_20px_60px_rgba(0,0,0,0.4)]'}`}
                style={{ backgroundColor: isSpinning ? undefined : accentColor }}
              >
                <span className="relative z-10">{isSpinning ? 'Spinning...' : 'Spin!'}</span>
                {!isSpinning && (
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                )}
              </button>
           </div>
        </div>

        <QuickBuyModal isOpen={showQuickBuy} onClose={() => setShowQuickBuy(false)} />
      </div>
    </Layout>
  );
};

export default GamePage;
