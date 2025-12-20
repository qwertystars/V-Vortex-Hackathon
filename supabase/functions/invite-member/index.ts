import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const siteUrl =
  Deno.env.get("SITE_URL") ??
  Deno.env.get("APP_URL") ??
  Deno.env.get("SUPABASE_SITE_URL") ??
  "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  try {
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
    const email = String(body.email || "").trim().toLowerCase();
    const teamId = String(body.teamId || "").trim();

  if (!email || !teamId) {
    return new Response(JSON.stringify({ error: "Missing invite details" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (user.email && email === user.email) {
    return new Response(JSON.stringify({ error: "Cannot invite yourself" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

    const { data: existingAuth, error: existingAuthError } = await supabase
      .schema("auth")
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (existingAuthError) {
      console.error("Lookup error:", existingAuthError);
    }
    const existingUserId = existingAuth?.id ?? null;

  if (existingUserId) {
    const { data: existingMembership } = await supabase
      .from("team_members")
      .select("team_id")
      .eq("user_id", existingUserId)
      .maybeSingle();

    if (existingMembership?.team_id) {
      if (existingMembership.team_id === teamId) {
        return new Response(JSON.stringify({ status: "already_member" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "User already in another team" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const { data: existingInvite } = await supabase
    .from("team_invites")
    .select("status")
    .eq("team_id", teamId)
    .eq("email", email)
    .maybeSingle();

  if (existingInvite && ["pending", "accepted"].includes(existingInvite.status)) {
    return new Response(JSON.stringify({ status: "already_invited" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: team } = await supabase
    .from("teams")
    .select("id, leader_user_id")
    .eq("id", teamId)
    .maybeSingle();

  if (!team || team.leader_user_id !== user.id) {
    return new Response(JSON.stringify({ error: "Not authorized to invite" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { count } = await supabase
    .from("team_members")
    .select("user_id", { count: "exact", head: true })
    .eq("team_id", teamId);

  if ((count ?? 0) >= 4) {
    return new Response(JSON.stringify({ error: "Team is already full" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const redirectTo = siteUrl
    ? `${siteUrl.replace(/\/$/, "")}/invite`
    : undefined;

  const { data: inviteData, error: inviteError } =
    await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        role: "team_member",
        team_id: teamId,
        invited_by: user.id,
      },
      redirectTo,
    });

  if (inviteError) {
    console.error("Invite error:", inviteError);
    return new Response(JSON.stringify({ error: inviteError.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const invitedUserId = inviteData?.user?.id ?? null;

  if (invitedUserId) {
    await supabase.auth.admin.updateUserById(invitedUserId, {
      app_metadata: {
        role: "team_member",
        team_id: teamId,
      },
    });

    await supabase.from("team_members").upsert(
      {
        team_id: teamId,
        user_id: invitedUserId,
      },
      { onConflict: "team_id,user_id" }
    );
  }

  await supabase.from("team_invites").upsert(
    {
      team_id: teamId,
      email,
      invited_by: user.id,
      invited_user_id: invitedUserId,
      status: "pending",
      created_at: new Date().toISOString(),
    },
    { onConflict: "team_id,email" }
  );

    return new Response(JSON.stringify({ status: "sent" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Unhandled invite-member error:", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
