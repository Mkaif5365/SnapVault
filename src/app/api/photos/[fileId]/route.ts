import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params

  if (!fileId || !TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  try {
    // 1. Look up the photo record in Supabase
    const supabase = await createClient()
    const { data: photo, error: photoError } = await supabase
      .from("photos")
      .select("*, events(*)")
      .eq("telegram_file_id", fileId)
      .single()

    if (photoError || !photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // 2. Security Check: Is the reveal time in the past?
    const event = photo.events
    const revealTime = new Date(event.reveal_time)
    const now = new Date()

    // Check if the requester is the host (bypass reveal check)
    const { data: { user } } = await supabase.auth.getUser()
    const isHost = user && user.id === event.host_id

    if (!isHost && revealTime > now) {
      return NextResponse.json(
        { error: "This vault is still developing. Check back later." },
        { status: 403 }
      )
    }

    // 3. Get Telegram file path
    const fileInfoRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`
    )
    const fileInfo = await fileInfoRes.json()

    if (!fileInfo.ok || !fileInfo.result?.file_path) {
      return NextResponse.json({ error: "Failed to retrieve photo" }, { status: 500 })
    }

    // 4. Stream the photo from Telegram
    const photoUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.result.file_path}`
    const photoRes = await fetch(photoUrl)

    if (!photoRes.ok) {
      return NextResponse.json({ error: "Failed to load photo" }, { status: 500 })
    }

    const photoBuffer = await photoRes.arrayBuffer()
    const contentType = photo.mime_type || photoRes.headers.get("content-type") || "image/jpeg"
    const download = request.nextUrl.searchParams.get("download")

    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    }

    if (download === "1") {
      const extension = contentType.split("/")[1]?.split("+")[0] || "jpg"
      const extMap: Record<string, string> = {
        'jpeg': 'jpg',
        'x-matroska': 'mkv',
        'quicktime': 'mov',
        'heic': 'heic',
        'heif': 'heif'
      }
      const finalExt = extMap[extension] || extension
      headers["Content-Disposition"] = `attachment; filename="snapvault-${fileId}.${finalExt}"`
    }

    return new NextResponse(photoBuffer, {
      status: 200,
      headers
    })
  } catch (err) {
    console.error("Photo proxy error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
