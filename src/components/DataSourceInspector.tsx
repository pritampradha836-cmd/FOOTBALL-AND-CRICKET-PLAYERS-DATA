import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  Layers, 
  Table as TableIcon,
  Filter,
  RefreshCw
} from 'lucide-react';
import Papa from 'papaparse';
import { DataSourceType, SalesRecord, PlayerRecord } from '../types/tableau';

interface DataSourceInspectorProps {
  dataSource: DataSourceType;
  setDataSource: (source: DataSourceType) => void;
  salesData: SalesRecord[];
  playersData: PlayerRecord[];
  onUploadCustomCsv: (data: any[]) => void;
  onOpenSheetsModal: () => void;
}

export const DataSourceInspector: React.FC<DataSourceInspectorProps> = ({
  dataSource,
  setDataSource,
  salesData,
  playersData,
  onUploadCustomCsv,
  onOpenSheetsModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          onUploadCustomCsv(results.data);
          setDataSource('custom');
        }
      },
      error: (err) => {
        alert('Failed to parse CSV file: ' + err.message);
      },
    });
  };

  const currentRecords = dataSource === 'players' ? playersData : salesData;

  const filteredRecords = currentRecords.filter((rec) => {
    if (!searchTerm) return true;
    return Object.values(rec).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = filteredRecords.slice((page - 1) * pageSize, page * pageSize);

  // Column definitions
  const columns = currentRecords.length > 0
    ? Object.keys(currentRecords[0]).slice(0, 14) // Display first 14 columns
    : [];

  return (
    <div className="bg-[#1a2634] border border-[#2d3e52] rounded-xl shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#14202d] border-b border-[#2b3c4f] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Tableau Data Connection Manager</h2>
            <p className="text-xs text-slate-400">
              Inspect schemas, verify data types, upload custom CSVs, and manage Google Sheets connectors
            </p>
          </div>
        </div>

        {/* Source Switcher */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => { setDataSource('sales'); setPage(1); }}
            className={`px-3 py-1.5 rounded font-medium border transition-colors ${
              dataSource === 'sales'
                ? 'bg-blue-600 border-blue-400 text-white font-semibold'
                : 'bg-[#1b2b3d] border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            Sales Transactions ({salesData.length.toLocaleString()})
          </button>

          <button
            onClick={() => { setDataSource('players'); setPage(1); }}
            className={`px-3 py-1.5 rounded font-medium border transition-colors ${
              dataSource === 'players'
                ? 'bg-blue-600 border-blue-400 text-white font-semibold'
                : 'bg-[#1b2b3d] border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            2026/27 Leagues ({playersData.length.toLocaleString()})
          </button>

          <label className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#25394d] hover:bg-[#314a63] text-cyan-200 border border-cyan-800/50 rounded cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Upload CSV</span>
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          </label>

          <button
            onClick={onOpenSheetsModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded font-medium transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Google Sheets</span>
          </button>
        </div>
      </div>

      {/* Schema / Metadata overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-[#172433] border-b border-[#2b3c4f] text-xs">
        <div className="bg-[#121c29] p-3 rounded-lg border border-[#28384a]">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Total Records</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {currentRecords.length.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#121c29] p-3 rounded-lg border border-[#28384a]">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Fields Detected</span>
          <div className="text-xl font-bold text-cyan-300 font-mono mt-1">
            {columns.length} columns
          </div>
        </div>

        <div className="bg-[#121c29] p-3 rounded-lg border border-[#28384a]">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Extract Engine</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            Tableau Hyper Fast
          </div>
        </div>

        <div className="bg-[#121c29] p-3 rounded-lg border border-[#28384a]">
          <span className="text-slate-400 text-[10px] uppercase font-bold">Live Stream Sync</span>
          <div className="text-xl font-bold text-amber-300 font-mono mt-1 flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Active</span>
          </div>
        </div>
      </div>

      {/* Search & Pagination Bar */}
      <div className="p-3 bg-[#131f2c] border-b border-[#2b3c4f] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search within dataset..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full bg-[#1b2b3d] border border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center space-x-2 text-slate-300">
          <span>Page {page} of {totalPages}</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded disabled:opacity-40 border border-slate-700 text-xs"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded disabled:opacity-40 border border-slate-700 text-xs"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="p-4 overflow-x-auto flex-1">
        <div className="min-w-[800px]">
          <table className="w-full border-collapse text-xs select-none">
            <thead>
              <tr className="bg-[#121c29] border-b border-[#2d3e52]">
                {columns.map((col) => (
                  <th
                    key={col}
                    className="p-2 text-left font-bold text-slate-300 uppercase tracking-wider border-r border-[#2d3e52] last:border-r-0 truncate max-w-[140px]"
                  >
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-blue-400 font-mono">#</span>
                      <span className="truncate">{col}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((row: any, rIdx) => (
                <tr
                  key={rIdx}
                  className="border-b border-[#223347] hover:bg-[#1f2f42] transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col}
                      className="p-2 text-slate-200 border-r border-[#223347] last:border-r-0 truncate max-w-[140px] font-mono text-[11px]"
                    >
                      {String(row[col] !== undefined && row[col] !== null ? row[col] : '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
