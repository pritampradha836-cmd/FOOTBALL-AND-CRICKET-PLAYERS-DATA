import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  LogOut, 
  Plus, 
  Download,
  FolderOpen,
  ArrowRight
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logout, getAccessToken } from '../services/firebaseAuth';
import { 
  listUserSpreadsheets, 
  readSpreadsheetValues, 
  createTableauSpreadsheet, 
  DriveSpreadsheet 
} from '../services/googleSheetsService';
import { SalesRecord, ForecastPoint } from '../types/tableau';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  salesData: SalesRecord[];
  forecastPoints: ForecastPoint[];
  onImportSheetData?: (headers: string[], rows: any[]) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  setUser,
  salesData,
  forecastPoints,
  onImportSheetData,
}) => {
  const [spreadsheets, setSpreadsheets] = useState<DriveSpreadsheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessUrl, setExportSuccessUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSheetId, setSelectedSheetId] = useState<string>('');
  
  // Mandatory confirmation dialog state for destructive/mutating Google Sheets operation
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    title: string;
    description: string;
    action: () => Promise<void>;
  }>({
    show: false,
    title: '',
    description: '',
    action: async () => {},
  });

  // Fetch spreadsheets when user is authenticated
  useEffect(() => {
    if (isOpen && user) {
      loadSpreadsheets();
    }
  }, [isOpen, user]);

  const loadSpreadsheets = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const sheets = await listUserSpreadsheets();
      setSpreadsheets(sheets);
      if (sheets.length > 0 && !selectedSheetId) {
        setSelectedSheetId(sheets[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load spreadsheets:', err);
      setErrorMessage(err.message || 'Failed to list spreadsheets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        const sheets = await listUserSpreadsheets();
        setSpreadsheets(sheets);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setSpreadsheets([]);
    setExportSuccessUrl(null);
  };

  // Request user confirmation before creating/updating Google Sheet
  const requestExportConfirmation = () => {
    setConfirmDialog({
      show: true,
      title: 'Export Tableau Data to Google Sheets?',
      description: `This will create a new formatted spreadsheet in your Google Drive containing ${salesData.length} live sales transaction records and ${forecastPoints.filter((f) => !f.isHistorical).length} predictive forecasting projections with confidence intervals.`,
      action: executeExport,
    });
  };

  const executeExport = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const headers = [
        'Transaction ID',
        'Date',
        'Region',
        'Sub-Region',
        'Customer',
        'Segment',
        'Product Category',
        'Sub-Category',
        'Sales ($)',
        'Profit ($)',
        'Margin (%)',
        'Quantity',
        'Discount Rate',
        'Quota Target ($)',
        'Order Priority',
      ];

      const rows = salesData.slice(0, 500).map((r) => [
        r.id,
        r.date,
        r.region,
        r.subRegion,
        r.customer,
        r.segment,
        r.category,
        r.subCategory,
        r.sales,
        r.profit,
        r.sales > 0 ? +((r.profit / r.sales) * 100).toFixed(1) : 0,
        r.quantity,
        r.discount,
        r.target,
        r.orderPriority,
      ]);

      const now = new Date();
      const title = `Tableau Analytics Export - ${now.toISOString().slice(0, 10)}`;

      const { url } = await createTableauSpreadsheet(title, headers, rows);
      setExportSuccessUrl(url);
      await loadSpreadsheets();
    } catch (err: any) {
      console.error('Export failed:', err);
      setErrorMessage(err.message || 'Export to Google Sheets failed');
    } finally {
      setIsExporting(false);
      setConfirmDialog((prev) => ({ ...prev, show: false }));
    }
  };

  const handleImportSheet = async () => {
    if (!selectedSheetId) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const values = await readSpreadsheetValues(selectedSheetId, 'A1:Z200');
      if (values.length < 2) {
        throw new Error('Spreadsheet does not have enough rows (header + data needed)');
      }
      const headers = values[0];
      const rows = values.slice(1);
      if (onImportSheetData) {
        onImportSheetData(headers, rows);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to read sheet data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
      <div className="bg-[#182635] border border-[#374d63] rounded-xl shadow-2xl w-full max-w-xl text-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-[#131f2c] border-b border-[#2b3e51] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Google Sheets Integration</h3>
              <p className="text-xs text-slate-400">
                Sync real-time sales trends, regional performance, and predictive forecasts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* Auth State */}
          {!user ? (
            <div className="p-4 bg-[#14202c] border border-blue-900/40 rounded-lg text-center space-y-3">
              <p className="text-slate-300 text-xs">
                Connect your Google account to read, write, and synchronize Tableau datasets directly with Google Sheets spreadsheets in your Drive.
              </p>

              {/* Official Google Sign-In button style */}
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="inline-flex items-center space-x-3 px-4 py-2 bg-white text-slate-800 rounded-md shadow-md hover:bg-slate-100 font-medium text-xs transition-colors border border-slate-300 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span>{isLoading ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-emerald-950/40 border border-emerald-700/50 rounded-lg">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                  {user.displayName ? user.displayName.charAt(0) : user.email?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-white text-xs">{user.displayName || 'Google User'}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-600 text-[11px]"
              >
                <LogOut className="w-3 h-3" />
                <span>Disconnect</span>
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-950/70 border border-rose-600/60 rounded-lg text-rose-200 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {exportSuccessUrl && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/60 rounded-lg text-emerald-200 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Spreadsheet created & synchronized in your Google Drive!</span>
              </div>
              <a
                href={exportSuccessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-medium text-xs transition-colors"
              >
                <span>Open in Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {user && (
            <div className="space-y-4">
              {/* Option 1: Export Current Dashboard */}
              <div className="p-3.5 bg-[#14202d] rounded-lg border border-[#283b4d]">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs flex items-center space-x-1.5">
                      <Plus className="w-3.5 h-3.5 text-blue-400" />
                      <span>Create New Tableau Spreadsheet in Drive</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Exports current sales transactions, regional metrics, and Holt-Winters projections with Tableau styling.
                    </p>
                  </div>
                  <button
                    onClick={requestExportConfirmation}
                    disabled={isExporting}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded text-xs transition-colors flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isExporting ? 'Exporting...' : 'Export to Sheets'}</span>
                  </button>
                </div>
              </div>

              {/* Option 2: Select Existing Spreadsheet from Drive */}
              <div className="p-3.5 bg-[#14202d] rounded-lg border border-[#283b4d] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-xs flex items-center space-x-1.5">
                    <FolderOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Import Existing Spreadsheet from Drive</span>
                  </h4>
                  <button
                    onClick={loadSpreadsheets}
                    disabled={isLoading}
                    className="text-slate-400 hover:text-white text-[11px] flex items-center space-x-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {spreadsheets.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">
                    {isLoading ? 'Loading files from Drive...' : 'No spreadsheets found in your Google Drive.'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <select
                      value={selectedSheetId}
                      onChange={(e) => setSelectedSheetId(e.target.value)}
                      className="w-full bg-[#1b2b3d] border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400"
                    >
                      {spreadsheets.map((sheet) => (
                        <option key={sheet.id} value={sheet.id}>
                          {sheet.name} (Modified: {new Date(sheet.modifiedTime).toLocaleDateString()})
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={handleImportSheet}
                      disabled={isLoading || !selectedSheetId}
                      className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-medium rounded text-xs transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50"
                    >
                      <span>Load Data into Tableau Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#131f2c] border-t border-[#2b3e51] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#1c2936] border border-amber-500/50 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center space-x-2.5 text-amber-300 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>{confirmDialog.title}</span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              {confirmDialog.description}
            </p>

            <div className="p-2.5 bg-[#121c26] rounded border border-slate-700 font-mono text-[11px] text-slate-400">
              Target: Google Sheets API v4 (Drive File creation)
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setConfirmDialog((prev) => ({ ...prev, show: false }))}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.action}
                disabled={isExporting}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold shadow-md transition-colors disabled:opacity-50"
              >
                {isExporting ? 'Creating Sheet...' : 'Yes, Export to Google Sheets'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
