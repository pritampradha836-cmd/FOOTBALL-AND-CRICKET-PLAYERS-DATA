import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  Hash, 
  Globe, 
  Calendar, 
  Type, 
  Sliders, 
  Info,
  TrendingUp,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { DataSourceType, ScenarioParams, TableauPill } from '../types/tableau';

interface TableauSidebarProps {
  dataSource: DataSourceType;
  setDataSource: (source: DataSourceType) => void;
  scenario: ScenarioParams;
  setScenario: React.Dispatch<React.SetStateAction<ScenarioParams>>;
  onAddPillToShelf: (pill: TableauPill, shelf: 'columns' | 'rows') => void;
  isCustomCsvLoaded: boolean;
  onOpenSheetsModal: () => void;
  playerCount: number;
}

export const TableauSidebar: React.FC<TableauSidebarProps> = ({
  dataSource,
  setDataSource,
  scenario,
  setScenario,
  onAddPillToShelf,
  isCustomCsvLoaded,
  onOpenSheetsModal,
  playerCount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    dimensions: true,
    measures: true,
    parameters: true,
  });

  const toggleSection = (section: 'dimensions' | 'measures' | 'parameters') => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Sales Dimensions & Measures
  const salesDimensions: { field: string; label: string; icon: string }[] = [
    { field: 'region', label: 'Region', icon: 'globe' },
    { field: 'subRegion', label: 'Sub-Region / Territory', icon: 'globe' },
    { field: 'category', label: 'Product Category', icon: 'abc' },
    { field: 'subCategory', label: 'Sub-Category', icon: 'abc' },
    { field: 'segment', label: 'Customer Segment', icon: 'abc' },
    { field: 'date', label: 'Order Date (Year / Month)', icon: 'date' },
    { field: 'orderPriority', label: 'Order Priority', icon: 'abc' },
    { field: 'customer', label: 'Customer Account', icon: 'abc' },
  ];

  const salesMeasures: { field: string; label: string; aggregation: 'SUM' | 'AVG' | 'COUNT' }[] = [
    { field: 'sales', label: 'SUM(Sales)', aggregation: 'SUM' },
    { field: 'profit', label: 'SUM(Profit)', aggregation: 'SUM' },
    { field: 'cost', label: 'SUM(Cost)', aggregation: 'SUM' },
    { field: 'target', label: 'SUM(Quota Target)', aggregation: 'SUM' },
    { field: 'quantity', label: 'SUM(Quantity)', aggregation: 'SUM' },
    { field: 'discount', label: 'AVG(Discount Rate)', aggregation: 'AVG' },
    { field: 'margin', label: 'AVG(Profit Margin %)', aggregation: 'AVG' },
    { field: 'deals', label: 'COUNT(Transactions)', aggregation: 'COUNT' },
  ];

  // Player Dataset Dimensions & Measures (from attached 2026/2027 CSV)
  const playerDimensions = [
    { field: 'player', label: 'Player Name', icon: 'abc' },
    { field: 'squad', label: 'Squad / Club', icon: 'abc' },
    { field: 'comp', label: 'League / Competition', icon: 'globe' },
    { field: 'nation', label: 'Nationality / Country', icon: 'globe' },
    { field: 'pos', label: 'Position (FW, MF, DF, GK)', icon: 'abc' },
  ];

  const playerMeasures: { field: string; label: string; aggregation: 'SUM' | 'AVG' | 'COUNT' }[] = [
    { field: 'gls', label: 'SUM(Goals)', aggregation: 'SUM' },
    { field: 'ast', label: 'SUM(Assists)', aggregation: 'SUM' },
    { field: 'ga', label: 'SUM(Goals + Assists)', aggregation: 'SUM' },
    { field: 'min', label: 'SUM(Minutes Played)', aggregation: 'SUM' },
    { field: 'starts', label: 'SUM(Starts)', aggregation: 'SUM' },
    { field: 'sh', label: 'SUM(Shots)', aggregation: 'SUM' },
    { field: 'sot', label: 'SUM(Shots on Target)', aggregation: 'SUM' },
    { field: 'ppm', label: 'AVG(Points Per Match)', aggregation: 'AVG' },
    { field: 'age', label: 'AVG(Player Age)', aggregation: 'AVG' },
  ];

  const currentDimensions = dataSource === 'players' ? playerDimensions : salesDimensions;
  const currentMeasures = dataSource === 'players' ? playerMeasures : salesMeasures;

  const filteredDimensions = currentDimensions.filter((d) =>
    d.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredMeasures = currentMeasures.filter((m) =>
    m.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="w-64 bg-[#1f2937] text-slate-200 border-r border-[#374151] flex flex-col flex-shrink-0 select-none overflow-y-auto text-xs">
      {/* Data Source Selector */}
      <div className="p-3 border-b border-[#374151] bg-[#16202c]">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
          <span className="flex items-center space-x-1">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Tableau Data Source</span>
          </span>
        </div>
        
        <select
          value={dataSource}
          onChange={(e) => setDataSource(e.target.value as DataSourceType)}
          className="w-full bg-[#243344] border border-[#3b5166] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
        >
          <option value="sales">⚡ Global Sales (Live Stream)</option>
          <option value="players">⚽ 2026/27 Player Stats ({playerCount.toLocaleString()} rows)</option>
          <option value="sheets">📊 Google Sheets Live Sync</option>
          <option value="custom">📁 Custom CSV Upload {isCustomCsvLoaded ? '✓' : ''}</option>
        </select>

        {dataSource === 'sheets' && (
          <button
            onClick={onOpenSheetsModal}
            className="w-full mt-2 py-1 px-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-[11px] font-medium flex items-center justify-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>Configure Google Sheets Sync</span>
          </button>
        )}
      </div>

      {/* Field Search Box */}
      <div className="p-2 border-b border-[#374151] bg-[#1a232f]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
          <input
            type="text"
            placeholder="Search fields & metrics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111827] border border-[#374151] rounded pl-7 pr-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Dimensions Shelf (Blue Pills) */}
      <div className="border-b border-[#374151]">
        <button
          onClick={() => toggleSection('dimensions')}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#1a2430] hover:bg-[#202c3b] font-semibold text-slate-300 text-[11px]"
        >
          <span className="flex items-center space-x-1.5">
            {expandedSections.dimensions ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-blue-400 font-bold uppercase tracking-wider">Dimensions</span>
            <span className="text-[10px] text-slate-400 font-normal">({filteredDimensions.length})</span>
          </span>
          <span className="text-[10px] px-1 rounded bg-blue-900/50 text-blue-300 font-mono">Abc</span>
        </button>

        {expandedSections.dimensions && (
          <div className="p-1.5 space-y-0.5">
            {filteredDimensions.map((dim) => (
              <div
                key={dim.field}
                className="group flex items-center justify-between px-2 py-1 rounded hover:bg-[#273749] cursor-pointer text-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  {dim.icon === 'globe' ? (
                    <Globe className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  ) : dim.icon === 'date' ? (
                    <Calendar className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  ) : (
                    <Type className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  )}
                  <span className="truncate">{dim.label}</span>
                </div>
                <div className="hidden group-hover:flex items-center space-x-1">
                  <button
                    onClick={() =>
                      onAddPillToShelf(
                        { id: `pill-${Date.now()}-${dim.field}`, label: dim.label, field: dim.field, type: 'dimension' },
                        'columns'
                      )
                    }
                    className="px-1 py-0.5 text-[9px] bg-blue-700 hover:bg-blue-600 text-white rounded"
                    title="Add to Columns shelf"
                  >
                    +Col
                  </button>
                  <button
                    onClick={() =>
                      onAddPillToShelf(
                        { id: `pill-${Date.now()}-${dim.field}`, label: dim.label, field: dim.field, type: 'dimension' },
                        'rows'
                      )
                    }
                    className="px-1 py-0.5 text-[9px] bg-blue-800 hover:bg-blue-700 text-white rounded"
                    title="Add to Rows shelf"
                  >
                    +Row
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Measures Shelf (Green Pills) */}
      <div className="border-b border-[#374151]">
        <button
          onClick={() => toggleSection('measures')}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-[#1a2430] hover:bg-[#202c3b] font-semibold text-slate-300 text-[11px]"
        >
          <span className="flex items-center space-x-1.5">
            {expandedSections.measures ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-emerald-400 font-bold uppercase tracking-wider">Measures</span>
            <span className="text-[10px] text-slate-400 font-normal">({filteredMeasures.length})</span>
          </span>
          <span className="text-[10px] px-1 rounded bg-emerald-900/50 text-emerald-300 font-mono">#</span>
        </button>

        {expandedSections.measures && (
          <div className="p-1.5 space-y-0.5">
            {filteredMeasures.map((measure) => (
              <div
                key={measure.field}
                className="group flex items-center justify-between px-2 py-1 rounded hover:bg-[#23382c] cursor-pointer text-slate-200 transition-colors"
              >
                <div className="flex items-center space-x-2 truncate">
                  <Hash className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span className="truncate text-emerald-100">{measure.label}</span>
                </div>
                <div className="hidden group-hover:flex items-center space-x-1">
                  <button
                    onClick={() =>
                      onAddPillToShelf(
                        {
                          id: `pill-${Date.now()}-${measure.field}`,
                          label: measure.label,
                          field: measure.field,
                          type: 'measure',
                          aggregation: measure.aggregation,
                        },
                        'rows'
                      )
                    }
                    className="px-1 py-0.5 text-[9px] bg-emerald-700 hover:bg-emerald-600 text-white rounded"
                    title="Add to Rows shelf"
                  >
                    +Row
                  </button>
                  <button
                    onClick={() =>
                      onAddPillToShelf(
                        {
                          id: `pill-${Date.now()}-${measure.field}`,
                          label: measure.label,
                          field: measure.field,
                          type: 'measure',
                          aggregation: measure.aggregation,
                        },
                        'columns'
                      )
                    }
                    className="px-1 py-0.5 text-[9px] bg-emerald-800 hover:bg-emerald-700 text-white rounded"
                    title="Add to Columns shelf"
                  >
                    +Col
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Predictive Scenario Parameters (Tableau Parameters card) */}
      <div className="flex-1 p-3 bg-[#17222e]">
        <button
          onClick={() => toggleSection('parameters')}
          className="w-full flex items-center justify-between font-semibold text-slate-300 text-[11px] mb-2 uppercase tracking-wider"
        >
          <span className="flex items-center space-x-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-cyan-300">What-If Parameters</span>
          </span>
          {expandedSections.parameters ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>

        {expandedSections.parameters && (
          <div className="space-y-3 pt-1">
            {/* Target Growth Multiplier */}
            <div>
              <div className="flex justify-between items-center text-[11px] text-slate-300 mb-1">
                <span>Annual Growth Multiplier:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {((scenario.growthRateMultiplier - 1) * 100 > 0 ? '+' : '')}
                  {Math.round((scenario.growthRateMultiplier - 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.80"
                max="1.50"
                step="0.05"
                value={scenario.growthRateMultiplier}
                onChange={(e) =>
                  setScenario((prev) => ({ ...prev, growthRateMultiplier: parseFloat(e.target.value) }))
                }
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Price Adjustment */}
            <div>
              <div className="flex justify-between items-center text-[11px] text-slate-300 mb-1">
                <span>Price Elasticity:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {scenario.priceAdjustmentPercent > 0 ? '+' : ''}
                  {scenario.priceAdjustmentPercent}%
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="25"
                step="1"
                value={scenario.priceAdjustmentPercent}
                onChange={(e) =>
                  setScenario((prev) => ({ ...prev, priceAdjustmentPercent: parseInt(e.target.value) }))
                }
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Marketing Spend Multiplier */}
            <div>
              <div className="flex justify-between items-center text-[11px] text-slate-300 mb-1">
                <span>Marketing Spend:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {scenario.marketingSpendMultiplier.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="2.0"
                step="0.1"
                value={scenario.marketingSpendMultiplier}
                onChange={(e) =>
                  setScenario((prev) => ({ ...prev, marketingSpendMultiplier: parseFloat(e.target.value) }))
                }
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>

            {/* Forecast Horizon */}
            <div>
              <div className="text-[11px] text-slate-300 mb-1">Forecast Horizon:</div>
              <div className="grid grid-cols-4 gap-1">
                {([30, 90, 180, 365] as const).map((days) => (
                  <button
                    key={days}
                    onClick={() => setScenario((prev) => ({ ...prev, forecastHorizonDays: days }))}
                    className={`py-1 text-[10px] font-mono rounded border transition-colors ${
                      scenario.forecastHorizonDays === days
                        ? 'bg-cyan-900 border-cyan-400 text-cyan-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {days}d
                  </button>
                ))}
              </div>
            </div>

            {/* Confidence Interval */}
            <div>
              <div className="text-[11px] text-slate-300 mb-1">Confidence Interval Band:</div>
              <div className="grid grid-cols-2 gap-1.5">
                {[80, 95].map((level) => (
                  <button
                    key={level}
                    onClick={() => setScenario((prev) => ({ ...prev, confidenceLevel: level as 80 | 95 }))}
                    className={`py-1 text-[11px] font-mono rounded border transition-colors ${
                      scenario.confidenceLevel === level
                        ? 'bg-blue-900 border-blue-400 text-blue-200 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {level}% Fan
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() =>
                setScenario({
                  growthRateMultiplier: 1.0,
                  priceAdjustmentPercent: 0,
                  marketingSpendMultiplier: 1.0,
                  seasonalityStrength: 0.8,
                  forecastHorizonDays: 180,
                  confidenceLevel: 95,
                })
              }
              className="w-full py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded border border-slate-700"
            >
              Reset Parameters
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
