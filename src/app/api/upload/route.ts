import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const eventId = formData.get("eventId") as string
    const participantId = formData.get("participantId") as string
    const mediaType = (formData.get("mediaType") as string) || "photo"
    const mimeType = (formData.get("mimeType") as string) || file.type
    const photographerName = formData.get("photographerName") as string
    const duration = parseFloat(formData.get("duration") as string || "0")

    if (!file || !eventId) {
      return NextResponse.json({ error: "Missing file or event ID" }, { status: 400 })
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ error: "Server storage configuration error" }, { status: 500 })
    }

    // 1. Determine Telegram method and field
    const isShortVideo = mediaType === "video" && duration < 7
    const method = isShortVideo ? "sendVideo" : "sendDocument"
    const fileField = isShortVideo ? "video" : "document"

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/${method}`
    
    const telegramFormData = new FormData()
    telegramFormData.append("chat_id", TELEGRAM_CHAT_ID)
    telegramFormData.append(fileField, file)
    telegramFormData.append("caption", `SnapVault Capture | Type: ${mediaType} | Event: ${eventId} | From: ${photographerName || 'Guest'}`)

    const response = await fetch(telegramUrl, {
      method: "POST",
      body: telegramFormData,
    })

    const data = await response.json()

    if (!data.ok) {
      console.error("Telegram error:", data)
      return NextResponse.json({ error: `Telegram upload failed: ${data.description}` }, { status: 502 })
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
      return NextResponse.json({ error: "Failed to extract file ID" }, { status: 500 })
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
      return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, fileId: telegramFileId })
  } catch (err: any) {
    console.error("Upload Route Error:", err)
    return NextResponse.json({ error: err.message || "An unexpected error occurred" }, { status: 500 })
  }
}
