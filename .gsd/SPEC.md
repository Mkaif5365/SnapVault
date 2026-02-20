# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision

SnapVault is a browser-based disposable camera event platform that provides event-based, time-locked photo sharing with a nostalgic aesthetic. It works on any device without downloads, allowing participants to capture and upload photos that remain "hidden" until a host-defined reveal time, simulating the experience of film development.

## Goals

1. **Frictionless Participation**: Allow users to join events and capture photos via QR codes/short links without requiring account creation or app installation.
2. **Delayed Gratification**: Implement a robust time-lock mechanism where photos are only visible to all participants after a specific "reveal" date and time.
3. **Nostalgic Experience**: Provide built-in camera filters (Sepia, B&W, Grain, etc.) and a clean, minimal UI that feels premium and SaaS-grade.
4. **Efficient Storage**: Leverage Telegram Bot API for cost-effective, high-capacity photo storage while managing metadata in Supabase.
5. **Host Control**: Give event creators comprehensive tools to manage participants, limits, and reveal timings.

## Non-Goals (Out of Scope)

- Real-time photo feed (photos are hidden until reveal).
- Social features like comments, likes, or direct messaging.
- Native mobile applications (PWA focus only).
- Non-host authentication (participants are anonymous).

## Users

- **Hosts**: Authenticated users (Email/Pass or Google) who create and manage events, view stats, and can bypass reveal delays.
- **Participants**: Anonymous users who join via code/QR, enter a name, and contribute photos to a specific event.

## Constraints

- **Tech Stack**: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI, Supabase (Auth/DB), Telegram Bot API (Storage).
- **Storage**: Photos stored on Telegram; file IDs in Supabase.
- **Limits**: Default cap of 100 photos per event (expandable to 1000 via promocode). Max 20MB per upload.
- **Security**: Host-only routes must be protected; promocodes must be verified via secure environment variables.

## Success Criteria

- [ ] Host can sign up, log in, and create an event with a reveal timer.
- [ ] Participant can join an event via QR/code without logging in.
- [ ] Participant can take a photo with a filter or upload one from the gallery.
- [ ] Photos are stored on Telegram and IDs are saved in Supabase.
- [ ] Gallery remains "locked" with a countdown until the reveal time.
- [ ] All photos are revealed simultaneously after the timer hits zero.
- [ ] Host can download all event photos as a ZIP.
