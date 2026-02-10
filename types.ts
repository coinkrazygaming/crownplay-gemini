
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
  REFERRAL_BONUS = 'REFERRAL_BONUS'
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
  SOCIAL_MANAGEMENT = 'SOCIAL_MANAGEMENT'
}

export interface KYCDocuments {
  idFront?: string;
  proofOfAddress?: string;
  paymentProof?: string;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'LOCKED';
  createdAt: string;
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

export interface Promotion {
  id: string;
  name: string;
  description: string;
  bonusType: CurrencyType;
  bonusValue: number;
  isActive: boolean;
}

export interface SocialComment {
  id: string;
  author: string;
  text: string;
  source: 'FACEBOOK' | 'PLATFORM';
  createdAt: string;
}

export interface WinTickerEntry {
  id: string;
  playerName: string;
  gameName: string;
  amount: number;
  currency: CurrencyType;
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: CurrencyType;
  metadata?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
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

export interface RedemptionRequest {
  id: string;
  userId: string;
  amount: number;
  status: RedemptionStatus;
  notes?: string;
  createdAt: string;
}
