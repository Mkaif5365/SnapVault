-- Phase 5: Host Controls & Polish
-- Adds: event locking, participant status tracking, promocodes

-- 1. Add is_locked to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT FALSE;

-- 2. Add status to participants (active, removed, kicked)
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 3. Create promocodes table
CREATE TABLE IF NOT EXISTS public.promocodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    photo_limit INTEGER NOT NULL DEFAULT 500,
    is_used BOOLEAN DEFAULT FALSE,
    used_by_event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS for promocodes
ALTER TABLE public.promocodes ENABLE ROW LEVEL SECURITY;

-- Anyone can read promocodes (to validate)
CREATE POLICY "Anyone can validate promocodes"
ON public.promocodes FOR SELECT TO public USING (true);

-- Only authenticated users can use (update) a promocode
CREATE POLICY "Authenticated users can use promocodes"
ON public.promocodes FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

-- Host can update their own events (for lock, reveal_time, photo_limit changes)
CREATE POLICY "Hosts can update their events"
ON public.events FOR UPDATE TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

-- Host can update participants in their events (for kick/remove)
CREATE POLICY "Hosts can update participants"
ON public.participants FOR UPDATE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = participants.event_id
        AND events.host_id = auth.uid()
    )
);

-- Host can delete participants
CREATE POLICY "Hosts can delete participants"
ON public.participants FOR DELETE TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = participants.event_id
        AND events.host_id = auth.uid()
    )
);

-- Seed some promocodes (you can add more from Supabase dashboard)
INSERT INTO public.promocodes (code, photo_limit) VALUES
  ('SNAP500', 500),
  ('SNAP1000', 1000),
  ('UNLIMITED', 10000)
ON CONFLICT (code) DO NOTHING;

-- Index for promocode lookups
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON public.promocodes(code);
CREATE INDEX IF NOT EXISTS idx_participants_status ON public.participants(status);
