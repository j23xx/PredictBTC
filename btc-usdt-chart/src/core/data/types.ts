export type Candle = {
  t: number; // epoch ms
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
};

export interface MarketDataAdapter {
  fetchHistory: (symbol: string, interval: string, limit?: number) => Promise<Candle[]>;
  subscribeRealtime: (
    symbol: string,
    interval: string,
    onMsg: (candle: Candle, isFinal: boolean) => void
  ) => () => void; // returns unsubscribe
}