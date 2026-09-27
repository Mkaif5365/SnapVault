/**
 * Telegram's Bot API can send files up to 50 MB but only lets a bot download
 * files up to 20 MB, so anything larger could be stored but never viewed.
 */
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024
export const MAX_UPLOAD_LABEL = "20MB"

/**
 * Vercel Functions reject request bodies over 4.5 MB. Files at or under this
 * size go straight through /api/upload; larger ones go via Supabase Storage.
 */
export const DIRECT_UPLOAD_MAX_BYTES = 4 * 1024 * 1024
