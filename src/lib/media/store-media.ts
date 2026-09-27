import { createClient } from "@/lib/supabase/server"

export type MediaFields = {
  eventId: string
  participantId?: string | null
  mediaType?: string | null
  mimeType?: string | null
  photographerName?: string | null
  duration?: string | number | null
}

export type StoreResult =
  | { ok: true; fileId: string }
  | { ok: false; status: number; error: string }

/**
 * Sends a file to the Telegram storage chat and records it in `photos`.
 * Shared by the direct upload route and the large-file (Storage) route.
 */
export async function storeMedia(file: Blob, fileName: string, fields: MediaFields): Promise<StoreResult> {
  const { eventId, participantId, photographerName } = fields
  const mediaType = fields.mediaType || "photo"
  const mimeType = fields.mimeType || file.type
  const duration = parseFloat(String(fields.duration ?? "0") || "0")

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return { ok: false, status: 500, error: "Server storage configuration error" }
  }

  // 1. Determine Telegram method and field
  const isShortVideo = mediaType === "video" && duration < 7
  const method = isShortVideo ? "sendVideo" : "sendDocument"
  const fileField = isShortVideo ? "video" : "document"

  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`

  const telegramFormData = new FormData()
  telegramFormData.append("chat_id", TELEGRAM_CHAT_ID)
  telegramFormData.append(fileField, file, fileName)
  telegramFormData.append("caption", `SnapVault Capture | Type: ${mediaType} | Event: ${eventId} | From: ${photographerName || 'Guest'}`)

  const response = await fetch(telegramUrl, {
    method: "POST",
    body: telegramFormData,
  })

  const data = await response.json()

  if (!data.ok) {
    console.error("Telegram error:", data)
    return { ok: false, status: 502, error: `Telegram upload failed: ${data.description}` }
  }

  // Extract file ID
  let telegramFileId = ""
  if (isShortVideo && data.result.video) {
    telegramFileId = data.result.video.file_id
  } else if (data.result.document) {
    telegramFileId = data.result.document.file_id
  } else if (data.result.photo) {
    telegramFileId = data.result.photo[data.result.photo.length - 1].file_id
  }

  if (!telegramFileId) {
    return { ok: false, status: 500, error: "Failed to extract file ID" }
  }

  // 2. Save metadata to Supabase
  const supabase = await createClient()
  const { error: dbError } = await supabase
    .from("photos")
    .insert({
      event_id: eventId,
      participant_id: participantId || null,
      telegram_file_id: telegramFileId,
      media_type: mediaType,
      mime_type: mimeType,
    })

  if (dbError) {
    return { ok: false, status: 500, error: `Database error: ${dbError.message}` }
  }

  return { ok: true, fileId: telegramFileId }
}
