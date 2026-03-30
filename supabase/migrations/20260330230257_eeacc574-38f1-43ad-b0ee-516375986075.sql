
-- Entries table for revenue records
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  date TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  description TEXT,
  category TEXT,
  source TEXT DEFAULT 'manual'
);

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own entries" ON public.entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entries" ON public.entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.entries FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own entries" ON public.entries FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Costs table for expense records
CREATE TABLE public.costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'product',
  classification TEXT NOT NULL DEFAULT 'variable',
  spread_days INTEGER NOT NULL DEFAULT 1,
  date TEXT NOT NULL,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM now()) * 1000)::BIGINT,
  description TEXT,
  category TEXT,
  subcategory TEXT
);

ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own costs" ON public.costs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own costs" ON public.costs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own costs" ON public.costs FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own costs" ON public.costs FOR DELETE TO authenticated USING (auth.uid() = user_id);
