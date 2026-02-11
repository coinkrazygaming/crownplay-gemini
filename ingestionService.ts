
import { Game, IngestionLog, AuditAction } from './types';
import { generateStudioGameSpec } from './aiService';

/**
 * SIMULATED PROVIDER CATALOGS
 * In a real backend, these would be fetched via secure REST/GQL endpoints.
 */
const MOCK_BGAMING_CATALOG = [
  { id: 'bg-elvis-frog', title: 'Elvis Frog in Vegas', reels: 5, rows: 3, paylines: 25, volatility: 'HIGH' },
  { id: 'bg-aztec-magic', title: 'Aztec Magic Bonanza', reels: 6, rows: 5, paylines: 'Megaways', volatility: 'VERY HIGH' }
];

const MOCK_PRAGMATIC_CATALOG = [
  { id: 'pp-sugar-rush', title: 'Sugar Rush 1000', symbols: 'Candy Set', bonus: 'Multiplier Spots', volatility: 'HIGH' },
  { id: 'pp-gates-olympus', title: 'Gates of Olympus', symbols: 'Greek Deities', bonus: 'Tumble Multiplier', volatility: 'HIGH' }
];

export class IngestionEngine {
  static async runNightlySync(currentGames: Game[], onNewGames: (games: Game[]) => void, onLog: (log: IngestionLog) => void) {
    const logs: IngestionLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      provider: 'BGAMING',
      gamesProcessed: 0,
      newGames: [],
      updatedGames: [],
      errors: [],
      status: 'SUCCESS'
    };

    try {
      // 1. Process BGaming
      for (const item of MOCK_BGAMING_CATALOG) {
        logs.gamesProcessed++;
        const exists = currentGames.find(g => g.id === item.id);
        
        // Generate Version Hash (Simplified)
        const versionHash = btoa(JSON.stringify(item));

        if (!exists || exists.versionHash !== versionHash) {
          const action = exists ? 'UPDATED' : 'NEW';
          console.log(`[SIE] Processing ${action} game: ${item.title}`);
          
          // Auto-Clone Builder: Extraction via AI
          try {
            const spec = await generateStudioGameSpec(`provider-url/${item.id}`, `Monarch Branded Version of ${item.title}. Ensure high luxury aesthetic.`);
            const normalizedGame: Game = {
              id: item.id,
              name: spec.name,
              description: spec.description,
              image: `https://picsum.photos/seed/${item.id}/400/500`,
              categoryId: 'cat-slots',
              provider: 'BGaming (Cloned)',
              rtp: spec.rtp,
              volatility: spec.volatility as any,
              minBet: 100,
              maxBet: 1000000,
              themeColor: spec.themeColor,
              versionHash: versionHash,
              mathModel: spec.mathModel,
              assetManifest: spec.assetManifest,
              featureSet: spec.featureSet,
              isStudioOriginal: true,
              lastIngestedAt: new Date().toISOString()
            };

            onNewGames([normalizedGame]);
            if (exists) logs.updatedGames.push(item.title);
            else logs.newGames.push(item.title);
          } catch (e) {
            logs.errors.push(`Failed to extract math for ${item.title}`);
          }
        }
      }

      // 2. Repeat for Pragmatic... (Truncated for brevity)
      
      onLog(logs);
    } catch (err) {
      logs.status = 'FAILED';
      logs.errors.push('CRITICAL: Pipeline Interrupted');
      onLog(logs);
    }
  }

  static async triggerManualIngest(url: string): Promise<Game> {
    const spec = await generateStudioGameSpec(url, "Manual sovereign ingestion request. Highest fidelity clone requested.");
    return {
      id: `manual-${Math.random().toString(36).substr(2, 5)}`,
      name: spec.name,
      description: spec.description,
      image: `https://picsum.photos/seed/${spec.name}/400/500`,
      categoryId: 'cat-slots',
      provider: 'External Provider',
      rtp: spec.rtp,
      volatility: spec.volatility as any,
      minBet: 100,
      maxBet: 1000000,
      themeColor: spec.themeColor,
      mathModel: spec.mathModel,
      assetManifest: spec.assetManifest,
      featureSet: spec.featureSet,
      isStudioOriginal: true,
      lastIngestedAt: new Date().toISOString()
    };
  }
}
