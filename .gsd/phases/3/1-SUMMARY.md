---
phase: 3
plan: 1
status: complete
---

# Plan 3.1 Summary: Individual Downloads & Batch Export Fix

## Accomplishments

- Implemented `download=1` query parameter support in `src/app/api/photos/[fileId]/route.ts` to force file downloads with correct headers.
- Added a `Download` icon button in the gallery lightbox to trigger individual media downloads.
- Refactored `src/app/api/events/[id]/download/route.ts` to support multi-format media in the ZIP export.
- Implemented a MIME-to-extension mapper to handle `.jpg`, `.png`, `.heic`, `.mp4`, `.mkv`, and `.mov` correctly within the ZIP archive.

## Verification

- Verified individual downloads for both photos and videos.
- Verified ZIP export results in correctly named files with appropriate extensions based on their actual formats.
