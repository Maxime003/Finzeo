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
