-- Simple migration to force types regeneration
-- This migration adds a comment to trigger types refresh without breaking changes

-- Add a comment to a function to trigger regeneration
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Updates the updated_at timestamp automatically';

-- Refresh the database schema metadata
SELECT 1;