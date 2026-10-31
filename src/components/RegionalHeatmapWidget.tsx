import React, { useState, useMemo } from 'react';
import { 
  Globe, 
  Layers, 
  TrendingUp, 
  Award, 
  Filter, 
  Sparkles,
  Maximize2,
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SalesRecord, RegionalMetric } from '../types/tableau';
import { computeRegionalHeatmapMatrix, computeRegionalMetrics } from '../data/mockSalesData';

interface RegionalHeatmapWidgetProps {
  salesData: SalesRecord[];
  onSelectRegion?: (region: string) => void;
}

export const RegionalHeatmapWidget: React.FC<RegionalHeatmapWidgetProps> = ({
  salesData,
  onSelectRegion,
}) => {
  const [matrixRow, setMatrixRow] = useState<'region' | 'subRegion' | 'segment'>('region');
  const [matrixCol, setMatrixCol] = useState<'category' | 'orderPriority' | 'segment'>('category');
  const [matrixMetric, setMatrixMetric] = useState<'sales' | 'profit' | 'margin' | 'attainment'>('sales');
  const [colorPalette, setColorPalette] = useState<'tableauBlue' | 'orangeBlue' | 'redGreen'>('orangeBlue');
  const [selectedCell, setSelectedCell] = useState<{ row: string; col: string; value: number } | null>(null);

  // Compute matrix
  const { rowKeys, colKeys, matrix, minVal, maxVal } = useMemo(() => {
    return computeRegionalHeatmapMatrix(salesData, matrixRow, matrixCol, matrixMetric);
  }, [salesData, matrixRow, matrixCol, matrixMetric]);

  // Compute regional metrics
  const regionalMetrics = useMemo(() => computeRegionalMetrics(salesData), [salesData]);

  // Interpolate color based on normalized value 0..1
  const getCellColor = (normalized: number) => {
    if (colorPalette === 'orangeBlue') {
      // Diverging Orange-to-Blue (classic Tableau diverging)
      if (normalized < 0.5) {
        // Orange to Light Slate
        const ratio = normalized * 2;
        const r = Math.round(242 - ratio * (242 - 140));
        const g = Math.round(142 - ratio * (142 - 150));
        const b = Math.round(43 + ratio * (170 - 43));
        return `rgb(${r}, ${g}, ${b})`;
      } else {
        // Light Slate to Deep Tableau Blue
        const ratio = (normalized - 0.5) * 2;
        const r = Math.round(140 - ratio * (140 - 31));
        const g = Math.round(150 - ratio * (150 - 119));
        const b = Math.round(170 + ratio * (180 - 170));
        return `rgb(${r}, ${g}, ${b})`;
      }
    } else if (colorPalette === 'redGreen') {
      // Red-Yellow-Green attainment
      if (normalized < 0.5) {
        const ratio = normalized * 2;
        return `rgb(225, ${Math.round(87 + ratio * 100)}, 89)`;
      } else {
        const ratio = (normalized - 0.5) * 2;
        return `rgb(${Math.round(225 - ratio * 136)}, ${Math.round(187 - ratio * 26)}, ${Math.round(89 - ratio * 10)})`;
      }
    } else {
      // Sequential Tableau Blue
      const r = Math.round(31 + (1 - normalized) * 120);
      const g = Math.round(119 + (1 - normalized) * 80);
      const b = Math.round(180 + (1 - normalized) * 40);
      return `rgb(${r}, ${g}, ${b})`;
    }
  };

  const getCellTextColor = (normalized: number) => {
    return normalized > 0.65 || normalized < 0.35 ? '#ffffff' : '#0f172a';
  };

  return (
    <div className="bg-[#1a2634] border border-[#2d3e52] rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Widget Header */}
      <div className="p-4 bg-[#14202d] border-b border-[#2b3c4f] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-orange-600/20 text-orange-400 rounded-lg border border-orange-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Regional Performance Heatmap</h2>
            <p className="text-xs text-slate-400">
              Interactive geographic & categorical density matrix with Tableau diverging color gradients
            </p>
          </div>
        </div>

        {/* Matrix Configuration Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Row Dimension */}
          <div className="flex items-center space-x-1.5 bg-[#101924] px-2 py-1 rounded border border-[#2a3c50]">
            <span className="text-slate-400">Rows:</span>
            <select
              value={matrixRow}
              onChange={(e) => setMatrixRow(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="region" className="bg-[#1b2b3d]">Region (4 Territories)</option>
              <option value="subRegion" className="bg-[#1b2b3d]">Sub-Region (Territory Details)</option>
              <option value="segment" className="bg-[#1b2b3d]">Customer Segment</option>
            </select>
          </div>

          {/* Col Dimension */}
          <div className="flex items-center space-x-1.5 bg-[#101924] px-2 py-1 rounded border border-[#2a3c50]">
            <span className="text-slate-400">Columns:</span>
            <select
              value={matrixCol}
              onChange={(e) => setMatrixCol(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="category" className="bg-[#1b2b3d]">Product Category</option>
              <option value="segment" className="bg-[#1b2b3d]">Customer Segment</option>
              <option value="orderPriority" className="bg-[#1b2b3d]">Order Priority</option>
            </select>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center space-x-1.5 bg-[#101924] px-2 py-1 rounded border border-[#2a3c50]">
            <span className="text-slate-400">Value:</span>
            <select
              value={matrixMetric}
              onChange={(e) => setMatrixMetric(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="sales" className="bg-[#1b2b3d]">Sales Volume ($)</option>
              <option value="profit" className="bg-[#1b2b3d]">Operating Profit ($)</option>
              <option value="margin" className="bg-[#1b2b3d]">Profit Margin (%)</option>
              <option value="attainment" className="bg-[#1b2b3d]">Quota Attainment (%)</option>
            </select>
          </div>

          {/* Color Palette Toggle */}
          <div className="flex items-center space-x-1.5 bg-[#101924] px-2 py-1 rounded border border-[#2a3c50]">
            <span className="text-slate-400">Palette:</span>
            <select
              value={colorPalette}
              onChange={(e) => setColorPalette(e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="orangeBlue" className="bg-[#1b2b3d]">Tableau Orange-Blue</option>
              <option value="redGreen" className="bg-[#1b2b3d]">Red-Yellow-Green</option>
              <option value="tableauBlue" className="bg-[#1b2b3d]">Sequential Blue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Table Canvas */}
      <div className="p-4 overflow-x-auto">
        <div className="min-w-[650px]">
          <table className="w-full border-collapse select-none">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-bold text-slate-400 uppercase tracking-wider bg-[#14202d] border border-[#2d3e52] w-48">
                  {matrixRow.toUpperCase()}
                </th>
                {colKeys.map((col) => (
                  <th
                    key={col}
                    className="p-2 text-center text-xs font-bold text-slate-300 bg-[#14202d] border border-[#2d3e52]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rowKeys.map((row) => (
                <tr key={row} className="hover:opacity-95">
                  <td className="p-2 text-xs font-semibold text-slate-200 bg-[#172433] border border-[#2d3e52] truncate">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      <span>{row}</span>
                    </div>
                  </td>
                  {colKeys.map((col) => {
                    const cell = matrix.find((m) => m.row === row && m.col === col);
                    if (!cell) return <td key={col} className="border border-[#2d3e52] bg-slate-900"></td>;

                    const bgColor = getCellColor(cell.normalized);
                    const textColor = getCellTextColor(cell.normalized);
                    const isSelected = selectedCell?.row === row && selectedCell?.col === col;

                    return (
                      <td
                        key={col}
                        onClick={() => setSelectedCell({ row, col, value: cell.value })}
                        style={{ backgroundColor: bgColor, color: textColor }}
                        className={`p-3 text-center border border-[#2d3e52]/70 cursor-pointer transition-transform duration-100 hover:scale-[1.03] hover:z-10 shadow-xs relative ${
                          isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 font-extrabold' : ''
                        }`}
                      >
                        <div className="font-mono text-sm font-bold tracking-tight">
                          {matrixMetric === 'sales' || matrixMetric === 'profit'
                            ? `$${(cell.value / 1000).toFixed(0)}k`
                            : `${cell.value}%`}
                        </div>
                        <div className="text-[10px] opacity-85 mt-0.5 font-sans">
                          {cell.deals} deals • {cell.margin}% mgn
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Color Scale Legend */}
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-[#121c28] px-3 py-2 rounded-lg border border-[#263749]">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold text-slate-300">Tableau Diverging Scale:</span>
              <span className="font-mono text-xs text-slate-400">
                Min: {matrixMetric === 'sales' || matrixMetric === 'profit' ? `$${(minVal / 1000).toFixed(0)}k` : `${minVal}%`}
              </span>
              <div 
                className="w-48 h-3 rounded-full border border-slate-600 shadow-inner"
                style={{
                  background:
                    colorPalette === 'orangeBlue'
                      ? 'linear-gradient(to right, rgb(242, 142, 43), rgb(140, 150, 170), rgb(31, 119, 180))'
                      : colorPalette === 'redGreen'
                      ? 'linear-gradient(to right, #e15759, #edc948, #59a14f)'
                      : 'linear-gradient(to right, #9ecae1, #3182bd, #08519c)',
                }}
              />
              <span className="font-mono text-xs text-slate-400">
                Max: {matrixMetric === 'sales' || matrixMetric === 'profit' ? `$${(maxVal / 1000).toFixed(0)}k` : `${maxVal}%`}
              </span>
            </div>

            {selectedCell && (
              <div className="flex items-center space-x-2 text-cyan-300 font-medium animate-fadeIn">
                <span>Selected:</span>
                <span className="bg-[#1f3347] px-2 py-0.5 rounded text-white font-mono text-xs">
                  {selectedCell.row} × {selectedCell.col} (
                  {matrixMetric === 'sales' || matrixMetric === 'profit'
                    ? `$${selectedCell.value.toLocaleString()}`
                    : `${selectedCell.value}%`}
                  )
                </span>
                <button
                  onClick={() => setSelectedCell(null)}
                  className="text-slate-400 hover:text-white text-xs underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Territory Performance Cards Summary */}
      <div className="p-4 bg-[#14202d] border-t border-[#2b3c4f]">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Territory Performance Index & Quota Attainment</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {regionalMetrics.map((reg) => {
            const isExceeding = reg.attainment >= 100;
            return (
              <div
                key={reg.region}
                onClick={() => onSelectRegion && onSelectRegion(reg.region)}
                className="bg-[#1a2736] hover:bg-[#223347] p-3 rounded-lg border border-[#2c3f54] transition-all cursor-pointer group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: reg.colorHex }}
                    />
                    <span className="font-bold text-white text-sm">{reg.region}</span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                      isExceeding
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-600/50'
                    }`}
                  >
                    {reg.attainment}% Quota
                  </span>
                </div>

                {/* Attainment progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isExceeding ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, reg.attainment)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Actual Sales</span>
                    <span className="font-mono font-bold text-white">
                      ${(reg.sales / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Profit Margin</span>
                    <span className="font-mono font-semibold text-emerald-400">
                      {reg.profitMargin}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/50 pt-1.5">
                  <span>Growth: <span className="text-cyan-300 font-semibold">{reg.growthRate > 0 ? '+' : ''}{reg.growthRate}%</span></span>
                  <span className="text-slate-400 group-hover:text-blue-300 transition-colors">Drilldown →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
