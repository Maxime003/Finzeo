-- One-shot : ajoute la catégorie "Divers" aux utilisateurs qui ne l'ont pas encore.
-- À exécuter une seule fois dans Supabase → SQL Editor.

INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
SELECT u.id, 'Divers', 'expense', '#6b7280', 'MoreHorizontal', true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1
  FROM public.categories c
  WHERE c.user_id = u.id
    AND c.name = 'Divers'
);

