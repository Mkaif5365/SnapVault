---
phase: 2
plan: 3
wave: 2
---

# Plan 2.3: Mixed Media Gallery

## Objective

Upgrade the event gallery to support video playback and identify media types.

## Context

- .gsd/SPEC.md
- src/components/event/GalleryGrid.tsx
- src/app/[eventCode]/page.tsx

## Tasks

<task type="auto">
  <name>Gallery Mixed Media Support</name>
  <files>
    <file>src/components/event/GalleryGrid.tsx</file>
    <file>src/app/[eventCode]/page.tsx</file>
  </files>
  <action>
    - Fetch `media_type` and `mime_type` in the reveal query inside `page.tsx`.
    - Update `GalleryGrid` to accept these fields.
    - If `media_type === 'video'`, render a `<video>` tag with a play icon overlay in the grid.
    - In the lightbox, use `<video controls>` for video items.
  </action>
  <verify>Check revealed gallery for an event with both photos and videos.</verify>
  <done>Gallery displays and plays both media types correctly.</done>
</task>

<task type="auto">
  <name>Gallery UI Polish (Badges)</name>
  <files>
    <file>src/components/event/GalleryGrid.tsx</file>
  </files>
  <action>
    - Add small badges/icons (Camera/VideoCamera) to gallery items to indicate type (NTH-05).
    - Ensure video previews are responsive and don't break the grid layout.
  </action>
  <verify>Visual inspection of the gallery grid.</verify>
  <done>Gallery items have clear media type indicators.</done>
</task>

## Success Criteria

- [ ] Gallery supports video playback.
- [ ] Media type indicators are visible on gallery items.
