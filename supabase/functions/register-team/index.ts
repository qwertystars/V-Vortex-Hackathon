import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...(init.headers || {}) },
  });
}

function asString(value: unknown) {
  if (typeof value === "string") return value;
  return null;
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) return Number(value);
  return null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ??
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !supabaseKey) {
      return jsonResponse({ error: "Supabase environment not configured" }, { status: 500 });
    }

    const authorization = req.headers.get("authorization") ?? "";

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: authorization ? { authorization } : {},
      },
    });

    const payload = await req.json();

    const teamName = asString(payload?.teamName);
    const teamSize = asNumber(payload?.teamSize);
    const isVitChennai = asString(payload?.isVitChennai);
    const leaderName = asString(payload?.leaderName);
    const leaderReg = asString(payload?.leaderReg);
    const leaderEmail = asString(payload?.leaderEmail);
    const receiptLink = asString(payload?.receiptLink);
    const members = Array.isArray(payload?.members) ? payload.members : [];

    // Backwards-compat: frontend currently sends `eventHubId` for non-VIT.
    const institution =
      asString(payload?.institution) ??
      asString(payload?.eventHubId) ??
      null;

    const isVit = isVitChennai === "yes";

    console.log("Received registration:", {
      teamName,
      leaderEmail,
      teamSize,
      isVitChennai,
      membersCount: members?.length ?? 0,
    });

    const { data: registered, error: registerError } = await supabase.rpc("register_team_v1", {
      p_team_name: teamName,
      p_team_size: teamSize,
      p_is_vit_chennai: isVit,
      p_institution: institution,
      p_leader_name: leaderName,
      p_leader_reg_no: leaderReg,
      p_leader_email: leaderEmail,
      p_receipt_link: receiptLink,
      p_members: members,
    });

    if (registerError) {
      const status =
        registerError.code === "23505" ? 409 :
        registerError.code === "22023" ? 400 :
        500;

      return jsonResponse(
        { error: registerError.message, code: registerError.code },
        { status },
      );
    }

    const resultRow = Array.isArray(registered) ? registered[0] : null;
    const teamId = resultRow?.team_id ?? null;
    const insertedMemberCount = resultRow?.inserted_member_count ?? null;

    // 3. Send to Google Sheets
    const GOOGLE_SHEETS_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
    
    let sheetsOk = true;
    if (GOOGLE_SHEETS_URL) {
      try {
        const sheetData = {
          teamName,
          teamSize,
          isVitChennai,
          institution: isVit ? "VIT Chennai" : institution,
          leaderName,
          leaderReg: isVit ? leaderReg : "N/A",
          leaderEmail,
          receiptLink,
          members: members || [],
          timestamp: new Date().toISOString(),
        };

        const resp = await fetch(GOOGLE_SHEETS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sheetData),
        });

        if (!resp.ok) {
          sheetsOk = false;
          console.warn("Google Sheets webhook failed:", resp.status, await resp.text());
        }
      } catch (err) {
        sheetsOk = false;
        console.warn("Google Sheets webhook error:", err);
      }
    }

    return jsonResponse({
      success: true,
      teamId,
      insertedMemberCount,
      sheetsOk,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return jsonResponse(
      { error: error?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
});
