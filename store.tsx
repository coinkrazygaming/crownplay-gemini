
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, Transaction, RedemptionRequest, KYCStatus, TransactionType, CurrencyType, RedemptionStatus, Category, AuditLog, AuditAction, Game, Package, KYCDocuments, SocialComment, WinTickerEntry, SecurityAlert, AppSettings, EmailLog, IngestionLog } from './types';
import { MOCK_PACKAGES, MOCK_GAMES, INITIAL_CATEGORIES } from './constants';

interface StoreContextType {
  currentUser: User | null;
  users: User[];
  transactions: Transaction[];
  redemptions: RedemptionRequest[];
  categories: Category[];
  games: Game[];
  packages: Package[];
  socialComments: SocialComment[];
  latestWins: WinTickerEntry[];
  securityAlerts: SecurityAlert[];
  auditLogs: AuditLog[];
  emailLogs: EmailLog[];
  ingestionLogs: IngestionLog[];
  settings: AppSettings;
  dbStatus: 'connected' | 'syncing' | 'error';
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, name: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  claimDailyReward: () => { error: string | null; gc: number; sc: number; streak: number };
  purchasePackage: (packageId: string, method?: string, paymentData?: any) => void;
  requestRedemption: (amount: number) => string | null;
  updateUser: (updates: Partial<User>) => void;
  processGameSpin: (gameId: string, bet: number, currency: CurrencyType) => Promise<{ won: boolean; amount: number; message: string; reels: string[][]; winLines: number[] }>;
  recordBridgeTransaction: (gameId: string, amount: number, currency: CurrencyType, type: 'BET' | 'WIN') => Promise<{ success: boolean; newBalance: number }>;
  adminAdjustBalance: (userId: string, currency: CurrencyType, amount: number, reason: string) => void;
  adminUpdateGame: (id: string, updates: Partial<Game>) => void;
  adminAddGame: (game: Game) => void;
  adminUpsertGames: (newGames: Game[]) => void;
  adminDeleteGame: (id: string) => void;
  adminResolveAlert: (id: string) => void;
  adminUpdateSettings: (updates: Partial<AppSettings>) => void;
  adminSendEmail: (userId: string | 'ALL', subject: string, body: string, type: EmailLog['type']) => void;
  adminUpdateUserStatus: (userId: string, status: 'ACTIVE' | 'LOCKED', kyc: KYCStatus) => void;
  adminAddIngestionLog: (log: IngestionLog) => void;
  connectSocial: (platform: string) => void;
  completeSocialPromotion: () => void;
  uploadKycDoc: (type: keyof KYCDocuments, data: string) => void;
  syncToNeon: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [socialComments, setSocialComments] = useState<SocialComment[]>([]);
  const [latestWins, setLatestWins] = useState<WinTickerEntry[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [ingestionLogs, setIngestionLogs] = useState<IngestionLog[]>([]);
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error'>('connected');
  const [settings, setSettings] = useState<AppSettings>({
    globalGPayEnabled: true,
    maintenanceMode: false,
    minRedemption: 100,
    newUserBonusGC: 10000,
    newUserBonusSC: 2,
    socialBonusGC: 5000,
    dailyRewardGC: 1000,
    dailyRewardSC: 0.5,
    socialTaskBonusGC: 20000,
    socialTaskBonusSC: 5,
    leaderboardWeeklyPrizeSC: 100,
    gamePlayBonusRate: 1,
    squareApplicationId: '',
    squareLocationId: '',
    gpayMerchantId: 'BCR2DN4TX7O7JYT6',
    leaderboardVisible: true,
    tickerMaxItems: 15,
    tickerScrollSpeed: 40,
    jackpotGC: 1000000,
    jackpotSC: 5000,
    jackpotContributionRate: 0.01,
    jackpotSeedGC: 1000000,
    jackpotSeedSC: 5000,
  });

  useEffect(() => {
    const saved = (key: string) => {
      const val = localStorage.getItem(`cp_neon_${key}`);
      return val ? JSON.parse(val) : null;
    };

    const initialUsers = saved('users') || [{
      id: 'admin-1',
      email: 'coinkrazy26@gmail.com',
      role: UserRole.ADMIN,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      goldCoins: 1000000,
      sweepCoins: 1000,
      name: 'Grand Monarch',
      kycStatus: KYCStatus.VERIFIED,
      kycDocuments: { idFront: 'data:mock', proofOfAddress: 'data:mock', paymentProof: 'data:mock' },
      referralCode: 'ADMIN-CROWN',
      loginStreak: 1,
      gPayEnabled: true,
      socialConnections: [],
      socialTaskCompleted: true,
      xp: 10000,
      level: 10,
      badges: ['STAFF', 'WHALE'],
      totalDeposited: 0,
      totalWithdrawn: 0,
      isPublic: true
    }];

    setUsers(initialUsers);
    setTransactions(saved('transactions') || []);
    setRedemptions(saved('redemptions') || []);
    setCategories(saved('categories') || INITIAL_CATEGORIES);
    setGames(saved('games') || MOCK_GAMES);
    setPackages(saved('packages') || MOCK_PACKAGES);
    setSocialComments(saved('comments') || []);
    setLatestWins(saved('wins') || []);
    setSecurityAlerts(saved('alerts') || []);
    setAuditLogs(saved('audit') || []);
    setEmailLogs(saved('emails') || []);
    setIngestionLogs(saved('ingestion') || []);
    setSettings(saved('settings') || settings);
    setCurrentUser(saved('current'));
  }, []);

  const syncToNeon = useCallback(async () => {
    setDbStatus('syncing');
    await new Promise(resolve => setTimeout(resolve, 800));
    const save = (key: string, val: any) => localStorage.setItem(`cp_neon_${key}`, JSON.stringify(val));
    save('users', users);
    save('transactions', transactions);
    save('redemptions', redemptions);
    save('categories', categories);
    save('games', games);
    save('packages', packages);
    save('comments', socialComments);
    save('wins', latestWins);
    save('alerts', securityAlerts);
    save('audit', auditLogs);
    save('emails', emailLogs);
    save('ingestion', ingestionLogs);
    save('settings', settings);
    if (currentUser) save('current', currentUser);
    else localStorage.removeItem('cp_neon_current');
    setDbStatus('connected');
  }, [users, transactions, redemptions, categories, games, packages, socialComments, latestWins, securityAlerts, auditLogs, emailLogs, settings, currentUser, ingestionLogs]);

  const addAudit = (action: AuditAction, targetId: string, metadata: string) => {
    if (!currentUser) return null;
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      adminId: currentUser.id,
      adminName: currentUser.name,
      targetUserId: targetId,
      targetUserName: users.find(u => u.id === targetId)?.name || 'System',
      action,
      metadata,
      createdAt: new Date().toISOString()
    };
    setAuditLogs(prev => [log, ...prev]);
    return log.id;
  };

  const login = async (email: string, pass: string) => {
    const user = users.find(u => u.email === email);
    if (user && (pass === 'admin123' || pass === 'password' || pass === 'CrownPlayAdmin')) {
      const updatedUser = { ...user, lastLoginAt: new Date().toISOString() };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      return true;
    }
    return false;
  };

  // Atomic Spin (Used for legacy/internal games)
  const processGameSpin = async (gameId: string, bet: number, currency: CurrencyType) => {
    if (!currentUser) throw new Error("Not logged in");
    if (settings.maintenanceMode && currentUser.role !== UserRole.ADMIN) throw new Error("Kingdom under maintenance.");

    const game = games.find(g => g.id === gameId);
    if (!game) throw new Error("Game not found");
    
    const currencyField = currency === CurrencyType.GC ? 'goldCoins' : 'sweepCoins';
    if (currentUser[currencyField] < bet) return { won: false, amount: 0, message: "INSUFFICIENT_FUNDS", reels: [], winLines: [] };

    const contribution = bet * settings.jackpotContributionRate;
    setSettings(s => ({ 
      ...s, 
      [currency === CurrencyType.GC ? 'jackpotGC' : 'jackpotSC']: s[currency === CurrencyType.GC ? 'jackpotGC' : 'jackpotSC'] + contribution 
    }));

    const rand = Math.random();
    let winAmount = 0;
    let won = false;
    let message = "TRY AGAIN";

    if (rand < 0.000005) { // Jackpot
      winAmount = currency === CurrencyType.GC ? settings.jackpotGC : settings.jackpotSC;
      won = true;
      message = "ROYAL JACKPOT!";
      setSettings(s => ({ ...s, [currency === CurrencyType.GC ? 'jackpotGC' : 'jackpotSC']: currency === CurrencyType.GC ? s.jackpotSeedGC : s.jackpotSeedSC }));
    } else {
      const hitFrequency = 0.25;
      if (Math.random() < hitFrequency) {
        won = true;
        const volFactor = game.volatility === 'HIGH' ? 2 : (game.volatility === 'MEDIUM' ? 1.0 : 0.5);
        const mult = Math.random() > 0.9 ? 10 * volFactor : 2 * volFactor;
        winAmount = Math.floor(bet * mult);
        message = winAmount > bet * 10 ? "MEGA WIN!" : "WIN!";
      }
    }

    const updatedUser = { 
      ...currentUser, 
      [currencyField]: currentUser[currencyField] - bet + winAmount, 
      xp: currentUser.xp + (bet * settings.gamePlayBonusRate) 
    };
    updatedUser.level = Math.floor(Math.sqrt(updatedUser.xp / 100)) + 1;

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));

    if (winAmount > 0) {
      const winEntry: WinTickerEntry = { 
        id: Math.random().toString(36).substr(2, 9), 
        playerName: `${currentUser.name.split(' ')[0]} ${currentUser.name.split(' ')[1]?.[0] || ''}.`, 
        gameName: game.name, 
        amount: winAmount, 
        currency, 
        createdAt: new Date().toISOString() 
      };
      setLatestWins(prev => [winEntry, ...prev].slice(0, 50));
    }

    return { won, amount: winAmount, message, reels: [], winLines: [] };
  };

  // Seamless Bridge Transaction (Used for external iFrame providers like Pragmatic)
  // FIXED: Using functional updates to prevent race conditions during rapid betting/winning
  const recordBridgeTransaction = async (gameId: string, amount: number, currency: CurrencyType, type: 'BET' | 'WIN') => {
    if (!currentUser) throw new Error("Not logged in");
    
    const currencyField = currency === CurrencyType.GC ? 'goldCoins' : 'sweepCoins';
    let finalNewBalance = 0;

    // Use a promise to handle the update and return the new balance correctly
    return new Promise<{ success: boolean; newBalance: number }>((resolve, reject) => {
      setCurrentUser(prev => {
        if (!prev) {
          reject("No user session");
          return null;
        }

        let newBalance = prev[currencyField];

        if (type === 'BET') {
          if (prev[currencyField] < amount) {
            reject(new Error("INSUFFICIENT_FUNDS"));
            return prev;
          }
          newBalance -= amount;
          
          // Jackpot contribution on bet
          const contribution = amount * settings.jackpotContributionRate;
          setSettings(s => ({ 
            ...s, 
            [currency === CurrencyType.GC ? 'jackpotGC' : 'jackpotSC']: s[currency === CurrencyType.GC ? 'jackpotGC' : 'jackpotSC'] + contribution 
          }));
        } else {
          newBalance += amount;
          
          // Update Win Ticker on Bridge Win
          if (amount > 0) {
            const game = games.find(g => g.id === gameId);
            const winEntry: WinTickerEntry = { 
              id: Math.random().toString(36).substr(2, 9), 
              playerName: `${prev.name.split(' ')[0]} ${prev.name.split(' ')[1]?.[0] || ''}.`, 
              gameName: game?.name || "Live Game", 
              amount, 
              currency, 
              createdAt: new Date().toISOString() 
            };
            setLatestWins(lprev => [winEntry, ...lprev].slice(0, 50));
          }
        }

        finalNewBalance = newBalance;
        const updatedUser = { 
          ...prev, 
          [currencyField]: newBalance,
          xp: prev.xp + (type === 'BET' ? amount * settings.gamePlayBonusRate : 0)
        };
        updatedUser.level = Math.floor(Math.sqrt(updatedUser.xp / 100)) + 1;

        // Also sync to global users list
        setUsers(uprev => uprev.map(u => u.id === updatedUser.id ? updatedUser : u));
        
        // Log as a transaction
        const tx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          userId: prev.id,
          type: type === 'BET' ? TransactionType.GAME_LOSS : TransactionType.GAME_WIN,
          amount: amount,
          currency: currency,
          metadata: `Bridge ${type}: ${gameId}`,
          status: 'COMPLETED',
          createdAt: new Date().toISOString()
        };
        setTransactions(tprev => [tx, ...tprev]);

        resolve({ success: true, newBalance: finalNewBalance });
        return updatedUser;
      });
    });
  };

  const purchasePackage = (packageId: string, method: string = 'Card', paymentData: any = null) => {
    if (!currentUser) return;
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    const updatedUser = { 
      ...currentUser, 
      goldCoins: currentUser.goldCoins + pkg.goldAmount, 
      sweepCoins: currentUser.sweepCoins + pkg.sweepAmount, 
      totalDeposited: (currentUser.totalDeposited || 0) + (pkg.priceCents / 100) 
    };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setTransactions(prev => [{ 
      id: Math.random().toString(36).substr(2, 9), 
      userId: currentUser.id, 
      type: TransactionType.PURCHASE, 
      amount: pkg.priceCents / 100, 
      currency: CurrencyType.GC, 
      metadata: `Package: ${pkg.name}`, 
      paymentMethod: method, 
      status: 'COMPLETED', 
      createdAt: new Date().toISOString() 
    }, ...prev]);
    syncToNeon();
  };

  const adminUpdateSettings = (u: Partial<AppSettings>) => {
    setSettings(s => ({ ...s, ...u }));
    syncToNeon();
  };

  const adminUpdateGame = (id: string, u: Partial<Game>) => {
    setGames(prev => prev.map(g => g.id === id ? { ...g, ...u } : g));
    syncToNeon();
  };

  const adminAddGame = (game: Game) => {
    setGames(prev => [game, ...prev]);
    syncToNeon();
  };

  const adminDeleteGame = (id: string) => {
    setGames(prev => prev.filter(g => g.id !== id));
    syncToNeon();
  };

  const adminResolveAlert = (id: string) => {
    setSecurityAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
    syncToNeon();
  };

  const adminUpdateUserStatus = (userId: string, status: 'ACTIVE' | 'LOCKED', kyc: KYCStatus) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const updatedUser = { ...target, status, kycStatus: kyc };
    setUsers(users.map(u => u.id === userId ? updatedUser : u));
    if (currentUser?.id === userId) setCurrentUser(updatedUser);
    addAudit(AuditAction.ACCOUNT_STATUS_CHANGE, userId, `Status: ${status}, KYC: ${kyc}`);
    syncToNeon();
  };

  const claimDailyReward = () => {
    if (!currentUser) return { error: "Login required", gc: 0, sc: 0, streak: 0 };
    const now = new Date();
    const lastClaim = currentUser.lastDailyClaim ? new Date(currentUser.lastDailyClaim) : null;
    
    if (lastClaim && (now.getTime() - lastClaim.getTime()) < 86400000) {
      return { error: "Cooldown active.", gc: 0, sc: 0, streak: currentUser.loginStreak };
    }

    let newStreak = (currentUser.loginStreak || 0) + 1;
    if (lastClaim && (now.getTime() - lastClaim.getTime()) > 172800000) newStreak = 1;
    if (newStreak > 7) newStreak = 7;

    const finalGC = settings.dailyRewardGC * newStreak;
    const finalSC = settings.dailyRewardSC;

    const updated = { 
      ...currentUser, 
      goldCoins: currentUser.goldCoins + finalGC, 
      sweepCoins: currentUser.sweepCoins + finalSC, 
      lastDailyClaim: now.toISOString(),
      loginStreak: newStreak
    };

    setCurrentUser(updated); 
    setUsers(users.map(u => u.id === updated.id ? updated : u));
    syncToNeon();
    return { error: null, gc: finalGC, sc: finalSC, streak: newStreak };
  };

  const signup = async (email: string, name: string, referralCode?: string) => {
    const newUserId = Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      id: newUserId,
      email, name, role: UserRole.PLAYER, status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      goldCoins: settings.newUserBonusGC,
      sweepCoins: 2, // Welcome SC
      kycStatus: KYCStatus.UNVERIFIED,
      kycDocuments: {},
      referralCode: 'CP-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      loginStreak: 0,
      gPayEnabled: false,
      socialConnections: [],
      socialTaskCompleted: false,
      xp: 0, level: 1, badges: [],
      totalDeposited: 0, totalWithdrawn: 0, isPublic: true
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    syncToNeon();
  };

  const adminSendEmail = useCallback((userId: string | 'ALL', subject: string, body: string, type: EmailLog['type']) => {
    const targets = userId === 'ALL' ? users : users.filter(u => u.id === userId);
    const newLogs: EmailLog[] = targets.map(u => ({ id: Math.random().toString(36).substr(2, 9), userId: u.id, subject, body, type, sentAt: new Date().toISOString() }));
    setEmailLogs(prev => [...newLogs, ...prev]);
    addAudit(AuditAction.EMAIL_SENT, userId, `Sent ${type} email: ${subject}`);
  }, [users]);

  const adminAddIngestionLog = (log: IngestionLog) => {
    setIngestionLogs(prev => [log, ...prev]);
  };

  const adminUpsertGames = (newGames: Game[]) => {
    setGames(prev => {
      const next = [...prev];
      newGames.forEach(newG => {
        const idx = next.findIndex(g => g.id === newG.id);
        if (idx > -1) next[idx] = newG;
        else next.push(newG);
      });
      return next;
    });
  };

  const logout = () => setCurrentUser(null);
  const updateUser = (u: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...u };
    setCurrentUser(updated);
    setUsers(users.map(u => u.id === currentUser.id ? updated : u));
    syncToNeon();
  };

  const adminAdjustBalance = (userId: string, currency: CurrencyType, amount: number, reason: string) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const field = currency === CurrencyType.GC ? 'goldCoins' : 'sweepCoins';
    const updatedUser = { ...target, [field]: Math.max(0, target[field] + amount) };
    setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    if (currentUser?.id === userId) setCurrentUser(updatedUser);
    addAudit(AuditAction.BALANCE_ADJUSTMENT, userId, `Adjusted ${currency} by ${amount}. Reason: ${reason}`);
    syncToNeon();
  };

  const requestRedemption = (amount: number) => {
    if (!currentUser) return "Login required";
    if (amount < settings.minRedemption) return `Minimum is ${settings.minRedemption} SC.`;
    if (currentUser.sweepCoins < amount) return "Insufficient SC.";
    if (currentUser.kycStatus !== KYCStatus.VERIFIED) return "Identity Vault Verification Required.";
    const newReq: RedemptionRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id, amount, status: RedemptionStatus.PENDING, createdAt: new Date().toISOString()
    };
    setRedemptions(prev => [newReq, ...prev]);
    const updatedUser = { ...currentUser, sweepCoins: currentUser.sweepCoins - amount, totalWithdrawn: (currentUser.totalWithdrawn || 0) + amount };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    syncToNeon();
    return null;
  };

  const uploadKycDoc = (type: keyof KYCDocuments, data: string) => {
    if (!currentUser) return;
    const updatedDocs = { ...currentUser.kycDocuments, [type]: data, uploadedAt: new Date().toISOString() };
    const updatedUser = { ...currentUser, kycDocuments: updatedDocs, kycStatus: KYCStatus.PENDING };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    syncToNeon();
  };

  const connectSocial = (platform: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, socialConnections: [...currentUser.socialConnections, platform], goldCoins: currentUser.goldCoins + 5000 };
    setCurrentUser(updated); setUsers(users.map(u => u.id === updated.id ? updated : u));
    syncToNeon();
  };

  const completeSocialPromotion = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, socialTaskCompleted: true, goldCoins: currentUser.goldCoins + 20000 };
    setCurrentUser(updated); setUsers(users.map(u => u.id === updated.id ? updated : u));
    syncToNeon();
  };

  return (
    <StoreContext.Provider value={{
      currentUser, users, transactions, redemptions, categories, games, packages, socialComments, latestWins, securityAlerts, auditLogs, emailLogs, ingestionLogs, settings, dbStatus,
      login, signup, logout, claimDailyReward, purchasePackage, requestRedemption, updateUser, processGameSpin, recordBridgeTransaction,
      adminAdjustBalance, adminUpdateGame, adminAddGame, adminUpsertGames, adminDeleteGame, adminResolveAlert, adminUpdateSettings, adminSendEmail, adminUpdateUserStatus, adminAddIngestionLog, connectSocial, completeSocialPromotion, uploadKycDoc, syncToNeon
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore error');
  return context;
};
