import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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

  const user = userData.user;

  const teamCode = String(body.teamCode || "").trim();
  const name = String(body.name || "").trim();
  const phoneRaw = String(body.phone || "").trim();
  const phone = phoneRaw ? phoneRaw : null;
  const universityName = String(body.universityName || "").trim();
  const eventHubIdRaw = String(body.eventHubId || "").trim();
  const eventHubId = eventHubIdRaw ? eventHubIdRaw : null;

  if (!teamCode || !name || !universityName) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: existingLeader } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_user_id", user.id)
    .maybeSingle();

  if (existingLeader?.id) {
    return new Response(JSON.stringify({ error: "User already leads a team" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: existingMembership } = await supabase
    .from("team_members")
    .select("team_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingMembership?.team_id) {
    return new Response(JSON.stringify({ error: "User already in a team" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const normalizedCode = teamCode.toUpperCase();
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("id, team_name, team_code")
    .ilike("team_code", normalizedCode)
    .maybeSingle();

  if (teamError) {
    console.error("Team lookup error:", teamError);
  }

  if (!team?.id) {
    return new Response(JSON.stringify({ error: "Team code not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { count } = await supabase
    .from("team_members")
    .select("user_id", { count: "exact", head: true })
    .eq("team_id", team.id);

  if ((count ?? 0) >= 4) {
    return new Response(JSON.stringify({ error: "Team is already full" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  await supabase.from("team_members").upsert(
    {
      team_id: team.id,
      user_id: user.id,
    },
    { onConflict: "team_id,user_id" }
  );

  await supabase.from("users").upsert(
    {
      id: user.id,
      email: user.email,
      name,
      phone,
      role: "team_member",
      university_name: universityName,
      event_hub_id: eventHubId,
      onboarding_complete: true,
    },
    { onConflict: "id" }
  );

  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      role: "team_member",
      team_id: team.id,
    },
  });

  return new Response(
    JSON.stringify({
      teamId: team.id,
      teamName: team.team_name,
      teamCode: team.team_code,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
