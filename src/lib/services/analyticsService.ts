import type { Trade, Strategy } from '../../types';
import {
  calculateAverageLoss,
  calculateAverageR,
  calculateAverageWin,
  calculateExpectancy,
  calculateMaxDrawdown,
  calculateMonthlyPnl,
  calculateProfitFactor,
  calculateWinRate,
} from '../calculations';

export const getDashboardMetrics = (trades: Trade[], strategies: Strategy[] = []) => {
  const closed = trades.filter((trade) => trade.status === 'CLOSED');
  const netPnl = closed.reduce((sum, trade) => sum + Number(trade.net_pnl ?? 0), 0);
  let previousPeriodNetPnl = 0;
  if (closed.length > 1) {
    previousPeriodNetPnl = closed.slice(0, Math.max(1, Math.ceil(closed.length / 2))).reduce((sum, trade) => sum + Number(trade.net_pnl ?? 0), 0);
  }
  const currentWinRate = calculateWinRate(closed as Trade[]);
  const profitFactor = calculateProfitFactor(closed as Trade[]);
  const maxDrawdown = calculateMaxDrawdown(closed as Trade[]);
  const planAdherence = closed.length ? (closed.filter((trade) => trade.followed_plan).length / closed.length) * 100 : 0;

  return {
    netPnl,
    winRate: currentWinRate,
    profitFactor: Number.isFinite(profitFactor) ? profitFactor : 0,
    maxDrawdown,
    totalTrades: closed.length,
    winningTrades: closed.filter((trade) => Number(trade.net_pnl ?? 0) > 0).length,
    losingTrades: closed.filter((trade) => Number(trade.net_pnl ?? 0) < 0).length,
    planAdherence,
    previousPeriodNetPnl,
    strategyCount: strategies.length,
  };
};

export const getAnalyticsMetrics = (trades: Trade[]) => {
  const closed = trades.filter((trade) => trade.status === 'CLOSED');
  const netPnl = closed.reduce((sum, trade) => sum + Number(trade.net_pnl ?? 0), 0);
  const grossProfit = closed.filter((trade) => Number(trade.net_pnl ?? 0) > 0).reduce((sum, trade) => sum + Number(trade.net_pnl ?? 0), 0);
  const grossLoss = Math.abs(closed.filter((trade) => Number(trade.net_pnl ?? 0) < 0).reduce((sum, trade) => sum + Number(trade.net_pnl ?? 0), 0));

  return {
    totalTrades: closed.length,
    winningTrades: closed.filter((trade) => Number(trade.net_pnl ?? 0) > 0).length,
    losingTrades: closed.filter((trade) => Number(trade.net_pnl ?? 0) < 0).length,
    winRate: calculateWinRate(closed as Trade[]),
    netPnl,
    grossProfit,
    grossLoss,
    profitFactor: calculateProfitFactor(closed as Trade[]),
    averageWin: calculateAverageWin(closed as Trade[]),
    averageLoss: calculateAverageLoss(closed as Trade[]),
    expectancy: calculateExpectancy(closed as Trade[]),
    maxDrawdown: calculateMaxDrawdown(closed as Trade[]),
    averageR: calculateAverageR(closed as Trade[]),
    bestTrade: closed.reduce((max, trade) => Math.max(max, Number(trade.net_pnl ?? 0)), 0),
    worstTrade: closed.reduce((min, trade) => Math.min(min, Number(trade.net_pnl ?? 0)), 0),
  };
};

export const getMonthlyChartData = (trades: Trade[]) => {
  const monthly = calculateMonthlyPnl(trades);
  return Object.entries(monthly).map(([key, value]) => ({
    month: key,
    pnl: value,
  }));
};
