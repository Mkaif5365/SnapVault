import { DIRECT_UPLOAD_MAX_BYTES, MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "./limits"

/** Form fields sent with every upload (same names /api/upload has always read). */
export type UploadFields = Record<string, string | undefined>

type UploadResult = { success: true; fileId: string }

/**
 * Uploads one photo or video to the vault.
 * - Up to 4 MB: a single POST to /api/upload (unchanged path).
 * - Larger (up to 20 MB): signed upload straight to Supabase Storage, then
 *   /api/upload/complete forwards it to Telegram. Keeps every request to our
 *   Vercel Functions under the 4.5 MB body limit.
 * `onProgress` receives 0-100.
 */
export async function uploadMedia(
  file: Blob,
  fileName: string,
  fields: UploadFields,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File is too large (max ${MAX_UPLOAD_LABEL}).`)
  }

  if (file.size <= DIRECT_UPLOAD_MAX_BYTES) {
    const formData = new FormData()
    formData.append("file", file, fileName)
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) formData.append(key, value)
    }
    const response = await send("POST", "/api/upload", formData, {}, onProgress)
    return parseResult(response)
  }

  // 1. Ask the server for a one-time signed upload URL
  const signRes = await fetch("/api/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId: fields.eventId, fileName, size: file.size }),
  })
  const sign = await signRes.json().catch(() => ({}))
  if (!signRes.ok || !sign.signedUrl) {
    throw new Error(sign.error || "Could not prepare upload")
  }

  // 2. Put the file straight into Storage (same request shape as supabase-js uploadToSignedUrl)
  const body = new FormData()
  body.append("cacheControl", "3600")
  body.append("", file, fileName)
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
  await send(
    "PUT",
    sign.signedUrl,
    body,
    { "x-upsert": "false", apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    (p) => onProgress?.(Math.round(p * 0.9))
  )

  // 3. Server forwards it to Telegram and records it
  const completeRes = await fetch("/api/upload/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...fields, path: sign.path }),
  })
  const complete = await completeRes.json().catch(() => ({}))
  if (!completeRes.ok || !complete.success) {
    throw new Error(complete.error || `Upload failed with status ${completeRes.status}`)
  }
  onProgress?.(100)
  return complete
}

function parseResult(xhr: XMLHttpRequest): UploadResult {
  let response: any = {}
  try {
    response = JSON.parse(xhr.responseText)
  } catch {}
  if (!response.success) throw new Error(response.error || "Upload failed")
  return response
}

/** XHR wrapper so we keep upload progress events (fetch has none for request bodies). */
function send(
  method: string,
  url: string,
  body: FormData,
  headers: Record<string, string>,
  onProgress?: (percent: number) => void
): Promise<XMLHttpRequest> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)
    for (const [key, value] of Object.entries(headers)) xhr.setRequestHeader(key, value)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve(xhr)
      let message = `Upload failed with status ${xhr.status}`
      try {
        const parsed = JSON.parse(xhr.responseText)
        message = parsed.error || parsed.message || message
      } catch {}
      reject(new Error(message))
    }
    xhr.onerror = () => reject(new Error("Network error during upload"))
    xhr.send(body)
  })
}
