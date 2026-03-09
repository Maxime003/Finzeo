-- ============================================
-- Finzeo MVP - Full schema
-- This file is for version control only.
-- The schema is already applied to the live DB.
-- ============================================

-- TABLE: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', new.email));

  PERFORM public.create_default_categories(new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  color text NOT NULL,
  icon text NOT NULL,
  parent_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_select_own"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "categories_insert_own"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_update_own"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "categories_delete_own"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: import_batches
-- ============================================
CREATE TABLE IF NOT EXISTS public.import_batches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  file_size int,
  download_date date,
  account_name text,
  account_balance numeric(10,2),
  period_start date,
  period_end date,
  total_transactions int NOT NULL,
  imported_transactions int NOT NULL,
  duplicates_skipped int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_import_batches_user_id ON public.import_batches(user_id);

ALTER TABLE public.import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_batches_select_own"
  ON public.import_batches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "import_batches_insert_own"
  ON public.import_batches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "import_batches_update_own"
  ON public.import_batches FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "import_batches_delete_own"
  ON public.import_batches FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: account_snapshots
-- ============================================
CREATE TABLE IF NOT EXISTS public.account_snapshots (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL,
  balance numeric(10,2) NOT NULL,
  account_name text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, snapshot_date, account_name)
);

CREATE INDEX IF NOT EXISTS idx_snapshots_user_date
  ON public.account_snapshots(user_id, snapshot_date DESC);

ALTER TABLE public.account_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "snapshots_select_own"
  ON public.account_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "snapshots_insert_own"
  ON public.account_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "snapshots_update_own"
  ON public.account_snapshots FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "snapshots_delete_own"
  ON public.account_snapshots FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- TABLE: transactions
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  amount numeric(10,2) NOT NULL,
  original_label text NOT NULL,
  operation_type text,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  account_name text,
  is_recurring boolean DEFAULT false,
  import_batch_id uuid REFERENCES public.import_batches(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, transaction_date DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions_select_own"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_update_own"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "transactions_delete_own"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- TABLE: categorization_rules
-- ============================================
CREATE TABLE IF NOT EXISTS public.categorization_rules (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  confidence numeric(3,2) DEFAULT 1.00 CHECK (confidence >= 0 AND confidence <= 1),
  usage_count int DEFAULT 1,
  last_used_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rules_user_id ON public.categorization_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_rules_pattern ON public.categorization_rules(pattern);

ALTER TABLE public.categorization_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rules_select_own"
  ON public.categorization_rules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "rules_insert_own"
  ON public.categorization_rules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rules_update_own"
  ON public.categorization_rules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "rules_delete_own"
  ON public.categorization_rules FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: create_default_categories
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id uuid)
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = p_user_id) THEN
    RETURN;
  END IF;

  INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
    (p_user_id, 'Logement', 'expense', '#1e40af', 'Home', true),
    (p_user_id, 'Charge mensuelle logement', 'expense', '#2563eb', 'Key', true),
    (p_user_id, 'Charge mensuelle', 'expense', '#eab308', 'Zap', true),
    (p_user_id, 'Courses', 'expense', '#16a34a', 'ShoppingCart', true),
    (p_user_id, 'Restauration', 'expense', '#ea580c', 'UtensilsCrossed', true),
    (p_user_id, 'Transport', 'expense', '#0ea5e9', 'Car', true),
    (p_user_id, 'Loisirs', 'expense', '#dc2626', 'Dumbbell', true),
    (p_user_id, 'Santé', 'expense', '#06b6d4', 'Heart', true),
    (p_user_id, 'Hygiène', 'expense', '#d946ef', 'Sparkles', true),
    (p_user_id, 'Éducation', 'expense', '#6366f1', 'GraduationCap', true),
    (p_user_id, 'Cadeaux', 'expense', '#f43f5e', 'Gift', true),
    (p_user_id, 'Divers', 'expense', '#6b7280', 'Package', true),
    (p_user_id, 'Vacances', 'expense', '#0d9488', 'Plane', true),
    (p_user_id, 'Revenus', 'income', '#059669', 'TrendingUp', true),
    (p_user_id, 'Transferts', 'transfer', '#9ca3af', 'ArrowLeftRight', true),
    (p_user_id, 'Non catégorisé', 'expense', '#9ca3af', 'HelpCircle', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TABLE: pending_expenses
-- ============================================
CREATE TABLE IF NOT EXISTS public.pending_expenses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL,  -- always negative (it's an expense)
  description text NOT NULL,
  expense_date date NOT NULL,
  reconciled_with uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  reconciled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pending_expenses_user_id ON public.pending_expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_expenses_active ON public.pending_expenses(user_id) WHERE reconciled_with IS NULL;

ALTER TABLE public.pending_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pending_expenses_select_own"
  ON public.pending_expenses FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "pending_expenses_insert_own"
  ON public.pending_expenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pending_expenses_update_own"
  ON public.pending_expenses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pending_expenses_delete_own"
  ON public.pending_expenses FOR DELETE
  USING (auth.uid() = user_id);
