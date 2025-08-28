/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MarketDataAdapter, Candle } from './types';

export class BinanceDataAdapter implements MarketDataAdapter {
  private baseUrl = 'https://api.binance.com/api/v3';
  private wsUrl = 'wss://stream.binance.com:9443/ws';
  private reconnectTimeout: NodeJS.Timeout | number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectBaseDelay = 1000;
  private ws: WebSocket | null = null;

  async fetchHistory(
    symbol: string,
    interval: string,
    limit: number = 1000
  ): Promise<Candle[]> {
    try {
      const cleanSymbol = symbol.toUpperCase().trim();
      console.log('🔄 Fetching historical data:', { cleanSymbol, interval, limit });
      
      const url = `${this.baseUrl}/klines?symbol=${cleanSymbol}&interval=${interval}&limit=${limit}`;
      console.log('📡 Request URL:', url);
      
      const response = await fetch(url, {
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Binance API error:', response.status, response.statusText, errorText);
        throw new Error(`Binance API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error('❌ Invalid response format:', data);
        return [];
      }
      
      console.log('📊 Received data points:', data.length);
      
      if (data.length === 0) {
        console.warn('⚠️ No data received from Binance');
        return [];
      }
      
      const candles = data.map((item) => ({
        t: item[0],           // open time (milliseconds)
        o: parseFloat(item[1]), // open price
        h: parseFloat(item[2]), // high price
        l: parseFloat(item[3]), // low price
        c: parseFloat(item[4]), // close price
        v: parseFloat(item[5]), // volume
      }));
      
      console.log('✅ Processed candles:', candles.length);
      return candles;
    } catch (error) {
      console.error('❌ Failed to fetch historical data:', error);
      throw error;
    }
  }

  subscribeRealtime(
    symbol: string,
    interval: string,
    onMsg: (candle: Candle, isFinal: boolean) => void
  ): () => void {
    const wsSymbol = symbol.toLowerCase();
    const wsInterval = interval;
    const streamName = `${wsSymbol}@kline_${wsInterval}`;
    
    console.log('🔗 Subscribing to real-time data:', { symbol, interval, streamName });
    this.connectWebSocket(streamName, onMsg);
    
    return () => {
      console.log('🔌 Unsubscribing from real-time data');
      this.disconnectWebSocket();
    };
  }

  private connectWebSocket(streamName: string, onMsg: (candle: Candle, isFinal: boolean) => void) {
    this.disconnectWebSocket();
    
    const wsUrl = `${this.wsUrl}/${streamName}`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected:', streamName);
      this.reconnectAttempts = 0;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };
    
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const kline = data.k;
        
        const candle: Candle = {
          t: kline.t,
          o: parseFloat(kline.o),
          h: parseFloat(kline.h),
          l: parseFloat(kline.l),
          c: parseFloat(kline.c),
          v: parseFloat(kline.v),
        };
        
        onMsg(candle, kline.x);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.scheduleReconnect(streamName, onMsg);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  private scheduleReconnect(streamName: string, onMsg: (candle: Candle, isFinal: boolean) => void) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    const delay = Math.min(
      this.reconnectBaseDelay * Math.pow(2, this.reconnectAttempts),
      30000
    );
    
    this.reconnectAttempts++;
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connectWebSocket(streamName, onMsg);
    }, delay);
  }

  private disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}