"use server"

import { createClient } from "@/lib/supabase/server"

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

export async function removeParticipant(participantId: string, eventId: string) {
  const supabase = await createClient()
  
  // Verify host ownership
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: event } = await supabase
    .from('events')
    .select('host_id')
    .eq('id', eventId)
    .single()

  if (!event || event.host_id !== user.id) return { error: "Unauthorized" }

  // Set participant status to 'removed' (keep their photos)
  const { error } = await supabase
    .from('participants')
    .update({ status: 'removed' })
    .eq('id', participantId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function kickParticipant(participantId: string, eventId: string) {
  const supabase = await createClient()
  
  // Verify host ownership
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: event } = await supabase
    .from('events')
    .select('host_id')
    .eq('id', eventId)
    .single()

  if (!event || event.host_id !== user.id) return { error: "Unauthorized" }

  // 1. Delete participant's photos
  const { error: photoError } = await supabase
    .from('photos')
    .delete()
    .eq('participant_id', participantId)
    .eq('event_id', eventId)

  if (photoError) return { error: photoError.message }

  // 2. Set status to 'kicked'
  const { error } = await supabase
    .from('participants')
    .update({ status: 'kicked' })
    .eq('id', participantId)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updateRevealTime(eventId: string, newRevealTime: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from('events')
    .update({ reveal_time: newRevealTime })
    .eq('id', eventId)
    .eq('host_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function toggleEventLock(eventId: string, isLocked: boolean) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from('events')
    .update({ is_locked: isLocked })
    .eq('id', eventId)
    .eq('host_id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}

export async function applyPromocode(eventId: string, code: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // 1. Find the promocode
  const { data: promo, error: promoError } = await supabase
    .from('promocodes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .single()

  if (promoError || !promo) return { error: "Invalid promocode." }
  if (promo.is_used) return { error: "This promocode has already been used." }

  // 2. Apply limit to event
  const { error: updateError } = await supabase
    .from('events')
    .update({ photo_limit: promo.photo_limit })
    .eq('id', eventId)
    .eq('host_id', user.id)

  if (updateError) return { error: updateError.message }

  // 3. Mark promo as used
  await supabase
    .from('promocodes')
    .update({ is_used: true, used_by_event_id: eventId })
    .eq('id', promo.id)

  return { success: true, newLimit: promo.photo_limit }
}

export async function deleteMedia(photoId: string, eventId: string) {
  const supabase = await createClient()
  
  // 1. Verify host ownership
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { data: event } = await supabase
    .from('events')
    .select('host_id')
    .eq('id', eventId)
    .single()

  if (!event || event.host_id !== user.id) return { error: "Unauthorized" }

  // 2. Delete the photo
  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId)
    .eq('event_id', eventId)

  if (error) return { error: error.message }
  return { success: true }
}
