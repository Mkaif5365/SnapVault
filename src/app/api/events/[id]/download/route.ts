import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import JSZip from "jszip"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params

  try {
    const supabase = await createClient()

    // 1. Verify host
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('host_id', user.id)
      .single()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // 2. Fetch all photos
    const { data: photos } = await supabase
      .from('photos')
      .select('telegram_file_id, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (!photos || photos.length === 0) {
      return NextResponse.json({ error: "No photos to download" }, { status: 404 })
    }

    // 3. Build ZIP
    const zip = new JSZip()

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i]
      const fileNum = (i + 1).toString().padStart(2, '0')

      // Get Telegram file path
      const fileInfoRes = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${photo.telegram_file_id}`
      )
      const fileInfo = await fileInfoRes.json()

      if (fileInfo.ok && fileInfo.result?.file_path) {
        const photoUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.result.file_path}`
        const photoRes = await fetch(photoUrl)

        if (photoRes.ok) {
          const buffer = await photoRes.arrayBuffer()
          zip.file(`snap_${fileNum}.jpg`, buffer)
        }
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" })

    // Sanitize event name for filename
    const safeName = event.name.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_')

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeName}.zip"`,
      },
    })
  } catch (err) {
    console.error("ZIP download error:", err)
    return NextResponse.json({ error: "Failed to create ZIP" }, { status: 500 })
  }
}
