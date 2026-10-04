import { useEffect, useMemo, useState } from 'react';
import { FilePenLine, Plus, Trash2, Eye, Search, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatDate, formatPnl } from '../utils/format';
import type { Strategy, Trade } from '../types';

export default function TradesPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: tradesData }, { data: strategiesData }] = await Promise.all([
          supabase.from('trades').select('*').order('trade_date', { ascending: false }),
          supabase.from('strategies').select('*').order('name', { ascending: true }),
        ]);
        setTrades((tradesData ?? []) as Trade[]);
        setStrategies((strategiesData ?? []) as Strategy[]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredTrades = useMemo(() => {
    const query = search.toLowerCase();
    return trades.filter((trade) => {
      if (!query) return true;
      return [trade.symbol, trade.setup, trade.notes ?? ''].join(' ').toLowerCase().includes(query);
    });
  }, [search, trades]);

  const removeTrade = async (id: string) => {
    const confirmed = window.confirm('Delete this trade?\n\nThis action cannot be undone.');
    if (!confirmed) return;
    const { error } = await supabase.from('trades').delete().eq('id', id);
    if (!error) {
      setTrades((prev) => prev.filter((trade) => trade.id !== id));
      if (selectedTrade?.id === id) setSelectedTrade(null);
    }
  };

  if (loading) {
    return <div className="space-y-3"><div className="h-16 rounded-xl bg-slate-800 animate-pulse" /><div className="h-64 rounded-xl bg-slate-800 animate-pulse" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xl font-semibold text-white">Trades</div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950">
          <Plus size={16} /> Add Trade
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by symbol, setup, notes…" className="w-full rounded-xl border border-slate-700 bg-slate-950/60 pl-9 pr-3 py-2.5 text-sm text-white outline-none ring-0 placeholder:text-slate-500" />
          </div>
          <button type="button" className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-300">Filters</button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Symbol</th>
                <th className="py-3 pr-4">Side</th>
                <th className="py-3 pr-4">Entry</th>
                <th className="py-3 pr-4">Exit</th>
                <th className="py-3 pr-4">Qty</th>
                <th className="py-3 pr-4">P&L</th>
                <th className="py-3 pr-4">Strategy</th>
                <th className="py-3 pr-4">R</th>
                <th className="py-3 pr-4">Plan</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.length === 0 ? (
                <tr><td colSpan={12} className="py-10 text-center text-slate-400">No trades found.</td></tr>
              ) : filteredTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-slate-800/70 align-middle">
                  <td className="py-3 pr-4 text-slate-300">{formatDate(trade.trade_date)}</td>
                  <td className="py-3 pr-4 font-medium text-white">{trade.symbol}</td>
                  <td className="py-3 pr-4"><span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-1 text-[10px] uppercase text-sky-300">{trade.direction}</span></td>
                  <td className="py-3 pr-4 text-slate-300">{trade.entry_price}</td>
                  <td className="py-3 pr-4 text-slate-300">{trade.exit_price ?? '—'}</td>
                  <td className="py-3 pr-4 text-slate-300">{trade.quantity}</td>
                  <td className={`py-3 pr-4 font-semibold ${Number(trade.net_pnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatPnl(Number(trade.net_pnl ?? 0))}</td>
                  <td className="py-3 pr-4 text-slate-300">{strategies.find((item) => item.id === trade.strategy_id)?.name ?? '—'}</td>
                  <td className="py-3 pr-4 text-slate-300">{trade.r_multiple ?? '—'}</td>
                  <td className="py-3 pr-4"><span className={`rounded-full px-2 py-1 text-[10px] ${trade.followed_plan ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{trade.followed_plan ? 'Followed' : 'Violated'}</span></td>
                  <td className="py-3 pr-4"><span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase text-slate-300">{trade.status}</span></td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setSelectedTrade(trade)} className="rounded-lg border border-slate-700 p-1.5 text-slate-300"><Eye size={14} /></button>
                      <button type="button" className="rounded-lg border border-slate-700 p-1.5 text-slate-300"><FilePenLine size={14} /></button>
                      <button type="button" onClick={() => removeTrade(trade.id)} className="rounded-lg border border-red-500/50 p-1.5 text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-semibold text-white">{selectedTrade.symbol}</div>
                <div className="text-sm text-slate-400">{formatDate(selectedTrade.trade_date)}</div>
              </div>
              <button type="button" onClick={() => setSelectedTrade(null)} className="rounded-lg border border-slate-700 p-2 text-slate-300"><X size={16} /></button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoBlock label="Direction" value={selectedTrade.direction} />
              <InfoBlock label="Quantity" value={String(selectedTrade.quantity)} />
              <InfoBlock label="Entry" value={String(selectedTrade.entry_price)} />
              <InfoBlock label="Exit" value={selectedTrade.exit_price ? String(selectedTrade.exit_price) : '—'} />
              <InfoBlock label="P&L" value={formatPnl(Number(selectedTrade.net_pnl ?? 0))} />
              <InfoBlock label="Strategy" value={strategies.find((item) => item.id === selectedTrade.strategy_id)?.name ?? '—'} />
            </div>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{selectedTrade.notes || 'No notes recorded.'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="text-xs uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 text-sm text-white">{value}</div>
    </div>
  );
}
