-- Create photos table
create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  participant_id uuid references public.participants(id) on delete set null,
  telegram_file_id text not null,
  caption text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.photos enable row level security;

-- Policies

-- 1. Anyone can insert (guests)
create policy "Anyone can upload photos"
  on public.photos for insert
  with check (true);

-- 2. Everyone can view photos ONLY AFTER reveal_time
create policy "Photos are visible after reveal"
  on public.photos for select
  using (
    exists (
      select 1 from public.events
      where events.id = photos.event_id
      and (
        events.reveal_time <= now()
        or events.host_id = auth.uid()
      )
    )
  );

-- 3. Hosts can delete photos in their events
create policy "Hosts can delete photos"
  on public.photos for delete
  using (
    exists (
      select 1 from public.events
      where events.id = photos.event_id
      and events.host_id = auth.uid()
    )
  );

-- Indexes
create index if not exists photos_event_id_idx on public.photos(event_id);
create index if not exists photos_participant_id_idx on public.photos(participant_id);
