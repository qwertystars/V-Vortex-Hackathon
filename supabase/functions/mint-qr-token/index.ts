import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const allowedCheckpoints = new Set(["entry_1", "entry_2", "entry_3"]);
const encoder = new TextEncoder();

const toBase64Url = (bytes: Uint8Array) => {
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const sha256Hex = async (value: string) => {
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const resolveTtlHours = () => {
  const raw = Number(Deno.env.get("QR_TTL_HOURS") ?? "12");
  if (!Number.isFinite(raw) || raw <= 0) return 12;
  return raw;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Server is missing Supabase secrets" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch (error) {
    console.error("Invalid JSON body:", error);
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const checkpoint = String(body.checkpoint || "").trim();
  if (!allowedCheckpoints.has(checkpoint)) {
    return new Response(JSON.stringify({ error: "Invalid checkpoint" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const user = userData.user;

  const { data: leaderTeam, error: leaderError } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_user_id", user.id)
    .maybeSingle();

  if (leaderError) {
    console.error("Leader lookup error:", leaderError);
  }

  if (!leaderTeam?.id) {
    return new Response(JSON.stringify({ error: "Only team leaders can mint tokens" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const ttlHours = resolveTtlHours();
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  let rawToken = "";
  let tokenHash = "";
  let insertError: { message?: string; code?: string } | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    rawToken = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
    tokenHash = await sha256Hex(rawToken);

    const { error } = await supabase.from("qr_tokens").insert({
      team_id: leaderTeam.id,
      checkpoint,
      token_hash: tokenHash,
      issued_by_user_id: user.id,
      expires_at: expiresAt.toISOString(),
    });

    if (!error) {
      insertError = null;
      break;
    }

    insertError = error as { message?: string; code?: string };
    if (error.code !== "23505") {
      break;
    }
  }

  if (insertError) {
    console.error("QR token insert error:", insertError);
    return new Response(JSON.stringify({ error: "Unable to mint token" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      raw_token: rawToken,
      expires_at: expiresAt.toISOString(),
      checkpoint,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
