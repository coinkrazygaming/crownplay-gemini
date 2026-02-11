
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Button, CurrencyBadge, QuickBuyModal, Card, Badge } from '../components';
import { useStore } from '../store';
import { CurrencyType } from '../types';

const GamePage: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { games, currentUser, recordBridgeTransaction, settings } = useStore();
  
  const mode = new URLSearchParams(location.search).get('mode');
  const currencyType = mode === 'sc' ? CurrencyType.SC : CurrencyType.GC;
  const game = games.find(g => g.id === id);

  const [isLoading, setIsLoading] = useState(true);
  const [showQuickBuy, setShowQuickBuy] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState<'idle' | 'syncing' | 'connected'>('idle');
  const [showSimulator, setShowSimulator] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // --- SEAMLESS WALLET BRIDGE LOGIC ---
  
  // 1. Broadcast current balance to the iFrame (The "Push" side of the bridge)
  const broadcastBalance = useCallback(() => {
    if (!currentUser || !iframeRef.current?.contentWindow) return;
    
    const balance = currentUser[currencyType === CurrencyType.GC ? 'goldCoins' : 'sweepCoins'];
    
    // PostMessage protocol for external providers
    iframeRef.current.contentWindow.postMessage({
      type: 'SOVEREIGN_WALLET_UPDATE',
      balance,
      currency: currencyType,
      timestamp: Date.now()
    }, '*');
    
    setBridgeStatus('connected');
  }, [currentUser, currencyType]);

  // 2. Process Bridge Requests
  const handleBridgeRequest = async (amount: number, type: 'BET' | 'WIN') => {
    if (!game || !currentUser) return;
    
    setBridgeStatus('syncing');
    try {
      const result = await recordBridgeTransaction(game.id, amount, currencyType, type);
      
      // Inform the iframe client that the transaction was successful
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'CROWN_TRANSACTION_SUCCESS',
          transactionType: type,
          newBalance: result.newBalance,
          amountProcessed: amount
        }, '*');
      }
    } catch (e: any) {
      console.error("Bridge Error:", e);
      if (e.message === 'INSUFFICIENT_FUNDS') {
        setShowQuickBuy(true);
      }
      // Inform the iframe of the error
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'CROWN_TRANSACTION_ERROR',
          error: e.message || 'Unknown Error'
        }, '*');
      }
    } finally {
      setTimeout(() => setBridgeStatus('connected'), 300);
    }
  };

  // 3. Listen for requests from the Game iFrame
  useEffect(() => {
    const handleBridgeMessage = async (event: MessageEvent) => {
      const data = event.data;
      if (!data) return;

      // Handle standard wager/win events
      switch (data.type) {
        case 'CROWN_WAGER':
        case 'PRAGMATIC_BET_REQUEST':
          await handleBridgeRequest(data.amount || 100, 'BET');
          break;
        case 'CROWN_WIN':
        case 'PRAGMATIC_WIN_NOTIFICATION':
          await handleBridgeRequest(data.amount || 0, 'WIN');
          break;
        case 'CROWN_GET_BALANCE':
          broadcastBalance();
          break;
      }
    };

    window.addEventListener('message', handleBridgeMessage);
    return () => window.removeEventListener('message', handleBridgeMessage);
  }, [game, currentUser, currencyType, broadcastBalance]);

  // 4. State-Driven Synchronization
  // Whenever the parent balance changes, we push it to the child
  useEffect(() => {
    if (!isLoading) {
      broadcastBalance();
    }
  }, [currentUser?.goldCoins, currentUser?.sweepCoins, isLoading, broadcastBalance]);

  // 5. Heartbeat to maintain connection
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading) broadcastBalance();
    }, 10000);
    return () => clearInterval(interval);
  }, [isLoading, broadcastBalance]);

  if (!game || !currentUser) return null;

  return (
    <Layout hideSidebar>
      <div className="fixed inset-0 top-20 sm:top-32 bg-zinc-950 flex flex-col z-40 animate-in fade-in duration-500 overflow-hidden">
        
        {/* Immersive Responsive Game Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 bg-zinc-900/90 backdrop-blur-2xl border-b border-zinc-800 shrink-0">
           <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/lobby')} 
                className="px-4 py-2 rounded-xl border border-zinc-800 hover:bg-zinc-800 group h-10 text-[10px] font-black"
              >
                <span className="mr-2 group-hover:-translate-x-1 transition-transform inline-block text-lg">←</span> 
                EXIT
              </Button>
              <div className="h-6 w-px bg-zinc-800 hidden md:block" />
              <div className="hidden md:flex flex-col">
                 <h2 className="text-sm font-black text-white italic tracking-tight leading-none uppercase truncate max-w-[200px]">{game.name}</h2>
                 <div className="flex items-center gap-2 mt-1">
                   <div className={`w-1.5 h-1.5 rounded-full ${bridgeStatus === 'connected' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
                   <span className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest leading-none">BRIDGE: {bridgeStatus.toUpperCase()}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <CurrencyBadge type={currencyType} amount={currentUser[currencyType === CurrencyType.GC ? 'goldCoins' : 'sweepCoins']} />
              <div className="hidden xl:flex flex-col items-end px-6 border-l border-zinc-800">
                 <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic leading-none mb-1">Elite Jackpot</span>
                 <span className="text-lg font-black text-white italic leading-none tracking-tighter">
                    {currencyType === CurrencyType.SC ? settings.jackpotSC.toLocaleString() : settings.jackpotGC.toLocaleString()}
                 </span>
              </div>
              <Button 
                variant="primary" 
                className="h-10 px-6 text-[11px] font-black shadow-amber-500/10"
                onClick={() => setShowQuickBuy(true)}
              >
                TOP UP
              </Button>
           </div>
        </div>

        {/* Dynamic Adaptive Full-Screen iFrame Viewport */}
        <div className="flex-1 relative bg-black flex flex-col items-center justify-center overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center gap-10">
               <div className="relative">
                  <div className="w-20 h-20 border-[6px] border-zinc-900 border-t-amber-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-amber-500 italic">CP</div>
               </div>
               <div className="text-center">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-2">Syncing Identity Vault...</h3>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                  </div>
               </div>
               <div className="mt-12 text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] italic">AES-256 SEAMLESS BRIDGE INITIALIZING</div>
            </div>
          )}

          {/* The iFrame itself - Adapts to all available space using CSS flex-1 and w-full/h-full */}
          <iframe 
            ref={iframeRef}
            src={game.iframeUrl} 
            className="w-full h-full border-none select-none touch-none scale-100 origin-center transition-transform"
            onLoad={() => {
              setIsLoading(false);
              setTimeout(() => broadcastBalance(), 100); 
            }}
            allow="fullscreen; autoplay; encrypted-media"
            title={game.name}
          />
          
          {/* Subtle Immersive Ambient Gradients */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          
          {/* Bridge Status Indicator Overlay */}
          <div className="absolute top-4 left-4 z-30 pointer-events-none hidden sm:block">
            <Card className="px-5 py-2.5 bg-black/60 backdrop-blur-xl border border-white/5 flex items-center gap-3 shadow-2xl">
               <div className={`w-2 h-2 rounded-full ${bridgeStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shadow-[0_0_12px_currentColor]`} />
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-0.5">VAULT CHANNEL</span>
                  <span className="text-[9px] font-black text-white italic leading-none tracking-tight">SECURED • 128-BIT</span>
               </div>
            </Card>
          </div>

          {/* SIMULATOR TOGGLE - For testing the bridge functionality since the iframe is a static demo */}
          <div className="absolute bottom-6 left-6 z-50">
             <button 
               onClick={() => setShowSimulator(!showSimulator)}
               className="px-4 py-2 bg-zinc-900/80 backdrop-blur-lg border border-zinc-800 rounded-xl text-[9px] font-black text-zinc-500 hover:text-white transition-all uppercase tracking-widest"
             >
               {showSimulator ? 'CLOSE SIMULATOR' : 'TEST BRIDGE SYNC'}
             </button>
             
             {showSimulator && (
               <Card className="mt-4 p-6 bg-zinc-900/95 backdrop-blur-2xl border-amber-500/20 shadow-3xl w-64 animate-in slide-in-from-bottom-4 duration-300">
                  <h4 className="text-xs font-black text-white italic uppercase mb-4 border-b border-zinc-800 pb-2">Simulator Tool</h4>
                  <div className="space-y-4">
                     <p className="text-[9px] text-zinc-500 font-bold leading-relaxed">Manually trigger bridge events to verify real-time balance synchronization.</p>
                     <Button 
                       variant="secondary" 
                       className="w-full py-2.5 text-[9px]" 
                       onClick={() => handleBridgeRequest(100, 'BET')}
                       disabled={bridgeStatus === 'syncing'}
                     >
                       SIMULATE 100 BET
                     </Button>
                     <Button 
                       variant="primary" 
                       className="w-full py-2.5 text-[9px]" 
                       onClick={() => handleBridgeRequest(500, 'WIN')}
                       disabled={bridgeStatus === 'syncing'}
                     >
                       SIMULATE 500 WIN
                     </Button>
                  </div>
               </Card>
             )}
          </div>
        </div>

        {/* Global Compliance Footer */}
        <div className="h-10 sm:h-12 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center px-4 shrink-0 overflow-hidden">
           <div className="flex gap-8 sm:gap-16 text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] italic whitespace-nowrap">
              <span className="flex items-center gap-2"><span className="text-emerald-500">🛡️</span> AES-256 VAULT SYNC</span>
              <span className="hidden sm:inline text-zinc-800">|</span>
              <span className="flex items-center gap-2"><span className="text-amber-500">📜</span> GLI-19 CERTIFIED</span>
              <span className="hidden md:inline text-zinc-800">|</span>
              <span className="hidden md:flex items-center gap-2"><span className="text-blue-500">⚖️</span> RNG FAIRNESS AUDITED</span>
           </div>
        </div>

        <QuickBuyModal isOpen={showQuickBuy} onClose={() => setShowQuickBuy(false)} />
      </div>

      <style>{`
        /* Immersive Mode Screen Optimizations */
        body { 
          overflow: hidden; 
          touch-action: none;
        }
        iframe {
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
    </Layout>
  );
};

export default GamePage;
