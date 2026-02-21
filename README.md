# SnapVault AI 📸

> **Disposable camera experience for digital events.** Capture now, reveal later — like developing film.

SnapVault AI brings the nostalgic, delayed-gratification experience of disposable cameras to your parties, weddings, and special events. Participants join via QR code, take limited photos with vintage filters, and wait for the "vault" to reveal all memories simultaneously.

## ✨ Features

- **Vintage Camera Experience**: Browser-based camera with real-time filters (Grainy B&W, Vintage Sepia, Polaroid Soft, '98 Date Stamp).
- **The Dark Room**: A time-locked waiting experience with a pulsating red light and countdown timer.
- **Simultaneous Reveal**: All photos are revealed to all participants at once when the timer hits zero.
- **Host Dashboard**: Create events, manage photo limits, adjust reveal times, and see who the "Top Snapper" is.
- **Secure Storage**: Leverages Telegram Bot API for high-capacity storage with metadata managed in Supabase.
- **Frictionless Participation**: No app download or account creation required for guests. Just scan and snap.
- **Host Management**: ZIP download for all event photos, participant moderation (kick/remove), and vault locking.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Storage**: [Telegram Bot API](https://core.telegram.org/bots/api)
- **Deployment**: Next.js Server Actions & API Routes

## 🚀 Getting Started

### Prerequisites

1.  **Supabase Project**: Create a project and run the migrations found in `/supabase/migrations`.
2.  **Telegram Bot**: Create a bot via [@BotFather](https://t.me/botfather) to get your `TELEGRAM_BOT_TOKEN`.
3.  **Telegram Chat ID**: Get a `TELEGRAM_CHAT_ID` (e.g., via `@idbot`) where photos will be stored.

### Environment Setup

Create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/snapvault-ai.git

# Install dependencies
npm install

# Run development server
npm run dev
```

## 📜 Database Schema

The project includes SQL migrations to set up the following:

- `events`: Core event metadata and reveal timing.
- `participants`: Anonymous guest records.
- `photos`: Linked metadata for Telegram-stored assets.
- `promocodes`: System for expanding event photo limits.

---

Built with ❤️ by [Your Name/Handle]
