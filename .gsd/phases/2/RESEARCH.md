# Research: Phase 2 — Video Support

## Objective

Identify best practices for recording, uploading, and displaying videos in SnapVault while maintaining original media quality.

## Findings

### 1. Video Recording (MediaRecorder API)

- **Support**: Well-supported across modern browsers (iOS 14.5+, Android, Desktop).
- **Mime Types**:
  - Chrome/Android: `video/webm;codecs=vp8` or `video/webm;codecs=h264`.
  - iOS/Safari: `video/mp4` or `video/quicktime`.
- **Implementation**:
  - Need to switch `MediaStream` tracks or reuse existing camera stream.
  - `MediaRecorder` captures chunks; combine into a `Blob` on `stop`.
  - Preview using `URL.createObjectURL(blob)`.

### 2. Telegram Upload (`sendDocument`)

- `sendDocument` is the most reliable way to preserve **original quality** as it skips all Telegram compression.
- `sendDocument` handles arbitrary file types, including videos.
- **Constraints**: 50MB limit (already matched in our app config).

### 3. Database Schema

- The existing `photos` table needs to distinguish between photos and videos.
- **Action**: Add `media_type` column (default: `'photo'`).
- This ensures the gallery knows whether to render `<img>` or `<video>`.

### 4. Gallery Playback

- HTML5 `<video>` tag is sufficient for gallery playback.
- **Attributes**: `controls`, `playsinline`, `preload="metadata"`.
- **Thumbnail**: For now, we'll use the video itself (lazy loaded) or a default play icon. NTH-01 (Video thumbnails) is scoped for Phase 5.

## Proposed Tech Stack

- **Recording**: MediaRecorder API.
- **Storage**: Telegram Bot API (`sendDocument`).
- **Database**: Supabase (PostgreSQL).
- **UI**: Shadcn UI + Lucide Icons.
