---
phase: 5
plan: 2
wave: 1
---

# Plan 5.2: Gallery Performance (Lazy Loading)

## Objective

Optimize gallery performance by using IntersectionObserver to only load video metadata and thumbnails when items are in the viewport.

## Context

- src/components/event/GalleryGrid.tsx

## Tasks

<task type="auto">
  <name>Implement Viewport-based Loading</name>
  <files>src/components/event/GalleryGrid.tsx</files>
  <action>
    - Use a custom hook or `IntersectionObserver` directly within the gallery item loop.
    - For video elements, set `src` only when `isIntersecting` is true.
    - Add a loading skeleton or a low-res placeholder (amber-950/20) while the media is loading.
  </action>
  <verify>Scroll through a large gallery and observe network tab to confirm video metadata requests only happen on scroll.</verify>
  <done>Videos do not load metadata/thumbnails until they enter the viewport.</done>
</task>

<task type="auto">
  <name>Add Entrance Animations</name>
  <files>src/components/event/GalleryGrid.tsx</files>
  <action>
    - Add a `fade-in-up` animation to media items as they become visible.
    - Ensure animations are subtle (300ms) and use `animate-in fade-in fill-mode-both`.
  </action>
  <verify>Refresh gallery and scroll to see items smoothy appearing.</verify>
  <done>Items have a premium entrance animation when entering viewport.</done>
</task>

## Success Criteria

- [ ] Reduced initial page load weight (fewer metadata requests).
- [ ] Smooth entrance animations for all media items.
