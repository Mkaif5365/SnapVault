-- Migration: Private relay bucket for large uploads
-- Description: Vercel Functions reject request bodies over 4.5 MB, so files larger
-- than 4 MB are uploaded by the browser straight into this bucket using a one-time
-- signed URL issued by /api/upload/sign. /api/upload/complete then forwards the file
-- to Telegram and deletes it, so objects only live here for a few seconds.
--
-- No RLS policies are added on purpose: anon/authenticated users get no direct
-- access. Uploads are authorised by the signed-URL token, and reads/deletes are
-- done server-side with the service role key.

insert into storage.buckets (id, name, public, file_size_limit)
values ('uploads', 'uploads', false, 20971520) -- 20 MB, matches Telegram's bot download limit
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit;
