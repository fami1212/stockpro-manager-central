-- Modifier le champ reference pour qu'il soit optionnel et auto-généré
ALTER TABLE public.products ALTER COLUMN reference DROP NOT NULL;