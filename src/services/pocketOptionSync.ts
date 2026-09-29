// ============================================================================
// POCKET OPTION & QUOTEX SYNC RE-EXPORT (FOR BACKWARD COMPATIBILITY)
// ============================================================================

import { brokerSyncEngine, BrokerLiveTick, BrokerId, PriceDirection, getBrokerDecimals } from './brokerSyncEngine';
import { Candle } from '../types/trading';

export type { PriceDirection };
export type PocketOptionLiveTick = BrokerLiveTick;
export type TickListener = (tick: BrokerLiveTick) => void;

class PocketOptionSyncProxy {
  public static getPairDecimals(symbol: string): number {
    return getBrokerDecimals(symbol);
  }

  public syncPocketOptionPrice(pair: string): BrokerLiveTick {
    return brokerSyncEngine.syncRealTimePrice('pocket', pair);
  }

  public setSelectedPair(pair: string) {
    brokerSyncEngine.setPair(pair);
  }

  public getCurrentPrice(pair: string): number | null {
    return brokerSyncEngine.getCurrentPrice(pair);
  }

  public subscribe(listener: TickListener): () => void {
    return brokerSyncEngine.subscribe(listener);
  }

  public syncCandleWithPrice(candles: Candle[], pair: string, timeframeSeconds: number): Candle[] {
    return brokerSyncEngine.syncCandleWithLivePrice(candles, pair, timeframeSeconds);
  }
}

export const pocketOptionSync = new PocketOptionSyncProxy();
