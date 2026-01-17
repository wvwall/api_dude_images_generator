-- Enable RLS on all Prisma internal tables
-- Run this after migrations on Supabase

-- Enable RLS on Prisma migrations table
ALTER TABLE IF EXISTS public._prisma_migrations
  ENABLE ROW LEVEL SECURITY;

-- Revoke public access from Prisma internal tables
REVOKE ALL ON public._prisma_migrations FROM PUBLIC;
REVOKE ALL ON public._prisma_migrations FROM anon;
REVOKE ALL ON public._prisma_migrations FROM authenticated;

-- Add comment for documentation
COMMENT ON TABLE public._prisma_migrations IS
  'Prisma migrations history - RLS enabled, only accessible by service role';
