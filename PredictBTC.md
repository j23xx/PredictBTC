# Build a BTC/USDT Interactive Chart with Multiple Indicators

## Objective
Create a performant, production-ready BTC/USDT web chart with switchable indicators, real-time updates, and a Kronos predictor overlay fed by an automated JSON pipeline. Host on Vercel.

## Notes on Improvements
- Switched data source to Binance **Klines** + **WebSocket** for real-time OHLCV.
- Clarified **lightweight-charts** capability vs. “standard tools”; added feasible UI toggles.
- Added **TypeScript interfaces**, **predictions.json schema**, and **error/rate-limit** handling.
- Added **serverless** boundaries (no secrets in client), **Vercel Blob** upload/fetch flow.
- Each phase has **acceptance criteria** and **deliverables**.

## Tech Stack (Hard Requirements)
- **Frontend:** Next.js (TypeScript), `lightweight-charts` by TradingView
- **Styling/UI:** Tailwind (or minimal CSS), Headless UI for menus
- **Data (Spot):**  
  - Historical: `GET https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=1000` (interval varies)  
  - Realtime: `wss://stream.binance.com:9443/ws/btcusdt@kline_<interval>`
- **Indicators:** Client-side calc (EMA), overlay rendering via series/markers
- **Serverless:** Next.js Route Handlers / API routes on Vercel
- **Storage:** Vercel Blob (`@vercel/blob` or REST)
- **CI:** GitHub Actions (cron hourly)
- **Language:** TypeScript everywhere

## Non-Goals & Constraints
- **No proprietary TradingView “Charting Library”** (drawing tools). We’re using **lightweight-charts** only: crosshair, zoom/pan, scales, series overlays, markers, tooltips.  
- Secret keys (if any) **must not** be exposed client-side; use serverless routes.

---

## Global UX Requirements
- Responsive layout; dark theme default.
- Chart: candlesticks + volume below (shared time scale).
- Top bar:
  - Symbol: **BTC/USDT**
  - Timeframes: `1m · 5m · 15m · 1h · 4h · 1d`
  - Indicators menu with toggles:
    - **EMA Cross Scanner** (on/off)
    - **Kronos Predictor** (on/off)
- Status/toast area for: “Realtime connected”, “Rate limited”, “Blob fetch failed”.
- Disclaimer footer: “For research/education; not financial advice.”

---

## Data Contracts

### Kline Input (Binance)
```
[
  [
    openTime, "open", "high", "low", "close",
    "volume", closeTime, ... (ignored)
  ],
  ...
]
```

### Internal Candlestick Type
```ts
type UnixMs = number;
interface Candle {
  time: UnixMs;        // use openTime or closeTime (be consistent)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
```

### Predictions JSON (Produced in Phase 3)
```json
{
  "symbol": "BTCUSDT",
  "interval": "1h",
  "generated_at": "2025-08-27T00:00:00Z",
  "model": "kronos-v1",
  "horizon_hours": 48,
  "points": [
    {
      "time": 1724716800000,
      "mean": 58432.15,
      "min": 57100.00,
      "max": 59650.00
    }
  ]
}
```

TypeScript:
```ts
interface PredictionPoint {
  time: number;  // epoch ms (UTC)
  mean: number;
  min: number;
  max: number;
}
interface PredictionsFile {
  symbol: "BTCUSDT";
  interval: "1m"|"5m"|"15m"|"1h"|"4h"|"1d";
  generated_at: string; // ISO8601
  model: string;
  horizon_hours: number;
  points: PredictionPoint[];
}
```

---

## Phase 1 — Base Chart & Realtime

**Build**
- Next.js app with a dedicated `/` chart page.
- Fetch initial OHLCV via **/klines** for selected timeframe; map to `Candle[]`.
- Create candlestick series + separate volume histogram aligned at bottom.
- Start Binance **WebSocket** kline stream matching the selected timeframe; update the latest candle in place.
- UI:
  - Timeframe buttons (1m, 5m, 15m, 1h, 4h, 1d).
  - Indicators menu with toggles (wired but EMA/Kronos can be placeholders).
  - Crosshair tooltip showing OHLCV.

**Acceptance Criteria**
- Smooth realtime updates without chart flicker.
- Switching timeframes refetches history and restarts WS stream.
- Handles WS reconnect with backoff; shows a small status badge.

**Deliverables**
- `app/page.tsx` (chart), `lib/binance.ts` (REST/WS), `components/Chart.tsx`.
- Minimal tests for data mapping & timeframe switching.

---

## Phase 2 — Indicator 1: EMA Cross Scanner

**Spec**
- Inputs: `emaFast=33`, `emaSlow=55`, `trendFast=100`, `trendSlow=200`
- Compute EMAs from `close` on current timeframe’s candles.
- Render two line series for emaFast and emaSlow, in blue and red
- Render interval band using trendFast and trendSlow, shaded in light green
- Toggle on/off from Indicators menu.

**Acceptance Criteria**
- EMA lines align with candles.
- Toggling cleans up series/markers without memory leaks.

**Deliverables**
- `lib/indicators/ema.ts` (pure math).
- `components/indicators/EmaCross.tsx`.

> _Note:_ “Refer to `EMACross.md`” — port the exact logic and thresholding from that file if it differs from standard EMA.

---

## Phase 3 — Predictions Pipeline & Blob

**Spec**
- Review `https://github.com/j23xx/KronosBTC` and **replace plotting** with a writer for `predictions.json` using the schema above.
- Ensure the script outputs **epoch ms** timestamps and consistent `interval`.
- GitHub Actions:
  - Run hourly: `0 * * * *`
  - Steps: checkout → set up Python → install deps → run predictor → upload to Vercel Blob.
- **Upload to Vercel Blob**  
  - Use `@vercel/blob` or REST with a token stored as `VERCEL_BLOB_READ_WRITE_TOKEN` (repo secret).  
  - Path: `predictions/btcusdt-<interval>.json` (e.g., `predictions/btcusdt-1h.json`)

**Acceptance Criteria**
- Action passes on main; artifact available at Blob URL.
- JSON validates to the schema; at least 24–48 future points.
- Frontend endpoint `/api/predictions?interval=1h` proxies/caches Blob fetch with `Cache-Control: s-maxage=60`.

**Deliverables**
- `update_predictions.py` (modified).
- `.github/workflows/predict.yml` (cron).
- `app/api/predictions/route.ts` (proxy).
- Readme with local run instructions.

---

## Phase 4 — Indicator 2: Kronos Predictor Overlay

**Spec**
- Fetch latest `predictions.json` via `/api/predictions?interval=<tf>`.
- Render **Mean forecast** as a forward-projecting line starting at last known candle time.
- Render **Forecast range** as a semi-transparent **cloud** between `min` and `max`.
- Align predictor timeline with chart time scale; do not mutate historical candles.

**Acceptance Criteria**
- Toggle shows/hides both line and cloud cleanly.
- If JSON missing or stale, show “No fresh predictions” badge.
- Visuals stay performant with zoom/pan and frequent realtime updates.

**Deliverables**
- `components/indicators/Kronos.tsx`.
- `lib/predictions.ts` (fetch/validate/transform).

---

## Error Handling, Performance & Ops

**Rate Limits & Resilience**
- Debounce timeframe switches; cancel stale fetches.
- WS reconnect with exponential backoff (cap 30s).
- If REST 429, surface toast + retry with jitter.

**Perf**
- Keep at most ~2–5k candles per view; downsample older data if needed.
- Use `requestAnimationFrame` for UI updates; avoid re-creating series on minor changes.

**Security**
- No secrets on client. Blob writes only via GitHub Action or serverless route.
- CORS locked to site origin for `/api/*`.

**Testing**
- Unit: EMA math, JSON validation, mappers.
- E2E (Playwright): timeframe toggle, indicator toggles, stale JSON path.

**Telemetry (Optional)**
- Lightweight event logs for errors and WS reconnects.

---

## Environment Variables
- `VERCEL_BLOB_READ_WRITE_TOKEN` (repo secret & Vercel project env)
- (Optional) `PREDICT_MODEL_CONFIG` for the Python script

---

## Folder Structure (Suggested)
```
/app
  /api/predictions/route.ts
  /page.tsx
/components
  /Chart.tsx
  /indicators/EmaCross.tsx
  /indicators/Kronos.tsx
/lib
  /binance.ts
  /indicators/ema.ts
  /predictions.ts
  /types.ts
/github/workflows/predict.yml
/scripts/update_predictions.py
```

---

## Definition of Done (Overall)
- Deployed on Vercel, public URL provided.
- Real-time candles + volume working across all timeframes.
- EMA Cross Scanner toggle works and marks signals correctly.
- Hourly pipeline generates & uploads valid `predictions.json`.
- Kronos overlay shows mean line + forecast cloud; toggles on/off.
- Basic tests pass in CI; README explains setup, run, and deploy.
