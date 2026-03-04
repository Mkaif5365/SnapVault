---
phase: 5
plan: 3
wave: 2
---

# Plan 5.3: Mobile UX & Swipe Gestures

## Objective

Refine the mobile experience by adding swipe-to-dismiss gestures to the lightbox and improving the visibility of media metadata (badges/photographer).

## Context

- src/components/event/GalleryGrid.tsx

## Tasks

<task type="auto">
  <name>Implement Swipe-to-Dismiss</name>
  <files>src/components/event/GalleryGrid.tsx</files>
  <action>
    - Add touch start/move/end handlers to the lightbox overlay.
    - Calculate vertical delta to dismiss the lightbox when swiped down (threshold: 100px).
    - Add a subtle transform transition based on finger position for "physical" feel.
  </action>
  <verify>Test in browser mobile emulation (F12) and verify swiping down closes the media preview.</verify>
  <done>Lightbox can be closed via downward swipe on mobile devices.</done>
</task>

<task type="auto">
  <name>Refine Badges & Overlays</name>
  <files>src/components/event/GalleryGrid.tsx</files>
  <action>
    - Add `backdrop-blur-md` and high-contrast text to media type badges.
    - Move badges to a standardized corner with improved padding.
    - Ensure photographer names are legible even on very bright photos.
  </action>
  <verify>Confirm badges are clearly visible on both black and white background media.</verify>
  <done>UI elements have consistent, premium contrast and glassmorphism styling.</done>
</task>

## Success Criteria

- [ ] Lightbox supports intuitive mobile gestures.
- [ ] Metadata badges look premium and are universally legible.
