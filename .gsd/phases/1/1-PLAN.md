---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Quick Fixes & Upload Pipeline

## Objective

Fix guest name visibility, increase upload limit to 50MB, and switch Telegram storage to `sendDocument` for original quality preservation.

## Context

- .gsd/SPEC.md
- src/app/[eventCode]/page.tsx
- src/app/[eventCode]/camera/page.tsx
- src/lib/telegram/actions.ts

## Tasks

<task type="auto">
  <name>UI Fixes & Upload Limit</name>
  <files>
    <file>src/app/[eventCode]/page.tsx</file>
  </files>
  <action>
    - Change input text color to black for the guest name field.
    - Update client-side file size check from 20MB to 50MB.
    - Update UI labels to show 50MB.
  </action>
  <verify>Manual check of join form and upload button label.</verify>
  <done>Guest name input is readable; files up to 50MB are accepted by the frontend.</done>
</task>

<task type="auto">
  <name>Telegram Document Storage</name>
  <files>
    <file>src/lib/telegram/actions.ts</file>
    <file>src/app/[eventCode]/camera/page.tsx</file>
  </files>
  <action>
    - Update `uploadPhotoToTelegram` to use `sendDocument` endpoint.
    - Change form key from `photo` to `document`.
    - Update response parsing to extract `document.file_id`.
    - In camera page, set canvas blob quality to 1.0 (no compression).
  </action>
  <verify>Upload a photo and verify it arrives in Telegram as a 'File' (document) not a 'Photo'.</verify>
  <done>Media is stored in original quality on Telegram without compression.</done>
</task>

## Success Criteria

- [ ] Guest name input text is black.
- [ ] Max upload size is 50MB.
- [ ] Telegram storage uses `sendDocument` with original file quality.
