# ROADMAP.md

> **Current Milestone**: v2.0 — Media Expansion & Host Control
> **Goal**: Upgrade SnapVault into a full media sharing system with video support, original quality preservation, and host management tools.

---

## v1.0 (Complete)

Phases 1–3 delivered auth, event management, camera & storage.
Phases 4–5 (Delay Logic & Host Controls) folded into v2.0 scope.

---

## v2.0 Must-Haves

- [x] Guest name input renders in black (visibility fix)
- [x] 50MB max upload per file
- [x] No compression — original quality preserved
- [x] Telegram `sendDocument` for storage
- [x] Video upload, recording, preview, and gallery display
- [x] Mixed media gallery (photos + videos)
- [x] Guest individual download
- [x] Host-side media management (delete/preview)
- [x] Batch ZIP export for all captured media
- [x] Manual reveal/hidden control
- [x] Forced individual media downloads
- [x] Host camera capture & direct upload

## v2.0 Nice-to-Haves

- [x] Video thumbnails
- [x] Lazy loading gallery
- [x] Download icon overlay
- [x] Delete confirmation modal
- [x] Media type badges
- [x] Upload progress indicator
- [ ] Drag-and-drop upload (desktop)
- [ ] Mobile gallery UX improvements

---

## Phases

### Phase 1: Quick Fixes & Upload Pipeline

**Status**: ✅ Complete
**Objective**: Fix guest name visibility, increase upload limit to 50MB, disable compression, switch Telegram to `sendDocument`.
**Requirements**: FR-UX-01, FR-UPLOAD-01, FR-UPLOAD-02, FR-TELE-01

### Phase 2: Video Support

**Status**: ✅ Complete
**Goal**: Native video recording and playback without quality loss.
**Requirements**: FR-VIDEO-01, FR-VIDEO-02, FR-VIDEO-03

### Phase 3: Mixed Media Gallery & Guest Download

**Status**: ✅ Complete
**Objective**: Upgrade gallery to handle photos + videos with proper previews. Add individual download for guests.
**Requirements**: FR-GALLERY-01, FR-GALLERY-02

### Phase 4: Host Controls

**Status**: ✅ Complete
**Objective**: Host can delete, upload, and capture media directly from the dashboard.
**Requirements**: FR-HOST-01, FR-HOST-02, FR-HOST-03

### Phase 5: Polish & Nice-to-Haves

**Status**: ✅ Complete
**Objective**: Video thumbnails, lazy loading, progress indicators, drag-and-drop, mobile UX — time permitting.
**Requirements**: NTH-01 through NTH-08
