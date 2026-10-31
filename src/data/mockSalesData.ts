import { SalesRecord, ForecastPoint, RegionalMetric, ScenarioParams } from '../types/tableau';

export const REGIONS = ['North America', 'EMEA', 'APAC', 'Latin America'] as const;
export const CATEGORIES = ['Cloud Services', 'Hardware', 'Software Licenses', 'Consulting'] as const;
export const SEGMENTS = ['Enterprise', 'Mid-Market', 'SMB', 'Consumer'] as const;

export const SUB_REGIONS: Record<string, string[]> = {
  'North America': ['US West', 'US East', 'US Central', 'Canada'],
  'EMEA': ['United Kingdom', 'Germany & DACH', 'Nordics', 'France & Benelux', 'Southern Europe'],
  'APAC': ['Japan', 'Australia & NZ', 'Singapore & SE Asia', 'India'],
  'Latin America': ['Brazil', 'Mexico', 'Chile & Andean', 'Argentina'],
};

export const SUB_CATEGORIES: Record<string, string[]> = {
  'Cloud Services': ['Compute Nodes', 'Managed DBs', 'AI/ML Compute', 'Object Storage'],
  'Hardware': ['Edge Servers', 'Networking Switches', 'Security Gateways', 'Workstations'],
  'Software Licenses': ['Tableau Enterprise', 'BI Embedded Server', 'Data Prep Conductor', 'Analyst Desktop'],
  'Consulting': ['Data Governance', 'Cloud Migration', 'Architecture Review', 'Custom Dashboards'],
};

const CUSTOMERS = [
  'Acme Global Corp', 'Starlight Technologies', 'Apex Financial', 'Novacorp Industries',
  'Summit Healthcare', 'Omni Retail Group', 'Horizon Logistics', 'Vanguard Aerospace',
  'Pulse BioMed', 'Pinnacle Capital', 'Aether Mobility', 'Crestline Media',
  'Helios Renewable Energy', 'Matrix CyberSystems', 'BluePeak Telecom', 'Quantum Dynamics'
];

// Generate 18 months of rich historical data
export const generateHistoricalSales = (): SalesRecord[] => {
  const records: SalesRecord[] = [];
  const now = new Date(2026, 9, 30); // 2026-10-30 based on current timestamp
  let idCounter = 1;

  for (let monthOffset = 18; monthOffset >= 0; monthOffset--) {
    const d = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    // 25 - 45 transactions per month
    const txCount = 28 + Math.floor(Math.sin(monthOffset * 0.5) * 6) + (monthOffset === 0 ? 15 : 0);
    
    for (let i = 0; i < txCount; i++) {
      const day = Math.min(daysInMonth, 1 + Math.floor(Math.random() * daysInMonth));
      const txDate = new Date(d.getFullYear(), d.getMonth(), day);
      const dateStr = txDate.toISOString().slice(0, 10);

      const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
      const subRegionList = SUB_REGIONS[region];
      const subRegion = subRegionList[Math.floor(Math.random() * subRegionList.length)];

      const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const subCatList = SUB_CATEGORIES[category];
      const subCategory = subCatList[Math.floor(Math.random() * subCatList.length)];

      const segment = SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)];
      const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

      // Base amounts depending on segment
      let baseSales = segment === 'Enterprise' ? 24000 : segment === 'Mid-Market' ? 12000 : segment === 'SMB' ? 4500 : 1800;
      // Add trend upward (growth over 18 months)
      const trendMultiplier = 1 + (18 - monthOffset) * 0.025;
      // Seasonality (Q4 peak)
      const monthIndex = txDate.getMonth();
      const seasonMultiplier = (monthIndex === 10 || monthIndex === 11) ? 1.35 : (monthIndex === 0) ? 0.85 : 1.05;
      
      const sales = Math.round((baseSales * trendMultiplier * seasonMultiplier * (0.8 + Math.random() * 0.45)));
      const discount = Math.round((Math.random() * 0.25) * 100) / 100;
      const marginRatio = category === 'Cloud Services' ? 0.42 : category === 'Software Licenses' ? 0.65 : category === 'Consulting' ? 0.35 : 0.22;
      const profit = Math.round(sales * marginRatio * (1 - discount * 1.2));
      const cost = sales - profit;
      const target = Math.round(sales * (0.92 + Math.random() * 0.2));
      const quantity = Math.max(1, Math.floor(sales / (baseSales / 4)));

      const priorities: SalesRecord['orderPriority'][] = ['Critical', 'High', 'Medium', 'Low'];
      const orderPriority = priorities[Math.floor(Math.random() * priorities.length)];

      records.push({
        id: `TX-${idCounter++}`,
        date: dateStr,
        timestamp: txDate.getTime(),
        region,
        subRegion,
        segment,
        category,
        subCategory,
        sales,
        profit,
        cost,
        quantity,
        discount,
        target,
        customer,
        orderPriority,
      });
    }
  }

  return records.sort((a, b) => a.timestamp - b.timestamp);
};

// Generate next simulated real-time transaction
export const generateLiveTransaction = (counter: number): SalesRecord => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  const subRegionList = SUB_REGIONS[region];
  const subRegion = subRegionList[Math.floor(Math.random() * subRegionList.length)];
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const subCategory = SUB_CATEGORIES[category][Math.floor(Math.random() * SUB_CATEGORIES[category].length)];
  const segment = SEGMENTS[Math.floor(Math.random() * SEGMENTS.length)];
  const customer = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];

  const baseSales = segment === 'Enterprise' ? 26000 : segment === 'Mid-Market' ? 13500 : segment === 'SMB' ? 5000 : 2100;
  const sales = Math.round(baseSales * (0.85 + Math.random() * 0.6));
  const discount = Math.round(Math.random() * 0.2 * 100) / 100;
  const marginRatio = category === 'Software Licenses' ? 0.68 : category === 'Cloud Services' ? 0.45 : 0.28;
  const profit = Math.round(sales * marginRatio * (1 - discount));
  const cost = sales - profit;

  const priorities: SalesRecord['orderPriority'][] = ['Critical', 'High', 'Medium', 'Low'];
  const orderPriority = priorities[Math.floor(Math.random() * priorities.length)];

  return {
    id: `LIVE-${counter}`,
    date: dateStr,
    timestamp: now.getTime(),
    region,
    subRegion,
    segment,
    category,
    subCategory,
    sales,
    profit,
    cost,
    quantity: Math.max(1, Math.floor(Math.random() * 8) + 1),
    discount,
    target: Math.round(sales * 0.95),
    customer,
    orderPriority,
  };
};

// Holt-Winters Predictive Forecasting Engine
export const calculatePredictiveForecast = (
  historicalRecords: SalesRecord[],
  scenario: ScenarioParams
): ForecastPoint[] => {
  // Aggregate sales by month
  const monthlyTotals = new Map<string, number>();
  
  historicalRecords.forEach((r) => {
    const key = r.date.slice(0, 7); // YYYY-MM
    monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + r.sales);
  });

  const sortedMonths = Array.from(monthlyTotals.keys()).sort();
  const series = sortedMonths.map((m) => monthlyTotals.get(m)!);

  if (series.length === 0) return [];

  // Triple exponential smoothing calculation
  const alpha = 0.35; // level smoothing
  const beta = 0.20;  // trend smoothing
  const gamma = 0.25 * scenario.seasonalityStrength; // seasonal smoothing
  const seasonLength = 12;

  let level = series[0];
  let trend = (series[Math.min(series.length - 1, 3)] - series[0]) / Math.min(series.length - 1, 3);
  const seasonal: number[] = new Array(seasonLength).fill(1.0);

  // Initial seasonal indices
  for (let i = 0; i < seasonLength && i < series.length; i++) {
    seasonal[i] = series[i] / (level || 1);
  }

  const result: ForecastPoint[] = [];

  // 1. Historical points with fitted trend
  sortedMonths.forEach((monthStr, idx) => {
    const actual = series[idx];
    const sIdx = idx % seasonLength;
    const prevLevel = level;

    level = alpha * (actual / (seasonal[sIdx] || 1)) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    seasonal[sIdx] = gamma * (actual / level) + (1 - gamma) * seasonal[sIdx];

    result.push({
      date: monthStr,
      historical: actual,
      forecast: actual,
      confidenceLow80: actual,
      confidenceHigh80: actual,
      confidenceLow95: actual,
      confidenceHigh95: actual,
      isHistorical: true,
      trend: Math.round(level),
      seasonality: seasonal[sIdx],
    });
  });

  // Calculate residual standard deviation for confidence bands
  const residuals = result.map((r) => (r.historical || 0) - r.trend);
  const variance = residuals.reduce((acc, r) => acc + r * r, 0) / Math.max(1, residuals.length);
  const baseStdDev = Math.sqrt(variance) || 12000;

  // 2. Future Forecast projection
  const horizonMonths = Math.ceil(scenario.forecastHorizonDays / 30);
  const lastDate = new Date(sortedMonths[sortedMonths.length - 1] + '-01');

  // Scenario multipliers
  const effectiveGrowth = scenario.growthRateMultiplier; // e.g. 1.15
  // Price elasticity: price +5% might reduce volume 3%, net change depends on multiplier
  const priceVolumeEffect = 1 + (scenario.priceAdjustmentPercent * 0.4) / 100;
  const marketingEffect = 1 + (scenario.marketingSpendMultiplier - 1) * 0.35;
  const combinedScenarioMultiplier = effectiveGrowth * priceVolumeEffect * marketingEffect;

  for (let step = 1; step <= horizonMonths; step++) {
    const futureDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + step, 1);
    const dateStr = futureDate.toISOString().slice(0, 7);
    const sIdx = (sortedMonths.length + step - 1) % seasonLength;

    const projectedBase = (level + trend * step) * (seasonal[sIdx] || 1);
    const forecastVal = Math.round(projectedBase * combinedScenarioMultiplier);

    // Uncertainty increases with step horizon: sqrt(step)
    const uncertaintyFactor = Math.sqrt(step);
    const stdDevStep = baseStdDev * uncertaintyFactor;

    const z80 = 1.282;
    const z95 = 1.960;

    const confLow80 = Math.max(0, Math.round(forecastVal - z80 * stdDevStep));
    const confHigh80 = Math.round(forecastVal + z80 * stdDevStep);
    const confLow95 = Math.max(0, Math.round(forecastVal - z95 * stdDevStep));
    const confHigh95 = Math.round(forecastVal + z95 * stdDevStep);

    result.push({
      date: dateStr,
      forecast: forecastVal,
      confidenceLow80: confLow80,
      confidenceHigh80: confHigh80,
      confidenceLow95: confLow95,
      confidenceHigh95: confHigh95,
      isHistorical: false,
      trend: Math.round(level + trend * step),
      seasonality: seasonal[sIdx],
    });
  }

  return result;
};

// Compute regional KPIs & Heatmap aggregates
export const computeRegionalMetrics = (records: SalesRecord[]): RegionalMetric[] => {
  const map = new Map<string, { sales: number; target: number; profit: number; count: number }>();
  
  REGIONS.forEach((r) => map.set(r, { sales: 0, target: 0, profit: 0, count: 0 }));

  records.forEach((r) => {
    const cur = map.get(r.region) || { sales: 0, target: 0, profit: 0, count: 0 };
    cur.sales += r.sales;
    cur.target += r.target;
    cur.profit += r.profit;
    cur.count += 1;
    map.set(r.region, cur);
  });

  const colors: Record<string, string> = {
    'North America': '#1f77b4', // Tableau Blue
    'EMEA': '#ff7f0e',         // Tableau Orange
    'APAC': '#2ca02c',         // Tableau Green
    'Latin America': '#d62728', // Tableau Red
  };

  return Array.from(map.entries()).map(([region, val]) => {
    const attainment = val.target > 0 ? Math.round((val.sales / val.target) * 1000) / 10 : 100;
    const profitMargin = val.sales > 0 ? Math.round((val.profit / val.sales) * 1000) / 10 : 35;
    // Growth calculation
    const growthRate = +(12.4 + (region === 'APAC' ? 6.8 : region === 'North America' ? 4.2 : -1.8)).toFixed(1);

    return {
      region,
      sales: val.sales,
      target: val.target,
      profit: val.profit,
      profitMargin,
      attainment,
      dealsCount: val.count,
      growthRate,
      colorHex: colors[region] || '#4e79a7',
    };
  });
};

// Compute cross-tabulation matrix for Regional Performance Heatmap
export const computeRegionalHeatmapMatrix = (
  records: SalesRecord[],
  rowField: 'region' | 'subRegion' | 'segment',
  colField: 'category' | 'orderPriority' | 'segment',
  metric: 'sales' | 'profit' | 'margin' | 'attainment'
) => {
  const rowKeys = Array.from(new Set(records.map((r) => r[rowField]))).sort();
  const colKeys = Array.from(new Set(records.map((r) => r[colField]))).sort();

  const cellData: Record<string, Record<string, { value: number; count: number; profit: number; sales: number; target: number }>> = {};

  rowKeys.forEach((r) => {
    cellData[r] = {};
    colKeys.forEach((c) => {
      cellData[r][c] = { value: 0, count: 0, profit: 0, sales: 0, target: 0 };
    });
  });

  records.forEach((r) => {
    const row = r[rowField];
    const col = r[colField];
    if (cellData[row] && cellData[row][col]) {
      cellData[row][col].sales += r.sales;
      cellData[row][col].profit += r.profit;
      cellData[row][col].target += r.target;
      cellData[row][col].count += 1;
    }
  });

  // Calculate chosen metric & normalize
  let minVal = Infinity;
  let maxVal = -Infinity;

  const matrix: {
    row: string;
    col: string;
    value: number;
    sales: number;
    profit: number;
    margin: number;
    attainment: number;
    deals: number;
    normalized: number;
  }[] = [];

  rowKeys.forEach((r) => {
    colKeys.forEach((c) => {
      const cell = cellData[r][c];
      let val = 0;
      if (metric === 'sales') val = cell.sales;
      else if (metric === 'profit') val = cell.profit;
      else if (metric === 'margin') val = cell.sales > 0 ? (cell.profit / cell.sales) * 100 : 0;
      else if (metric === 'attainment') val = cell.target > 0 ? (cell.sales / cell.target) * 100 : 100;

      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;

      const margin = cell.sales > 0 ? Math.round((cell.profit / cell.sales) * 100) : 0;
      const attainment = cell.target > 0 ? Math.round((cell.sales / cell.target) * 100) : 100;

      matrix.push({
        row: r,
        col: c,
        value: Math.round(val),
        sales: cell.sales,
        profit: cell.profit,
        margin,
        attainment,
        deals: cell.count,
        normalized: 0,
      });
    });
  });

  const range = maxVal - minVal || 1;
  matrix.forEach((item) => {
    item.normalized = Math.max(0, Math.min(1, (item.value - minVal) / range));
  });

  return { rowKeys, colKeys, matrix, minVal, maxVal };
};
