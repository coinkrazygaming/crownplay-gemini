
import { Game, Package, Category, CurrencyType } from './types';

export const APP_NAME = "CrownPlay";

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-featured', name: 'Featured', icon: '🔥' },
  { id: 'cat-slots', name: 'Pragmatic Slots', icon: '🎰' },
  { id: 'cat-jackpots', name: 'Elite Jackpots', icon: '💰' },
  { id: 'cat-table', name: 'High Stakes Tables', icon: '🃏' }
];

const PRAGMATIC_MAPPING = [
  { name: "Gates of Olympus", symbol: "vs20olympgate" },
  { name: "Sugar Rush 1000", symbol: "vs20sugarrush" },
  { name: "Sweet Bonanza", symbol: "vs20sweetbonanza" },
  { name: "Big Bass Bonanza", symbol: "vs10bbbonanza" },
  { name: "Wolf Gold", symbol: "vs25wolfgold" },
  { name: "The Dog House", symbol: "vs20doghouse" },
  { name: "Wild West Gold", symbol: "vs40wildwest" },
  { name: "Madame Destiny Megaways", symbol: "vswaysmadame" },
  { name: "Juicy Fruits", symbol: "vs50juicyfr" },
  { name: "Starlight Princess", symbol: "vs20starlight" },
  { name: "Buffalo King", symbol: "vs4096bufking" },
  { name: "Fruit Party 2", symbol: "vs20fruitparty" },
  { name: "Great Rhino Megaways", symbol: "vswaysrhino" },
  { name: "Chilli Heat", symbol: "vs25chilli" },
  { name: "Mustang Gold", symbol: "vs25mustang" },
  { name: "Release the Kraken", symbol: "vs20kraken" },
  { name: "Tomb of the Scarab Queen", symbol: "vs25scarabqueen" },
  { name: "The Hand of Midas", symbol: "vs20midas" },
  { name: "Spartan King", symbol: "vs40spartan" },
  { name: "Floating Dragon", symbol: "vs10floatdrg" },
  { name: "Ancient Egypt", symbol: "vs10egypt" },
  { name: "Panda's Fortune", symbol: "vs25pandafort" },
  { name: "Golden Beauty", symbol: "vs75beauty" },
  { name: "Greek Gods", symbol: "vs243greekgods" },
  { name: "Master Joker", symbol: "vs1masterjoker" },
  { name: "Aladdin and the Sorcerer", symbol: "vs20aladdin" },
  { name: "Mysterious Egypt", symbol: "vs10wildnewyear" },
  { name: "Eye of the Storm", symbol: "vs10eyestorm" },
  { name: "Chicken Drop", symbol: "vs20chickdrop" },
  { name: "Bigger Bass Bonanza", symbol: "vs12bbbonanza" },
  { name: "Treasure Wild", symbol: "vs20treasurew" },
  { name: "Day of Dead", symbol: "vs20daydead" },
  { name: "Mystic Chief", symbol: "vs576mystic" },
  { name: "Bounty Gold", symbol: "vs25bountyg" },
  { name: "Santa's Wonderland", symbol: "vs20santawonder" },
  { name: "Wild Depths", symbol: "vs40wilddepth" },
  { name: "Magician's Secrets", symbol: "vs4096magician" },
  { name: "Rock Vegas", symbol: "vs20rockvegas" },
  { name: "The Ultimate 5", symbol: "vs20ultim5" },
  { name: "Colossal Cash Zone", symbol: "vs20colossal" },
  { name: "Barn Festival", symbol: "vs20barnfest" },
  { name: "Spaceman", symbol: "vs0spaceman" },
  { name: "Drill that Gold", symbol: "vs20drillgold" },
  { name: "Eye of Cleopatra", symbol: "vs40cleopatra" },
  { name: "Clover Gold", symbol: "vs20clovergold" },
  { name: "Fire Strike 2", symbol: "vs10firestrike2" },
  { name: "Zombie Carnival", symbol: "vs4096zombie" },
  { name: "Fortune of Giza", symbol: "vs20giza" },
  { name: "Big Bass Splash", symbol: "vs10splashtxt" },
  { name: "Cash Patrol", symbol: "vs25cpatrol" },
  { name: "Queen of Gods", symbol: "vs10queengods" },
  { name: "Cosmic Cash", symbol: "vs40cosmiccash" },
  { name: "Tropical Tiki", symbol: "vs3125ttiki" },
  { name: "Gorilla Mayhem", symbol: "vs1024gorilla" },
  { name: "Greedy Wolf", symbol: "vs20greedywolf" },
  { name: "Black Bull", symbol: "vs20blackbull" },
  { name: "Crown of Fire", symbol: "vs10crownfire" },
  { name: "Book of Golden Sands", symbol: "vswaysbookgs" },
  { name: "Striking Hot 5", symbol: "vs5striking" },
  { name: "Happy Hooves", symbol: "vs40hooves" },
  { name: "Fire Archer", symbol: "vs25firearcher" },
  { name: "Gods of Giza", symbol: "vs10godsgiza" },
  { name: "Rabbit Garden", symbol: "vs20rabbitgard" },
  { name: "Wild Bison Charge", symbol: "vs50bison" },
  { name: "Knight Hot Spotz", symbol: "vs25knighthp" },
  { name: "Loki's Riches", symbol: "vs20lokiriches" },
  { name: "Pinup Girls", symbol: "vs20pinup" },
  { name: "Gems Bonanza", symbol: "vs20gemsbon" },
  { name: "Voodoo Magic", symbol: "vs40voodoo" },
  { name: "Power of Thor Megaways", symbol: "vswaysthor" },
  { name: "Wild Booster", symbol: "vs20booster" },
  { name: "Fishin' Reels", symbol: "vs10fishinreels" },
  { name: "The Hand of Midas", symbol: "vs20midas" },
  { name: "Buffalo King Megaways", symbol: "vswaysbufking" },
  { name: "Fruit Party", symbol: "vs20fruitparty" },
  { name: "Book of Tut", symbol: "vs10bookoftut" },
  { name: "Great Rhino", symbol: "vs20rhino" },
  { name: "Da Vinci's Treasure", symbol: "vs25davinci" },
  { name: "Triple Dragons", symbol: "vs5dragons" },
  { name: "888 Dragons", symbol: "vs1dragons" },
  { name: "Aztec Gems", symbol: "vs5aztecgems" },
  { name: "Vampires vs Wolves", symbol: "vs10vampires" },
  { name: "Super Joker", symbol: "vs5sjoker" },
  { name: "Honey Honey Honey", symbol: "vs20honey" },
  { name: "Tree of Riches", symbol: "vs1treeofrich" },
  { name: "Hercules and Pegasus", symbol: "vs20hercpun" },
  { name: "Monkey Warrior", symbol: "vs25monkey" },
  { name: "Fire 88", symbol: "vs3fire88" },
  { name: "Diamond Strike", symbol: "vs15diamond" },
  { name: "Gold Rush", symbol: "vs25goldrush" },
  { name: "Pixie Wings", symbol: "vs50pixie" },
  { name: "Queen of Gold", symbol: "vs25queenofgold" },
  { name: "Joker's Jewels", symbol: "vs5jokerjewels" },
  { name: "Triple Tigers", symbol: "vs1ttiger" },
  { name: "Wild Spells", symbol: "vs25wildspells" },
  { name: "Dragon Kingdom", symbol: "vs25dragonkingdom" },
  { name: "Hot Safari", symbol: "vs25hotsafari" },
  { name: "Panda's Fortune 2", symbol: "vs25pandafort2" },
  { name: "The Magic Cauldron", symbol: "vs20magiccauldron" },
  { name: "Cash Bonanza", symbol: "vs4096cashbon" }
];

const generatePragmaticLibrary = (): Game[] => {
  return PRAGMATIC_MAPPING.map((game, index) => {
    const id = `pp-${index}`;
    const externalId = game.symbol;
    const categoryId = index < 12 ? 'cat-featured' : 'cat-slots';
    
    return {
      id,
      externalId,
      name: game.name,
      description: `Premium Pragmatic Play title: ${game.name}. Experience authentic studio mathematics and state-of-the-art visuals.`,
      // Real CDN Thumbnails
      image: `https://static.pragmaticplay.net/game_pic/square/200/${externalId}.png`,
      categoryId,
      provider: 'Pragmatic Play',
      rtp: 0.965,
      volatility: index % 3 === 0 ? 'HIGH' : index % 3 === 1 ? 'MEDIUM' : 'LOW',
      minBet: 100,
      maxBet: 500000,
      themeColor: index % 2 === 0 ? '#f59e0b' : '#10b981',
      // Authentic Demo URL
      iframeUrl: `https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?gameSymbol=${externalId}&lang=en&cur=USD&jurisdiction=99`
    };
  });
};

export const MOCK_GAMES: Game[] = generatePragmaticLibrary();

export const MOCK_PACKAGES: Package[] = [
  { id: 'p1', name: 'Starter Bundle', priceCents: 999, goldAmount: 10000, sweepAmount: 10, isActive: true, tag: 'Most Popular' },
  { id: 'p2', name: 'Pro Package', priceCents: 1999, goldAmount: 25000, sweepAmount: 22, isActive: true },
  { id: 'p3', name: 'Crown Elite', priceCents: 4999, goldAmount: 75000, sweepAmount: 55, isActive: true, tag: 'Best Value' },
  { id: 'p4', name: 'Royal Treasury', priceCents: 9999, goldAmount: 200000, sweepAmount: 110, isActive: true },
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
