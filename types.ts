
export enum UserRole {
  PLAYER = 'PLAYER',
  ADMIN = 'ADMIN'
}

export enum KYCStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED'
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  REDEMPTION = 'REDEMPTION',
  BONUS = 'BONUS',
  DAILY_REWARD = 'DAILY_REWARD',
  GAME_WIN = 'GAME_WIN',
  GAME_LOSS = 'GAME_LOSS',
  REFERRAL_BONUS = 'REFERRAL_BONUS',
  ADMIN_ADJUSTMENT = 'ADMIN_ADJUSTMENT',
  SOCIAL_TASK_BONUS = 'SOCIAL_TASK_BONUS',
  JACKPOT_WIN = 'JACKPOT_WIN'
}

export enum CurrencyType {
  GC = 'GOLD_COINS',
  SC = 'SWEEP_COINS'
}

export enum RedemptionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum AuditAction {
  BALANCE_ADJUSTMENT = 'BALANCE_ADJUSTMENT',
  ROLE_CHANGE = 'ROLE_CHANGE',
  ACCOUNT_STATUS_CHANGE = 'ACCOUNT_STATUS_CHANGE',
  KYC_APPROVAL = 'KYC_APPROVAL',
  GAME_MANAGEMENT = 'GAME_MANAGEMENT',
  PACKAGE_MANAGEMENT = 'PACKAGE_MANAGEMENT',
  SOCIAL_MANAGEMENT = 'SOCIAL_MANAGEMENT',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE',
  SECURITY_OVERRIDE = 'SECURITY_OVERRIDE',
  LEADERBOARD_ADJUSTMENT = 'LEADERBOARD_ADJUSTMENT',
  EMAIL_SENT = 'EMAIL_SENT',
  MAINTENANCE_COMMAND = 'MAINTENANCE_COMMAND'
}

export interface SecurityAlert {
  id: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  description: string;
  userId?: string;
  createdAt: string;
  resolved: boolean;
}

export interface KYCDocuments {
  idFront?: string;
  proofOfAddress?: string;
  paymentProof?: string;
  uploadedAt?: string;
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
  lastLoginAt: string;
  goldCoins: number;
  sweepCoins: number;
  name: string;
  dob?: string;
  address?: string;
  kycStatus: KYCStatus;
  kycDocuments: KYCDocuments;
  referralCode: string;
  referredBy?: string;
  lastDailyClaim?: string;
  gPayEnabled: boolean; 
  socialConnections: string[]; 
  socialTaskCompleted: boolean;
  xp: number;
  level: number;
  badges: string[];
  totalDeposited: number;
  totalWithdrawn: number;
  isPublic: boolean;
}

export interface Game {
  id: string;
  name: string;
  description: string;
  image: string;
  categoryId: string;
  provider: string;
  rtp: number;
  volatility: 'LOW' | 'MEDIUM' | 'HIGH';
  minBet: number;
  maxBet: number;
  themeColor: string;
  reelsConfig?: string[]; 
}

export interface Package {
  id: string;
  name: string;
  priceCents: number;
  goldAmount: number;
  sweepAmount: number;
  isActive: boolean;
  tag?: string;
}

export interface WinTickerEntry {
  id: string;
  playerName: string;
  gameName: string;
  amount: number;
  currency: CurrencyType;
  createdAt: string;
  isAIPicked?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyType;
  metadata?: string;
  createdAt: string;
  paymentMethod?: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  auditId?: string; 
}

export interface EmailLog {
  id: string;
  userId: string;
  subject: string;
  body: string;
  type: 'RETENTION' | 'KYC_REMINDER' | 'PROMO' | 'SYSTEM';
  sentAt: string;
}

export interface AppSettings {
  globalGPayEnabled: boolean;
  maintenanceMode: boolean;
  minRedemption: number;
  // Bonus Management
  newUserBonusGC: number;
  newUserBonusSC: number;
  socialBonusGC: number;
  socialBonusSC: number;
  dailyRewardGC: number;
  dailyRewardSC: number;
  socialTaskBonusGC: number;
  socialTaskBonusSC: number;
  leaderboardWeeklyPrizeSC: number;
  gamePlayBonusRate: number; // XP per coin
  // Banking
  squareApplicationId: string;
  squareLocationId: string;
  gpayMerchantId: string;
  // Social/Ticker
  leaderboardVisible: boolean;
  tickerMaxItems: number;
  tickerScrollSpeed: number;
  // Progressive Jackpot
  jackpotGC: number;
  jackpotSC: number;
  jackpotContributionRate: number; // % of bet
  jackpotSeedGC: number;
  jackpotSeedSC: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  bonusType: CurrencyType;
  bonusValue: number;
  isActive: boolean;
}

export interface RedemptionRequest {
  id: string;
  userId: string;
  amount: number;
  status: RedemptionStatus;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  action: AuditAction;
  metadata: string;
  createdAt: string;
}

export interface SocialComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}
