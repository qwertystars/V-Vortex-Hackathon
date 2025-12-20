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

  let role = null as null | "team_leader" | "team_member";
  let teamId = null as string | null;

  const { data: leaderTeam } = await supabase
    .from("teams")
    .select("id")
    .eq("leader_user_id", user.id)
    .maybeSingle();

  if (leaderTeam?.id) {
    role = "team_leader";
    teamId = leaderTeam.id;
  } else {
    const { data: membership } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership?.team_id) {
      role = "team_member";
      teamId = membership.team_id;
    }
  }

  if (!role) {
    role = "team_leader";
  }

  let onboardingComplete = false;
  if (role === "team_member") {
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("onboarding_complete")
      .eq("id", user.id)
      .maybeSingle();

    if (!profileError && profile) {
      onboardingComplete = Boolean(profile.onboarding_complete);
    }

    if (teamId) {
      await supabase
        .from("team_invites")
        .update({
          status: "accepted",
          accepted_at: new Date().toISOString(),
          invited_user_id: user.id,
        })
        .eq("team_id", teamId)
        .eq("email", user.email)
        .is("accepted_at", null);
    }
  } else {
    onboardingComplete = true;
  }

  return new Response(
    JSON.stringify({
      role,
      teamId,
      onboardingComplete,
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
