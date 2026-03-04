-- Migration: Add media_type and mime_type to photos table
-- Description: Supports distinguishing between photos and videos.

ALTER TABLE public.photos 
ADD COLUMN IF NOT EXISTS media_type text DEFAULT 'photo' CHECK (media_type IN ('photo', 'video')),
ADD COLUMN IF NOT EXISTS mime_type text;

-- Update existing records to have a mime_type if possible (defaulting to image/jpeg for photos)
UPDATE public.photos SET mime_type = 'image/jpeg' WHERE media_type = 'photo' AND mime_type IS NULL;
