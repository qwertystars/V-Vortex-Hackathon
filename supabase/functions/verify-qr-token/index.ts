import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-scan-secret",
};

const encoder = new TextEncoder();

const sha256Hex = async (value: string) => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "Server is missing Supabase secrets" }, 500);
  }

  const expectedSecret = Deno.env.get("SCAN_SECRET") ?? "";
  const providedSecret = req.headers.get("x-scan-secret") ?? "";
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return jsonResponse({ ok: false, error: "Forbidden" }, 403);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch (error) {
    console.error("Invalid JSON body:", error);
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const rawToken = String(body.raw_token || "").trim();
  if (!rawToken) {
    return jsonResponse({ error: "Missing raw_token" }, 400);
  }

  const tokenHash = await sha256Hex(rawToken);
  const { data: tokenRow, error: tokenError } = await supabase
    .from("qr_tokens")
    .select("id, team_id, checkpoint, expires_at, used_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (tokenError) {
    console.error("Token lookup error:", tokenError);
  }

  if (!tokenRow) {
    return jsonResponse({ ok: false, error: "Invalid token" }, 404);
  }

  const now = new Date();
  const expiresAt = new Date(tokenRow.expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt <= now) {
    return jsonResponse({ ok: false, error: "Expired" }, 410);
  }

  const { data: teamRow } = await supabase
    .from("teams")
    .select("team_name")
    .eq("id", tokenRow.team_id)
    .maybeSingle();

  if (tokenRow.used_at) {
    const { data: existingAttendance } = await supabase
      .from("attendance")
      .select("checked_in_at")
      .eq("team_id", tokenRow.team_id)
      .eq("checkpoint", tokenRow.checkpoint)
      .maybeSingle();

    return jsonResponse({
      ok: true,
      team_id: tokenRow.team_id,
      team_name: teamRow?.team_name ?? null,
      checkpoint: tokenRow.checkpoint,
      already_checked_in: true,
      checked_in_at: existingAttendance?.checked_in_at ?? tokenRow.used_at,
    });
  }

  const { data: insertedAttendance, error: attendanceError } = await supabase
    .from("attendance")
    .insert(
      {
        team_id: tokenRow.team_id,
        checkpoint: tokenRow.checkpoint,
        checked_in_by_user_id: userData.user.id,
        source_token_id: tokenRow.id,
      },
      { onConflict: "team_id,checkpoint", ignoreDuplicates: true }
    )
    .select("checked_in_at")
    .maybeSingle();

  if (attendanceError) {
    console.error("Attendance insert error:", attendanceError);
    return jsonResponse({ ok: false, error: "Unable to record attendance" }, 500);
  }

  let alreadyCheckedIn = false;
  let checkedInAt = insertedAttendance?.checked_in_at ?? null;

  if (!checkedInAt) {
    alreadyCheckedIn = true;
    const { data: existingAttendance } = await supabase
      .from("attendance")
      .select("checked_in_at")
      .eq("team_id", tokenRow.team_id)
      .eq("checkpoint", tokenRow.checkpoint)
      .maybeSingle();
    checkedInAt = existingAttendance?.checked_in_at ?? null;
  }

  const usedAt = now.toISOString();
  const { error: updateError } = await supabase
    .from("qr_tokens")
    .update({
      used_at: usedAt,
      used_by_user_id: userData.user.id,
    })
    .eq("id", tokenRow.id)
    .is("used_at", null);

  if (updateError) {
    console.error("Token update error:", updateError);
  }

  return jsonResponse({
    ok: true,
    team_id: tokenRow.team_id,
    team_name: teamRow?.team_name ?? null,
    checkpoint: tokenRow.checkpoint,
    already_checked_in: alreadyCheckedIn,
    checked_in_at: checkedInAt ?? usedAt,
  });
});
