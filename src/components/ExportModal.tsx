import React from 'react';
import { X, Download, FileText, Database, FileSpreadsheet, Check } from 'lucide-react';
import { SalesRecord, ForecastPoint } from '../types/tableau';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesData: SalesRecord[];
  forecastPoints: ForecastPoint[];
  onOpenSheetsModal: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  salesData,
  forecastPoints,
  onOpenSheetsModal,
}) => {
  if (!isOpen) return null;

  const downloadCSV = () => {
    const headers = [
      'id', 'date', 'region', 'subRegion', 'segment', 'category', 'subCategory',
      'sales', 'profit', 'cost', 'quantity', 'discount', 'target', 'customer', 'orderPriority'
    ];
    const rows = salesData.map((r) => [
      r.id, r.date, r.region, r.subRegion, r.segment, r.category, r.subCategory,
      r.sales, r.profit, r.cost, r.quantity, r.discount, r.target, `"${r.customer}"`, r.orderPriority
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tableau_Sales_Data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadForecastCSV = () => {
    const headers = ['date', 'actual_or_projected', 'sales_amount', 'confidence_80_low', 'confidence_80_high', 'confidence_95_low', 'confidence_95_high', 'trend'];
    const rows = forecastPoints.map((p) => [
      p.date,
      p.isHistorical ? 'Historical Actual' : 'Predictive Forecast',
      p.isHistorical ? p.historical : p.forecast,
      p.confidenceLow80,
      p.confidenceHigh80,
      p.confidenceLow95,
      p.confidenceHigh95,
      p.trend
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Tableau_Predictive_Forecast_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = () => {
    const jsonStr = JSON.stringify({ salesData, forecastPoints }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tableau_Workbook_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#182635] border border-[#374d63] rounded-xl shadow-2xl w-full max-w-md text-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-[#131f2c] border-b border-[#2b3e51] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Export Tableau Workbook Data</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options */}
        <div className="p-5 space-y-3 text-xs">
          <button
            onClick={downloadCSV}
            className="w-full p-3 bg-[#131f2c] hover:bg-[#1d2d3e] border border-[#2b3e51] hover:border-blue-500 rounded-lg flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2 bg-blue-600/20 text-blue-400 rounded-md">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs group-hover:text-blue-300">
                  Sales Transactions (CSV)
                </div>
                <div className="text-[11px] text-slate-400">
                  Download all {salesData.length} records with regional & financial dimensions
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </button>

          <button
            onClick={downloadForecastCSV}
            className="w-full p-3 bg-[#131f2c] hover:bg-[#1d2d3e] border border-[#2b3e51] hover:border-cyan-500 rounded-lg flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2 bg-cyan-600/20 text-cyan-400 rounded-md">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs group-hover:text-cyan-300">
                  Predictive Forecast Model (CSV)
                </div>
                <div className="text-[11px] text-slate-400">
                  Includes Holt-Winters trend, seasonal indices & 80%/95% confidence bands
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </button>

          <button
            onClick={downloadJSON}
            className="w-full p-3 bg-[#131f2c] hover:bg-[#1d2d3e] border border-[#2b3e51] hover:border-purple-500 rounded-lg flex items-center justify-between transition-all group"
          >
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2 bg-purple-600/20 text-purple-400 rounded-md">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs group-hover:text-purple-300">
                  Full Workbook Data (JSON)
                </div>
                <div className="text-[11px] text-slate-400">
                  Structured JSON dataset compatible with Tableau Prep or API consumption
                </div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-white" />
          </button>

          <div className="border-t border-slate-700/60 pt-3">
            <button
              onClick={() => {
                onClose();
                onOpenSheetsModal();
              }}
              className="w-full p-3 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/60 rounded-lg flex items-center justify-between transition-all group"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-md">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-emerald-300 text-xs">
                    Sync to Google Sheets
                  </div>
                  <div className="text-[11px] text-emerald-400/80">
                    Create live spreadsheet directly in Google Drive
                  </div>
                </div>
              </div>
              <span className="text-xs text-emerald-400 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#131f2c] border-t border-[#2b3e51] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
