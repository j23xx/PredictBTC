const testBinanceAPI = async () => {
  const baseUrl = 'https://api.binance.com/api/v3';
  const symbol = 'BTCUSDT';
  const interval = '1h';
  const limit = 10;
  
  const url = `${baseUrl}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
  console.log('Testing URL:', url);
  
  try {
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Data length:', data.length);
    console.log('First candle:', data[0]);
    
    const candles = data.map(item => ({
      t: item[0],
      o: parseFloat(item[1]),
      h: parseFloat(item[2]),
      l: parseFloat(item[3]),
      c: parseFloat(item[4]),
      v: parseFloat(item[5])
    }));
    
    console.log('Processed candles:', candles.length);
    console.log('First processed:', candles[0]);
    
  } catch (error) {
    console.error('Fetch error:', error);
  }
};

testBinanceAPI();