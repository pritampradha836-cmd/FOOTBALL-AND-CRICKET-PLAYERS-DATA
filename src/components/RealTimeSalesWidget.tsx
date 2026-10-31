import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Layers, 
  Clock, 
  Sparkles,
  Zap,
  BarChart3
} from 'lucide-react';
import { SalesRecord } from '../types/tableau';

interface RealTimeSalesWidgetProps {
  salesData: SalesRecord[];
  isStreaming: boolean;
  latestTransaction: SalesRecord | null;
}

export const RealTimeSalesWidget: React.FC<RealTimeSalesWidgetProps> = ({
  salesData,
  isStreaming,
  latestTransaction,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'sales' | 'profit' | 'margin' | 'volume'>('sales');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    sales: number;
    profit: number;
    margin: number;
    volume: number;
    x: number;
    y: number;
  } | null>(null);
  const [showMovingAverage, setShowMovingAverage] = useState(true);

  // Group by date (aggregate to daily or monthly points)
  const timeSeries = useMemo(() => {
    const map = new Map<string, { sales: number; profit: number; volume: number; count: number }>();
    
    // Sort transactions
    const sorted = [...salesData].sort((a, b) => a.timestamp - b.timestamp);
    
    // Use last 45 data points for high density real-time view
    sorted.forEach((r) => {
      const key = r.date;
      const cur = map.get(key) || { sales: 0, profit: 0, volume: 0, count: 0 };
      cur.sales += r.sales;
      cur.profit += r.profit;
      cur.volume += r.quantity;
      cur.count += 1;
      map.set(key, cur);
    });

    const entries = Array.from(map.entries())
      .map(([date, val]) => ({
        date,
        sales: val.sales,
        profit: val.profit,
        margin: val.sales > 0 ? (val.profit / val.sales) * 100 : 0,
        volume: val.volume,
        count: val.count,
      }))
      .slice(-40); // Last 40 timeline periods

    // Calculate moving average
    const maWindow = 5;
    return entries.map((item, idx) => {
      const start = Math.max(0, idx - maWindow + 1);
      const slice = entries.slice(start, idx + 1);
      const maSales = slice.reduce((acc, s) => acc + s.sales, 0) / slice.length;
      const maProfit = slice.reduce((acc, s) => acc + s.profit, 0) / slice.length;
      return {
        ...item,
        maSales: Math.round(maSales),
        maProfit: Math.round(maProfit),
      };
    });
  }, [salesData]);

  // Overall KPI stats
  const totalSales = useMemo(() => salesData.reduce((acc, r) => acc + r.sales, 0), [salesData]);
  const totalProfit = useMemo(() => salesData.reduce((acc, r) => acc + r.profit, 0), [salesData]);
  const avgMargin = totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : '38.2';
  const recentGrowth = '+14.6%';

  // SVG Chart Dimensions
  const svgWidth = 840;
  const svgHeight = 280;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const metricValues = timeSeries.map((d) => {
    if (selectedMetric === 'sales') return d.sales;
    if (selectedMetric === 'profit') return d.profit;
    if (selectedMetric === 'margin') return d.margin;
    return d.volume;
  });

  const maxVal = Math.max(...metricValues, 100) * 1.15;
  const minVal = Math.min(0, Math.min(...metricValues));

  const getX = (idx: number) => {
    if (timeSeries.length <= 1) return padding.left;
    return padding.left + (idx / (timeSeries.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return padding.top + chartHeight - ((val - minVal) / range) * chartHeight;
  };

  // Build SVG path strings
  const points = timeSeries.map((d, i) => {
    const val = selectedMetric === 'sales' ? d.sales : selectedMetric === 'profit' ? d.profit : selectedMetric === 'margin' ? d.margin : d.volume;
    return { x: getX(i), y: getY(val), data: d };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`
    : '';

  // Moving average path
  const maPoints = timeSeries.map((d, i) => {
    const val = selectedMetric === 'sales' ? d.maSales : d.maProfit;
    return { x: getX(i), y: getY(val) };
  });

  const maPathD = maPoints.length > 0
    ? `M ${maPoints[0].x} ${maPoints[0].y} ` + maPoints.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ')
    : '';

  return (
    <div className="bg-[#1a2634] border border-[#2d3e52] rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 bg-[#14202d] border-b border-[#2b3c4f] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">Real-Time Sales Velocity & Trends</h2>
              {isStreaming && (
                <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 rounded-full animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>LIVE TICKS</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Streaming multi-region transactional velocity with moving average convergence & volume analysis
            </p>
          </div>
        </div>

        {/* Metric Switcher Pills */}
        <div className="flex items-center space-x-1 bg-[#101924] p-1 rounded-lg border border-[#2a3c50] text-xs">
          <button
            onClick={() => setSelectedMetric('sales')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              selectedMetric === 'sales'
                ? 'bg-[#1f77b4] text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sales ($)
          </button>
          <button
            onClick={() => setSelectedMetric('profit')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              selectedMetric === 'profit'
                ? 'bg-[#2ca02c] text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profit ($)
          </button>
          <button
            onClick={() => setSelectedMetric('margin')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              selectedMetric === 'margin'
                ? 'bg-[#ff7f0e] text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Margin (%)
          </button>
          <button
            onClick={() => setSelectedMetric('volume')}
            className={`px-3 py-1 rounded font-medium transition-all ${
              selectedMetric === 'volume'
                ? 'bg-[#9467bd] text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Units Sold
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#172433] border-b border-[#2b3c4f]">
        <div className="bg-[#121c29] p-3 rounded-lg border border-[#28384a]">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Total Sales Volume</div>
          <div className="text-xl font-bold text-white mt-1 font-mono">
            ${totalSales.toLocaleString()}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{recentGrowth} vs prior baseline</span>
          </div>
        </div>

        <div className="bg-[#121c29] p-3 rounded-lg border border-[#28384a]">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Net Operating Profit</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
            ${totalProfit.toLocaleString()}
          </div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-300 mt-1">
            <span>Margin: </span>
            <span className="font-semibold text-white">{avgMargin}%</span>
          </div>
        </div>

        <div className="bg-[#121c29] p-3 rounded-lg border border-[#28384a]">
          <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Deals Processed</div>
          <div className="text-xl font-bold text-cyan-300 mt-1 font-mono">
            {salesData.length.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across 4 Global Territories
          </div>
        </div>

        <div className="bg-[#121c29] p-3 rounded-lg border border-[#28384a]">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            <span>Chart Controls</span>
            <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-blue-300">
              <input
                type="checkbox"
                checked={showMovingAverage}
                onChange={(e) => setShowMovingAverage(e.target.checked)}
                className="rounded accent-blue-500"
              />
              <span>5-Period MA</span>
            </label>
          </div>
          <div className="mt-2 text-xs text-slate-300 flex items-center space-x-2">
            <span className="inline-block w-3 h-0.5 bg-[#4e79a7]"></span>
            <span>Actual</span>
            <span className="inline-block w-3 h-0.5 border-t border-dashed border-[#f28e2b]"></span>
            <span>Moving Avg</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative p-4 overflow-x-auto flex-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[700px] select-none"
        >
          <defs>
            {/* Tableau Area Gradient */}
            <linearGradient id="tableauAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1f77b4" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#1f77b4" stopOpacity="0.02" />
            </linearGradient>

            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4e79a7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#4e79a7" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + chartHeight * (1 - pct);
            const val = Math.round(minVal + (maxVal - minVal) * pct);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#283a4e"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#8295a8"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {selectedMetric === 'sales' || selectedMetric === 'profit'
                    ? `$${(val / 1000).toFixed(0)}k`
                    : selectedMetric === 'margin'
                    ? `${val}%`
                    : val}
                </text>
              </g>
            );
          })}

          {/* Subtle Volume Bars in background */}
          {timeSeries.map((d, i) => {
            const barW = Math.max(3, chartWidth / timeSeries.length - 4);
            const barH = (d.count / Math.max(...timeSeries.map((t) => t.count))) * (chartHeight * 0.4);
            const x = getX(i) - barW / 2;
            const y = padding.top + chartHeight - barH;
            return (
              <rect
                key={`bar-${i}`}
                x={x}
                y={y}
                width={barW}
                height={barH}
                fill="url(#barGrad)"
                rx="1"
              />
            );
          })}

          {/* Shaded Area */}
          <path d={areaD} fill="url(#tableauAreaGrad)" />

          {/* Moving Average Line */}
          {showMovingAverage && (
            <path
              d={maPathD}
              fill="none"
              stroke="#f28e2b"
              strokeWidth="2"
              strokeDasharray="5 3"
              opacity="0.85"
            />
          )}

          {/* Primary Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#1f77b4"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Points */}
          {points.map((pt, i) => {
            const isHovered = hoveredPoint?.date === pt.data.date;
            return (
              <g key={`pt-${i}`}>
                {/* Invisible hover trigger */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="12"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      date: pt.data.date,
                      sales: pt.data.sales,
                      profit: pt.data.profit,
                      margin: Math.round(pt.data.margin),
                      volume: pt.data.volume,
                      x: pt.x,
                      y: pt.y,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Visible dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : i === points.length - 1 ? 5 : 3}
                  fill={isHovered ? '#38bdf8' : i === points.length - 1 ? '#10b981' : '#1f77b4'}
                  stroke="#ffffff"
                  strokeWidth={isHovered ? 2.5 : 1.5}
                />
              </g>
            );
          })}

          {/* X-axis date labels */}
          {timeSeries.filter((_, idx) => idx % Math.ceil(timeSeries.length / 8) === 0).map((d, i) => {
            const idx = timeSeries.findIndex((t) => t.date === d.date);
            return (
              <text
                key={`xlabel-${i}`}
                x={getX(idx)}
                y={svgHeight - 12}
                textAnchor="middle"
                fill="#8295a8"
                fontSize="10"
                fontFamily="sans-serif"
              >
                {d.date.slice(5)}
              </text>
            );
          })}
        </svg>

        {/* Tableau Hover Tooltip Card */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-[#101824] border border-[#3b5166] text-white p-3 rounded-lg shadow-2xl text-xs w-52"
            style={{
              left: Math.min(hoveredPoint.x + 10, svgWidth - 230),
              top: Math.max(hoveredPoint.y - 80, 10),
            }}
          >
            <div className="font-semibold text-blue-300 border-b border-slate-700 pb-1 mb-1.5 flex items-center justify-between">
              <span>Date: {hoveredPoint.date}</span>
              <span className="text-[10px] text-slate-400">Actuals</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Sales:</span>
                <span className="font-mono font-bold text-white">${hoveredPoint.sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Profit:</span>
                <span className="font-mono font-semibold text-emerald-400">${hoveredPoint.profit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Margin:</span>
                <span className="font-mono text-amber-300">{hoveredPoint.margin}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Units:</span>
                <span className="font-mono text-purple-300">{hoveredPoint.volume}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Live Transaction Feed Ticker (Tableau Streaming Element) */}
      <div className="bg-[#121c28] border-t border-[#263749] px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2 truncate">
          <span className="flex items-center space-x-1 text-slate-400 text-[11px] font-semibold uppercase tracking-wider flex-shrink-0">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>Latest Tick:</span>
          </span>

          {latestTransaction ? (
            <div className="flex items-center space-x-3 text-slate-200 truncate animate-fadeIn">
              <span className="font-mono text-cyan-300 font-semibold">{latestTransaction.id}</span>
              <span className="text-slate-300 font-medium truncate">{latestTransaction.customer}</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-900/40 text-blue-300 text-[10px] border border-blue-700/40">
                {latestTransaction.region} • {latestTransaction.subRegion}
              </span>
              <span className="text-emerald-400 font-mono font-bold">
                +${latestTransaction.sales.toLocaleString()}
              </span>
              <span className="text-slate-400 text-[11px]">
                ({latestTransaction.category})
              </span>
            </div>
          ) : (
            <span className="text-slate-500 italic">Waiting for real-time transactions...</span>
          )}
        </div>

        <div className="text-[11px] text-slate-400 flex items-center space-x-1.5 flex-shrink-0">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Real-time Stream Engine</span>
        </div>
      </div>
    </div>
  );
};
