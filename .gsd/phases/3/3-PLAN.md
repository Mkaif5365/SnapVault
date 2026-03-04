---
phase: 3
plan: 3
wave: 2
---

# Plan 3.3: Host Media Upload & Capture

## Objective

Enable hosts to personally contribute media to the vault directly from their dashboard.

## Context

- .gsd/SPEC.md
- src/app/dashboard/events/[id]/page.tsx
- src/app/[eventCode]/camera/page.tsx (Reference for camera logic)

## Tasks

<task type="auto">
  <name>Add Host Upload Component</name>
  <files>f:/Code/SnapVault AI/src/app/dashboard/events/[id]/page.tsx</files>
  <action>
    - Add a "Upload Media" button with a hidden file input (similar to guest hub).
    - Implement `handleHostUpload` that uses `uploadMediaToTelegram`.
    - Automatically detect `mediaType` from file.
  </action>
  <verify>Upload a test image from host dashboard.</verify>
  <done>Media appears in host preview and guest gallery.</done>
</task>

<task type="auto">
  <name>Add Host Camera Entry</name>
  <files>f:/Code/SnapVault AI/src/app/dashboard/events/[id]/page.tsx</files>
  <action>
    - Add an "Open Camera" button that redirects to `/[eventCode]/camera`.
    - Ensure the host can return to the dashboard easily (already covered by "Back to Hub" but might need a "Back to Dashboard" for hosts).
  </action>
  <verify>Click button and record a video.</verify>
  <done>Host can capture and record using the same camera UI as guests.</done>
</task>
