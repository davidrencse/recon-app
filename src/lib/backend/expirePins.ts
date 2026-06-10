import { supabaseServer } from "@/lib/supabase/server";

export type ExpireResult = {
  expiredCount: number;
  errors: string[];
};

/**
 * Bulk-expire all active pins whose expires_at is in the past.
 * Updates status active → expired and writes audit log rows.
 * Never throws — errors are returned in the result.
 */
export async function expireOldPins(): Promise<ExpireResult> {
  const errors: string[] = [];
  const now = new Date().toISOString();

  // Find active pins past their expiry
  const { data: expiredPins, error: findError } = await supabaseServer
    .from("pins")
    .select("id")
    .eq("status", "active")
    .lt("expires_at", now);

  if (findError) {
    errors.push(`Failed to query expired pins: ${findError.message}`);
    return { expiredCount: 0, errors };
  }

  if (!expiredPins || expiredPins.length === 0) {
    return { expiredCount: 0, errors };
  }

  const pinIds = (expiredPins as { id: string }[]).map((p) => p.id);

  // Bulk status update
  const { error: updateError } = await supabaseServer
    .from("pins")
    .update({ status: "expired" })
    .in("id", pinIds);

  if (updateError) {
    errors.push(`Failed to update pin status: ${updateError.message}`);
    return { expiredCount: 0, errors };
  }

  // Bulk audit log — non-fatal if this fails
  const auditRows = pinIds.map((id) => ({
    pin_id: id,
    event_type: "expired",
    previous_status: "active",
    new_status: "expired",
    reason: "scheduled_expiry",
    source: "cron",
  }));

  const { error: auditError } = await supabaseServer
    .from("pin_audit_log")
    .insert(auditRows);

  if (auditError) {
    console.error("[expirePins] audit log insert failed:", auditError.message);
    errors.push(`Audit log failed (pins still expired): ${auditError.message}`);
  }

  return { expiredCount: pinIds.length, errors };
}
