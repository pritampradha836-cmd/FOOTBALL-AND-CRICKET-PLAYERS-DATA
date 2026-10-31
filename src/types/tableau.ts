export type DataSourceType = 'sales' | 'players' | 'sheets' | 'custom';

export interface SalesRecord {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  region: 'North America' | 'EMEA' | 'APAC' | 'Latin America';
  subRegion: string;
  segment: 'Enterprise' | 'Mid-Market' | 'SMB' | 'Consumer';
  category: 'Cloud Services' | 'Hardware' | 'Software Licenses' | 'Consulting';
  subCategory: string;
  sales: number;
  profit: number;
  cost: number;
  quantity: number;
  discount: number; // 0 to 0.4
  target: number;
  customer: string;
  orderPriority: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface PlayerRecord {
  rk: number;
  player: string;
  nation: string;
  pos: string;
  squad: string;
  comp: string;
  age: number;
  born: number;
  mp: number;
  starts: number;
  min: number;
  nineties: number;
  gls: number;
  ast: number;
  ga: number;
  sh: number;
  sot: number;
  ppm: number;
  tklw: number;
  [key: string]: any;
}

export interface ForecastPoint {
  date: string;
  historical?: number;
  forecast: number;
  confidenceLow80: number;
  confidenceHigh80: number;
  confidenceLow95: number;
  confidenceHigh95: number;
  isHistorical: boolean;
  trend: number;
  seasonality: number;
}

export interface RegionalMetric {
  region: string;
  sales: number;
  target: number;
  profit: number;
  profitMargin: number;
  attainment: number;
  dealsCount: number;
  growthRate: number;
  colorHex: string;
}

export type PillType = 'dimension' | 'measure';

export interface TableauPill {
  id: string;
  label: string;
  field: string;
  type: PillType;
  aggregation?: 'SUM' | 'AVG' | 'COUNT' | 'MIN' | 'MAX' | 'MEDIAN';
  colorHex?: string;
}

export type ChartType = 
  | 'line'
  | 'bar'
  | 'heatmap'
  | 'forecast'
  | 'scatter'
  | 'treemap'
  | 'bullet'
  | 'waterfall';

export interface TableauFilter {
  field: string;
  values: string[];
  range?: [number, number];
}

export interface ScenarioParams {
  growthRateMultiplier: number; // e.g. 1.0 = normal, 1.15 = +15%
  priceAdjustmentPercent: number; // e.g. +5% or -10%
  marketingSpendMultiplier: number; // 0.8 to 1.5
  seasonalityStrength: number; // 0 to 1
  forecastHorizonDays: 30 | 60 | 90 | 180 | 365;
  confidenceLevel: 80 | 95;
}
