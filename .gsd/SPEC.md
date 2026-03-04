# SPEC.md — SnapVault v2.0

> **Status**: FINALIZED
> **Milestone**: v2.0 — Media Expansion & Host Control
> **Date**: 2026-03-04

## Overview

Upgrade SnapVault from a photo-only upload platform into a full media sharing system supporting photos **and** videos while preserving original quality. Add host management tools and improve guest UX.

---

## Functional Requirements

### FR-UX-01: Guest Name Input Fix

- Guest name input text must render in **black** for proper visibility.
- **File**: `src/app/[eventCode]/page.tsx` (join form)

### FR-UPLOAD-01: Max Upload Size

- Increase per-file upload limit from **20MB → 50MB**.
- Applies to both photos and videos.

### FR-UPLOAD-02: No Compression

- Disable all automatic photo compression or resizing.
- Uploaded images must remain in **original resolution and quality**.

### FR-TELE-01: Telegram Document Upload

- Use `sendDocument` instead of `sendPhoto` for Telegram storage.
- Preserves original file quality (no Telegram compression).
- **File**: `src/lib/telegram/actions.ts`

### FR-VIDEO-01: Video Upload

- Accept video file uploads (mp4, mov, webm).
- Preview video before submission.

### FR-VIDEO-02: Video Recording

- Record video using device camera (in addition to existing photo capture).
- **File**: `src/app/[eventCode]/camera/page.tsx`

### FR-VIDEO-03: Video Gallery Display

- Display videos inline in the gallery with playback controls.
- **File**: `src/components/event/GalleryGrid.tsx`

### FR-VIDEO-04: Video Duration Limit

- Video capture must automatically stop after a maximum of **45 seconds**.
- Provide a visual indicator of remaining time during recording.

### FR-GALLERY-01: Mixed Media Gallery

- Gallery supports both photos and videos with appropriate previews.
- `media_type` field distinguishes photo vs video entries.

### FR-GALLERY-02: Guest Download

- Guests can download individual photos/videos directly from the gallery.

### FR-HOST-01: Host Delete Media

- Host can delete specific photos/videos from the event dashboard.
- **File**: `src/app/dashboard/events/[id]/page.tsx`

### FR-HOST-02: Host Upload Media

- Host can upload photos/videos directly from the dashboard.

### FR-HOST-03: Host Camera Capture

- Host can capture photo or record video from device camera within dashboard.

---

## Nice-to-Have Requirements

| ID     | Feature                                       |
| ------ | --------------------------------------------- |
| NTH-01 | Video thumbnails in gallery                   |
| NTH-02 | Lazy loading for gallery media                |
| NTH-03 | Download button icon overlay on gallery items |
| NTH-04 | Confirmation modal before media deletion      |
| NTH-05 | Media type badges (Photo/Video indicator)     |
| NTH-06 | Upload progress indicator for large files     |
| NTH-07 | Drag-and-drop upload for desktop              |
| NTH-08 | Improved mobile gallery scrolling & preview   |

---

## Non-Functional Requirements

### NFR-QUAL-01: Original Quality Preservation

- No lossy transformations at any stage of the upload pipeline.

### NFR-PERF-01: Upload Performance

- 50MB uploads must complete within reasonable time with progress feedback.

### NFR-COMPAT-01: Device Compatibility

- Video recording must work on iOS Safari, Android Chrome, and desktop browsers.

---

## Database Changes

### `photos` table updates

- Add `media_type` column: `text` — values: `'photo'` | `'video'`
- Add `file_size` column: `bigint` — original file size in bytes
- Add `mime_type` column: `text` — e.g., `image/jpeg`, `video/mp4`

---

## Key Files

| Area            | File                                        |
| --------------- | ------------------------------------------- |
| Telegram upload | `src/lib/telegram/actions.ts`               |
| Camera UI       | `src/app/[eventCode]/camera/page.tsx`       |
| Guest join      | `src/app/[eventCode]/page.tsx`              |
| Gallery         | `src/components/event/GalleryGrid.tsx`      |
| Host dashboard  | `src/app/dashboard/events/[id]/page.tsx`    |
| Photo proxy     | `src/app/api/photos/[fileId]/route.ts`      |
| Download API    | `src/app/api/events/[id]/download/route.ts` |
| Host actions    | `src/lib/actions/host.ts`                   |
| DB migrations   | `supabase/migrations/`                      |
