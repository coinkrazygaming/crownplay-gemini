
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from './store';
import { UserRole, CurrencyType, Transaction, TransactionType, SecurityAlert } from './types';
import { generateGeminiResponse } from './aiService';

export const CrownLogo = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8 sm:w-10 sm:h-10 text-amber-500 drop-shadow-lg" fill="currentColor">
    <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.55 18.55 20 18 20H6C5.45 20 5 19.55 5 19V18H19V19Z" />
  </svg>
);

const GoldCoinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full fill-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
    <circle cx="12" cy="12" r="10" className="fill-amber-600" />
    <circle cx="12" cy="12" r="8" className="fill-amber-400" stroke="#b45309" strokeWidth="1" />
    <path d="M12 7v10M9 9h6M9 15h6" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="12" r="5" fill="none" stroke="#b45309" strokeWidth="0.5" opacity="0.3" />
  </svg>
);

const SweepGemIcon = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full fill-emerald-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
    <path d="M12 2l9 5v10l-9 5-9-5V7l9-5z" className="fill-emerald-600" />
    <path d="M12 5l6 3.5v7l-6 3.5-6-3.5v-7l6-3.5z" className="fill-emerald-400" />
    <path d="M12 2v20M3 7l18 10M3 17L21 7" stroke="#064e3b" strokeWidth="0.5" opacity="0.5" />
  </svg>
);

export const GooglePayButton: React.FC<{ onPaymentSuccess: (paymentData: any) => void, amount: number }> = ({ onPaymentSuccess, amount }) => {
  const { settings } = useStore();
  const [isGPayReady, setIsGReady] = useState(false);
  const paymentsClient = useRef<any>(null);

  useEffect(() => {
    if ((window as any).google && (window as any).google.payments && (window as any).google.payments.api) {
      const baseRequest = {
        apiVersion: 2,
        apiVersionMinor: 0
      };
      
      const allowedPaymentMethods = [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }
      ];

      const isReadyToPayRequest = Object.assign({}, baseRequest, {
        allowedPaymentMethods: allowedPaymentMethods
      });

      paymentsClient.current = new (window as any).google.payments.api.PaymentsClient({ environment: 'TEST' });
      
      paymentsClient.current.isReadyToPay(isReadyToPayRequest)
        .then((response: any) => {
          if (response.result) {
            setIsGReady(true);
          }
        })
        .catch((err: any) => {
          console.error("GPay isReadyToPay error:", err);
        });
    }
  }, []);

  const handleClick = () => {
    if (!paymentsClient.current) return;

    const paymentDataRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
      allowedPaymentMethods: [
        {
          type: 'CARD',
          parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
          },
          tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: {
              gateway: 'example',
              gatewayMerchantId: 'exampleGatewayMerchantId'
            }
          }
        }
      ],
      transactionInfo: {
        totalPriceStatus: 'FINAL',
        totalPriceLabel: 'Total',
        totalPrice: amount.toFixed(2),
        currencyCode: 'USD',
        countryCode: 'US'
      },
      merchantInfo: {
        merchantName: 'CrownPlay Sovereign Casino',
        merchantId: settings.gpayMerchantId
      }
    };

    paymentsClient.current.loadPaymentData(paymentDataRequest)
      .then((paymentData: any) => {
        onPaymentSuccess(paymentData);
      })
      .catch((err: any) => {
        console.error("loadPaymentData error:", err);
      });
  };

  if (!isGPayReady) {
    return (
      <button 
        disabled
        className="w-full flex items-center justify-center gap-3 bg-zinc-800 text-zinc-500 px-6 py-4 rounded-2xl font-bold transition-all border border-zinc-900 cursor-not-allowed"
      >
        <span>Google Pay Initializing...</span>
      </button>
    );
  }

  return (
    <button 
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 bg-zinc-100 hover:bg-white text-zinc-950 px-6 py-4 rounded-2xl font-bold transition-all border border-zinc-200 shadow-xl active:scale-95"
    >
      <span className="text-xl">💳</span>
      <span>Pay with Google Pay (${amount.toFixed(2)})</span>
    </button>
  );
};

export const TransactionAuditor: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse min-w-[600px]">
      <thead>
        <tr className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-zinc-900">
          <th className="px-6 py-5">Event ID</th>
          <th className="px-6 py-5">Activity</th>
          <th className="px-6 py-5">Currency</th>
          <th className="px-6 py-5">Method</th>
          <th className="px-6 py-5">Status</th>
          <th className="px-6 py-5">Timestamp</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-zinc-900/50">
        {transactions.map(tx => (
          <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors group">
            <td className="px-6 py-4 font-mono text-[10px] text-zinc-500">TX-{tx.id.toUpperCase()}</td>
            <td className="px-6 py-4">
              <div className="text-xs font-bold text-white uppercase">{tx.type.replace('_', ' ')}</div>
              <div className="text-[9px] text-zinc-500 truncate max-w-[150px] italic">{tx.metadata}</div>
            </td>
            <td className="px-6 py-4">
              <div className={`text-xs font-black ${tx.currency === CurrencyType.GC ? 'text-amber-500' : 'text-emerald-500'}`}>
                {tx.type === TransactionType.GAME_LOSS ? '-' : '+'}{tx.amount.toLocaleString()} {tx.currency === CurrencyType.GC ? 'GC' : 'SC'}
              </div>
            </td>
            <td className="px-6 py-4">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{tx.paymentMethod || 'In-App'}</span>
            </td>
            <td className="px-6 py-4">
              <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'FAILED' ? 'error' : 'warning'}>
                {tx.status || 'DONE'}
              </Badge>
            </td>
            <td className="px-6 py-4 text-[10px] text-zinc-600 font-bold whitespace-nowrap">
              {new Date(tx.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SocialTicker = () => {
  const { latestWins, settings } = useStore();
  const tickerItems = [...latestWins, ...latestWins];

  return (
    <div className="bg-zinc-950 border-y border-zinc-900 overflow-hidden py-2 sm:py-3 shrink-0 relative z-10">
      <div 
        className="flex whitespace-nowrap gap-12 sm:gap-16 items-center"
        style={{
          animation: `marquee ${settings.tickerScrollSpeed}s linear infinite`
        }}
      >
        {tickerItems.map((win, idx) => (
          <div key={`${win.id}-${idx}`} className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] group">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-zinc-600 font-bold hidden sm:inline">CITIZEN</span>
             <NavLink to={`/profile/${win.playerName.split(' ')[0]}`} className="text-white hover:text-amber-400 transition-colors underline decoration-zinc-800">{win.playerName}</NavLink>
             <span className="text-zinc-500 hidden sm:inline">UNCOVERED</span>
             <span className={`italic ${win.currency === CurrencyType.SC ? 'text-emerald-400' : 'text-amber-400'}`}>
               {win.amount.toLocaleString()} {win.currency === CurrencyType.GC ? 'GC' : 'SC'}
             </span>
             <span className="text-zinc-600">IN</span>
             <span className="text-white bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">{win.gameName}</span>
             <span className="text-zinc-800 ml-4 sm:ml-8">◆</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export const BadgeIcon: React.FC<{ type: string }> = ({ type }) => {
  const badges: any = {
    'WHALE': { icon: '🐋', name: 'Royal Whale', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    'STAFF': { icon: '🛡️', name: 'Monarch Staff', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    'DAILY': { icon: '📅', name: 'Loyal Citizen', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    'AMBASSADOR': { icon: '🤝', name: 'Ambassador', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
  };
  const b = badges[type] || { icon: '🏆', name: 'Achiever', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' };
  return (
    <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 rounded-xl border ${b.color} text-[8px] sm:text-[9px] font-black uppercase tracking-widest`} title={b.name}>
      <span>{b.icon}</span>
      <span className="hidden sm:inline">{b.name}</span>
    </div>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black shadow-lg shadow-amber-500/20 border-b-[4px] sm:border-b-[6px] border-amber-700 active:border-b-0 active:translate-y-1 transition-all',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white font-bold border-b-[4px] sm:border-b-[6px] border-zinc-950 active:border-b-0 active:translate-y-1 transition-all',
    outline: 'border-2 sm:border-4 border-zinc-800 hover:border-amber-500/50 text-zinc-300 font-bold active:scale-95 transition-all',
    ghost: 'hover:bg-zinc-800 text-zinc-400 font-bold active:scale-95 transition-all',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-bold border-b-[4px] sm:border-b-[6px] border-red-900 active:border-b-0 active:translate-y-1 transition-all',
    ai: 'bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-amber-500/60 active:scale-95 transition-all'
  };
  return (
    <button className={`px-4 sm:px-6 py-2 sm:py-3 rounded-[20px] sm:rounded-[24px] transition-all disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-[10px] sm:text-xs ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const QuickBuyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { packages, purchasePackage } = useStore();
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-zinc-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl p-6 sm:p-8 border-amber-500/40 relative shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-zinc-500 hover:text-white transition-colors text-xl">✕</button>
        <div className="text-center mb-6 sm:mb-8">
           <h3 className="text-2xl sm:text-4xl font-black mb-2 uppercase italic text-amber-500 tracking-tighter">Vault Empty!</h3>
           <p className="text-zinc-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Refill your balance instantly to continue.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
           {packages.filter(p => p.isActive).slice(0, 4).map(pkg => (
             <button key={pkg.id} onClick={() => { purchasePackage(pkg.id, 'Direct Card'); onClose(); }} className="p-4 sm:p-6 bg-zinc-950 border-2 border-zinc-800 rounded-2xl sm:rounded-3xl hover:border-amber-500/50 transition-all text-left flex flex-col justify-between group active:scale-95">
                <div>
                   <div className="text-[9px] sm:text-[10px] font-black text-zinc-600 uppercase mb-1">{pkg.name}</div>
                   <div className="text-xl sm:text-2xl font-black text-white italic">{pkg.goldAmount.toLocaleString()} GC</div>
                   <div className="text-[10px] sm:text-xs font-black text-emerald-500 mt-1">+{pkg.sweepAmount} SC Bonus</div>
                </div>
                <div className="mt-4 sm:mt-6 font-black text-amber-500 group-hover:translate-x-1 transition-transform italic tracking-widest text-[10px] sm:text-[11px] border-t border-zinc-900 pt-3 sm:pt-4">PURCHASE ${(pkg.priceCents/100).toFixed(2)} →</div>
             </button>
           ))}
        </div>
        <Button className="w-full py-4 sm:py-5 text-base sm:text-lg" onClick={() => navigate('/shop')}>OPEN SOVEREIGN STORE</Button>
      </Card>
    </div>
  );
};

export const GameCard: React.FC<{ game: any; onClick: () => void; useSweepCoins: boolean }> = ({ game, onClick, useSweepCoins }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotY = (x - centerX) / 8; 
    const rotX = (centerY - y) / 8; 
    
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    
    setRotation({ x: rotX, y: rotY });
    setGlare({ x: glareX, y: glareY, opacity: 0.6 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlare({ ...glare, opacity: 0 });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="group relative aspect-[3/4.2] rounded-[24px] sm:rounded-[40px] overflow-hidden border-2 border-zinc-800 hover:border-amber-500 transition-all bg-zinc-900 shadow-2xl cursor-pointer perspective-1000 transform-gpu"
      style={{
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: rotation.x === 0 ? 'transform 0.5s ease-out, border-color 0.4s ease, box-shadow 0.4s ease' : 'none',
        boxShadow: glare.opacity > 0 ? `0 30px 60px rgba(0,0,0,0.6), 0 0 40px ${game.themeColor || '#f59e0b'}44` : '0 10px 20px rgba(0,0,0,0.3)'
      }}
    >
      <div 
        className="absolute inset-0 w-full h-full scale-[1.05] group-hover:scale-110 transform-gpu transition-all duration-700"
      >
        <img 
          src={game.image} 
          className="w-full h-full object-cover group-hover:brightness-[0.4] transition-all duration-700" 
          alt={game.name} 
        />
      </div>

      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 overflow-hidden transform-gpu"
        style={{
          opacity: glare.opacity,
          background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.2) 0%, transparent 40%),
                       radial-gradient(circle at ${100 - glare.x}% ${100 - glare.y}%, ${game.themeColor || '#f59e0b'}33 0%, transparent 60%)`,
        }}
      />

      {game.isStudioOriginal && (
        <div className="absolute top-4 left-4 z-20">
           <div className="relative bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 text-zinc-950 text-[7px] sm:text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-[0.2em] shadow-2xl overflow-hidden group/badge">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-25deg] animate-glint" />
             <span className="relative z-10 italic">Studio Original</span>
           </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
        <div className="flex items-center justify-between mb-2">
           <p className="text-[8px] sm:text-[11px] font-black text-amber-500 uppercase tracking-[0.3em]">{game.provider}</p>
           <div className="flex gap-1">
              {[...Array(3)].map((_, i) => <div key={i} className={`w-1 h-1 rounded-full ${i === 0 ? 'bg-amber-500' : 'bg-zinc-800'}`} />)}
           </div>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white italic tracking-tighter mb-3 group-hover:translate-x-2 transition-transform duration-500 truncate">{game.name}</h3>
        <div className="flex items-center gap-3">
           <div className={`w-2.5 h-2.5 rounded-full ${useSweepCoins ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-amber-500 shadow-[0_0_12px_#f59e0b]'}`} />
           <span className="text-[9px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-widest leading-none">{useSweepCoins ? 'SC ELIGIBLE' : 'PLAY FOR GC'}</span>
        </div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-10 group-hover:translate-y-0 z-20 scale-90 group-hover:scale-100 duration-500 ease-out">
        <div className="flex flex-col items-center gap-4">
           <Button variant="primary" className="pointer-events-auto px-10 py-5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] border-2 border-white/10 text-lg">
             PLAY NOW
           </Button>
           <span className="text-[10px] text-white/50 font-black uppercase tracking-[0.5em] italic">Secure iFrame</span>
        </div>
      </div>

      <style>{`
        @keyframes glint {
          0% { transform: translateX(-150%) skewX(-25deg); }
          50% { transform: translateX(150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }
        .animate-glint {
          animation: glint 3s infinite ease-in-out;
        }
        .transform-gpu {
          transform-style: preserve-3d;
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-zinc-900 border border-zinc-800 rounded-[24px] sm:rounded-[40px] overflow-hidden shadow-2xl ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info'; className?: string }> = ({ children, variant = 'info', className = '' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };
  return <span className={`px-2 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[10px] font-black tracking-widest border uppercase ${styles[variant]} ${className}`}>{children}</span>;
};

export const CurrencyBadge: React.FC<{ type: CurrencyType; amount: number; hideLabelOnMobile?: boolean }> = ({ type, amount, hideLabelOnMobile = true }) => {
  const isGC = type === CurrencyType.GC;
  return (
    <div className={`
      relative flex items-center gap-1 sm:gap-3 px-1.5 sm:px-6 py-1 sm:py-3.5 rounded-[12px] sm:rounded-[24px] font-black border-2 transition-all hover:scale-[1.02] cursor-default group overflow-hidden backdrop-blur-md
      ${isGC 
        ? 'bg-amber-500/5 text-amber-400 border-amber-500/20 hover:border-amber-400/40 hover:bg-amber-500/10' 
        : 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/10'
      }
    `}>
      <div className={`
        flex items-center justify-center w-5 h-5 sm:w-9 sm:h-9 shrink-0 transition-transform group-hover:scale-110
        ${isGC ? '' : 'animate-pulse-subtle'}
      `}>
        {isGC ? <GoldCoinIcon /> : <SweepGemIcon />}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="leading-tight tracking-tighter text-white text-[10px] sm:text-2xl font-black italic truncate">
          {amount.toLocaleString()}
        </span>
        <span className={`${hideLabelOnMobile ? 'hidden sm:inline' : 'inline'} opacity-40 text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em] leading-none mt-0.5`}>
          {isGC ? 'Gold Credits' : 'Sweepstakes'}
        </span>
      </div>
      
      {/* Visual Indicator Glow */}
      <div className={`absolute -bottom-2 -right-2 w-8 h-8 blur-xl opacity-20 ${isGC ? 'bg-amber-500' : 'bg-emerald-500'}`} />
      
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export const SecuritySentinel = () => {
  const { securityAlerts, adminResolveAlert, currentUser } = useStore();
  const [activeAlert, setActiveAlert] = useState<SecurityAlert | null>(null);

  useEffect(() => {
    const unresolved = securityAlerts.filter(a => !a.resolved);
    if (unresolved.length > 0) setActiveAlert(unresolved[0]);
    else setActiveAlert(null);
  }, [securityAlerts]);

  if (!activeAlert || currentUser?.role !== UserRole.ADMIN) return null;

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-[200] max-w-sm animate-in slide-in-from-right duration-500">
      <Card className="p-6 sm:p-8 border-red-500 bg-red-500/10 backdrop-blur-xl shadow-[0_30px_80px_rgba(239,68,68,0.4)]">
        <div className="flex items-center gap-4 sm:gap-5 mb-4 sm:mb-6">
          <span className="text-2xl sm:text-3xl">🚨</span>
          <div>
            <div className="text-[8px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">High Auditor Alert</div>
            <h4 className="text-base sm:text-lg font-bold text-white uppercase italic">{activeAlert.type}</h4>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-zinc-400 mb-6 sm:mb-8 leading-relaxed">{activeAlert.description}</p>
        <Button variant="danger" className="w-full py-3 sm:py-4" onClick={() => adminResolveAlert(activeAlert.id)}>RESOLVE INCIDENT</Button>
      </Card>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; hideSidebar?: boolean }> = ({ children, hideSidebar = false }) => {
  const { currentUser, logout, settings } = useStore();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isMaintenanceMode = settings.maintenanceMode && currentUser?.role !== UserRole.ADMIN;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (path: string) => {
    setIsProfileOpen(false);
    navigate(path);
  };

  if (isMaintenanceMode && window.location.hash !== '#/auth') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-8 animate-in zoom-in-95 duration-700">
           <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-[32px] flex items-center justify-center text-5xl mx-auto shadow-2xl border border-amber-500/20">⚙️</div>
           <h1 className="text-5xl font-black italic uppercase tracking-tighter">Sovereign Refinement</h1>
           <p className="text-zinc-500 font-bold uppercase tracking-[0.3em] text-[10px] leading-relaxed">
             The Crown is currently undergoing administrative updates. <br />Please return at a later hour.
           </p>
           {currentUser?.role === UserRole.ADMIN && <Button onClick={() => navigate('/admin')}>Enter Console</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-amber-500/30 relative overflow-x-hidden">
      <SecuritySentinel />
      <SocialTicker />
      <header className="sticky top-0 z-[100] h-20 sm:h-32 bg-zinc-900/90 backdrop-blur-3xl border-b border-zinc-800/50 px-3 sm:px-14 flex items-center justify-between gap-2 sm:gap-6 shadow-2xl">
        <NavLink to="/" className="flex items-center gap-2 sm:gap-4 group active:scale-95 transition-all shrink-0">
           <div className="relative">
             <CrownLogo />
             <div className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
           </div>
           <div className="flex flex-col -gap-1 sm:-gap-2">
             <span className="text-sm sm:text-5xl font-black tracking-tighter text-white leading-none italic uppercase drop-shadow-xl">CROWNPLAY</span>
             <span className="text-[6px] sm:text-[14px] text-amber-500 font-black tracking-[0.4em] sm:tracking-[0.6em] uppercase opacity-70 italic">Monarch Gaming</span>
           </div>
        </NavLink>

        <div className="flex items-center gap-1 sm:gap-6 lg:gap-10">
          {currentUser ? (
            <>
              <div className="hidden lg:flex flex-col items-end px-6 py-2 border-r-2 border-zinc-800/50">
                 <span className="text-[10px] font-black text-amber-500 italic uppercase tracking-widest mb-1">ROYAL JACKPOT:</span>
                 <span className="text-2xl font-black text-white italic tracking-tighter animate-pulse">{settings.jackpotSC.toLocaleString()} SC</span>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-4 bg-black/40 p-1 sm:p-2 rounded-[14px] sm:rounded-[28px] border border-zinc-800/50 shadow-inner">
                <CurrencyBadge type={CurrencyType.GC} amount={currentUser.goldCoins} />
                <CurrencyBadge type={CurrencyType.SC} amount={currentUser.sweepCoins} />
              </div>

              <div className="hidden md:flex flex-col items-end px-4">
                 <span className="text-[12px] font-black text-amber-500 uppercase tracking-widest italic">LVL {currentUser.level}</span>
                 <div className="w-24 sm:w-36 h-2.5 bg-zinc-800 rounded-full mt-2 overflow-hidden border border-zinc-950 shadow-inner">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_15px_#f59e0b]" style={{ width: `${(currentUser.xp % 100)}%` }} />
                 </div>
              </div>
              <Button variant="primary" className="hidden lg:block px-12 py-5 text-sm font-black" onClick={() => navigate('/shop')}>GET COINS</Button>
              <div className="relative shrink-0" ref={profileMenuRef}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className={`w-10 h-10 sm:w-20 sm:h-20 rounded-[10px] sm:rounded-[28px] bg-zinc-800 border-2 sm:border-4 flex items-center justify-center font-black transition-all uppercase text-base sm:text-3xl italic shadow-2xl ${isProfileOpen ? 'border-amber-500 text-white bg-zinc-700' : 'border-zinc-700/50 text-amber-500'}`}
                >
                  {currentUser.name[0]}
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-4 sm:mt-6 w-64 sm:w-80 bg-zinc-900/98 backdrop-blur-3xl border-2 border-zinc-800 rounded-[32px] sm:rounded-[48px] shadow-[0_50px_150px_rgba(0,0,0,1)] p-4 sm:p-6 animate-in zoom-in-95 duration-200 origin-top-right z-[500]">
                    <div className="px-4 py-4 sm:px-6 sm:py-6 border-b-2 border-zinc-800 mb-4 text-center">
                      <p className="text-[9px] sm:text-[11px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-2 sm:mb-3 italic">Verified Citizen</p>
                      <p className="text-lg sm:text-2xl font-black text-white truncate italic uppercase tracking-tighter">{currentUser.name}</p>
                      <div className="flex justify-center gap-2 mt-4 sm:mt-6 flex-wrap">{currentUser.badges.map(b => <BadgeIcon key={b} type={b} />)}</div>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5">
                      <MenuButton onClick={() => handleMenuClick('/lobby')} icon="🎰" label="Reel Treasury" />
                      <MenuButton onClick={() => handleMenuClick('/leaderboard')} icon="🏆" label="Elite Hierarchy" />
                      <MenuButton onClick={() => handleMenuClick('/bonuses')} icon="💎" label="Bounty Charter" />
                      <MenuButton onClick={() => handleMenuClick('/profile')} icon="🛡️" label="Identity Vault" />
                      {currentUser.role === UserRole.ADMIN && <MenuButton onClick={() => handleMenuClick('/admin')} icon="👑" label="Monarch Console" highlight />}
                      <div className="h-0.5 bg-zinc-800/50 my-3 sm:my-4 mx-4 sm:mx-6" />
                      <button 
                        onClick={() => { setIsProfileOpen(false); logout(); }} 
                        className="w-full flex items-center gap-4 sm:gap-5 px-4 sm:px-6 py-3 sm:py-4 hover:bg-red-500/10 text-red-500 rounded-[24px] sm:rounded-[32px] text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all active:scale-95 text-left"
                      >
                        🚪 ABANDON THRONE
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 sm:gap-6">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="text-[10px] sm:text-sm font-black px-2 sm:px-6">ENTER</Button>
              <Button variant="primary" onClick={() => navigate('/auth')} className="px-3 sm:px-14 py-2 sm:py-5 text-[10px] sm:text-sm font-black italic">JOIN</Button>
            </div>
          )}
        </div>
      </header>
      <div className="flex flex-1 relative">
        {currentUser && !hideSidebar && (
          <aside className="hidden xl:flex w-88 flex-col border-r-2 border-zinc-900 bg-zinc-900/40 p-10 gap-5 shrink-0">
            <SidebarItem to="/lobby" icon="🔥" label="Sovereign Picks" />
            <SidebarItem to="/lobby" icon="🎰" label="Reel Treasury" />
            <SidebarItem to="/leaderboard" icon="👑" label="The Elite 50" />
            <div className="mt-14 mb-5 px-8 text-[12px] font-black text-zinc-600 uppercase tracking-[0.5em] italic">Administrative</div>
            <SidebarItem to="/shop" icon="💎" label="Crown Repository" />
            <SidebarItem to="/bonuses" icon="🛡️" label="Bounty Charter" />
            <SidebarItem to="/redeem" icon="🎁" label="Redeem Prizes" />
            
            <div className="mt-auto p-8 bg-black/40 rounded-[48px] border-2 border-zinc-800/50 text-center shadow-inner group">
               <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mb-2 italic">Session Status</p>
               <Badge variant="success" className="scale-110">Royal Secure 2.0</Badge>
            </div>
          </aside>
        )}
        <main className="flex-1 p-4 sm:p-8 md:p-16">{children}</main>
      </div>
      <RoyalConcierge isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
};

const MenuButton = ({ onClick, icon, label, highlight = false }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 sm:gap-5 px-4 sm:px-6 py-3 sm:py-4.5 rounded-[24px] sm:rounded-[32px] text-[10px] sm:text-[12px] font-black uppercase tracking-widest transition-all active:scale-95 text-left ${highlight ? 'text-amber-500 bg-amber-500/5 hover:bg-amber-500/10' : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'}`}>
    <span className="text-xl sm:text-2xl drop-shadow-xl">{icon}</span> {label}
  </button>
);

const SidebarItem = ({ to, icon, label }: any) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-6 px-10 py-6 rounded-[40px] font-black text-[13px] uppercase tracking-widest transition-all active:scale-95 ${isActive ? 'bg-amber-500 text-zinc-950 shadow-[0_20px_50px_rgba(245,158,11,0.4)] scale-105' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
    <span className="text-3xl drop-shadow-lg">{icon}</span> {label}
  </NavLink>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-2 sm:gap-4 w-full">
    {label && <label className="text-[10px] sm:text-[12px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2 sm:ml-4 italic">{label}</label>}
    <input className={`bg-zinc-950 border-2 sm:border-4 border-zinc-800 rounded-[24px] sm:rounded-[32px] px-6 sm:px-8 py-4 sm:py-6 text-zinc-100 placeholder:text-zinc-800 focus:outline-none focus:border-amber-500 transition-all shadow-inner text-base sm:text-lg ${className}`} {...props} />
  </div>
);

const RoyalConcierge: React.FC<{ isOpen: boolean, setIsOpen: (v: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Your Majesty, I am at your service. How may I assist your gameplay today?" }
  ]);
  const [input, setInput] = useState('');
  
  const handleSend = async () => {
    if (!input.trim()) return;
    const txt = input; setInput(''); setMessages(p => [...p, { role: 'user', text: txt }]);
    const res = await generateGeminiResponse(txt);
    setMessages(p => [...p, { role: 'ai', text: res }]);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-12 sm:right-12 z-[200] flex flex-col items-end">
      {isOpen && (
        <Card className="w-[calc(100vw-2rem)] sm:w-[450px] h-[70vh] sm:h-[650px] mb-4 sm:mb-10 border-2 sm:border-4 border-amber-500/40 flex flex-col shadow-[0_50px_200px_rgba(0,0,0,1)] rounded-[32px] sm:rounded-[64px] animate-in slide-in-from-bottom duration-500">
           <div className="p-6 sm:p-10 bg-amber-500 flex justify-between items-center shrink-0">
             <div className="flex items-center gap-3 sm:gap-5">
                <div className="bg-zinc-950 p-1.5 sm:p-2.5 rounded-[12px] sm:rounded-[20px] shadow-2xl scale-75 sm:scale-100"><CrownLogo /></div>
                <span className="font-black text-sm sm:text-lg uppercase tracking-widest text-zinc-950 italic">Concierge AI</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="text-zinc-950 font-black text-2xl sm:text-3xl hover:scale-110 transition-transform">✕</button>
           </div>
           <div className="flex-1 overflow-auto p-6 sm:p-10 space-y-6 sm:space-y-8 bg-zinc-950/90 backdrop-blur-3xl scrollbar-hide">
             {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[90%] px-5 sm:px-8 py-3 sm:py-5 rounded-[24px] sm:rounded-[36px] text-sm sm:text-base leading-relaxed shadow-2xl ${m.role === 'user' ? 'bg-zinc-800 text-white border-2 border-zinc-700' : 'bg-amber-500/10 text-amber-100 border-2 border-amber-500/20 italic'}`}>{m.text}</div>
               </div>
             ))}
           </div>
           <div className="p-4 sm:p-8 bg-zinc-900 border-t-2 border-zinc-800 flex gap-3 sm:gap-5 shrink-0">
             <input className="flex-1 bg-zinc-950 border-2 sm:border-4 border-zinc-800 rounded-[20px] sm:rounded-[32px] px-5 sm:px-8 text-sm sm:text-base outline-none focus:border-amber-500 transition-all text-white" placeholder="Royal inquiry..." value={input} onChange={e => setInput(e.target.value)} onKeyPress={k => k.key === 'Enter' && handleSend()} />
             <button onClick={handleSend} className="w-12 h-12 sm:w-16 sm:h-16 rounded-[16px] sm:rounded-[24px] bg-amber-500 flex items-center justify-center text-zinc-950 text-xl sm:text-2xl shadow-2xl hover:bg-amber-400 transition-all active:scale-90">✨</button>
           </div>
        </Card>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 sm:w-24 h-24 rounded-[20px] sm:rounded-[40px] bg-amber-500 flex items-center justify-center text-zinc-950 shadow-[0_20px_80px_rgba(245,158,11,0.6)] transition-all hover:scale-110 active:scale-90 hover:rotate-12 border-2 sm:border-4 border-zinc-950/20">
         {isOpen ? <span className="text-2xl sm:text-4xl font-black italic">✕</span> : <div className="scale-100 sm:scale-150"><CrownLogo /></div>}
      </button>
    </div>
  );
};
