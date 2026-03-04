---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: Host Deletion & Management UI

## Objective

Allow hosts to delete individual media items and provide UI for host-side capture/upload.

## Context

- .gsd/SPEC.md
- src/lib/actions/host.ts
- src/app/dashboard/events/[id]/page.tsx

## Tasks

<task type="auto">
  <name>Implement deleteMedia action</name>
  <files>f:/Code/SnapVault AI/src/lib/actions/host.ts</files>
  <action>
    - Create `deleteMedia(photoId, eventId)` server action.
    - Verify host ownership of the event.
    - Delete the photo record from Supabase.
  </action>
  <verify>Call action manually or via component.</verify>
  <done>Photo record is removed from DB.</done>
</task>

<task type="auto">
  <name>Add Deletion UI to Host Dashboard</name>
  <files>f:/Code/SnapVault AI/src/app/dashboard/events/[id]/page.tsx</files>
  <action>
    - In the Media Preview grid, add an overlay with a Trash icon.
    - Implement `handleDelete` that calls the server action and updates local state.
    - Add a simple confirmation before deletion.
  </action>
  <verify>Verify icon appears and triggers deletion.</verify>
  <done>Host can delete media from preview section.</done>
</task>
