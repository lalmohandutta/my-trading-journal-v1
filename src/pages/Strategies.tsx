import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Strategy } from '../types';

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchStrategies = async () => {
    const { data, error } = await supabase.from('strategies').select('*').order('created_at', { ascending: false });
    if (!error) setStrategies((data ?? []) as Strategy[]);
  };

  useEffect(() => {
    fetchStrategies().finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (editingId) {
      await supabase.from('strategies').update({ name, description, updated_at: new Date().toISOString() }).eq('id', editingId);
    } else {
      await supabase.from('strategies').insert({ name, description, active: true });
    }
    setName('');
    setDescription('');
    setEditingId(null);
    fetchStrategies();
  };

  const toggleStrategy = async (id: string, active: boolean) => {
    await supabase.from('strategies').update({ active: !active }).eq('id', id);
    fetchStrategies();
  };

  const removeStrategy = async (id: string) => {
    const confirmed = window.confirm('Delete this strategy?');
    if (!confirmed) return;
    await supabase.from('strategies').delete().eq('id', id);
    fetchStrategies();
  };

  if (loading) {
    return <div className="space-y-3"><div className="h-16 rounded-xl bg-slate-800 animate-pulse" /><div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-32 rounded-xl bg-slate-800 animate-pulse" />)}</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h2 className="text-xl font-semibold text-white">Strategies</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 text-lg font-semibold text-white">{editingId ? 'Edit Strategy' : 'Create Strategy'}</div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Description</span>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950">
              <Plus size={15} /> {editingId ? 'Save Changes' : 'Add Strategy'}
            </button>
          </div>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {strategies.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-slate-400 md:col-span-2">No strategies yet.</div> : strategies.map((strategy) => (
            <div key={strategy.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-white">{strategy.name}</div>
                  <div className="mt-1 text-xs text-slate-400">{strategy.active ? 'Active' : 'Inactive'}</div>
                </div>
                <button type="button" onClick={() => toggleStrategy(strategy.id, strategy.active)} className="text-slate-300">
                  {strategy.active ? <ToggleRight size={18} className="text-emerald-400" /> : <ToggleLeft size={18} className="text-slate-500" />}
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-300">{strategy.description || 'No description provided.'}</p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => { setName(strategy.name); setDescription(strategy.description ?? ''); setEditingId(strategy.id); }} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-300"><Pencil size={12} /> Edit</button>
                <button type="button" onClick={() => removeStrategy(strategy.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-500/50 px-2 py-1 text-xs text-red-400"><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
