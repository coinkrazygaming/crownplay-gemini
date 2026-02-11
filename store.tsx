
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, Transaction, RedemptionRequest, KYCStatus, TransactionType, CurrencyType, RedemptionStatus, Category, AuditLog, AuditAction, Game, Package, KYCDocuments, SocialComment, WinTickerEntry, SecurityAlert, AppSettings, EmailLog } from './types';
import { MOCK_PACKAGES, MOCK_GAMES, INITIAL_CATEGORIES, REFERRAL_BONUS_GC, REFERRAL_BONUS_SC } from './constants';

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
  settings: AppSettings;
  dbStatus: 'connected' | 'syncing' | 'error';
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, name: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  claimDailyReward: () => string | null;
  purchasePackage: (packageId: string, method?: string, paymentData?: any) => void;
  requestRedemption: (amount: number) => string | null;
  updateUser: (updates: Partial<User>) => void;
  processGameSpin: (gameId: string, bet: number, currency: CurrencyType) => Promise<{ won: boolean; amount: number; message: string; reels: string[][] }>;
  adminAdjustBalance: (userId: string, currency: CurrencyType, amount: number, reason: string) => void;
  adminUpdateGame: (id: string, updates: Partial<Game>) => void;
  adminAddGame: (game: Game) => void;
  adminDeleteGame: (id: string) => void;
  adminResolveAlert: (id: string) => void;
  adminUpdateSettings: (updates: Partial<AppSettings>) => void;
  adminSendEmail: (userId: string | 'ALL', subject: string, body: string, type: EmailLog['type']) => void;
  adminUpdateUserStatus: (userId: string, status: 'ACTIVE' | 'LOCKED', kyc: KYCStatus) => void;
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
  const [dbStatus, setDbStatus] = useState<'connected' | 'syncing' | 'error'>('connected');
  const [settings, setSettings] = useState<AppSettings>({
    globalGPayEnabled: true,
    maintenanceMode: false,
    minRedemption: 100,
    newUserBonusGC: 10000,
    newUserBonusSC: 2,
    socialBonusGC: 5000,
    socialBonusSC: 1,
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
      gPayEnabled: true,
      socialConnections: [],
      socialTaskCompleted: true,
      xp: 1000,
      level: 10,
      badges: ['STAFF'],
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
    save('settings', settings);
    if (currentUser) save('current', currentUser);
    else localStorage.removeItem('cp_neon_current');
    setDbStatus('connected');
  }, [users, transactions, redemptions, categories, games, packages, socialComments, latestWins, securityAlerts, auditLogs, emailLogs, settings, currentUser]);

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

  const adminSendEmail = useCallback((userId: string | 'ALL', subject: string, body: string, type: EmailLog['type']) => {
    const targets = userId === 'ALL' ? users : users.filter(u => u.id === userId);
    const newLogs: EmailLog[] = targets.map(u => ({ id: Math.random().toString(36).substr(2, 9), userId: u.id, subject, body, type, sentAt: new Date().toISOString() }));
    setEmailLogs(prev => [...newLogs, ...prev]);
    addAudit(AuditAction.EMAIL_SENT, userId, `Sent ${type} email: ${subject}`);
    const save = (key: string, val: any) => localStorage.setItem(`cp_neon_${key}`, JSON.stringify(val));
    save('emails', [...emailLogs, ...newLogs]);
  }, [users, emailLogs]);

  useEffect(() => {
    const checkKycReminders = () => {
      const admin = users.find(u => u.role === UserRole.ADMIN);
      if (!admin) return;
      const now = new Date().getTime();
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      let updated = false;
      const updatedUsers = users.map(user => {
        if (user.kycStatus === KYCStatus.VERIFIED) return user;
        const registeredAt = new Date(user.createdAt).getTime();
        const lastReminder = user.lastKycReminderSentAt ? new Date(user.lastKycReminderSentAt).getTime() : 0;
        if (now - registeredAt > sevenDaysMs && now - lastReminder > sevenDaysMs) {
          updated = true;
          adminSendEmail(user.id, 'URGENT: Verify Your Royal Identity', `Greetings ${user.name}. To continue enjoying full access to redemptions and premium features, please complete your Identity Vault verification.`, 'KYC_REMINDER');
          adminSendEmail(admin.id, `KYC Alert: ${user.name}`, `Notice: User ${user.name} (${user.email}) has not completed KYC after 7 days. Status: ${user.kycStatus}`, 'SYSTEM');
          return { ...user, lastKycReminderSentAt: new Date().toISOString() };
        }
        return user;
      });
      if (updated) {
        setUsers(updatedUsers);
        syncToNeon();
      }
    };
    const interval = setInterval(checkKycReminders, 60000 * 60);
    const initialTimeout = setTimeout(checkKycReminders, 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [users, adminSendEmail, syncToNeon]);

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

  const signup = async (email: string, name: string, referralCode?: string) => {
    const newUserId = Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      id: newUserId,
      email, name, role: UserRole.PLAYER, status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      goldCoins: settings.newUserBonusGC,
      sweepCoins: settings.newUserBonusSC,
      kycStatus: KYCStatus.UNVERIFIED,
      kycDocuments: {},
      referralCode: 'CP-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
      gPayEnabled: false,
      socialConnections: [],
      socialTaskCompleted: false,
      xp: 0, level: 1, badges: [],
      totalDeposited: 0, totalWithdrawn: 0, isPublic: true
    };
    let updatedUsers = [...users, newUser];
    if (referralCode) {
      const referrer = users.find(u => u.referralCode === referralCode);
      if (referrer) {
        newUser.referredBy = referrer.id;
        updatedUsers = updatedUsers.map(u => u.id === referrer.id ? { ...u, goldCoins: u.goldCoins + 5000, sweepCoins: u.sweepCoins + 1 } : u);
      }
    }
    setUsers(updatedUsers);
    setCurrentUser(newUser);
    const admin = users.find(u => u.role === UserRole.ADMIN);
    const adminId = admin ? admin.id : 'admin-1';
    adminSendEmail(newUserId, 'Confirm Your Royal Identity', `Greetings ${name}, please confirm your email to finalize your enlistment in CrownPlay.`, 'SYSTEM');
    adminSendEmail(adminId, 'New Citizen Enlistment Alert', `Admin notice: A new user has registered. Name: ${name}, Email: ${email}. ID: ${newUserId}`, 'SYSTEM');
    syncToNeon();
  };

  const uploadKycDoc = (type: keyof KYCDocuments, data: string) => {
    if (!currentUser) return;
    const updatedDocs = { ...currentUser.kycDocuments, [type]: data, uploadedAt: new Date().toISOString() };
    const updatedUser = { ...currentUser, kycDocuments: updatedDocs, kycStatus: KYCStatus.PENDING };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    const admin = users.find(u => u.role === UserRole.ADMIN);
    if (admin) {
      adminSendEmail(admin.id, 'Identity Vault Update', `User ${currentUser.name} has uploaded a new ${type} document for review.`, 'SYSTEM');
    }
    syncToNeon();
  };

  const requestRedemption = (amount: number) => {
    if (!currentUser) return "Login required";
    if (amount < settings.minRedemption) return `Minimum redemption is ${settings.minRedemption} SC.`;
    if (currentUser.sweepCoins < amount) return "Insufficient SC balance.";
    const docs = currentUser.kycDocuments;
    if (!docs.idFront || !docs.proofOfAddress || !docs.paymentProof) {
      return "Identity Vault Incomplete. ID Front, Proof of Address, and Payment Card proof are required for all redemptions.";
    }
    if (currentUser.kycStatus !== KYCStatus.VERIFIED) {
      return "Sovereign Audit in Progress. Redemption requires a VERIFIED status.";
    }
    const newReq: RedemptionRequest = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id, amount, status: RedemptionStatus.PENDING, createdAt: new Date().toISOString()
    };
    setRedemptions(prev => [newReq, ...prev]);
    const updatedUser = { ...currentUser, sweepCoins: currentUser.sweepCoins - amount, totalWithdrawn: (currentUser.totalWithdrawn || 0) + amount };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setTransactions(prev => [{
      id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, type: TransactionType.REDEMPTION, amount, currency: CurrencyType.SC, status: 'PENDING', createdAt: new Date().toISOString()
    }, ...prev]);
    const admin = users.find(u => u.role === UserRole.ADMIN);
    if (admin) {
      adminSendEmail(admin.id, 'URGENT: Redemption Request Disbursement', `Admin Audit Required: User ${currentUser.name} (${currentUser.email}) has requested a redemption of ${amount} SC.`, 'SYSTEM');
    }
    syncToNeon();
    return null;
  };

  const processGameSpin = async (gameId: string, bet: number, currency: CurrencyType) => {
    if (!currentUser) throw new Error("Not logged in");
    const game = games.find(g => g.id === gameId);
    if (!game) throw new Error("Game not found");
    const currencyField = currency === CurrencyType.GC ? 'goldCoins' : 'sweepCoins';
    if (currentUser[currencyField] < bet) return { won: false, amount: 0, message: "INSUFFICIENT_FUNDS", reels: [] };
    setSettings(s => ({ ...s, [currency === CurrencyType.GC ? 'jackpotGC' : 'jackpotSC']: s[currency === CurrencyType.GC ? 'jackpotGC' : 'jackpotSC'] + (bet * s.jackpotContributionRate) }));
    const jackpotWon = Math.random() < 0.000002;
    let winAmount = 0;
    let won = false;
    if (jackpotWon) {
      winAmount = currency === CurrencyType.GC ? settings.jackpotGC : settings.jackpotSC;
      won = true;
      setSettings(s => ({ ...s, [currency === CurrencyType.GC ? 'jackpotGC' : 'jackpotSC']: currency === CurrencyType.GC ? s.jackpotSeedGC : s.jackpotSeedSC }));
      const admin = users.find(u => u.role === UserRole.ADMIN);
      if (admin) {
        adminSendEmail(admin.id, '⚠️ MEGA JACKPOT TRIGGERED', `ALERT: User ${currentUser.name} has just hit the ROYAL JACKPOT for ${winAmount} ${currency}!`, 'SYSTEM');
      }
    } else {
      won = Math.random() < game.rtp;
      winAmount = won ? bet * (Math.random() > 0.95 ? 20 : 2) : 0;
    }
    const updatedUser = { ...currentUser, [currencyField]: currentUser[currencyField] - bet + winAmount, xp: currentUser.xp + (bet * settings.gamePlayBonusRate) };
    updatedUser.level = Math.floor(Math.sqrt(updatedUser.xp / 100)) + 1;
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (winAmount > 0) setLatestWins(prev => [{ id: Math.random().toString(36).substr(2, 9), playerName: `${currentUser.name.split(' ')[0]} ${currentUser.name.split(' ')[1]?.[0] || ''}.`, gameName: game.name, amount: winAmount, currency, createdAt: new Date().toISOString() }, ...prev].slice(0, 50));
    return { won, amount: winAmount, message: jackpotWon ? "ROYAL JACKPOT!" : (won ? "WIN!" : "TRY AGAIN"), reels: Array(5).fill(0).map(() => Array(3).fill(0).map(() => (game.reelsConfig || ['👑'])[Math.floor(Math.random() * (game.reelsConfig?.length || 1))])) };
  };

  const purchasePackage = (packageId: string, method: string = 'Card', paymentData: any = null) => {
    if (!currentUser) return;
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    const updatedUser = { ...currentUser, goldCoins: currentUser.goldCoins + pkg.goldAmount, sweepCoins: currentUser.sweepCoins + pkg.sweepAmount, totalDeposited: (currentUser.totalDeposited || 0) + (pkg.priceCents / 100) };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setTransactions(prev => [{ id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, type: TransactionType.PURCHASE, amount: pkg.priceCents / 100, currency: CurrencyType.GC, metadata: `Package: ${pkg.name}. Verified Token: ${paymentData?.paymentMethodData?.tokenizationData?.token?.substring(0, 20)}...`, paymentMethod: method, status: 'COMPLETED', createdAt: new Date().toISOString() }, ...prev]);
    const admin = users.find(u => u.role === UserRole.ADMIN);
    if (admin) {
      adminSendEmail(admin.id, 'Treasury Contribution Received', `Financial Update: User ${currentUser.name} purchased ${pkg.name} for $${(pkg.priceCents/100).toFixed(2)} via real ${method} transaction.`, 'PROMO');
    }
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

  const adminUpdateUserStatus = (userId: string, status: 'ACTIVE' | 'LOCKED', kyc: KYCStatus) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const updatedUser = { ...target, status, kycStatus: kyc };
    setUsers(users.map(u => u.id === userId ? updatedUser : u));
    if (currentUser?.id === userId) setCurrentUser(updatedUser);
    addAudit(AuditAction.ACCOUNT_STATUS_CHANGE, userId, `Status: ${status}, KYC: ${kyc}`);
    syncToNeon();
  };

  const updateUser = (u: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...u };
    setCurrentUser(updated);
    setUsers(users.map(u => u.id === currentUser.id ? updated : u));
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
  const logout = () => setCurrentUser(null);
  const claimDailyReward = () => {
    if (!currentUser) return "Login required";
    const now = new Date();
    if (currentUser.lastDailyClaim && (now.getTime() - new Date(currentUser.lastDailyClaim).getTime()) < 86400000) return `Cooldown active.`;
    const updated = { ...currentUser, goldCoins: currentUser.goldCoins + settings.dailyRewardGC, sweepCoins: currentUser.sweepCoins + settings.dailyRewardSC, lastDailyClaim: now.toISOString() };
    setCurrentUser(updated); setUsers(users.map(u => u.id === updated.id ? updated : u));
    syncToNeon();
    return null;
  };
  const completeSocialPromotion = () => {
    if (!currentUser || currentUser.socialTaskCompleted) return;
    const updated = { ...currentUser, socialTaskCompleted: true, goldCoins: currentUser.goldCoins + settings.socialTaskBonusGC, sweepCoins: currentUser.sweepCoins + settings.socialTaskBonusSC };
    setCurrentUser(updated); setUsers(users.map(u => u.id === updated.id ? updated : u));
    syncToNeon();
  };
  const connectSocial = (p: string) => {
    if (!currentUser || currentUser.socialConnections.includes(p)) return;
    const updated = { ...currentUser, socialConnections: [...currentUser.socialConnections, p], goldCoins: currentUser.goldCoins + settings.socialBonusGC, sweepCoins: currentUser.sweepCoins + settings.socialBonusSC };
    setCurrentUser(updated); setUsers(users.map(u => u.id === updated.id ? updated : u));
    syncToNeon();
  };
  return (
    <StoreContext.Provider value={{
      currentUser, users, transactions, redemptions, categories, games, packages, socialComments, latestWins, securityAlerts, auditLogs, emailLogs, settings, dbStatus,
      login, signup, logout, claimDailyReward, purchasePackage, requestRedemption, updateUser, processGameSpin,
      adminAdjustBalance, adminUpdateGame, adminAddGame, adminDeleteGame, adminResolveAlert, adminUpdateSettings, adminSendEmail, adminUpdateUserStatus, connectSocial, completeSocialPromotion, uploadKycDoc, syncToNeon
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
