"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

export async function uploadPhotoToTelegram(formData: FormData) {
  try {
    const file = formData.get("file") as File
    const eventId = formData.get("eventId") as string
    const participantId = formData.get("participantId") as string

    if (!file || !eventId) {
      return { error: "Missing file or event ID" }
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Telegram credentials missing")
      return { error: "Server storage configuration error" }
    }

    // 1. Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`
    
    // Telegram's sendPhoto expects multipart/form-data
    const telegramFormData = new FormData()
    telegramFormData.append("chat_id", TELEGRAM_CHAT_ID)
    telegramFormData.append("photo", file)
    telegramFormData.append("caption", `SnapVault Capture | Event: ${eventId}`)

    const response = await fetch(telegramUrl, {
      method: "POST",
      body: telegramFormData,
    })

    const data = await response.json()

    if (!data.ok) {
      console.error("Telegram error:", data)
      return { error: `Telegram upload failed: ${data.description}` }
    }

    const telegramFileId = data.result.photo[data.result.photo.length - 1].file_id

    // 2. Save metadata to Supabase
    const supabase = await createClient()
    const { error: dbError } = await supabase
      .from("photos")
      .insert({
        event_id: eventId,
        participant_id: participantId || null,
        telegram_file_id: telegramFileId,
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
