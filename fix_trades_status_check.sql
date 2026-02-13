-- FIX: Update the status constraint for the 'trades' table
-- This allows for the new 'Holding' and 'Sold' statuses required for Institutional Stocks.
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/gipxccfydceahzmqdoks/sql/new)

-- 1. Drop the existing constraint (Note: Name might vary if created automatically, so we try multiple common patterns)
ALTER TABLE "public"."trades" DROP CONSTRAINT IF EXISTS "trades_status_check";

-- 2. Add the updated constraint
ALTER TABLE "public"."trades" ADD CONSTRAINT "trades_status_check" 
CHECK (status IN ('Holding', 'Sold', 'Pending', 'Approved', 'Settled', 'Rejected'));

-- 3. Verify current records (Optional - converts any potential mismatches)
-- UPDATE "public"."trades" SET status = 'Holding' WHERE type = 'stock' AND status = 'Settled';
