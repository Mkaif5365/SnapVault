---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Real-time Upload Progress

## Objective

Replace silent Server Action uploads with a client-side XHR-based upload system and a dedicated API route to provide real-time byte-level progress feedback to users.

## Context

- src/app/[eventCode]/page.tsx
- src/lib/telegram/actions.ts (for logic reference)

## Tasks

<task type="auto">
  <name>Create Upload API Route</name>
  <files>src/app/api/upload/route.ts</files>
  <action>
    - Create a POST handler that accepts FormData (file, eventId, participantId, mediaType, mimeType).
    - Port the logic from `uploadMediaToTelegram` (lib/telegram/actions.ts) to this route.
    - Handle Telegram communication and Supabase metadata insertion.
    - Return JSON success/error.
  </action>
  <verify>curl -X POST -F "file=@package.json" http://localhost:3000/api/upload</verify>
  <done>API successfully receives file and returns Telegram file ID.</done>
</task>

<task type="auto">
  <name>Implement XHR Upload with Progress Bar</name>
  <files>src/app/[eventCode]/page.tsx</files>
  <action>
    - Refactor `handleFileUpload` to use `XMLHttpRequest`.
    - Implement `xhr.upload.onprogress` to update a `perFileProgress` state.
    - Update the UI to show a percentage bar (e.g., "Uploading file 1/5: 45%") using a smooth Tailwind transition.
  </action>
  <verify>Upload a 5MB+ file and observe the progress bar incrementing.</verify>
  <done>Progress UI reflects byte-level completion of the current file.</done>
</task>

## Success Criteria

- [ ] Users see a percentage-based progress bar during upload.
- [ ] Media is correctly saved to Telegram and Supabase via the new API route.
