import type { Trade } from '../types';

export function calculateGrossPnl(trade: Pick<Trade, 'direction' | 'entry_price' | 'exit_price' | 'quantity'>): number {
  if (!trade.entry_price || !trade.exit_price || trade.quantity <= 0) return 0;

  const gross = trade.direction === 'Long'
    ? (trade.exit_price - trade.entry_price) * trade.quantity
    : (trade.entry_price - trade.exit_price) * trade.quantity;

  return Number(gross.toFixed(2));
}

export function calculateNetPnl(trade: Pick<Trade, 'direction' | 'entry_price' | 'exit_price' | 'quantity' | 'charges'>): number {
  return Number((calculateGrossPnl(trade) - (trade.charges ?? 0)).toFixed(2));
}

export function calculateRiskAmount(trade: Pick<Trade, 'entry_price' | 'quantity' | 'stop_loss'>): number {
  if (!trade.stop_loss) return 0;
  const amount = Math.abs(trade.entry_price - trade.stop_loss) * trade.quantity;
  return Number(amount.toFixed(2));
}

export function calculateRMultiple(trade: Pick<Trade, 'net_pnl' | 'risk_amount'>): number {
  const riskAmount = trade.risk_amount ?? 0;
  if (!riskAmount || riskAmount <= 0) return 0;
  return Number(((trade.net_pnl ?? 0) / riskAmount).toFixed(2));
}

export function calculateWinRate(trades: Pick<Trade, 'net_pnl' | 'status'>[]): number {
  const closed = trades.filter((trade) => trade.status === 'CLOSED');
  if (closed.length === 0) return 0;
  const wins = closed.filter((trade) => (trade.net_pnl ?? 0) > 0).length;
  return Number(((wins / closed.length) * 100).toFixed(1));
}

export function calculateProfitFactor(trades: Pick<Trade, 'net_pnl' | 'gross_pnl' | 'status'>[]): number {
  const closed = trades.filter((trade) => trade.status === 'CLOSED');
  const grossWins = closed.filter((trade) => (trade.gross_pnl ?? 0) > 0).reduce((sum, trade) => sum + Math.max(0, trade.gross_pnl ?? 0), 0);
  const grossLosses = closed.filter((trade) => (trade.gross_pnl ?? 0) < 0).reduce((sum, trade) => sum + Math.abs(Math.min(0, trade.gross_pnl ?? 0)), 0);
  if (grossLosses === 0) return grossWins > 0 ? Number.POSITIVE_INFINITY : 0;
  return Number((grossWins / grossLosses).toFixed(2));
}

export function calculateAverageWin(trades: Pick<Trade, 'net_pnl' | 'status'>[]): number {
  const wins = trades.filter((trade) => trade.status === 'CLOSED' && (trade.net_pnl ?? 0) > 0);
  if (wins.length === 0) return 0;
  return Number((wins.reduce((sum, trade) => sum + (trade.net_pnl ?? 0), 0) / wins.length).toFixed(2));
}

export function calculateAverageLoss(trades: Pick<Trade, 'net_pnl' | 'status'>[]): number {
  const losses = trades.filter((trade) => trade.status === 'CLOSED' && (trade.net_pnl ?? 0) < 0);
  if (losses.length === 0) return 0;
  return Number((Math.abs(losses.reduce((sum, trade) => sum + (trade.net_pnl ?? 0), 0)) / losses.length).toFixed(2));
}

export function calculateExpectancy(trades: Pick<Trade, 'net_pnl' | 'status'>[]): number {
  const closed = trades.filter((trade) => trade.status === 'CLOSED');
  if (closed.length === 0) return 0;
  const total = closed.reduce((sum, trade) => sum + (trade.net_pnl ?? 0), 0);
  return Number((total / closed.length).toFixed(2));
}

export function calculateMaxDrawdown(trades: Pick<Trade, 'net_pnl' | 'status' | 'trade_date'>[], sortByDate = true): number {
  const closed = [...trades].filter((trade) => trade.status === 'CLOSED');
  if (sortByDate) {
    closed.sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
  }
  let running = 0;
  let peak = 0;
  let worst = 0;

  for (const trade of closed) {
    running += Number(trade.net_pnl ?? 0);
    if (running > peak) peak = running;
    const drawdown = peak - running;
    if (drawdown > worst) worst = drawdown;
  }

  return Number(worst.toFixed(2));
}

export function calculateMonthlyPnl(trades: Pick<Trade, 'trade_date' | 'net_pnl' | 'status'>[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const trade of trades.filter((item) => item.status === 'CLOSED')) {
    const date = new Date(trade.trade_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    result[key] = (result[key] ?? 0) + Number(trade.net_pnl ?? 0);
  }
  return result;
}

export function calculateEquityCurve(trades: Pick<Trade, 'trade_date' | 'net_pnl' | 'status'>[]): Array<{ date: string; cumulative: number; net: number }> {
  const ordered = [...trades].filter((trade) => trade.status === 'CLOSED').sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());
  let cumulative = 0;
  return ordered.map((trade) => {
    cumulative += Number(trade.net_pnl ?? 0);
    return {
      date: trade.trade_date,
      cumulative: Number(cumulative.toFixed(2)),
      net: Number((trade.net_pnl ?? 0).toFixed(2)),
    };
  });
}

export function calculateAverageR(trades: Pick<Trade, 'r_multiple' | 'status'>[]): number {
  const closed = trades.filter((trade) => trade.status === 'CLOSED' && Number.isFinite(trade.r_multiple));
  if (closed.length === 0) return 0;
  const total = closed.reduce((sum, trade) => sum + Number(trade.r_multiple ?? 0), 0);
  return Number((total / closed.length).toFixed(2));
}

export function calculateStrategyPerformance(trades: Pick<Trade, 'strategy_id' | 'net_pnl' | 'status'>[], strategyNameMap: Record<string, string>) {
  const grouped: Record<string, { netPnl: number; wins: number; total: number; profitFactor: number }> = {};

  for (const trade of trades.filter((item) => item.status === 'CLOSED')) {
    const key = trade.strategy_id ?? 'Unassigned';
    const current = grouped[key] ?? { netPnl: 0, wins: 0, total: 0, profitFactor: 1 };
    current.netPnl += Number(trade.net_pnl ?? 0);
    current.total += 1;
    if ((trade.net_pnl ?? 0) > 0) current.wins += 1;
    grouped[key] = current;
  }

  return Object.entries(grouped).map(([strategyId, stats]) => ({
    strategyId,
    strategyName: strategyNameMap[strategyId] ?? 'Unassigned',
    netPnl: Number(stats.netPnl.toFixed(2)),
    winRate: Number(((stats.wins / stats.total) * 100).toFixed(1)),
    trades: stats.total,
    profitFactor: stats.profitFactor,
  }));
}

export function calculateSymbolPerformance(trades: Pick<Trade, 'symbol' | 'net_pnl' | 'status'>[]) {
  const grouped: Record<string, number> = {};
  for (const trade of trades.filter((item) => item.status === 'CLOSED')) {
    grouped[trade.symbol] = (grouped[trade.symbol] ?? 0) + Number(trade.net_pnl ?? 0);
  }
  return Object.entries(grouped).map(([symbol, netPnl]) => ({ symbol, netPnl: Number(netPnl.toFixed(2)) }));
}

export function calculateDayOfWeekPerformance(trades: Pick<Trade, 'trade_date' | 'net_pnl' | 'status'>[]) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = labels.map((label, index) => ({ day: label, value: 0, index }));
  for (const trade of trades.filter((item) => item.status === 'CLOSED')) {
    const dayIndex = new Date(trade.trade_date).getDay();
    data[dayIndex].value += Number(trade.net_pnl ?? 0);
  }
  return data;
}
