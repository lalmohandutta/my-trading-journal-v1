import { supabase } from '../supabase';
import type { JournalEntry } from '../../types';

export async function getJournalEntries(): Promise<JournalEntry[]> {
  const { data, error } = await supabase.from('journal_entries').select('*').order('entry_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as JournalEntry[];
}

export async function createJournalEntry(input: Partial<JournalEntry>) {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ ...input, user_id: (await supabase.auth.getUser()).data.user?.id })
    .select()
    .single();

  if (error) throw error;
  return data as JournalEntry;
}

export async function updateJournalEntry(id: string, input: Partial<JournalEntry>) {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as JournalEntry;
}

export async function deleteJournalEntry(id: string) {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) throw error;
}
