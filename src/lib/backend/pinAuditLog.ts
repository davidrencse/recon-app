import { supabaseServer } from "@/lib/supabase/server";
import type { PinAuditLog, PinAuditLogInsert } from "@/types/backend";

function rowToAuditLog(row: Record<string, unknown>): PinAuditLog {
  return {
    id:             row.id as string,
    pinId:          (row.pin_id as string)          ?? null,
    postId:         (row.post_id as string)         ?? null,
    eventType:      row.event_type as PinAuditLog["eventType"],
    previousStatus: (row.previous_status as PinAuditLog["previousStatus"]) ?? null,
    newStatus:      (row.new_status as PinAuditLog["newStatus"])            ?? null,
    reason:         (row.reason as string)          ?? null,
    source:         (row.source as string)          ?? null,
    metadata:       (row.metadata as Record<string, unknown>) ?? null,
    createdAt:      row.created_at as string,
  };
}

/** Record a pin lifecycle event. Never throws — failures are logged to console. */
export async function logPinEvent(input: PinAuditLogInsert): Promise<PinAuditLog | null> {
  const { data, error } = await supabaseServer
    .from("pin_audit_log")
    .insert({
      pin_id:          input.pin_id          ?? null,
      post_id:         input.post_id         ?? null,
      event_type:      input.event_type,
      previous_status: input.previous_status ?? null,
      new_status:      input.new_status      ?? null,
      reason:          input.reason          ?? null,
      source:          input.source          ?? null,
      metadata:        input.metadata        ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("[pinAuditLog] logPinEvent failed:", error.message);
    return null;
  }

  return rowToAuditLog(data as Record<string, unknown>);
}

/** Fetch audit history for a single pin by its DB id. */
export async function getPinAuditHistory(pinId: string): Promise<PinAuditLog[]> {
  const { data, error } = await supabaseServer
    .from("pin_audit_log")
    .select("*")
    .eq("pin_id", pinId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[pinAuditLog] getPinAuditHistory failed:", error.message);
    return [];
  }

  return (data ?? []).map(rowToAuditLog);
}

/** Fetch audit history for a source post_id across all pins. */
export async function getPostAuditHistory(postId: string): Promise<PinAuditLog[]> {
  const { data, error } = await supabaseServer
    .from("pin_audit_log")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[pinAuditLog] getPostAuditHistory failed:", error.message);
    return [];
  }

  return (data ?? []).map(rowToAuditLog);
}
