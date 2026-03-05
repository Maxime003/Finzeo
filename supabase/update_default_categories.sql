-- Mise à jour des catégories par défaut (nouveaux utilisateurs)
-- Exécuter ce script dans Supabase → SQL Editor pour appliquer les changements.
-- N'affecte que les futurs comptes ; les comptes existants gardent leurs catégories actuelles.

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
    (p_user_id, 'Divers', 'expense', '#6b7280', 'MoreHorizontal', true),
    (p_user_id, 'Vacances', 'expense', '#0d9488', 'Plane', true),
    (p_user_id, 'Revenus', 'income', '#059669', 'TrendingUp', true),
    (p_user_id, 'Transferts', 'transfer', '#9ca3af', 'ArrowLeftRight', true),
    (p_user_id, 'Non catégorisé', 'expense', '#9ca3af', 'HelpCircle', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
