"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function uploadMediaToTelegram(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const eventId = formData.get("eventId") as string
    const participantId = formData.get("participantId") as string
    const mediaType = (formData.get("mediaType") as string) || "photo"
    const mimeType = (formData.get("mimeType") as string) || file.type
    const duration = parseFloat(formData.get("duration") as string || "0")

    if (!file || !eventId) {
      return { error: "Missing file or event ID" }
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Telegram credentials missing")
      return { error: "Server storage configuration error" }
    }

    // 1. Determine Telegram method and field
    // Logic: Photos always as document (original quality). 
    // Videos < 7s as video (animation/preview), >= 7s as document (original quality).
    const isShortVideo = mediaType === "video" && duration < 7
    const method = isShortVideo ? "sendVideo" : "sendDocument"
    const fileField = isShortVideo ? "video" : "document"

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`
    
    const telegramFormData = new FormData()
    telegramFormData.append("chat_id", TELEGRAM_CHAT_ID)
    telegramFormData.append(fileField, file)
    telegramFormData.append("caption", `SnapVault Capture | Type: ${mediaType} | Event: ${eventId}`)

    const response = await fetch(telegramUrl, {
      method: "POST",
      body: telegramFormData,
    })

    const data = await response.json()

    if (!data.ok) {
      console.error("Telegram error:", data)
      return { error: `Telegram upload failed: ${data.description}` }
    }

    // Extract file ID based on the result type
    let telegramFileId = ""
    if (isShortVideo && data.result.video) {
      telegramFileId = data.result.video.file_id
    } else if (data.result.document) {
      telegramFileId = data.result.document.file_id
    } else if (data.result.photo) {
      // Fallback for photos (though we send as document)
      telegramFileId = data.result.photo[data.result.photo.length - 1].file_id
    }

    if (!telegramFileId) {
      return { error: "Failed to extract file ID from Telegram response" }
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
      console.error("Supabase Save Error:", dbError)
      return { error: `Database error: ${dbError.message}` }
    }

    return { success: true, fileId: telegramFileId }
  } catch (err: any) {
    console.error("Upload Catch Error:", err)
    return { error: err.message || "An unexpected error occurred" }
  }
}
