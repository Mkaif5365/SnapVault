---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: Individual Downloads & Batch Export Fix

## Objective

Enable forced downloads for individual media items and fix the ZIP export to support mixed media extensions.

## Context

- .gsd/SPEC.md
- src/app/api/photos/[fileId]/route.ts (Proxy)
- src/app/api/events/[id]/download/route.ts (Batch ZIP)
- src/components/event/GalleryGrid.tsx (Gallery UI)

## Tasks

<task type="auto">
  <name>Implement individual download in proxy</name>
  <files>f:/Code/SnapVault AI/src/app/api/photos/[fileId]/route.ts</files>
  <action>
    - Extract `download` query param.
    - If `download === '1'`, set `Content-Disposition: attachment; filename="snapvault-${fileId}.${ext}"`.
    - Infer `ext` from `contentType`.
  </action>
  <verify>curl -I "http://localhost:3000/api/photos/[FILE_ID]?download=1"</verify>
  <done>Response contains Content-Disposition: attachment.</done>
</task>

<task type="auto">
  <name>Add download button to Gallery</name>
  <files>f:/Code/SnapVault AI/src/components/event/GalleryGrid.tsx</files>
  <action>
    - Add a `Download` button to the Lightbox near the close icon.
    - Link it to `/api/photos/${photo.telegram_file_id}?download=1`.
    - Use `lucide-react` Download icon.
  </action>
  <verify>Manually check lightbox UI.</verify>
  <done>Download button appears and triggers browser download.</done>
</task>

<task type="auto">
  <name>Fix batch ZIP export for all media formats</name>
  <files>f:/Code/SnapVault AI/src/app/api/events/[id]/download/route.ts</files>
  <action>
    - Update Supabase query to select `media_type` and `mime_type`.
    - Create a helper or map to convert `mime_type` to extension (e.g., `image/heic` -> `.heic`, `video/x-matroska` -> `.mkv`).
    - Use the mapped extension for files in the ZIP.
    - Reference: Handle iPhone HEIC and common video containers properly.
  </action>
  <verify>Download ZIP and check contents with various media types.</verify>
  <done>ZIP contains files with correct extensions corresponding to their actual formats.</done>
</task>
