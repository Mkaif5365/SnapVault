---
phase: 2
title: Event Management
objective: Create Host Dashboard, Event creation (with limits/codes), and Joining flow.
---

# Phase 2: Event Management

Objective: Build the core database schema for events/participants and implement the Host and Guest entry points.

## Context

Phase 1 set up the auth foundation. Now we need the actual business logic for managing disposable camera events.

## Tasks

### Database Setup [DB-01]

- [ ] Create `events` table in Supabase.
  - Fields: `id`, `created_at`, `host_id`, `name`, `description`, `reveal_time`, `photo_limit`, `participant_limit`, `code` (unique).
- [ ] Create `participants` table in Supabase.
  - Fields: `id`, `created_at`, `event_id`, `name`, `browser_id/session_id`.
- [ ] Set up basic RLS (Row Level Security) for `events`.

### Host Dashboard [DASH-01]

- [ ] Build `/dashboard` page to list events.
- [ ] "Empty State" with "Create Your First Event" button.
- [ ] Stat cards for Active vs. Revealed events.

### Event Creation [EVNT-01]

- [ ] Create `/dashboard/events/new` page with a Shadcn Form.
- [ ] Implement random code generation (utility function).
- [ ] Implement "DEV1000" promocode logic to bump limits.

### Event Detail & QR [UI-01]

- [ ] Create `/dashboard/events/[id]` view.
- [ ] Install `qrcode.react` and display the join QR code.
- [ ] Copy-button for the event link.

### Guest Joining Flow [JOIN-01]

- [ ] Create dynamic route `/[eventCode]`.
- [ ] If event code exists, show "SnapVault Join" page (Enter Name).
- [ ] Implement LocalStorage persistence for participant name.
- [ ] Redirect to `/[eventCode]/camera` (Camera logic is Phase 3).

## Verification Plan

### Automated Checks

- [ ] Test code generator utility for collisions/validity.
- [ ] Verify RLS policies: Host can only see their own events.

### Manual Verification

- [ ] Create an event as Host -> Check DB.
- [ ] Open incognito -> Join as Guest -> Check `participants` table.
- [ ] Verify `localStorage` persists name on refresh.
