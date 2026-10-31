import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  DataSourceType, 
  SalesRecord, 
  PlayerRecord, 
  TableauPill, 
  ChartType, 
  ScenarioParams 
} from './types/tableau';
import { 
  generateHistoricalSales, 
  generateLiveTransaction, 
  calculatePredictiveForecast 
} from './data/mockSalesData';
import { loadPlayersDataset } from './data/playersDatasetLoader';
import { initAuth } from './services/firebaseAuth';

// Components
import { TableauHeader } from './components/TableauHeader';
import { TableauSidebar } from './components/TableauSidebar';
import { TableauShelves } from './components/TableauShelves';
import { RealTimeSalesWidget } from './components/RealTimeSalesWidget';
import { RegionalHeatmapWidget } from './components/RegionalHeatmapWidget';
import { PredictiveForecastingWidget } from './components/PredictiveForecastingWidget';
import { WorksheetBuilderWidget } from './components/WorksheetBuilderWidget';
import { DataSourceInspector } from './components/DataSourceInspector';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  // Navigation & View Mode
  const [activeTab, setActiveTab] = useState<'executive' | 'heatmap' | 'forecasting' | 'worksheet' | 'data'>('executive');
  const [dataSource, setDataSource] = useState<DataSourceType>('sales');
  
  // Real-time Sales State
  const [salesData, setSalesData] = useState<SalesRecord[]>(() => generateHistoricalSales());
  const [playersData, setPlayersData] = useState<PlayerRecord[]>([]);
  const [customCsvData, setCustomCsvData] = useState<any[]>([]);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamIntervalMs, setStreamIntervalMs] = useState<number>(2000);
  const [liveTxCount, setLiveTxCount] = useState<number>(0);
  const [latestTransaction, setLatestTransaction] = useState<SalesRecord | null>(null);

  // Scenario & Forecasting Parameters
  const [scenario, setScenario] = useState<ScenarioParams>({
    growthRateMultiplier: 1.15,
    priceAdjustmentPercent: 0,
    marketingSpendMultiplier: 1.1,
    seasonalityStrength: 0.85,
    forecastHorizonDays: 180,
    confidenceLevel: 95,
  });

  // Tableau Shelves & Pills State
  const [columnPills, setColumnPills] = useState<TableauPill[]>([
    { id: 'pill-region', label: 'Region', field: 'region', type: 'dimension' },
    { id: 'pill-date', label: 'MONTH(Date)', field: 'date', type: 'dimension' },
  ]);
  const [rowPills, setRowPills] = useState<TableauPill[]>([
    { id: 'pill-sales', label: 'SUM(Sales)', field: 'sales', type: 'measure', aggregation: 'SUM' },
    { id: 'pill-profit', label: 'SUM(Profit)', field: 'profit', type: 'measure', aggregation: 'SUM' },
  ]);
  const [chartType, setChartType] = useState<ChartType>('line');

  // Filters
  const [activeRegionFilter, setActiveRegionFilter] = useState<string>('All');
  const [activeSegmentFilter, setActiveSegmentFilter] = useState<string>('All');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  // User & Modals
  const [user, setUser] = useState<User | null>(null);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser) => setUser(authenticatedUser),
      () => setUser(null)
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Pre-fetch 2026/2027 Player Dataset in background
  useEffect(() => {
    loadPlayersDataset()
      .then((records) => setPlayersData(records))
      .catch((err) => console.warn('Could not load players dataset:', err));
  }, []);

  // Real-Time Transaction Streaming Interval
  useEffect(() => {
    if (!isStreaming) return;

    let counter = liveTxCount;
    const interval = setInterval(() => {
      counter++;
      const newTx = generateLiveTransaction(counter);
      setLatestTransaction(newTx);
      setLiveTxCount(counter);
      setSalesData((prev) => [...prev.slice(-450), newTx]);
    }, streamIntervalMs);

    return () => clearInterval(interval);
  }, [isStreaming, streamIntervalMs, liveTxCount]);

  // Filtered sales data
  const filteredSalesData = useMemo(() => {
    return salesData.filter((r) => {
      if (activeRegionFilter !== 'All' && r.region !== activeRegionFilter) return false;
      if (activeSegmentFilter !== 'All' && r.segment !== activeSegmentFilter) return false;
      if (activeCategoryFilter !== 'All' && r.category !== activeCategoryFilter) return false;
      return true;
    });
  }, [salesData, activeRegionFilter, activeSegmentFilter, activeCategoryFilter]);

  // Calculated Forecast Points for Export
  const forecastPoints = useMemo(() => {
    return calculatePredictiveForecast(filteredSalesData, scenario);
  }, [filteredSalesData, scenario]);

  // Pill Handlers
  const handleAddPillToShelf = (pill: TableauPill, shelf: 'columns' | 'rows') => {
    if (shelf === 'columns') {
      setColumnPills((prev) => [...prev, pill]);
    } else {
      setRowPills((prev) => [...prev, pill]);
    }
  };

  const handleRemovePill = (id: string, shelf: 'columns' | 'rows') => {
    if (shelf === 'columns') {
      setColumnPills((prev) => prev.filter((p) => p.id !== id));
    } else {
      setRowPills((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSwapShelves = () => {
    const temp = columnPills;
    setColumnPills(rowPills);
    setRowPills(temp);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  const handleResetData = () => {
    setSalesData(generateHistoricalSales());
    setLiveTxCount(0);
    setLatestTransaction(null);
  };

  const handleImportSheetData = (headers: string[], rows: any[]) => {
    const formatted = rows.map((row, idx) => {
      const obj: any = {};
      headers.forEach((h, hIdx) => {
        obj[h] = row[hIdx];
      });
      return obj;
    });
    setCustomCsvData(formatted);
    setDataSource('sheets');
    setActiveTab('data');
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen w-screen bg-[#111827] text-slate-100 font-sans overflow-hidden"
    >
      {/* Tableau Application Header */}
      <TableauHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        streamIntervalMs={streamIntervalMs}
        setStreamIntervalMs={setStreamIntervalMs}
        liveTxCount={liveTxCount}
        user={user}
        onOpenGoogleSheetsModal={() => setIsSheetsModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onResetData={handleResetData}
      />

      {/* Tableau Shelves (Columns, Rows, Filters, Marks) */}
      <TableauShelves
        columnPills={columnPills}
        rowPills={rowPills}
        onRemovePill={handleRemovePill}
        onSwapShelves={handleSwapShelves}
        chartType={chartType}
        setChartType={setChartType}
        activeRegionFilter={activeRegionFilter}
        setActiveRegionFilter={setActiveRegionFilter}
        activeSegmentFilter={activeSegmentFilter}
        setActiveSegmentFilter={setActiveSegmentFilter}
        activeCategoryFilter={activeCategoryFilter}
        setActiveCategoryFilter={setActiveCategoryFilter}
      />

      {/* Main Workspace Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Data Pane & Parameter Sidebar */}
        <TableauSidebar
          dataSource={dataSource}
          setDataSource={setDataSource}
          scenario={scenario}
          setScenario={setScenario}
          onAddPillToShelf={handleAddPillToShelf}
          isCustomCsvLoaded={customCsvData.length > 0}
          onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
          playerCount={playersData.length}
        />

        {/* Dashboard Canvas Area */}
        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0d1520]">
          {/* TAB 1: EXECUTIVE SALES PULSE (Main Dashboard) */}
          {activeTab === 'executive' && (
            <div className="space-y-4">
              {/* Real-time Sales Trend Widget */}
              <RealTimeSalesWidget
                salesData={filteredSalesData}
                isStreaming={isStreaming}
                latestTransaction={latestTransaction}
              />

              {/* Dual Split: Regional Heatmap & Predictive Forecast Preview */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <RegionalHeatmapWidget
                  salesData={filteredSalesData}
                  onSelectRegion={(reg) => setActiveRegionFilter(reg)}
                />

                <PredictiveForecastingWidget
                  salesData={filteredSalesData}
                  scenario={scenario}
                  setScenario={setScenario}
                />
              </div>
            </div>
          )}

          {/* TAB 2: REGIONAL HEATMAPS (Dedicated Deep-Dive) */}
          {activeTab === 'heatmap' && (
            <div className="space-y-4">
              <RegionalHeatmapWidget
                salesData={filteredSalesData}
                onSelectRegion={(reg) => setActiveRegionFilter(reg)}
              />
            </div>
          )}

          {/* TAB 3: PREDICTIVE FORECASTING STUDIO */}
          {activeTab === 'forecasting' && (
            <div className="space-y-4">
              <PredictiveForecastingWidget
                salesData={filteredSalesData}
                scenario={scenario}
                setScenario={setScenario}
              />
            </div>
          )}

          {/* TAB 4: VISUAL WORKSHEET BUILDER (Interactive drag/drop pills) */}
          {activeTab === 'worksheet' && (
            <div className="space-y-4">
              <WorksheetBuilderWidget
                dataSource={dataSource}
                salesData={filteredSalesData}
                playersData={playersData}
                columnPills={columnPills}
                rowPills={rowPills}
                chartType={chartType}
                setChartType={setChartType}
                onAddPillToShelf={handleAddPillToShelf}
              />
            </div>
          )}

          {/* TAB 5: DATA SOURCES & SCHEMA INSPECTOR */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <DataSourceInspector
                dataSource={dataSource}
                setDataSource={setDataSource}
                salesData={filteredSalesData}
                playersData={playersData}
                onUploadCustomCsv={(data) => {
                  setCustomCsvData(data);
                  setDataSource('custom');
                }}
                onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
              />
            </div>
          )}
        </main>
      </div>

      {/* Google Sheets Live Sync Modal (With User Confirmation Dialog) */}
      <GoogleSheetsSyncModal
        isOpen={isSheetsModalOpen}
        onClose={() => setIsSheetsModalOpen(false)}
        user={user}
        setUser={setUser}
        salesData={filteredSalesData}
        forecastPoints={forecastPoints}
        onImportSheetData={handleImportSheetData}
      />

      {/* Export & Workbook Download Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        salesData={filteredSalesData}
        forecastPoints={forecastPoints}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
      />
    </div>
  );
}
