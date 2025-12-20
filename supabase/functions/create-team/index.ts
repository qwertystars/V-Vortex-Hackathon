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

  const user = userData.user;
  const body = await req.json();

  const teamName = String(body.teamName || "").trim();
  const leaderName = String(body.leaderName || "").trim();
  const leaderReg = body.leaderReg ? String(body.leaderReg).trim() : null;
  const leaderEmail = String(body.leaderEmail || "").trim();
  const leaderPhone = body.leaderPhone ? String(body.leaderPhone).trim() : null;
  const receiptLink = body.receiptLink ? String(body.receiptLink).trim() : null;
  const eventHubId = body.eventHubId ? String(body.eventHubId).trim() : null;
  const universityName = String(body.universityName || "").trim();

  if (!teamName || !leaderName || !leaderEmail || !universityName) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (leaderEmail && user.email && leaderEmail !== user.email) {
    return new Response(JSON.stringify({ error: "Leader email mismatch" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: existingTeam } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_user_id", user.id)
    .maybeSingle();

  if (existingTeam?.id) {
    return new Response(JSON.stringify({ error: "Leader already has a team" }), {
      status: 409,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({
      team_name: teamName,
      leader_user_id: user.id,
      payment_link: receiptLink,
    })
    .select("id, team_name")
    .single();

  if (teamError || !team) {
    console.error("Team create error:", teamError);
    return new Response(JSON.stringify({ error: "Unable to create team" }), {
      status: 500,
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
      name: leaderName,
      phone: leaderPhone,
      role: "team_leader",
      university_name: universityName,
      event_hub_id: eventHubId,
      onboarding_complete: true,
    },
    { onConflict: "id" }
  );

  await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: {
      role: "team_leader",
      team_id: team.id,
      leader_reg: leaderReg,
    },
  });

  return new Response(JSON.stringify({ teamId: team.id }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
