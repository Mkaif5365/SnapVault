---
phase: 2
plan: 2
wave: 1
---

# Plan 2.2: Video Recording UI

## Objective

Enable video recording on the camera page with real-time preview and playback before upload.

## Context

- .gsd/SPEC.md
- src/app/[eventCode]/camera/page.tsx
- src/components/camera/CameraFilters.tsx

## Tasks

<task type="auto">
  <name>Video Capture Logic</name>
  <files>
    <file>src/app/[eventCode]/camera/page.tsx</file>
  </files>
  <action>
    - Add a "Photo/Video" toggle to the camera UI.
    - Implement `MediaRecorder` logic to capture video chunks from the camera stream.
    - **Add auto-stop timer**: Recording must automatically stop after 45 seconds (with a visual countdown or indicator).
    - Handle camera facing mode and stream re-initialization if needed.
    - Video should capture the raw stream (filters on video are NTH/later).
  </action>
  <verify>Toggle to video mode and record. Verify it stops automatically at 45s.</verify>
  <done>User can switch modes and record video with a 45s time limit.</done>
</task>

<task type="auto">
  <name>Video Preview Overlay</name>
  <files>
    <file>src/app/[eventCode]/camera/page.tsx</file>
  </files>
  <action>
    - After recording, show a full-screen preview of the video.
    - provide "Retake" and "Keep/Upload" buttons.
    - Call `uploadMediaToTelegram` with `mediaType='video'` on "Keep".
  </action>
  <verify>Record video, watch preview, then upload.</verify>
  <done>Recorded video can be reviewed before submission.</done>
</task>

## Success Criteria

- [ ] Camera page supports video recording.
- [ ] Users can preview recorded video before uploading.
