import { NextResponse } from "next/server"
import { createAdminClient, UPLOAD_BUCKET } from "@/lib/supabase/admin"
import { storeMedia } from "@/lib/media/store-media"
import { MAX_UPLOAD_BYTES } from "@/lib/media/limits"

// Downloading from Storage and re-uploading to Telegram can take a while for 20 MB videos.
export const maxDuration = 120

/**
 * Step 2 of a large upload: the file is already in the `uploads` bucket.
 * Forward it to Telegram, record it, then delete the temporary copy.
 */
export async function POST(request: Request) {
  let path: string | undefined
  let admin: ReturnType<typeof createAdminClient> | undefined

  try {
    admin = createAdminClient()
    const body = await request.json()
    path = body.path
    const eventId = body.eventId as string

    if (!path || !eventId || !path.startsWith(`${eventId}/`)) {
      return NextResponse.json({ error: "Invalid upload reference" }, { status: 400 })
    }

    const { data: blob, error: downloadError } = await admin.storage.from(UPLOAD_BUCKET).download(path)
    if (downloadError || !blob) {
      return NextResponse.json({ error: "Uploaded file not found" }, { status: 404 })
    }
    if (blob.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File is too large" }, { status: 413 })
    }

    const fileName = path.split("/").pop()?.replace(/^[0-9a-f-]{36}-/, "") || "upload"
    const result = await storeMedia(blob, fileName, {
      eventId,
      participantId: body.participantId,
      mediaType: body.mediaType,
      mimeType: body.mimeType || blob.type,
      photographerName: body.photographerName,
      duration: body.duration,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ success: true, fileId: result.fileId })
  } catch (err: any) {
    console.error("Upload Complete Error:", err)
    return NextResponse.json({ error: err.message || "An unexpected error occurred" }, { status: 500 })
  } finally {
    // The bucket is only a relay; never keep the file around.
    if (path && admin) {
      await admin.storage.from(UPLOAD_BUCKET).remove([path]).catch(() => {})
    }
  }
}
