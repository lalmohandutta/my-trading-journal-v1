export type TradeDirection = 'Long' | 'Short';
export type Segment = 'Equity' | 'Futures' | 'Options' | 'Commodity' | 'Currency' | 'Crypto';
export type InstrumentType = 'Stock' | 'Index' | 'Future' | 'Option';
export type OptionType = 'CE' | 'PE' | null;
export type TradeStatus = 'OPEN' | 'CLOSED';
export type DateRange = 'today' | 'week' | 'month' | 'lastMonth' | 'quarter' | 'year' | 'all' | 'custom';

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  rules?: string | null;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string;
  title: string;
  content: string;
  mood?: string | null;
  market_summary?: string | null;
  lessons?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface TradeTag {
  id: string;
  trade_id: string;
  user_id: string;
  tag: string;
  created_at?: string;
}

export interface Trade {
  id: string;
  user_id: string;
  trade_date: string;
  symbol: string;
  segment: Segment;
  instrument_type: InstrumentType;
  direction: TradeDirection;
  option_type?: OptionType;
  strike_price?: number | null;
  expiry_date?: string | null;
  quantity: number;
  entry_price: number;
  exit_price?: number | null;
  stop_loss?: number | null;
  target_price?: number | null;
  gross_pnl?: number | null;
  charges?: number;
  net_pnl?: number | null;
  risk_amount?: number | null;
  r_multiple?: number | null;
  strategy_id?: string | null;
  setup?: string | null;
  timeframe?: string | null;
  market_condition?: string | null;
  entry_reason?: string | null;
  exit_reason?: string | null;
  emotion?: string | null;
  mistake?: string | null;
  followed_plan?: boolean;
  notes?: string | null;
  screenshot_path?: string | null;
  status: TradeStatus;
  entry_time?: string | null;
  exit_time?: string | null;
  trade_rating?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardMetrics {
  netPnl: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  planAdherence: number;
}

export interface AnalyticsMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  netPnl: number;
  grossProfit: number;
  grossLoss: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  expectancy: number;
  maxDrawdown: number;
  averageR: number;
  bestTrade: number;
  worstTrade: number;
}

export interface TradingInsight {
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  metric?: string;
}

export interface UserProfile {
  id: string;
  email?: string | null;
  name?: string | null;
  full_name?: string | null;
}

export interface FormTradeInput {
  trade_date: string;
  symbol: string;
  segment: Segment;
  instrument_type: InstrumentType;
  direction: TradeDirection;
  option_type?: OptionType;
  strike_price?: string;
  expiry_date?: string;
  quantity: number;
  entry_price: number;
  exit_price?: number | null;
  stop_loss?: number | null;
  target_price?: number | null;
  charges: number;
  strategy_id: string;
  setup?: string;
  timeframe?: string;
  market_condition?: string;
  entry_reason?: string;
  exit_reason?: string;
  emotion?: string;
  mistake?: string;
  followed_plan: boolean;
  notes?: string;
  status: TradeStatus;
  trade_rating?: number;
}
