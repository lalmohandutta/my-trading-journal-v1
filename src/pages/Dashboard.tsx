import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, CalendarRange, Plus, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getDashboardMetrics, getMonthlyChartData } from '../lib/services/analyticsService';
import { generateTradingInsights } from '../lib/insights';
import { formatPnl, formatCurrency, formatPercentage } from '../utils/format';
import type { Strategy, Trade } from '../types';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<'month' | 'week' | 'year' | 'all'>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: tradesData }, { data: strategiesData }] = await Promise.all([
          supabase.from('trades').select('*').order('trade_date', { ascending: false }),
          supabase.from('strategies').select('*').order('created_at', { ascending: false }),
        ]);

        setTrades((tradesData ?? []) as Trade[]);
        setStrategies((strategiesData ?? []) as Strategy[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredTrades = useMemo(() => {
    if (range === 'all') return trades;
    const now = new Date();
    return trades.filter((trade) => {
      const date = new Date(trade.trade_date);
      if (range === 'week') {
        const diff = (now.getTime() - date.getTime()) / 86400000;
        return diff <= 7;
      }
      if (range === 'year') {
        return date.getFullYear() === now.getFullYear();
      }
      const monthDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      return monthDiff <= 1;
    });
  }, [range, trades]);

  const metrics = useMemo(() => getDashboardMetrics(filteredTrades, strategies), [filteredTrades, strategies]);
  const months = useMemo(() => getMonthlyChartData(filteredTrades), [filteredTrades]);
  const insights = useMemo(() => generateTradingInsights(filteredTrades, strategies), [filteredTrades, strategies]);
  const recentTrades = filteredTrades.slice(0, 8);

  const chartData = useMemo(() => {
    let cumulative = 0;
    return [...filteredTrades]
      .filter((trade) => trade.status === 'CLOSED')
      .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())
      .map((trade) => {
        cumulative += Number(trade.net_pnl ?? 0);
        return { date: trade.trade_date, cumulative };
      });
  }, [filteredTrades]);

  const moneyFormatter = (value: number | string | readonly (number | string)[] | undefined) => {
    const normalized = Array.isArray(value) ? value[0] : value;
    return formatCurrency(Number(normalized ?? 0));
  };

  if (loading) {
    return <div className="space-y-4"><div className="h-28 rounded-2xl bg-slate-800 animate-pulse" /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-32 rounded-2xl bg-slate-800 animate-pulse" />)}</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-sky-300">{getGreeting()}, Trader!</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Track your trades. Learn from your mistakes. Grow as a trader.</h2>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-300">
            <CalendarRange size={15} />
            <select value={range} onChange={(event) => setRange(event.target.value as 'month' | 'week' | 'year' | 'all')} className="bg-transparent outline-none">
              <option value="month">This Month</option>
              <option value="week">This Week</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Net P&L" value={formatPnl(metrics.netPnl)} change="▲ +12.4% vs previous period" positive={metrics.netPnl >= 0} />
        <KpiCard title="Win Rate" value={formatPercentage(metrics.winRate)} subtext={`${metrics.winningTrades} wins / ${metrics.totalTrades} trades`} positive={metrics.winRate >= 50} />
        <KpiCard title="Profit Factor" value={metrics.profitFactor === Number.POSITIVE_INFINITY ? '∞' : metrics.profitFactor.toFixed(2)} subtext="Gross profit / gross loss" positive={metrics.profitFactor >= 1} />
        <KpiCard title="Max Drawdown" value={formatPnl(metrics.maxDrawdown)} subtext="-3.2% of equity" negative />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Equity Curve</h3>
            <button type="button" className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300">Net P&L</button>
          </div>
          {chartData.length === 0 ? (
            <EmptyState onAdd={() => navigate('/trades')} />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="equityFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  <Tooltip formatter={moneyFormatter} labelFormatter={(label) => `Date: ${label}`} />
                  <Area type="monotone" dataKey="cumulative" stroke="#38bdf8" fillOpacity={1} fill="url(#equityFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Trading Insights</h3>
          <div className="space-y-3">
            {insights.length === 0 ? <p className="text-sm text-slate-400">Add more closed trades to unlock insights.</p> : insights.slice(0, 4).map((insight) => (
              <div key={insight.type} className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-sky-300">{insight.title}</div>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">{insight.severity}</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{insight.description}</p>
                {insight.metric && <div className="mt-2 text-xs text-sky-200">{insight.metric}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Monthly P&L</h3>
            <select className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-300">
              <option>2026</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                <Tooltip formatter={moneyFormatter} />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]} fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Trades</h3>
            <Link to="/trades" className="inline-flex items-center gap-1 text-sm text-sky-300">View All Trades <ArrowUpRight size={15} /></Link>
          </div>
          <div className="space-y-3">
            {recentTrades.length === 0 ? <p className="text-sm text-slate-400">No recent trades recorded yet.</p> : recentTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/40 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-white">{trade.symbol}</div>
                  <div className="text-xs text-slate-400">{trade.trade_date}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold ${Number(trade.net_pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPnl(Number(trade.net_pnl ?? 0))}</div>
                  <div className="text-[10px] text-slate-400">{trade.followed_plan ? 'Plan' : 'Off-plan'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, change, subtext, positive, negative }: { title: string; value: string; change?: string; subtext?: string; positive?: boolean; negative?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>{title}</span>
        <TrendingUp size={15} className={positive ? 'text-emerald-400' : negative ? 'text-red-400' : 'text-sky-400'} />
      </div>
      <div className="mt-4 text-3xl font-semibold text-white">{value}</div>
      {change ? <div className={`mt-2 text-xs ${positive ? 'text-emerald-400' : 'text-red-400'}`}>{change}</div> : null}
      {subtext ? <div className="mt-1 text-xs text-slate-400">{subtext}</div> : null}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 text-center">
      <div className="text-xl font-semibold text-white">No trades yet</div>
      <p className="mt-2 max-w-xs text-sm text-slate-400">Add your first trade to start building your equity curve.</p>
      <button type="button" onClick={onAdd} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950">
        <Plus size={15} /> Add Trade
      </button>
    </div>
  );
}
