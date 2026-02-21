-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    reveal_time TIMESTAMPTZ NOT NULL,
    photo_limit INTEGER DEFAULT 100 NOT NULL,
    participant_limit INTEGER DEFAULT 50 NOT NULL,
    code TEXT UNIQUE NOT NULL
);

-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    session_id TEXT NOT NULL -- For localStorage persistence identification
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Events Policies
CREATE POLICY "Hosts can manage their own events"
ON public.events
FOR ALL
TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Anyone can view event metadata by code"
ON public.events
FOR SELECT
TO public
USING (true);

-- Participants Policies
CREATE POLICY "Anyone can join an event"
ON public.participants
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Participants can view their own record"
ON public.participants
FOR SELECT
TO public
USING (true);

CREATE POLICY "Hosts can see participants for their events"
ON public.participants
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.events
        WHERE events.id = participants.event_id
        AND events.host_id = auth.uid()
    )
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_events_code ON public.events(code);
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON public.participants(event_id);
