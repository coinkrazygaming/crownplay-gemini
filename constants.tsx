
import { Game, Package, Promotion, Category, CurrencyType } from './types';

export const APP_NAME = "CrownPlay";

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-featured', name: 'Featured', icon: '🔥' },
  { id: 'cat-slots', name: 'Slots', icon: '🎰' },
  { id: 'cat-jackpots', name: 'Jackpots', icon: '💰' },
  { id: 'cat-table', name: 'Tables', icon: '🃏' },
  { id: 'cat-live', name: 'Live Dealers', icon: '🎥' }
];

const createGame = (id: string, name: string, cat: string, volatility: 'LOW' | 'MEDIUM' | 'HIGH', rtp: number): Game => ({
  id,
  name,
  description: `Experience the premium thrill of ${name} exclusively at CrownPlay.`,
  image: `https://picsum.photos/seed/${id}/400/500`,
  categoryId: cat,
  provider: 'CrownPlay Studios',
  rtp,
  volatility,
  minBet: 100,
  maxBet: 1000000,
  themeColor: '#f59e0b'
});

export const MOCK_GAMES: Game[] = [
  // FEATURED
  createGame('1', 'Crown Gold Rush', 'cat-featured', 'HIGH', 0.965),
  createGame('2', 'Royal Spins Deluxe', 'cat-featured', 'MEDIUM', 0.972),
  createGame('3', 'Imperial Fortune', 'cat-featured', 'HIGH', 0.948),
  createGame('4', 'Queen of Crowns', 'cat-featured', 'LOW', 0.98),
  createGame('5', 'Majestic Multiplier', 'cat-featured', 'MEDIUM', 0.96),

  // SLOTS
  createGame('6', 'Sovereign Reels', 'cat-slots', 'MEDIUM', 0.96),
  createGame('7', 'Treasury Quest', 'cat-slots', 'HIGH', 0.955),
  createGame('8', 'Golden Scepter', 'cat-slots', 'MEDIUM', 0.962),
  createGame('9', 'Palace Perks', 'cat-slots', 'LOW', 0.975),
  createGame('10', 'Noble Nights', 'cat-slots', 'HIGH', 0.95),
  createGame('11', 'Crown Jewelers', 'cat-slots', 'MEDIUM', 0.968),
  createGame('12', 'Regal Wilds', 'cat-slots', 'MEDIUM', 0.96),
  createGame('13', 'Emerald Throne', 'cat-slots', 'HIGH', 0.945),
  createGame('14', 'Dynasty Diamonds', 'cat-slots', 'LOW', 0.972),
  createGame('15', 'Knightly Wins', 'cat-slots', 'MEDIUM', 0.964),

  // JACKPOTS
  createGame('16', 'Mega Crown Jackpot', 'cat-jackpots', 'HIGH', 0.92),
  createGame('17', 'King of Coins', 'cat-jackpots', 'HIGH', 0.935),
  createGame('18', 'Diamond Crown Blitz', 'cat-jackpots', 'MEDIUM', 0.95),
  createGame('19', 'Royal Vault', 'cat-jackpots', 'HIGH', 0.94),
  createGame('20', 'Infinite Sovereignty', 'cat-jackpots', 'HIGH', 0.915),

  // TABLES
  createGame('21', 'Crown Blackjack', 'cat-table', 'LOW', 0.995),
  createGame('22', 'Royal Roulette', 'cat-table', 'LOW', 0.973),
  createGame('23', 'Palace Baccarat', 'cat-table', 'LOW', 0.989),
  createGame('24', 'Crown Casino Holdem', 'cat-table', 'MEDIUM', 0.98),
  createGame('25', 'Regal Craps', 'cat-table', 'MEDIUM', 0.985),
];

export const MOCK_PACKAGES: Package[] = [
  { id: 'p1', name: 'Starter Bundle', priceCents: 999, goldAmount: 10000, sweepAmount: 10, isActive: true, tag: 'Most Popular' },
  { id: 'p2', name: 'Pro Package', priceCents: 1999, goldAmount: 25000, sweepAmount: 22, isActive: true },
  { id: 'p3', name: 'Crown Elite', priceCents: 4999, goldAmount: 75000, sweepAmount: 55, isActive: true, tag: 'Best Value' },
  { id: 'p4', name: 'Royal Treasury', priceCents: 9999, goldAmount: 200000, sweepAmount: 110, isActive: true },
];

// Updated bonusType to use CurrencyType enum values instead of unsafe strings
export const MOCK_PROMOTIONS: Promotion[] = [
  { id: 'promo1', name: 'Daily Login Bonus', description: 'Get 5,000 GC and 0.5 SC every day!', bonusType: CurrencyType.GC, bonusValue: 5000, isActive: true },
  { id: 'promo2', name: 'New Player Special', description: 'Double your first purchase!', bonusType: CurrencyType.SC, bonusValue: 10, isActive: true },
];

export const REFERRAL_BONUS_GC = 5000;
export const REFERRAL_BONUS_SC = 1;

export const INITIAL_CONTENT = {
  faq: [
    { q: "What are Gold Coins?", a: "Gold Coins are social gaming tokens used for play for fun. They have no real money value." },
    { q: "What are Sweepstakes Coins?", a: "Sweepstakes Coins are promotional tokens that can be used to enter sweepstakes for a chance to win prizes." },
    { q: "How do I redeem prizes?", a: "Once you have at least 100 Sweepstakes Coins won through gameplay, you can request a redemption." }
  ],
  terms: "By using CrownPlay, you agree to our sweepstakes rules and terms of service...",
  privacy: "We respect your privacy. Your data is protected using industry-standard encryption..."
};
