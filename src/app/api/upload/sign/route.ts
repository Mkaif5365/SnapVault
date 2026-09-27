import { NextResponse } from "next/server"
import { createAdminClient, UPLOAD_BUCKET } from "@/lib/supabase/admin"
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/media/limits"

/**
 * Step 1 of a large upload: returns a one-time signed URL so the browser can
 * put the file straight into the private `uploads` bucket, bypassing Vercel's
 * 4.5 MB request limit.
 */
export async function POST(request: Request) {
  try {
    const { eventId, fileName, size } = await request.json()

    if (!eventId || typeof eventId !== "string") {
      return NextResponse.json({ error: "Missing event ID" }, { status: 400 })
    }
    if (typeof size !== "number" || size <= 0) {
      return NextResponse.json({ error: "Missing file size" }, { status: 400 })
    }
    if (size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: `File is too large (max ${MAX_UPLOAD_LABEL})` }, { status: 413 })
    }

    const admin = createAdminClient()

    const { data: event } = await admin
      .from("events")
      .select("id")
      .eq("id", eventId)
      .single()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    const safeName = String(fileName || "upload").replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80)
    const path = `${eventId}/${crypto.randomUUID()}-${safeName}`

    const { data, error } = await admin.storage.from(UPLOAD_BUCKET).createSignedUploadUrl(path)
    if (error || !data) {
      console.error("Signed upload URL error:", error)
      return NextResponse.json({ error: "Could not prepare upload" }, { status: 500 })
    }

    return NextResponse.json({ path: data.path, signedUrl: data.signedUrl })
  } catch (err: any) {
    console.error("Upload Sign Error:", err)
    return NextResponse.json({ error: err.message || "An unexpected error occurred" }, { status: 500 })
  }
}
