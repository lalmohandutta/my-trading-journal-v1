import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { JournalEntry } from '../types';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchEntries = async () => {
    const { data, error } = await supabase.from('journal_entries').select('*').order('entry_date', { ascending: false });
    if (!error) setEntries((data ?? []) as JournalEntry[]);
  };

  useEffect(() => {
    fetchEntries().finally(() => setLoading(false));
  }, []);

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()), [entries]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    if (editingId) {
      await supabase.from('journal_entries').update({ title, content, entry_date: entryDate }).eq('id', editingId);
    } else {
      await supabase.from('journal_entries').insert({ title, content, entry_date: entryDate });
    }
    setTitle('');
    setContent('');
    setEntryDate(new Date().toISOString().slice(0, 10));
    setEditingId(null);
    fetchEntries();
  };

  const removeEntry = async (id: string) => {
    const confirmed = window.confirm('Delete this journal entry?');
    if (!confirmed) return;
    await supabase.from('journal_entries').delete().eq('id', id);
    fetchEntries();
  };

  if (loading) {
    return <div className="space-y-3"><div className="h-40 rounded-xl bg-slate-800 animate-pulse" /><div className="grid gap-4 md:grid-cols-2">{Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="h-32 rounded-xl bg-slate-800 animate-pulse" />)}</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <h2 className="text-xl font-semibold text-white">Journal</h2>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.4fr]">
        <form onSubmit={handleSave} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 text-lg font-semibold text-white">{editingId ? 'Edit Entry' : 'New Entry'}</div>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Date</span>
              <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm text-slate-300">Market Summary</span>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" />
            </label>
            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950">
              <Plus size={15} /> {editingId ? 'Save Entry' : 'Add Entry'}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {sortedEntries.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-slate-400">No journal entries yet.</div> : sortedEntries.map((entry) => (
            <article key={entry.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-sky-300">{new Date(entry.entry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  <h3 className="mt-2 text-xl font-semibold text-white">{entry.title}</h3>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => { setTitle(entry.title); setContent(entry.content); setEntryDate(entry.entry_date); setEditingId(entry.id); }} className="rounded-lg border border-slate-700 p-2 text-slate-300"><Pencil size={14} /></button>
                  <button type="button" onClick={() => removeEntry(entry.id)} className="rounded-lg border border-red-500/50 p-2 text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">{entry.content}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
