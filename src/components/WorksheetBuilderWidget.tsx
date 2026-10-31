import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  LineChart, 
  ScatterChart, 
  Layers, 
  ArrowUpDown, 
  Download, 
  Filter, 
  Sparkles,
  Trophy,
  PieChart
} from 'lucide-react';
import { TableauPill, ChartType, SalesRecord, PlayerRecord, DataSourceType } from '../types/tableau';

interface WorksheetBuilderWidgetProps {
  dataSource: DataSourceType;
  salesData: SalesRecord[];
  playersData: PlayerRecord[];
  columnPills: TableauPill[];
  rowPills: TableauPill[];
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  onAddPillToShelf: (pill: TableauPill, shelf: 'columns' | 'rows') => void;
}

export const WorksheetBuilderWidget: React.FC<WorksheetBuilderWidgetProps> = ({
  dataSource,
  salesData,
  playersData,
  columnPills,
  rowPills,
  chartType,
  setChartType,
  onAddPillToShelf,
}) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [activeDimension, setActiveDimension] = useState<string>(
    dataSource === 'players' ? 'squad' : 'region'
  );
  const [activeMeasure, setActiveMeasure] = useState<string>(
    dataSource === 'players' ? 'gls' : 'sales'
  );
  const [aggregation, setAggregation] = useState<'SUM' | 'AVG' | 'COUNT'>('SUM');

  // Available dimensions & measures based on active dataset
  const dimensions = useMemo(() => {
    if (dataSource === 'players') {
      return [
        { field: 'squad', label: 'Squad / Club' },
        { field: 'comp', label: 'League / Comp' },
        { field: 'pos', label: 'Position' },
        { field: 'nation', label: 'Nation' },
        { field: 'player', label: 'Player Name' },
      ];
    }
    return [
      { field: 'region', label: 'Region' },
      { field: 'subRegion', label: 'Sub-Region' },
      { field: 'category', label: 'Category' },
      { field: 'segment', label: 'Segment' },
      { field: 'orderPriority', label: 'Priority' },
    ];
  }, [dataSource]);

  const measures = useMemo(() => {
    if (dataSource === 'players') {
      return [
        { field: 'gls', label: 'Goals', defAgg: 'SUM' as const },
        { field: 'ast', label: 'Assists', defAgg: 'SUM' as const },
        { field: 'ga', label: 'Goals + Assists', defAgg: 'SUM' as const },
        { field: 'min', label: 'Minutes Played', defAgg: 'SUM' as const },
        { field: 'sh', label: 'Shots', defAgg: 'SUM' as const },
        { field: 'sot', label: 'Shots on Target', defAgg: 'SUM' as const },
        { field: 'ppm', label: 'Points Per Match', defAgg: 'AVG' as const },
      ];
    }
    return [
      { field: 'sales', label: 'Sales ($)', defAgg: 'SUM' as const },
      { field: 'profit', label: 'Profit ($)', defAgg: 'SUM' as const },
      { field: 'quantity', label: 'Quantity', defAgg: 'SUM' as const },
      { field: 'discount', label: 'Discount Rate', defAgg: 'AVG' as const },
      { field: 'target', label: 'Target ($)', defAgg: 'SUM' as const },
    ];
  }, [dataSource]);

  // Aggregate data according to active dimension & measure
  const chartData = useMemo(() => {
    const map = new Map<string, { sum: number; count: number; items: any[] }>();

    const rawData = (dataSource === 'players' ? playersData : salesData) as any[];

    rawData.forEach((item) => {
      const dimVal = String(item[activeDimension] || 'Unknown');
      const cur = map.get(dimVal) || { sum: 0, count: 0, items: [] };
      const numVal = Number(item[activeMeasure]) || 0;
      cur.sum += numVal;
      cur.count += 1;
      cur.items.push(item);
      map.set(dimVal, cur);
    });

    const entries = Array.from(map.entries()).map(([label, val]) => {
      let finalVal = val.sum;
      if (aggregation === 'AVG') finalVal = val.count > 0 ? val.sum / val.count : 0;
      if (aggregation === 'COUNT') finalVal = val.count;

      return {
        label,
        value: Math.round(finalVal * 10) / 10,
        count: val.count,
        items: val.items,
      };
    });

    entries.sort((a, b) => (sortOrder === 'desc' ? b.value - a.value : a.value - b.value));
    return entries.slice(0, 16); // Top 16 for clean Tableau presentation
  }, [dataSource, salesData, playersData, activeDimension, activeMeasure, aggregation, sortOrder]);

  const maxVal = Math.max(...chartData.map((d) => d.value), 10);

  // Quick preset queries
  const presets = dataSource === 'players'
    ? [
        { name: 'Top Goal Scorers', dim: 'player', meas: 'gls', agg: 'SUM' as const },
        { name: 'Goals by League', dim: 'comp', meas: 'gls', agg: 'SUM' as const },
        { name: 'Squad Total Minutes', dim: 'squad', meas: 'min', agg: 'SUM' as const },
        { name: 'Avg PPM by Position', dim: 'pos', meas: 'ppm', agg: 'AVG' as const },
      ]
    : [
        { name: 'Sales by Region', dim: 'region', meas: 'sales', agg: 'SUM' as const },
        { name: 'Profit by Category', dim: 'category', meas: 'profit', agg: 'SUM' as const },
        { name: 'Sales by Segment', dim: 'segment', meas: 'sales', agg: 'SUM' as const },
        { name: 'Avg Discount by Category', dim: 'category', meas: 'discount', agg: 'AVG' as const },
      ];

  const applyPreset = (preset: typeof presets[0]) => {
    setActiveDimension(preset.dim);
    setActiveMeasure(preset.meas);
    setAggregation(preset.agg);
  };

  return (
    <div className="bg-[#1a2634] border border-[#2d3e52] rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Widget Header with Shelves Control */}
      <div className="p-4 bg-[#14202d] border-b border-[#2b3c4f] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <BarChart className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-white tracking-tight">Tableau Visual Worksheet Builder</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50">
                {dataSource === 'players' ? '2026/27 European Leagues' : 'Global Sales & Revenue'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pill-based drag-and-drop aggregation engine across all categorical dimensions and quantitative measures
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Presets:</span>
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                activeDimension === p.dim && activeMeasure === p.meas && aggregation === p.agg
                  ? 'bg-blue-600 border-blue-400 text-white shadow-xs'
                  : 'bg-[#1b2b3d] border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pill Shelves Selector Toolbar */}
      <div className="p-3 bg-[#172332] border-b border-[#2b3c4f] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Dimension Pill (Blue) */}
          <div className="flex items-center space-x-1.5 bg-[#121c29] border border-blue-800/60 px-2.5 py-1 rounded-full text-blue-100">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Dimension:</span>
            <select
              value={activeDimension}
              onChange={(e) => setActiveDimension(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {dimensions.map((d) => (
                <option key={d.field} value={d.field} className="bg-[#1b2b3d]">
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Measure Pill (Green) */}
          <div className="flex items-center space-x-1.5 bg-[#121c29] border border-emerald-800/60 px-2.5 py-1 rounded-full text-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-400 font-bold uppercase text-[10px]">Measure:</span>
            <select
              value={activeMeasure}
              onChange={(e) => setActiveMeasure(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              {measures.map((m) => (
                <option key={m.field} value={m.field} className="bg-[#1b2b3d]">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation Function */}
          <div className="flex items-center space-x-1 bg-[#101924] border border-slate-700 px-2 py-1 rounded-md text-[11px]">
            <span className="text-slate-400">Agg:</span>
            {(['SUM', 'AVG', 'COUNT'] as const).map((agg) => (
              <button
                key={agg}
                onClick={() => setAggregation(agg)}
                className={`px-1.5 py-0.5 rounded font-mono font-medium ${
                  aggregation === agg ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {agg}
              </button>
            ))}
          </div>
        </div>

        {/* Sorting & Chart Type */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center space-x-1 px-2.5 py-1 bg-[#243447] hover:bg-[#30445d] text-white rounded border border-slate-600 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-[11px] font-medium uppercase font-mono">{sortOrder}</span>
          </button>

          <div className="flex items-center space-x-1 bg-[#121c29] p-0.5 rounded border border-slate-700">
            <button
              onClick={() => setChartType('bar')}
              className={`p-1 rounded ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Bar Chart"
            >
              <BarChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1 rounded ${chartType === 'line' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Line Chart"
            >
              <LineChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('treemap')}
              className={`p-1 rounded ${chartType === 'treemap' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              title="Treemap"
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Chart Canvas */}
      <div className="p-4 flex-1">
        {chartType === 'treemap' ? (
          /* Treemap Layout */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 min-h-[300px]">
            {chartData.map((d, i) => {
              const pct = (d.value / (chartData.reduce((acc, c) => acc + c.value, 0) || 1)) * 100;
              return (
                <div
                  key={d.label}
                  className="bg-gradient-to-br from-[#1f4e79] to-[#0d2a45] border border-blue-500/40 p-3 rounded-lg flex flex-col justify-between hover:border-blue-400 hover:scale-[1.02] transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span className="font-bold text-white text-xs truncate mr-1">{d.label}</span>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">{pct.toFixed(1)}%</span>
                  </div>
                  <div className="mt-4">
                    <div className="text-lg font-mono font-extrabold text-white">
                      {d.value >= 1000 ? `$${d.value.toLocaleString()}` : d.value.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-300">
                      {d.count.toLocaleString()} occurrences
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Horizontal Tableau Bar Chart */
          <div className="space-y-2.5">
            {chartData.map((d, i) => {
              const widthPct = Math.max(3, Math.min(100, (d.value / maxVal) * 100));
              const isFirst = i === 0;

              return (
                <div key={d.label} className="group flex items-center space-x-3 text-xs">
                  <div className="w-36 text-right font-medium text-slate-300 truncate text-[11px]" title={d.label}>
                    {d.label}
                  </div>
                  <div className="flex-1 bg-[#121c29] rounded-sm h-6 overflow-hidden relative flex items-center border border-[#263749]">
                    <div
                      className={`h-full transition-all duration-300 rounded-sm flex items-center justify-end pr-2 font-mono text-[11px] font-bold ${
                        isFirst
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white'
                          : 'bg-[#2b5c8f] hover:bg-[#3872ac] text-blue-100'
                      }`}
                      style={{ width: `${widthPct}%` }}
                    >
                      {widthPct > 20 && (
                        <span>{d.value >= 1000 ? `$${d.value.toLocaleString()}` : d.value.toLocaleString()}</span>
                      )}
                    </div>
                    {widthPct <= 20 && (
                      <span className="ml-2 font-mono text-[11px] text-slate-300 font-semibold">
                        {d.value >= 1000 ? `$${d.value.toLocaleString()}` : d.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="w-16 text-right font-mono text-[10px] text-slate-400">
                    {d.count} recs
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
