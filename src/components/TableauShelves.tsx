import React from 'react';
import { 
  X, 
  ArrowLeftRight, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Palette, 
  Eye, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { TableauPill, ChartType } from '../types/tableau';

interface TableauShelvesProps {
  columnPills: TableauPill[];
  rowPills: TableauPill[];
  onRemovePill: (id: string, shelf: 'columns' | 'rows') => void;
  onSwapShelves: () => void;
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  activeRegionFilter: string;
  setActiveRegionFilter: (region: string) => void;
  activeSegmentFilter: string;
  setActiveSegmentFilter: (segment: string) => void;
  activeCategoryFilter: string;
  setActiveCategoryFilter: (cat: string) => void;
}

export const TableauShelves: React.FC<TableauShelvesProps> = ({
  columnPills,
  rowPills,
  onRemovePill,
  onSwapShelves,
  chartType,
  setChartType,
  activeRegionFilter,
  setActiveRegionFilter,
  activeSegmentFilter,
  setActiveSegmentFilter,
  activeCategoryFilter,
  setActiveCategoryFilter,
}) => {
  return (
    <div className="bg-[#212f3f] border-b border-[#30455b] px-3 py-2 flex flex-col gap-2 select-none text-xs">
      {/* Top row: Filters & Marks preview */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Filters Shelf */}
        <div className="flex items-center space-x-1.5 bg-[#172330] px-2 py-1 rounded border border-[#2b3e51]">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center space-x-1">
            <SlidersHorizontal className="w-3 h-3 text-amber-400" />
            <span>Filters:</span>
          </span>

          {/* Region Filter Pill */}
          <div className="flex items-center bg-[#293b4d] border border-slate-600 rounded px-2 py-0.5 text-[11px] space-x-1">
            <span className="text-slate-400 font-medium">Region:</span>
            <select
              value={activeRegionFilter}
              onChange={(e) => setActiveRegionFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#1b2b3d]">All Regions</option>
              <option value="North America" className="bg-[#1b2b3d]">North America</option>
              <option value="EMEA" className="bg-[#1b2b3d]">EMEA</option>
              <option value="APAC" className="bg-[#1b2b3d]">APAC</option>
              <option value="Latin America" className="bg-[#1b2b3d]">Latin America</option>
            </select>
          </div>

          {/* Segment Filter Pill */}
          <div className="flex items-center bg-[#293b4d] border border-slate-600 rounded px-2 py-0.5 text-[11px] space-x-1">
            <span className="text-slate-400 font-medium">Segment:</span>
            <select
              value={activeSegmentFilter}
              onChange={(e) => setActiveSegmentFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#1b2b3d]">All Segments</option>
              <option value="Enterprise" className="bg-[#1b2b3d]">Enterprise</option>
              <option value="Mid-Market" className="bg-[#1b2b3d]">Mid-Market</option>
              <option value="SMB" className="bg-[#1b2b3d]">SMB</option>
              <option value="Consumer" className="bg-[#1b2b3d]">Consumer</option>
            </select>
          </div>

          {/* Category Filter Pill */}
          <div className="flex items-center bg-[#293b4d] border border-slate-600 rounded px-2 py-0.5 text-[11px] space-x-1">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={activeCategoryFilter}
              onChange={(e) => setActiveCategoryFilter(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-[#1b2b3d]">All Categories</option>
              <option value="Cloud Services" className="bg-[#1b2b3d]">Cloud Services</option>
              <option value="Hardware" className="bg-[#1b2b3d]">Hardware</option>
              <option value="Software Licenses" className="bg-[#1b2b3d]">Software Licenses</option>
              <option value="Consulting" className="bg-[#1b2b3d]">Consulting</option>
            </select>
          </div>
        </div>

        {/* Marks Card Selector */}
        <div className="flex items-center space-x-2 bg-[#172330] px-2 py-1 rounded border border-[#2b3e51]">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
            <Palette className="w-3 h-3 text-blue-400" />
            <span>Mark:</span>
          </span>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="bg-[#243447] border border-slate-600 rounded px-2 py-0.5 text-[11px] text-white font-semibold focus:outline-none cursor-pointer"
          >
            <option value="line">Line (Spline Trend)</option>
            <option value="forecast">Forecast (With Confidence Fan)</option>
            <option value="heatmap">Heatmap (Regional Diverging Matrix)</option>
            <option value="bar">Bar (Category Comparison)</option>
            <option value="scatter">Scatter (Sales vs Profit)</option>
            <option value="treemap">Treemap (Volume Hierarchy)</option>
            <option value="bullet">Bullet Chart (Quota Target vs Actual)</option>
          </select>
        </div>

        {/* Swap Rows & Columns Button */}
        <button
          onClick={onSwapShelves}
          className="flex items-center space-x-1 px-2.5 py-1 bg-[#283b4f] hover:bg-[#344d66] text-white rounded border border-slate-600 transition-colors shadow-xs"
          title="Swap Columns and Rows (Tableau Ctrl+W)"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-[11px] font-medium">Swap Shelves</span>
        </button>
      </div>

      {/* Columns & Rows Shelves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* Columns Shelf */}
        <div className="flex items-center bg-[#182635] border border-[#2f4357] rounded px-2 py-1 min-h-[32px]">
          <span className="text-[11px] font-bold text-slate-400 w-16 uppercase tracking-wider flex-shrink-0">
            Columns:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {columnPills.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">Drag dimensions or measures here</span>
            ) : (
              columnPills.map((pill) => (
                <div
                  key={pill.id}
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium shadow-xs border ${
                    pill.type === 'dimension'
                      ? 'bg-[#1e4870] border-blue-400 text-blue-100' // Discrete Blue
                      : 'bg-[#1b5e20] border-emerald-400 text-emerald-100' // Continuous Green
                  }`}
                >
                  <span className="font-semibold">{pill.label}</span>
                  <button
                    onClick={() => onRemovePill(pill.id, 'columns')}
                    className="hover:text-rose-300 rounded-full ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Rows Shelf */}
        <div className="flex items-center bg-[#182635] border border-[#2f4357] rounded px-2 py-1 min-h-[32px]">
          <span className="text-[11px] font-bold text-slate-400 w-16 uppercase tracking-wider flex-shrink-0">
            Rows:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {rowPills.length === 0 ? (
              <span className="text-[11px] text-slate-500 italic">Drag measures or dimensions here</span>
            ) : (
              rowPills.map((pill) => (
                <div
                  key={pill.id}
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium shadow-xs border ${
                    pill.type === 'dimension'
                      ? 'bg-[#1e4870] border-blue-400 text-blue-100'
                      : 'bg-[#1b5e20] border-emerald-400 text-emerald-100'
                  }`}
                >
                  <span className="font-semibold">{pill.label}</span>
                  <button
                    onClick={() => onRemovePill(pill.id, 'rows')}
                    className="hover:text-rose-300 rounded-full ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
