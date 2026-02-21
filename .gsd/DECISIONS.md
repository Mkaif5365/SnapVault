## Phase 3: Camera & Storage (Complete)

**Date:** 2026-02-21
... (omitted for brevity)

## Phase 4: Delay Logic & Reveal

**Date:** 2026-02-21

### UI/UX

- **Developing Screen**: "Dark Room" aesthetic (charcoal bg, pulsating red light, vintage countdown).
- **Roll Progress**: Show live photo count (e.g., "74/100 photos captured").
- **Reveal Animation**: Dramatic blur-to-sharp animation when timer hits zero.
- **Gallery**: Nostalgic contact sheet grid. Download all restricted to Host only.

### Technical & Security

- **Security**: Server-side checks for `reveal_time`. Photos remain locked in Supabase/API until time passes.
- **Telegram Proxy**: All photos served via `/api/photo?id=[telegram_file_id]` to handle secure fetching and bypass direct storage access.
