# BTC/USDT Interactive Chart — Build Brief (Optimized)

## Goal
Ship a production-ready, **modular** web app that plots **BTC/USDT** candlesticks, volume, and toggleable indicators using **TradingView Lightweight Charts**, with **real-time data** and a clean path to add more indicators later. Host on **Vercel**.

> Explicitly design the build to be **modular** to support future phases (easy inclusion of new indicators).

---

## Tech Stack & Key Choices
- **Frontend**: Next.js (App Router) + TypeScript
- **Charting**: TradingView **Lightweight Charts**
- **Data**:  
  - **History** — Binance REST `klines` (seed candles)  
  - **Realtime** — Binance WebSocket `@kline_<interval>` stream  
- **State**: Zustand (or Context) for app state (symbol, interval, indicators)
- **Build/Deploy**: Vercel (Preview + Production)
- **Lint/Test**: ESLint, Prettier, Vitest (unit), Playwright (smoke)

> Use a **Data Adapter** layer so we can swap Binance later with minimal changes.

Helpful refs:
- TradingView Lightweight Charts: https://tradingview.github.io/lightweight-charts/
- Binance REST klines: `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval={interval}&limit=1000`
- Binance WebSocket: `wss://stream.binance.com:9443/ws/btcusdt@kline_{interval}`

---

## Scope (P0)
- Candlestick chart + volume sub-chart
- Timeframe controls: `1m · 5m · 15m · 1h · 4h · 1d`
- OHLC tooltip & crosshair; zoom/pan; fit to content
- Indicator toggle framework (on/off per indicator)
- **Indicator #1**: EMA Cross Scanner (Phase 2)
- Deployed on Vercel with a live URL

---

## Phases

### Phase 1 — Core Chart & Realtime
**Requirements**
1. **Historical load**: Fetch the last N candles for the selected interval via Binance REST.  
   - Endpoint: `/api/v3/klines?symbol=BTCUSDT&interval={interval}&limit=1000`
2. **Realtime updates**: Subscribe to WebSocket `wss://stream.binance.com:9443/ws/btcusdt@kline_{interval}`; upsert the live candle and finalize on close.
3. **Chart**:  
   - Main: candlesticks  
   - Sub: volume (histogram) aligned to candles  
4. **Controls**: timeframe buttons; log/linear toggle; fit button; screenshot export.
5. **Indicator framework**: Pluggable registry + UI with switches (no indicators required yet).

**Acceptance Criteria**
- Switching timeframe re-seeds history and re-subscribes WS cleanly (no leaks).
- Realtime candle updates within <250ms of incoming WS message.
- Volume colors reflect candle direction.
- No UI jank under continuous websocket updates for 24h run.

---

### Phase 2 — Indicator 1: EMA Cross Scanner
**Spec**
- **Inputs**: `emaFast` (default 33), `emaSlow` (default 55), `trendFast` (default 100), `trendSlow` (default 200), `source` (close), `timeframe` (uses chart timeframe).
- **Outputs**:  
  - Blue line (emaFast)
  - Red line (emaSlow)  
  - Interval band, shaded in light green, opacity 50% (trendFast - trendSlow)  
  - **Signals**:  
    - **Bullish Cross**: Fast crosses above Slow → draw up arrow marker below bar; optional green highlight  
    - **Bearish Cross**: Fast crosses below Slow → draw down arrow marker above bar; optional red highlight
- **UI**: Toggle on/off; configurable lengths; show/hide signal markers.

**Acceptance Criteria**
- Outputs displayed correctly
- Toggling indicator never reflows chart or causes flicker.
- Signals appear only on closed bars (no repainting intrabar).

---

## Architecture

### 1) Data Adapter (decouple provider)
```ts
// core/data/types.ts
export type Candle = { t: number; o: number; h: number; l: number; c: number; v: number }; // t = epoch ms

export interface MarketDataAdapter {
  fetchHistory: (symbol: string, interval: string, limit?: number) => Promise<Candle[]>;
  subscribeRealtime: (
    symbol: string,
    interval: string,
    onMsg: (candle: Candle, isFinal: boolean) => void
  ) => () => void; // returns unsubscribe
}
```

### 2) Indicator Interface
```ts
// core/indicators/types.ts
export type IndicatorRender = {
  overlays?: Array<{ id: string; seriesType: 'line' | 'histogram'; data: Array<{ t:number; value:number }> }>;
  markers?: Array<{ t:number; position:'aboveBar'|'belowBar'; shape:'arrowUp'|'arrowDown'; text?:string }>;
};

export interface Indicator<TConfig = unknown> {
  id: string;
  label: string;
  defaults: TConfig;
  compute: (candles: Candle[], config: TConfig) => IndicatorRender;
}
```

### 3) EMA Cross Implementation (sketch)
```ts
// core/indicators/emaCross.ts
type EMAConfig = { fastLength: number; slowLength: number };
export const EmaCross: Indicator<EMAConfig> = {
  id: 'emaCross',
  label: 'EMA Cross',
  defaults: { fastLength: 12, slowLength: 26 },
  compute: (candles, cfg) => {
    const src = candles.map(c => c.c);
    const ema = (len:number) => {
      const k = 2/(len+1);
      let out:number[] = [];
      let prev = src[0];
      out[0] = prev;
      for (let i=1;i<src.length;i++){ prev = src[i]*k + prev*(1-k); out[i]=prev; }
      return out;
    };
    const fast = ema(cfg.fastLength);
    const slow = ema(cfg.slowLength);

    const overlays = [
      { id:'emaFast', seriesType:'line', data: candles.map((c,i)=>({ t:c.t, value:fast[i] })) },
      { id:'emaSlow', seriesType:'line', data: candles.map((c,i)=>({ t:c.t, value:slow[i] })) },
    ];

    const markers = [];
    for (let i=1;i<candles.length;i++){
      const prevDiff = fast[i-1]-slow[i-1];
      const currDiff = fast[i]-slow[i];
      if (prevDiff<=0 && currDiff>0) markers.push({ t:candles[i].t, position:'belowBar', shape:'arrowUp', text:'Bull Cross' });
      if (prevDiff>=0 && currDiff<0) markers.push({ t:candles[i].t, position:'aboveBar', shape:'arrowDown', text:'Bear Cross' });
    }
    return { overlays, markers };
  }
};
```

---

## UX Details
- **Layout**: Chart area (70vh), timeframe bar top, indicator panel right (collapsible).
- **Tooltip**: Show `Date, O, H, L, C, Vol`, plus active indicator values.
- **Empty/Error states**: network loss banner; auto-retry with backoff.
- **Performance**: keep series points ≤ 5k; downsample older data if needed.

---

## Repository Structure
```
/src
  /app        # Next.js routes
  /components # Chart, Controls, IndicatorPanel
  /core
    /data     # adapters/binance.ts, types.ts
    /indicators # registry.ts, emaCross.ts, types.ts
  /state      # store.ts (symbol, interval, indicators)
  /utils      # time, transforms (binance->Candle)
```

---

## Tasks & Deliverables

### Phase 1
- [ ] Bootstrap Next.js + TS; install lightweight-charts
- [ ] Implement **BinanceDataAdapter** (REST seed + WS realtime)
- [ ] Candles + volume series; timeframe switcher; crosshair; zoom/pan; fit
- [ ] Indicator framework (registry + UI toggles, no indicators yet)
- [ ] Vercel deploy (Preview + Prod); README with setup steps

### Phase 2
- [ ] Implement **EMA Cross** indicator per spec
- [ ] Config UI (fast/slow lengths) + on/off switch
- [ ] Unit tests for EMA math (golden cases)
- [ ] Playwright smoke: chart renders, toggle indicator, switch timeframe
- [ ] Update README: usage, config, limitations

**Definition of Done**
- Single-click Vercel deploy succeeds; app loads without errors
- 60 FPS pan/zoom on laptop; memory stable after 2h realtime
- No console errors; WebSocket reconnects on drop
- EMA Cross signals verified vs reference

---

## Config & Environment
- No secrets needed for public Binance endpoints.
- Optional `NEXT_PUBLIC_WS_URL` to support a proxy if needed.
- Timezone: treat all timestamps as **UTC**; format per user locale in tooltip.

---

## Guardrails & Edge Cases
- REST rate limits: throttle seed fetches; cache last history per interval
- WS reconnect strategy: exponential backoff (max 30s), re-seed last 200 candles on reconnect
- Interval changes: cancel previous WS, seed new history, subscribe new WS
- Data gaps: interpolate missing candles with previous close + zero volume (visually distinct)

---

## “Future-Proofing” Hooks (P1+)
- Indicator slots: RSI, MACD, VWAP, Bollinger Bands
- Multi-symbol support; settings persistence (localStorage)
- Alerts: client-side for EMA crosses (browser notifications)
- Snapshot export: PNG/CSV of visible range

---

## Handover Checklist
- README with: local dev, scripts, env vars, deploy steps, troubleshooting
- Tests passing in CI; Prettier/ESLint clean
- Lighthouse report ≥ 90 performance
- Live demo URL + commit hash

---

## Success Criteria (Exec)
- **Usability**: clear, snappy, clean
- **Modularity**: drop-in indicators via registry pattern
- **Reliability**: resilient to network hiccups, no repainting issues
- **Speed to iterate**: new indicators in hours, not days

---

