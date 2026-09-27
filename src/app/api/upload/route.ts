import { NextResponse } from "next/server"
import { storeMedia } from "@/lib/media/store-media"

/**
 * Direct upload for small files (Vercel caps request bodies at 4.5 MB).
 * Larger files use /api/upload/sign + /api/upload/complete instead.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const eventId = formData.get("eventId") as string

    if (!file || !eventId) {
      return NextResponse.json({ error: "Missing file or event ID" }, { status: 400 })
    }

    const result = await storeMedia(file, file.name || "upload", {
      eventId,
      participantId: formData.get("participantId") as string,
      mediaType: formData.get("mediaType") as string,
      mimeType: formData.get("mimeType") as string,
      photographerName: formData.get("photographerName") as string,
      duration: formData.get("duration") as string,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({ success: true, fileId: result.fileId })
  } catch (err: any) {
    console.error("Upload Route Error:", err)
    return NextResponse.json({ error: err.message || "An unexpected error occurred" }, { status: 500 })
  }
}
