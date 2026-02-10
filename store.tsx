
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, Transaction, RedemptionRequest, KYCStatus, TransactionType, CurrencyType, RedemptionStatus, Category, AuditLog, AuditAction, Game, Package, KYCDocuments, SocialComment, WinTickerEntry } from './types';
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
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (email: string, name: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  claimDailyReward: () => string | null;
  purchasePackage: (packageId: string) => void;
  requestRedemption: (amount: number) => string | null;
  updateKYC: (data: Partial<User>) => void;
  uploadDocument: (type: keyof KYCDocuments, file: string) => void;
  addTransaction: (tx: Transaction) => void;
  processGameSpin: (gameId: string, bet: number, currency: CurrencyType) => Promise<{ won: boolean; amount: number; message: string }>;
  adminAddSocialComment: (comment: SocialComment) => void;
  adminRemoveSocialComment: (id: string) => void;
  adminUpdateUser: (userId: string, updates: Partial<User>) => void;
  adminAdjustBalance: (userId: string, currency: CurrencyType, amount: number, reason: string) => void;
  adminUpdateRedemption: (id: string, status: RedemptionStatus) => void;
  adminUpdateGame: (id: string, updates: Partial<Game>) => void;
  adminAddGame: (game: Game) => void;
  adminDeleteGame: (id: string) => void;
  adminUpdatePackage: (id: string, updates: Partial<Package>) => void;
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

  useEffect(() => {
    const savedUsers = localStorage.getItem('cp_users');
    const savedTx = localStorage.getItem('cp_transactions');
    const savedRed = localStorage.getItem('cp_redemptions');
    const savedCurrent = localStorage.getItem('cp_current');
    const savedCategories = localStorage.getItem('cp_categories');
    const savedGames = localStorage.getItem('cp_games');
    const savedPackages = localStorage.getItem('cp_packages');
    const savedComments = localStorage.getItem('cp_comments');
    const savedWins = localStorage.getItem('cp_wins');

    if (savedUsers) setUsers(JSON.parse(savedUsers));
    else {
      const admin: User = {
        id: 'admin-1',
        email: 'coinkrazy26@gmail.com',
        role: UserRole.ADMIN,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        goldCoins: 500000,
        sweepCoins: 500,
        name: 'Admin Monarch',
        kycStatus: KYCStatus.VERIFIED,
        kycDocuments: {},
        referralCode: 'ADMIN-CROWN'
      };
      setUsers([admin]);
    }

    if (savedTx) setTransactions(JSON.parse(savedTx));
    if (savedRed) setRedemptions(JSON.parse(savedRed));
    if (savedCurrent) setCurrentUser(JSON.parse(savedCurrent));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    else setCategories(INITIAL_CATEGORIES);
    if (savedGames) setGames(JSON.parse(savedGames));
    else setGames(MOCK_GAMES);
    if (savedPackages) setPackages(JSON.parse(savedPackages));
    else setPackages(MOCK_PACKAGES);

    if (savedComments) setSocialComments(JSON.parse(savedComments));
    else setSocialComments([
      { id: '1', author: 'Royal Sarah', text: 'Just won 25 SC on Diamond Blitz! Love this kingdom!', source: 'FACEBOOK', createdAt: new Date().toISOString() },
      { id: '2', author: 'Sir Winsalot', text: 'Crown Gold Rush is paying out today! Fast redemptions.', source: 'FACEBOOK', createdAt: new Date().toISOString() }
    ]);

    if (savedWins) setLatestWins(JSON.parse(savedWins));
    else setLatestWins([
      { id: 'w1', playerName: 'Duke James', gameName: 'Crown Gold Rush', amount: 150000, currency: CurrencyType.GC, createdAt: new Date().toISOString() },
      { id: 'w2', playerName: 'Lady Elena', gameName: 'Royal Spins', amount: 25.5, currency: CurrencyType.SC, createdAt: new Date().toISOString() }
    ]);
  }, []);

  useEffect(() => {
    localStorage.setItem('cp_users', JSON.stringify(users));
    localStorage.setItem('cp_transactions', JSON.stringify(transactions));
    localStorage.setItem('cp_redemptions', JSON.stringify(redemptions));
    localStorage.setItem('cp_categories', JSON.stringify(categories));
    localStorage.setItem('cp_games', JSON.stringify(games));
    localStorage.setItem('cp_packages', JSON.stringify(packages));
    localStorage.setItem('cp_comments', JSON.stringify(socialComments));
    localStorage.setItem('cp_wins', JSON.stringify(latestWins));
    if (currentUser) localStorage.setItem('cp_current', JSON.stringify(currentUser));
    else localStorage.removeItem('cp_current');
  }, [users, transactions, redemptions, currentUser, categories, games, packages, socialComments, latestWins]);

  const login = async (email: string, pass: string) => {
    const user = users.find(u => u.email === email);
    if (user && (pass === 'admin123' || pass === 'password')) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const signup = async (email: string, name: string, referralCode?: string) => {
    if (users.find(u => u.email === email)) throw new Error('Citizen already exists.');
    const userId = Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      id: userId,
      email,
      name,
      role: UserRole.PLAYER,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      goldCoins: 10000,
      sweepCoins: 10,
      kycStatus: KYCStatus.UNVERIFIED,
      kycDocuments: {},
      referralCode: userId.toUpperCase(),
    };
    setUsers(prev => [...prev, newUser]);
    const bonuses: Transaction[] = [
      { id: Math.random().toString(36).substr(2, 9), userId: newUser.id, type: TransactionType.BONUS, amount: 10000, currency: CurrencyType.GC, metadata: 'Welcome Gold Bonus', createdAt: new Date().toISOString() },
      { id: Math.random().toString(36).substr(2, 9), userId: newUser.id, type: TransactionType.BONUS, amount: 10, currency: CurrencyType.SC, metadata: 'Welcome Sweep Bonus', createdAt: new Date().toISOString() }
    ];
    setTransactions(prev => [...bonuses, ...prev]);
    setCurrentUser(newUser);
  };

  const logout = () => setCurrentUser(null);

  const processGameSpin = async (gameId: string, bet: number, currency: CurrencyType) => {
    if (!currentUser) throw new Error("Not logged in");
    const game = games.find(g => g.id === gameId);
    if (!game) throw new Error("Game not found");

    const currencyField = currency === CurrencyType.GC ? 'goldCoins' : 'sweepCoins';
    if (currentUser[currencyField] < bet) return { won: false, amount: 0, message: "INSUFFICIENT_FUNDS" };

    // Math engine
    const won = Math.random() < (game.rtp * 0.95); // Variance factor
    const winAmount = won ? bet * (Math.random() > 0.8 ? (Math.random() > 0.9 ? 100 : 10) : 2) : 0;

    const updatedUser = {
      ...currentUser,
      [currencyField]: currentUser[currencyField] - bet + winAmount
    };

    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));

    if (winAmount > 0) {
      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        type: TransactionType.GAME_WIN,
        amount: winAmount,
        currency,
        metadata: `Win on ${game.name}`,
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [tx, ...prev]);

      // If big win, add to ticker
      if (winAmount > (currency === CurrencyType.GC ? 50000 : 20)) {
        const winEntry: WinTickerEntry = {
          id: Math.random().toString(36).substr(2, 9),
          playerName: currentUser.name,
          gameName: game.name,
          amount: winAmount,
          currency,
          createdAt: new Date().toISOString()
        };
        setLatestWins(prev => [winEntry, ...prev.slice(0, 19)]);
      }
    } else {
      const tx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        userId: currentUser.id,
        type: TransactionType.GAME_LOSS,
        amount: bet,
        currency,
        metadata: `Loss on ${game.name}`,
        createdAt: new Date().toISOString()
      };
      setTransactions(prev => [tx, ...prev]);
    }

    return { won, amount: winAmount, message: won ? "ROYAL WIN!" : "BETTER LUCK NEXT TIME" };
  };

  const claimDailyReward = () => {
    if (!currentUser) return null;
    const now = new Date();
    const lastClaim = currentUser.lastDailyClaim ? new Date(currentUser.lastDailyClaim) : new Date(0);
    const diffHours = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24) return `Bounty ready in ${Math.ceil(24 - diffHours)} hours.`;
    const bonusGC = 5000;
    const bonusSC = 0.5;
    const updatedUser = { ...currentUser, goldCoins: currentUser.goldCoins + bonusGC, sweepCoins: currentUser.sweepCoins + bonusSC, lastDailyClaim: now.toISOString() };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    setTransactions(prev => [{ id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, type: TransactionType.DAILY_REWARD, amount: bonusGC, currency: CurrencyType.GC, createdAt: now.toISOString() }, ...prev]);
    return null;
  };

  const purchasePackage = (packageId: string) => {
    if (!currentUser) return;
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;
    const updatedUser = { ...currentUser, goldCoins: currentUser.goldCoins + pkg.goldAmount, sweepCoins: currentUser.sweepCoins + pkg.sweepAmount };
    setTransactions(prev => [{ id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, type: TransactionType.PURCHASE, amount: pkg.priceCents / 100, currency: CurrencyType.GC, metadata: `Purchased ${pkg.name}`, createdAt: new Date().toISOString() }, ...prev]);
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const requestRedemption = (amount: number) => {
    if (!currentUser || currentUser.sweepCoins < amount || amount < 100 || currentUser.kycStatus !== KYCStatus.VERIFIED) return "Verification or funds missing.";
    const req: RedemptionRequest = { id: Math.random().toString(36).substr(2, 9), userId: currentUser.id, amount, status: RedemptionStatus.PENDING, createdAt: new Date().toISOString() };
    const updatedUser = { ...currentUser, sweepCoins: currentUser.sweepCoins - amount };
    setRedemptions(prev => [req, ...prev]);
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    return null;
  };

  const uploadDocument = (type: keyof KYCDocuments, file: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, kycDocuments: { ...currentUser.kycDocuments, [type]: file }, kycStatus: KYCStatus.PENDING };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const updateKYC = (data: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...data };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const addTransaction = (tx: Transaction) => setTransactions(prev => [tx, ...prev]);
  const adminUpdateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) setCurrentUser({ ...currentUser, ...updates });
  };
  const adminAdjustBalance = (u: string, c: CurrencyType, a: number, r: string) => adminUpdateUser(u, { [c === CurrencyType.GC ? 'goldCoins' : 'sweepCoins']: a });
  const adminUpdateRedemption = (id: string, status: RedemptionStatus) => setRedemptions(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  const adminUpdateGame = (id: string, u: Partial<Game>) => setGames(prev => prev.map(g => g.id === id ? { ...g, ...u } : g));
  const adminAddGame = (game: Game) => setGames(prev => [game, ...prev]);
  const adminDeleteGame = (id: string) => setGames(prev => prev.filter(g => g.id !== id));
  const adminUpdatePackage = (id: string, u: Partial<Package>) => setPackages(prev => prev.map(p => p.id === id ? { ...p, ...u } : p));
  const adminAddSocialComment = (c: SocialComment) => setSocialComments(prev => [c, ...prev]);
  const adminRemoveSocialComment = (id: string) => setSocialComments(prev => prev.filter(c => c.id !== id));

  return (
    <StoreContext.Provider value={{
      currentUser, users, transactions, redemptions, categories, games, packages, socialComments, latestWins,
      login, signup, logout, claimDailyReward, purchasePackage, requestRedemption, updateKYC, uploadDocument, addTransaction, processGameSpin,
      adminUpdateUser, adminAdjustBalance, adminUpdateRedemption, adminUpdateGame, adminAddGame, adminDeleteGame, adminUpdatePackage, adminAddSocialComment, adminRemoveSocialComment
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
