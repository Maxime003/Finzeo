-- One-shot : ajoute la catégorie "Loisirs" aux utilisateurs qui ne l'ont pas encore.
-- Exécuter une seule fois dans Supabase → SQL Editor.

INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
SELECT u.id, 'Loisirs', 'expense', '#dc2626', 'Dumbbell', true
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c
  WHERE c.user_id = u.id AND c.name = 'Loisirs'
);
