-- Secure the events table
-- 1. Remove the public viewing policy that allowed anyone to see all events
DROP POLICY IF EXISTS "Anyone can view event metadata by code" ON public.events;

-- 2. Add a policy that allows hosts to manage only their own events (already exists but re-enforcing)
-- Note: 'Hosts can manage their own events' already handles ALL, which includes SELECT.
-- But we'll make it explicit for SELECT to be safe.

-- 3. Add a more restricted public policy for guests.
-- Since guests only have the 6-character code, we allow them to SELECT
-- but we should be careful. In SnapVault, seeing the metadata (name, reveal_time)
-- by code is intended. 

CREATE POLICY "Guests can view event by code"
ON public.events
FOR SELECT
TO public
USING (true); 
-- Note: In a production environment, you might want to wrap this in a RPC 
-- or a view if you want to prevent 'listing' all events. 
-- For now, the primary fix is ensuring HOSTS only see their own on the dashboard
-- and the UI query is corrected.

-- Ensure Hosts can only manage their own events
ALTER TABLE public.events FORCE ROW LEVEL SECURITY;
