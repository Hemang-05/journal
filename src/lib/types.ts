// ==============================================================================
// TRADING JOURNAL - CORE TYPES & DATA CONTRACTS
// ==============================================================================

export type Direction = 'Long' | 'Short';
export type PositionSizeMethod = 'manual' | 'auto';

export type InstrumentType =
  | 'Stock'
  | 'NIFTY'
  | 'BANKNIFTY'
  | 'FINNIFTY'
  | 'Futures'
  | 'Options'
  | 'Forex'
  | 'Crypto'
  | 'Commodity'
  | 'Other';

export type MarketCondition =
  | 'Trending'
  | 'Sideways'
  | 'Volatile'
  | 'Low Volatility'
  | 'Choppy'
  | 'Range Bound';

export type Timeframe =
  | '1m'
  | '3m'
  | '5m'
  | '15m'
  | '30m'
  | '1H'
  | '4H'
  | 'Daily'
  | 'Other';

export type BeforeEmotion =
  | 'Confident'
  | 'Neutral'
  | 'Fearful'
  | 'Greedy'
  | 'FOMO'
  | 'Revenge'
  | 'Excited'
  | 'Uncertain'
  | 'Other';

export type DuringEmotion =
  | 'Calm'
  | 'Nervous'
  | 'Fearful'
  | 'Greedy'
  | 'Impatient'
  | 'Confident'
  | 'Other';

export type AfterEmotion =
  | 'Satisfied'
  | 'Frustrated'
  | 'Regret'
  | 'Calm'
  | 'Excited'
  | 'Angry'
  | 'Neutral'
  | 'Other';

export const COMMON_STRATEGIES = [
  'Breakout',
  'Pullback',
  'Support/Resistance',
  'Trend Following',
  'Reversal',
  'Momentum',
  'Mean Reversion',
  'VWAP',
  'Moving Average',
  'Options Strategy',
  'Scalping',
  'Swing',
  'Other',
] as const;

export const COMMON_MISTAKES = [
  'Early Entry',
  'Late Entry',
  'Early Exit',
  'Late Exit',
  'Moved Stop Loss',
  'Ignored Stop Loss',
  'Overtrading',
  'Revenge Trading',
  'FOMO',
  'Oversized Position',
  'No Confirmation',
  'Chased Trade',
  'Followed Plan',
  'Perfect Execution',
  'Other',
] as const;

export interface Trade {
  id: string;
  user_id?: string;
  trade_date: string; // YYYY-MM-DD
  entry_time: string; // HH:mm or ISO
  exit_time?: string | null;
  instrument: string;
  instrument_type: InstrumentType;
  direction: Direction;
  quantity: number;
  entry_price: number;
  exit_price?: number | null;
  stop_loss?: number | null;
  target?: number | null;
  account_capital?: number | null;
  risk_percent?: number | null;
  risk_amount?: number | null;
  planned_rr?: number | null;
  actual_rr?: number | null;
  position_size_method: PositionSizeMethod;
  gross_pnl?: number | null;
  gross_pnl_percent?: number | null;
  brokerage: number;
  charges: number;
  net_pnl?: number | null;
  net_pnl_percent?: number | null;
  r_multiple?: number | null;
  mae?: number | null;
  mfe?: number | null;
  strategy: string;
  custom_strategy?: string | null;
  entry_reason?: string | null;
  market_condition?: MarketCondition | string | null;
  timeframe?: Timeframe | string | null;
  entry_screenshot_url?: string | null;
  exit_screenshot_url?: string | null;
  before_emotion?: BeforeEmotion | string | null;
  during_emotion?: DuringEmotion | string | null;
  after_emotion?: AfterEmotion | string | null;
  plan_followed: boolean;
  fomo: boolean;
  revenge_trading: boolean;
  overtrading: boolean;
  early_exit: boolean;
  psychology_notes?: string | null;
  what_went_well?: string | null;
  what_went_wrong?: string | null;
  learning?: string | null;
  next_time?: string | null;
  mistake_tags: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Profile {
  id: string;
  name?: string | null;
  initial_capital: number;
  currency: string;
  created_at?: string;
  updated_at?: string;
}

export type TimeframeFilter = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all';

export interface FilterOptions {
  timeframe: TimeframeFilter;
  search: string;
  instrument: string;
  strategy: string;
  direction: 'All' | 'Long' | 'Short';
  marketCondition: string;
  result: 'All' | 'Winning' | 'Losing' | 'BreakEven';
  psychologyTag: 'All' | 'fomo' | 'revenge' | 'overtrading' | 'early_exit' | 'plan_followed' | 'plan_not_followed';
  startDate?: string;
  endDate?: string;
}

export interface PerformanceStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number; // 0 to 100
  lossRate: number; // 0 to 100
  grossProfit: number;
  grossLoss: number;
  totalCharges: number;
  netPnl: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  averageR: number;
  expectancy: number;
  peakEquity: number;
  currentEquity: number;
  currentDrawdown: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  planAdherenceRate: number;
  bestStrategy: string;
  worstStrategy: string;
  bestTimeSlot: string;
  worstTimeSlot: string;
  bestDayOfWeek: string;
  worstDayOfWeek: string;
}

export interface EquityPoint {
  date: string;
  tradeNumber: number;
  pnl: number;
  cumulativeNetPnl: number;
  peak: number;
  drawdown: number;
  instrument: string;
}

export interface DailyPnlPoint {
  date: string;
  pnl: number;
  tradesCount: number;
  winRate: number;
}

export interface StrategyPerformanceItem {
  strategy: string;
  trades: number;
  winRate: number;
  netPnl: number;
  averagePnl: number;
  averageR: number;
  profitFactor: number;
}

export interface TimeSlotPerformanceItem {
  slot: string;
  trades: number;
  winRate: number;
  netPnl: number;
  averageR: number;
}

export interface DayOfWeekPerformanceItem {
  day: string;
  trades: number;
  winRate: number;
  netPnl: number;
}

export interface PsychologyComparisonItem {
  category: string;
  trades: number;
  winRate: number;
  netPnl: number;
  avgPnl: number;
}

export interface MistakeAnalysisItem {
  tag: string;
  count: number;
  netPnlImpact: number;
}
