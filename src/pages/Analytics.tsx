import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Trade } from '../types';
import { supabase } from '../lib/supabase';
import { getAnalyticsMetrics } from '../lib/services/analyticsService';
import { formatCurrency, formatPnl } from '../utils/format';

export default function AnalyticsPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('trades').select('*');
      if (!error) setTrades((data ?? []) as Trade[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const metrics = useMemo(() => getAnalyticsMetrics(trades), [trades]);
  const pieData = [
    { name: 'Wins', value: metrics.winningTrades },
    { name: 'Losses', value: metrics.losingTrades },
  ];

  const moneyFormatter = (value: number | string | readonly (number | string)[] | undefined) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    return formatCurrency(Number(normalized ?? 0));
  };

  if (loading) {
    return <div className="space-y-3"><div className="h-20 rounded-xl bg-slate-800 animate-pulse" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-24 rounded-xl bg-slate-800 animate-pulse" />)}</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h2 className="text-xl font-semibold text-white">Performance Summary</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Trades" value={String(metrics.totalTrades)} />
        <StatCard label="Winning Trades" value={String(metrics.winningTrades)} />
        <StatCard label="Losing Trades" value={String(metrics.losingTrades)} />
        <StatCard label="Win Rate" value={`${metrics.winRate.toFixed(1)}%`} />
        <StatCard label="Net P&L" value={formatPnl(metrics.netPnl)} accent="green" />
        <StatCard label="Gross Profit" value={formatPnl(metrics.grossProfit)} accent="green" />
        <StatCard label="Gross Loss" value={formatPnl(-metrics.grossLoss)} accent="red" />
        <StatCard label="Profit Factor" value={metrics.profitFactor === Number.POSITIVE_INFINITY ? '∞' : metrics.profitFactor.toFixed(2)} />
        <StatCard label="Average Win" value={formatPnl(metrics.averageWin)} accent="green" />
        <StatCard label="Average Loss" value={formatPnl(-metrics.averageLoss)} accent="red" />
        <StatCard label="Expectancy" value={formatPnl(metrics.expectancy)} />
        <StatCard label="Max Drawdown" value={formatPnl(metrics.maxDrawdown)} accent="red" />
        <StatCard label="Average R" value={metrics.averageR.toFixed(2)} />
        <StatCard label="Best Trade" value={formatPnl(metrics.bestTrade)} accent="green" />
        <StatCard label="Worst Trade" value={formatPnl(metrics.worstTrade)} accent="red" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Equity Curve"><ResponsiveContainer width="100%" height={250}><BarChart data={trades.filter((trade) => trade.status === 'CLOSED').map((trade) => ({ date: trade.trade_date, value: Number(trade.net_pnl ?? 0) }))}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} /><Tooltip formatter={moneyFormatter} /><Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#38bdf8" /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Monthly P&L"><ResponsiveContainer width="100%" height={250}><BarChart data={trades.filter((trade) => trade.status === 'CLOSED').map((trade) => ({ month: trade.trade_date.slice(0, 7), value: Number(trade.net_pnl ?? 0) }))}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} /><Tooltip formatter={moneyFormatter} /><Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#22c55e" /></BarChart></ResponsiveContainer></ChartCard>
        <ChartCard title="Win vs Loss"><ResponsiveContainer width="100%" height={250}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" outerRadius={80}><Cell fill="#22c55e" /><Cell fill="#ef4444" /></Pie><Tooltip /></PieChart></ResponsiveContainer></ChartCard>
        <ChartCard title="P&L by Strategy"><ResponsiveContainer width="100%" height={250}><BarChart data={trades.filter((trade) => trade.status === 'CLOSED').map((trade) => ({ name: trade.symbol, value: Number(trade.net_pnl ?? 0) }))}><CartesianGrid stroke="#1e293b" strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} /><YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} /><Tooltip formatter={moneyFormatter} /><Bar dataKey="value" fill="#38bdf8" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></ChartCard>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: 'green' | 'red' }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`mt-3 text-2xl font-semibold ${accent === 'green' ? 'text-emerald-400' : accent === 'red' ? 'text-red-400' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <h3 className="mb-4 text-lg font-semibold text-white">{title}</h3>
      {children}
    </div>
  );
}
