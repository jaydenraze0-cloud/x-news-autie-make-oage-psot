import React, { useEffect, useRef } from 'react';

interface TradingViewChartProps {
  symbol: string;
  interval?: string;
  theme?: 'dark' | 'light';
  containerId?: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  interval = '60',
  theme = 'dark',
  containerId = 'tradingview_advanced_chart',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: 'Etc/UTC',
      theme: theme,
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
      container_id: containerId,
      withdateranges: true,
      hide_side_toolbar: false,
      details: true,
      hotlist: true,
      studies: [
        'STD;RSI',
        'STD;MACD',
      ],
    });

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.height = '100%';
    widgetDiv.style.width = '100%';

    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [symbol, interval, theme, containerId]);

  return (
    <div className="relative h-full w-full bg-black">
      <div
        id={containerId}
        ref={containerRef}
        className="tradingview-widget-container h-full w-full"
      />
    </div>
  );
};
