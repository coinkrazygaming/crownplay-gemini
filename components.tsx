
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

export const GooglePayButton: React.FC<{ onClick: () => void, amount: number }> = ({ onClick, amount }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-center gap-3 bg-zinc-100 hover:bg-white text-zinc-950 px-6 py-4 rounded-2xl font-bold transition-all border border-zinc-200 shadow-xl"
  >
    <span className="text-xl">💳</span>
    <span>Pay with Google Pay (${amount.toFixed(2)})</span>
  </button>
);

export const TransactionAuditor: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
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
    <div className="bg-zinc-950 border-y border-zinc-900 overflow-hidden py-3 shrink-0 relative">
      <div 
        className="flex whitespace-nowrap gap-16 items-center"
        style={{
          animation: `marquee ${settings.tickerScrollSpeed}s linear infinite`
        }}
      >
        {tickerItems.map((win, idx) => (
          <div key={`${win.id}-${idx}`} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] group">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-zinc-600 font-bold">CITIZEN</span>
             <NavLink to={`/profile/${win.playerName.split(' ')[0]}`} className="text-white hover:text-amber-400 transition-colors underline decoration-zinc-800">{win.playerName}</NavLink>
             <span className="text-zinc-500">UNCOVERED</span>
             <span className={`italic ${win.currency === CurrencyType.SC ? 'text-emerald-400' : 'text-amber-400'}`}>
               {win.amount.toLocaleString()} {win.currency === CurrencyType.GC ? 'GC' : 'SC'}
             </span>
             <span className="text-zinc-600">IN</span>
             <span className="text-white bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-800">{win.gameName}</span>
             <span className="text-zinc-800 ml-8">◆</span>
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
    <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border ${b.color} text-[9px] font-black uppercase tracking-widest`} title={b.name}>
      <span>{b.icon}</span>
      <span>{b.name}</span>
    </div>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black shadow-lg shadow-amber-500/20',
    secondary: 'bg-zinc-800 hover:bg-zinc-700 text-white font-bold',
    outline: 'border-2 border-zinc-800 hover:border-amber-500/50 text-zinc-300 font-bold',
    ghost: 'hover:bg-zinc-800 text-zinc-400 font-bold',
    danger: 'bg-red-600 hover:bg-red-700 text-white font-bold',
    ai: 'bg-gradient-to-r from-amber-400 to-amber-600 text-zinc-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
  };
  return (
    <button className={`px-5 py-2.5 rounded-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-widest text-xs ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const QuickBuyModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { packages, purchasePackage } = useStore();
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-zinc-950/95 backdrop-blur-xl animate-in fade-in duration-300">
      <Card className="w-full max-w-2xl p-8 border-amber-500/40 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors text-xl">✕</button>
        <div className="text-center mb-8">
           <h3 className="text-3xl font-black mb-2 uppercase italic text-amber-500">Royal Treasury Empty!</h3>
           <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Refill your balance instantly via Google Pay or Card.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
           {packages.filter(p => p.isActive).slice(0, 4).map(pkg => (
             <button key={pkg.id} onClick={() => { purchasePackage(pkg.id, 'Google Pay'); onClose(); }} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl hover:border-amber-500/50 transition-all text-left flex flex-col justify-between group">
                <div>
                   <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">{pkg.name}</div>
                   <div className="text-lg font-black text-white">{pkg.goldAmount.toLocaleString()} GC</div>
                   <div className="text-xs font-black text-emerald-500">+{pkg.sweepAmount} SC Bonus</div>
                </div>
                <div className="mt-4 font-black text-amber-500 group-hover:translate-x-1 transition-transform italic tracking-widest text-[10px]">PAY ${(pkg.priceCents/100).toFixed(2)} →</div>
             </button>
           ))}
        </div>
        <Button className="w-full py-4" onClick={() => navigate('/shop')}>ENTER THE FULL STORE</Button>
      </Card>
    </div>
  );
};

export const GameCard: React.FC<{ game: any; onClick: () => void; useSweepCoins: boolean }> = ({ game, onClick, useSweepCoins }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotY = (x - centerX) / 10;
    const rotX = (centerY - y) / 10;
    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => setRotation({ x: 0, y: 0 });

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className="group relative aspect-[3/4.2] rounded-[32px] overflow-hidden border-2 border-zinc-800 hover:border-amber-500/50 transition-all bg-zinc-900 shadow-2xl cursor-pointer"
      style={{
        perspective: '1000px',
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.1s ease-out, border-color 0.3s ease'
      }}
    >
      <img src={game.image} className="w-full h-full object-cover group-hover:brightness-[0.2] group-hover:scale-110 transition-all duration-700" alt={game.name} />
      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent">
        <p className="text-[10px] font-bold text-amber-500 mb-1 uppercase tracking-widest">{game.provider}</p>
        <h3 className="text-xl font-black text-white italic tracking-tighter mb-2">{game.name}</h3>
        <div className="flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${useSweepCoins ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`} />
           <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{useSweepCoins ? 'SC MODE' : 'GC MODE'}</span>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all pointer-events-none translate-y-4 group-hover:translate-y-0">
        <Button variant="primary" className="pointer-events-auto px-10 py-4 shadow-2xl">
           LAUNCH
        </Button>
      </div>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-zinc-900 border border-zinc-800 rounded-[32px] overflow-hidden shadow-2xl ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' }> = ({ children, variant = 'info' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  };
  return <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border uppercase ${styles[variant]}`}>{children}</span>;
};

export const CurrencyBadge: React.FC<{ type: CurrencyType; amount: number; hideLabelOnMobile?: boolean }> = ({ type, amount, hideLabelOnMobile = true }) => {
  const isGC = type === CurrencyType.GC;
  return (
    <div className={`
      relative flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl font-black text-[10px] sm:text-xs border transition-all hover:scale-105 cursor-default group overflow-hidden
      ${isGC 
        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[inset_0_0_15px_rgba(245,158,11,0.05)]' 
        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[inset_0_0_15px_rgba(16,185,129,0.05)]'
      }
    `}>
      <div className={`
        flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full shrink-0
        ${isGC ? 'bg-amber-500 shadow-lg shadow-amber-500/30' : 'bg-emerald-500 shadow-lg shadow-emerald-500/30'}
      `}>
        <span className="text-[10px] sm:text-xs text-zinc-950 font-black">{isGC ? 'G' : 'S'}</span>
      </div>
      <div className="flex flex-col">
        <span className="leading-none tracking-tight text-white">{amount.toLocaleString()}</span>
        <span className={`${hideLabelOnMobile ? 'hidden sm:inline' : 'inline'} opacity-50 text-[8px] font-black uppercase tracking-widest`}>
          {isGC ? 'Gold' : 'Sweep'}
        </span>
      </div>
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
    <div className="fixed top-24 right-8 z-[200] max-w-sm animate-in slide-in-from-right duration-500">
      <Card className="p-6 border-red-500 bg-red-500/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(239,68,68,0.3)]">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-2xl">🚨</span>
          <div>
            <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">Security Breach Detected</div>
            <h4 className="text-sm font-bold text-white">{activeAlert.type}</h4>
          </div>
        </div>
        <p className="text-xs text-zinc-400 mb-6">{activeAlert.description}</p>
        <Button variant="danger" className="w-full" onClick={() => adminResolveAlert(activeAlert.id)}>DISMISS</Button>
      </Card>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode; hideSidebar?: boolean }> = ({ children, hideSidebar = false }) => {
  const { currentUser, logout, settings } = useStore();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-amber-500/30 relative">
      <SecuritySentinel />
      <SocialTicker />
      <header className="sticky top-0 z-50 h-20 sm:h-24 bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800/50 px-4 md:px-12 flex items-center justify-between gap-4 shadow-2xl">
        <NavLink to="/" className="flex items-center gap-3 group active:scale-95 transition-all">
           <CrownLogo />
           <div className="flex flex-col -gap-1">
             <span className="text-xl sm:text-3xl font-black tracking-tighter text-white leading-none italic uppercase">CROWNPLAY</span>
             <span className="text-[8px] sm:text-[10px] text-amber-500 font-black tracking-[0.4em] uppercase opacity-70">Social Casino</span>
           </div>
        </NavLink>

        <div className="flex items-center gap-2 sm:gap-6">
          {currentUser ? (
            <>
              <div className="hidden lg:flex items-center gap-3 px-6 py-2 bg-zinc-950 rounded-full border border-amber-500/20 shadow-inner">
                 <span className="text-[10px] font-black text-amber-500 italic uppercase">Jackpot:</span>
                 <span className="text-xs font-black text-white">{settings.jackpotSC.toLocaleString()} SC</span>
              </div>
              <div className="hidden sm:flex items-center gap-3 bg-zinc-950/80 p-1.5 rounded-3xl border border-zinc-800/80">
                <CurrencyBadge type={CurrencyType.GC} amount={currentUser.goldCoins} />
                <CurrencyBadge type={CurrencyType.SC} amount={currentUser.sweepCoins} />
              </div>
              <div className="hidden md:flex flex-col items-end px-3">
                 <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Level {currentUser.level}</span>
                 <div className="w-24 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${(currentUser.xp % 100)}%` }} />
                 </div>
              </div>
              <Button variant="primary" className="hidden lg:block px-8 py-3" onClick={() => navigate('/shop')}>GET COINS</Button>
              <div className="relative group">
                <button className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-zinc-800 border-2 border-zinc-700/50 flex items-center justify-center font-black text-amber-500 hover:border-amber-500 shadow-xl transition-all uppercase">
                  {currentUser.name[0]}
                </button>
                <div className="absolute right-0 mt-4 w-64 bg-zinc-900/95 backdrop-blur-3xl border border-zinc-800 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-3 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all transform origin-top-right scale-95 group-hover:scale-100 z-[100]">
                  <div className="px-5 py-4 border-b border-zinc-800/50 mb-2 text-center">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Citizen</p>
                    <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                    <div className="flex justify-center gap-1 mt-2 flex-wrap">{currentUser.badges.map(b => <BadgeIcon key={b} type={b} />)}</div>
                  </div>
                  <div className="space-y-1">
                    <MenuButton onClick={() => navigate('/lobby')} icon="🏠" label="Royal Lobby" />
                    <MenuButton onClick={() => navigate('/leaderboard')} icon="📈" label="Leaderboard" />
                    <MenuButton onClick={() => navigate('/bonuses')} icon="💎" label="Bonus Guide" />
                    <MenuButton onClick={() => navigate('/profile')} icon="👤" label="My Profile" />
                    {currentUser.role === UserRole.ADMIN && <MenuButton onClick={() => navigate('/admin')} icon="👑" label="Monarch Console" highlight />}
                    <div className="h-px bg-zinc-800/50 my-2 mx-3" />
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 text-red-500 rounded-2xl text-xs font-black uppercase transition-all">🚪 SIGN OUT</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate('/auth')}>Log In</Button>
              <Button variant="primary" onClick={() => navigate('/auth')} className="px-8">Join Kingdom</Button>
            </div>
          )}
        </div>
      </header>
      <div className="flex flex-1 relative">
        {currentUser && !hideSidebar && (
          <aside className="hidden xl:flex w-72 flex-col border-r border-zinc-900 bg-zinc-900/40 p-6 gap-3 shrink-0">
            <SidebarItem to="/lobby" icon="🔥" label="Featured" />
            <SidebarItem to="/lobby" icon="🎰" label="All Slots" />
            <SidebarItem to="/leaderboard" icon="👑" label="Elite Players" />
            <div className="mt-10 mb-4 px-5 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Store</div>
            <SidebarItem to="/shop" icon="💎" label="Crown Store" />
            <SidebarItem to="/bonuses" icon="🛡️" label="Bonus Hub" />
            <SidebarItem to="/redeem" icon="🎁" label="Redeem" />
          </aside>
        )}
        <main className="flex-1 overflow-x-hidden p-6 md:p-12">{children}</main>
      </div>
      <RoyalConcierge isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
    </div>
  );
};

const MenuButton = ({ onClick, icon, label, highlight = false }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${highlight ? 'text-amber-500 bg-amber-500/5 hover:bg-amber-500/10' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
    <span className="text-lg">{icon}</span> {label}
  </button>
);

const SidebarItem = ({ to, icon, label }: any) => (
  <NavLink to={to} className={({ isActive }) => `flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isActive ? 'bg-amber-500 text-zinc-950 shadow-lg' : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'}`}>
    <span className="text-xl">{icon}</span> {label}
  </NavLink>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">{label}</label>}
    <input className={`bg-zinc-950 border-2 border-zinc-800 rounded-2xl px-5 py-4 text-zinc-100 placeholder:text-zinc-700 focus:outline-none focus:border-amber-500 transition-all ${className}`} {...props} />
  </div>
);

const RoyalConcierge: React.FC<{ isOpen: boolean, setIsOpen: (v: boolean) => void }> = ({ isOpen, setIsOpen }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Welcome to the VIP suite. How may I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const handleSend = async () => {
    if (!input.trim()) return;
    const txt = input; setInput(''); setMessages(p => [...p, { role: 'user', text: txt }]);
    const res = await generateGeminiResponse(txt);
    setMessages(p => [...p, { role: 'ai', text: res }]);
  };
  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
      {isOpen && (
        <Card className="w-[380px] h-[500px] mb-6 border-amber-500/40 flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
           <div className="p-6 bg-amber-500 flex justify-between items-center">
             <div className="flex items-center gap-3"><CrownLogo /><span className="font-black text-xs uppercase text-zinc-950">Concierge</span></div>
             <button onClick={() => setIsOpen(false)} className="text-zinc-950 font-black">✕</button>
           </div>
           <div className="flex-1 overflow-auto p-6 space-y-4 bg-zinc-950/50">
             {messages.map((m, i) => (
               <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-zinc-800 text-white' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{m.text}</div>
               </div>
             ))}
           </div>
           <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-3">
             <input className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 text-xs" placeholder="Inquiry..." value={input} onChange={e => setInput(e.target.value)} onKeyPress={k => k.key === 'Enter' && handleSend()} />
             <Button onClick={handleSend} className="px-4">SEND</Button>
           </div>
        </Card>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className="w-16 h-16 rounded-3xl bg-amber-500 flex items-center justify-center text-zinc-950 shadow-[0_10px_40px_rgba(245,158,11,0.5)] transition-all">
         {isOpen ? '✕' : <CrownLogo />}
      </button>
    </div>
  );
};
