import { supabase } from '../supabase';
import type { Strategy } from '../../types';

export async function getStrategies(): Promise<Strategy[]> {
  const { data, error } = await supabase.from('strategies').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Strategy[];
}

export async function createStrategy(input: Partial<Strategy>) {
  const { data, error } = await supabase
    .from('strategies')
    .insert({ ...input, user_id: (await supabase.auth.getUser()).data.user?.id })
    .select()
    .single();

  if (error) throw error;
  return data as Strategy;
}

export async function updateStrategy(id: string, input: Partial<Strategy>) {
  const { data, error } = await supabase
    .from('strategies')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Strategy;
}

export async function deleteStrategy(id: string) {
  const { error } = await supabase.from('strategies').delete().eq('id', id);
  if (error) throw error;
}
