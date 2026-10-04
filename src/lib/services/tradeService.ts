import { supabase } from '../supabase';
import type { Trade } from '../../types';

export async function getTrades(): Promise<Trade[]> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .order('trade_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Trade[];
}

export async function getTrade(id: string): Promise<Trade | null> {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return (data as Trade | null) ?? null;
}

export async function createTrade(input: Partial<Trade>) {
  const payload = {
    ...input,
    user_id: (await supabase.auth.getUser()).data.user?.id,
  };
  const { data, error } = await supabase.from('trades').insert(payload).select().single();
  if (error) throw error;
  return data as Trade;
}

export async function updateTrade(id: string, input: Partial<Trade>) {
  const { data, error } = await supabase
    .from('trades')
    .update(input)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Trade;
}

export async function deleteTrade(id: string) {
  const { error } = await supabase.from('trades').delete().eq('id', id);
  if (error) throw error;
}
