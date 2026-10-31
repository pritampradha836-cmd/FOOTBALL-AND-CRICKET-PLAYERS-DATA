import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Download, 
  Share2, 
  Maximize2, 
  Minimize2, 
  FileSpreadsheet, 
  Sparkles,
  Layers,
  ChevronDown,
  Sliders,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';

interface TableauHeaderProps {
  activeTab: 'executive' | 'heatmap' | 'forecasting' | 'worksheet' | 'data';
  setActiveTab: (tab: 'executive' | 'heatmap' | 'forecasting' | 'worksheet' | 'data') => void;
  isStreaming: boolean;
  setIsStreaming: (val: boolean | ((prev: boolean) => boolean)) => void;
  streamIntervalMs: number;
  setStreamIntervalMs: (ms: number) => void;
  liveTxCount: number;
  user: User | null;
  onOpenGoogleSheetsModal: () => void;
  onOpenExportModal: () => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onResetData: () => void;
}

export const TableauHeader: React.FC<TableauHeaderProps> = ({
  activeTab,
  setActiveTab,
  isStreaming,
  setIsStreaming,
  streamIntervalMs,
  setStreamIntervalMs,
  liveTxCount,
  user,
  onOpenGoogleSheetsModal,
  onOpenExportModal,
  isFullscreen,
  toggleFullscreen,
  onResetData,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuItems = ['File', 'Data', 'Worksheet', 'Dashboard', 'Analysis', 'Format', 'Server', 'Help'];

  return (
    <header className="bg-[#1a2b3c] text-white border-b border-[#2b3e51] select-none flex-shrink-0 z-30">
      {/* Top Menu Bar (Tableau Desktop style) */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#142331] text-xs border-b border-[#263749]">
        <div className="flex items-center space-x-1 text-slate-300">
          <div className="flex items-center space-x-1.5 mr-3 font-semibold text-white tracking-wide">
            {/* Tableau Iconic Color-Cross Mark */}
            <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
              <span className="bg-[#e15759] rounded-xs"></span>
              <span className="bg-[#4e79a7] rounded-xs"></span>
              <span className="bg-[#59a14f] rounded-xs"></span>
              <span className="bg-[#f28e2b] rounded-xs"></span>
            </div>
            <span className="text-sm font-bold bg-gradient-to-r from-blue-300 via-indigo-100 to-amber-200 bg-clip-text text-transparent">
              TableauPulse
            </span>
            <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-blue-900/60 text-blue-300 rounded font-mono border border-blue-700/50">
              v2027.2
            </span>
          </div>

          {menuItems.map((menu) => (
            <div key={menu} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === menu ? null : menu)}
                className={`px-2 py-0.5 rounded text-slate-300 hover:text-white hover:bg-slate-700/60 transition-colors ${
                  activeMenu === menu ? 'bg-slate-700 text-white' : ''
                }`}
              >
                {menu}
              </button>
              {activeMenu === menu && (
                <div 
                  className="absolute left-0 top-full mt-1 w-48 bg-[#1e2f42] border border-[#3b5166] rounded shadow-xl py-1 z-50 text-xs text-slate-200"
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <button 
                    onClick={() => { onOpenGoogleSheetsModal(); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Connect to Google Sheets...</span>
                  </button>
                  <button 
                    onClick={() => { onOpenExportModal(); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export Workbook / Image...</span>
                  </button>
                  <div className="border-t border-slate-700 my-1"></div>
                  <button 
                    onClick={() => { onResetData(); setActiveMenu(null); }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-600 hover:text-white flex items-center space-x-2 text-rose-300"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Data to Default</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Account / Google Workspace Status */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenGoogleSheetsModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-medium border transition-all ${
              user
                ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-blue-400 hover:text-white'
            }`}
            title="Google Sheets Live Integration"
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${user ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{user ? (user.displayName || user.email?.split('@')[0]) : 'Connect Google Sheets'}</span>
            {user && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
            )}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded"
            title={isFullscreen ? 'Exit Fullscreen' : 'Tableau Presentation Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Toolbar & View Tabs */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 gap-2 bg-[#1b2b3d]">
        {/* Workbook Tab Navigation */}
        <div className="flex items-center space-x-1 bg-[#13202e] p-1 rounded-lg border border-[#2b3e51]">
          <button
            onClick={() => setActiveTab('executive')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === 'executive'
                ? 'bg-[#2b5c8f] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Executive Sales Pulse</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === 'heatmap'
                ? 'bg-[#2b5c8f] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-orange-400" />
            <span>Regional Heatmaps</span>
          </button>

          <button
            onClick={() => setActiveTab('forecasting')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === 'forecasting'
                ? 'bg-[#2b5c8f] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Predictive Forecasting</span>
          </button>

          <button
            onClick={() => setActiveTab('worksheet')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === 'worksheet'
                ? 'bg-[#2b5c8f] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded bg-blue-500/30 text-blue-300 flex items-center justify-center font-mono text-[9px] font-bold">
              📊
            </span>
            <span>Visual Worksheet Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded text-xs font-medium transition-all ${
              activeTab === 'data'
                ? 'bg-[#2b5c8f] text-white shadow-sm font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Data Sources</span>
          </button>
        </div>

        {/* Real-time Ticker & Stream Controls */}
        <div className="flex items-center space-x-2">
          {/* Live Indicator Pill */}
          <div className="flex items-center space-x-2 bg-[#121f2d] border border-[#2b3e51] px-2.5 py-1 rounded-md text-xs">
            <button
              onClick={() => setIsStreaming((prev) => !prev)}
              className="flex items-center space-x-1.5 focus:outline-none"
              title={isStreaming ? 'Pause live sales stream' : 'Resume live sales stream'}
            >
              <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className={`font-semibold tracking-wide ${isStreaming ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isStreaming ? 'LIVE STREAMING' : 'STREAM PAUSED'}
              </span>
            </button>

            <span className="text-slate-600">|</span>

            {/* Stream Speed Selector */}
            <div className="flex items-center space-x-1 text-slate-300 text-[11px]">
              <span>Interval:</span>
              <select
                value={streamIntervalMs}
                onChange={(e) => setStreamIntervalMs(Number(e.target.value))}
                className="bg-[#1b2b3d] border border-slate-700 rounded px-1.5 py-0.5 text-white text-[11px] focus:outline-none focus:border-blue-400"
              >
                <option value={1000}>1.0s</option>
                <option value={2000}>2.0s</option>
                <option value={4000}>4.0s</option>
              </select>
            </div>

            <span className="text-slate-600">|</span>

            <span className="text-[11px] text-slate-400 font-mono">
              Ticks: <span className="text-blue-300 font-semibold">{liveTxCount}</span>
            </span>
          </div>

          {/* Quick Actions */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#263c52] hover:bg-[#324e6b] text-white rounded text-xs font-medium border border-blue-900/40 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-cyan-300" />
            <span>Export & Sync</span>
          </button>
        </div>
      </div>
    </header>
  );
};
