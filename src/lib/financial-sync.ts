import { supabase } from '@/integrations/supabase/client';
import { Entry, Cost, EntrySource, CostClassification } from '@/lib/store';

export async function loadEntriesFromDB(): Promise<Entry[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    amount: Number(row.amount),
    date: row.date,
    createdAt: Number(row.created_at),
    description: row.description || undefined,
    category: row.category || undefined,
    source: (row.source || 'manual') as EntrySource,
  }));
}

export async function loadCostsFromDB(): Promise<Cost[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('costs')
    .select('*')
    .eq('user_id', user.id);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    amount: Number(row.amount),
    type: row.type as 'product' | 'business',
    classification: row.classification as CostClassification,
    spreadDays: row.spread_days,
    date: row.date,
    createdAt: Number(row.created_at),
    description: row.description || undefined,
    category: row.category || undefined,
    subcategory: row.subcategory || undefined,
  }));
}

export async function saveEntryToDB(entry: Entry): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('entries').upsert({
    id: entry.id,
    user_id: user.id,
    amount: entry.amount,
    date: entry.date,
    created_at: entry.createdAt,
    description: entry.description || null,
    category: entry.category || null,
    source: entry.source || 'manual',
  }, { onConflict: 'id' });

  if (error) console.error('Error saving entry:', error);
}

export async function saveCostToDB(cost: Cost): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('costs').upsert({
    id: cost.id,
    user_id: user.id,
    amount: cost.amount,
    type: cost.type,
    classification: cost.classification,
    spread_days: cost.spreadDays,
    date: cost.date,
    created_at: cost.createdAt,
    description: cost.description || null,
    category: cost.category || null,
    subcategory: cost.subcategory || null,
  }, { onConflict: 'id' });

  if (error) console.error('Error saving cost:', error);
}

export async function deleteEntryFromDB(id: string): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) console.error('Error deleting entry:', error);
}

export async function deleteCostFromDB(id: string): Promise<void> {
  const { error } = await supabase.from('costs').delete().eq('id', id);
  if (error) console.error('Error deleting cost:', error);
}

export async function saveAllEntriesToDB(entries: Entry[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Delete all existing then insert fresh
  await supabase.from('entries').delete().eq('user_id', user.id);
  
  if (entries.length === 0) return;

  const rows = entries.map(e => ({
    id: e.id,
    user_id: user.id,
    amount: e.amount,
    date: e.date,
    created_at: e.createdAt,
    description: e.description || null,
    category: e.category || null,
    source: e.source || 'manual',
  }));

  const { error } = await supabase.from('entries').insert(rows);
  if (error) console.error('Error saving entries:', error);
}

export async function saveAllCostsToDB(costs: Cost[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('costs').delete().eq('user_id', user.id);
  
  if (costs.length === 0) return;

  const rows = costs.map(c => ({
    id: c.id,
    user_id: user.id,
    amount: c.amount,
    type: c.type,
    classification: c.classification,
    spread_days: c.spreadDays,
    date: c.date,
    created_at: c.createdAt,
    description: c.description || null,
    category: c.category || null,
    subcategory: c.subcategory || null,
  }));

  const { error } = await supabase.from('costs').insert(rows);
  if (error) console.error('Error saving costs:', error);
}
