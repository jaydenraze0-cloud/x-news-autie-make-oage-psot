import React, { useEffect, useRef } from 'react';

export const TradingViewTickerTape: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'OANDA:XAUUSD', title: 'GOLD (XAU/USD)' },
        { proName: 'TVC:USOIL', title: 'WTI CRUDE OIL' },
        { proName: 'TVC:UKOIL', title: 'BRENT CRUDE' },
        { proName: 'BINANCE:BTCUSDT', title: 'BITCOIN' },
        { proName: 'BINANCE:ETHUSDT', title: 'ETHEREUM' },
        { proName: 'BINANCE:SOLUSDT', title: 'SOLANA' },
        { proName: 'CAPITALCOM:DXY', title: 'DOLLAR INDEX' },
        { proName: 'FOREXCOM:SPXUSD', title: 'S&P 500' },
        { proName: 'FOREXCOM:NSXUSD', title: 'NASDAQ' },
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'en',
    });

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container__widget';
    containerRef.current.appendChild(widgetContainer);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="w-full bg-black/90 border-b border-white/10 overflow-hidden min-h-[46px] select-none">
      <div ref={containerRef} className="tradingview-widget-container" />
    </div>
  );
};
