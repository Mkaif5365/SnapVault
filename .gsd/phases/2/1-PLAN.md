---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Schema & Upload Refactor

## Objective

Update the database schema to support mixed media types and refactor the upload pipeline to be media-agnostic.

## Context

- .gsd/SPEC.md
- src/lib/telegram/actions.ts
- supabase/migrations/20260221000001_photos_schema.sql

## Tasks

<task type="auto">
  <name>Database Schema Update</name>
  <files>
    <file>supabase/migrations/20260304000000_add_media_type.sql</file>
  </files>
  <action>
    - Create a new migration to add `media_type` (text, default 'photo') and `mime_type` (text) columns to the `photos` table.
    - `media_type` should be restricted to 'photo' or 'video'.
  </action>
  <verify>Run the migration and check table schema.</verify>
  <done>`photos` table has `media_type` column.</done>
</task>

<task type="auto">
  <name>Refactor Upload Action</name>
  <files>
    <file>src/lib/telegram/actions.ts</file>
  </files>
  <action>
    - Rename `uploadPhotoToTelegram` to `uploadMediaToTelegram`.
    - Accept `mediaType` and `mimeType` in request.
    - Ensure it saves these to the `photos` table.
    - Continue using `sendDocument` as the Telegram endpoint for all types.
  </action>
  <verify>Check that existing photo uploads still work and use the new column.</verify>
  <done>Backend can store both photo and video metadata.</done>
</task>

## Success Criteria

- [ ] `photos` table supports `media_type`.
- [ ] Upload action is flexible for all media types.
