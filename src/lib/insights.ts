import type { Strategy, Trade, TradingInsight } from '../types';

const hasEnoughData = (trades: Trade[], minimum = 3) => trades.length >= minimum;

export function generateTradingInsights(trades: Trade[], strategies: Strategy[] = []): TradingInsight[] {
  const closed = trades.filter((trade) => trade.status === 'CLOSED');
  const insights: TradingInsight[] = [];

  if (hasEnoughData(closed, 3)) {
    const byStrategy = new Map<string, { netPnl: number; wins: number; total: number }>();
    for (const trade of closed) {
      const key = trade.strategy_id ?? 'Unassigned';
      const existing = byStrategy.get(key) ?? { netPnl: 0, wins: 0, total: 0 };
      existing.netPnl += Number(trade.net_pnl ?? 0);
      existing.total += 1;
      if ((trade.net_pnl ?? 0) > 0) existing.wins += 1;
      byStrategy.set(key, existing);
    }

    const best = [...byStrategy.entries()].sort((a, b) => b[1].netPnl - a[1].netPnl)[0];
    if (best) {
      const strategyName = strategies.find((item) => item.id === best[0])?.name ?? 'Unassigned';
      const winRate = (best[1].wins / best[1].total) * 100;
      insights.push({
        type: 'BEST_STRATEGY',
        title: 'Best Setup',
        description: `${strategyName} generated the highest historical net P&L in your recorded trades.`,
        severity: 'medium',
        metric: `${winRate.toFixed(0)}% win rate`,
      });
    }
  }

  if (closed.length >= 5) {
    const planAdherence = (closed.filter((trade) => trade.followed_plan).length / closed.length) * 100;
    if (planAdherence >= 60) {
      insights.push({
        type: 'PLAN_ADHERENCE',
        title: 'Plan Adherence',
        description: `Your trades are following the plan in ${planAdherence.toFixed(0)}% of closed trades.`,
        severity: 'low',
        metric: `${planAdherence.toFixed(0)}%`,
      });
    }
  }

  if (closed.length >= 4) {
    const avgLoss = closed.filter((trade) => (trade.net_pnl ?? 0) < 0).reduce((sum, trade) => sum + Math.abs(Number(trade.net_pnl ?? 0)), 0) / Math.max(1, closed.filter((trade) => (trade.net_pnl ?? 0) < 0).length);
    const largeLoss = closed.filter((trade) => (trade.net_pnl ?? 0) < 0 && Math.abs(Number(trade.net_pnl ?? 0)) > avgLoss * 1.5);
    if (largeLoss.length > 0) {
      insights.push({
        type: 'LARGE_LOSS',
        title: 'Large Loss Alert',
        description: 'This trade was significantly larger than your average losing trade.',
        severity: 'high',
        metric: `${Math.abs(Number(largeLoss[0].net_pnl ?? 0)).toLocaleString('en-IN')}`,
      });
    }
  }

  const stopLossMistakes = closed.filter((trade) => {
    const text = `${trade.mistake ?? ''} ${trade.exit_reason ?? ''}`.toLowerCase();
    return /moved stop|stop loss moved|ignored stop|widened stop|averaged down/.test(text);
  });
  if (stopLossMistakes.length > 0) {
    insights.push({
      type: 'STOP_LOSS_BEHAVIOR',
      title: 'Stop Loss Alert',
      description: 'One or more trades indicate stop-loss behaviour that may need review.',
      severity: 'high',
      metric: `${stopLossMistakes.length} trades`,
    });
  }

  if (closed.length >= 5) {
    const winRate = (closed.filter((trade) => Number(trade.net_pnl ?? 0) > 0).length / closed.length) * 100;
    if (winRate >= 60 || winRate <= 35) {
      insights.push({
        type: 'WIN_RATE',
        title: 'Performance Snapshot',
        description: `Your win rate is ${winRate.toFixed(0)}% across ${closed.length} closed trades.`,
        severity: 'medium',
        metric: `${winRate.toFixed(0)}%`,
      });
    }
  }

  return insights;
}
