import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { teamId, teamName, teamSize, members } = await req.json();
    
    console.log("Building team:", { teamId, teamName, teamSize, memberCount: members?.length });

    // Validate input
    if (!teamId || !teamName || !teamSize || !members) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate team size
    if (teamSize < 2 || teamSize > 4) {
      return new Response(
        JSON.stringify({ error: "Team size must be between 2 and 4" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate member count matches team size (team size includes leader)
    if (members.length !== teamSize - 1) {
      return new Response(
        JSON.stringify({ error: `Expected ${teamSize - 1} members for team size ${teamSize}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if team already has members
    const { data: existingMembers } = await supabase
      .from("team_members")
      .select("id")
      .eq("team_id", teamId);

    if (existingMembers && existingMembers.length > 0) {
      return new Response(
        JSON.stringify({ error: "Team already has members. Cannot rebuild team." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if team name is already taken by another team
    const { data: existingTeamName } = await supabase
      .from("teams")
      .select("id")
      .eq("team_name", teamName)
      .neq("id", teamId)
      .maybeSingle();

    if (existingTeamName) {
      return new Response(
        JSON.stringify({ error: "Team name already taken. Please choose a different name." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get team leader email to check against member emails
    const { data: team } = await supabase
      .from("teams")
      .select("lead_email")
      .eq("id", teamId)
      .single();

    if (!team) {
      return new Response(
        JSON.stringify({ error: "Team not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Collect all member emails
    const memberEmails = members.map((m: any) => m.email);

    // Check if leader email is in member emails
    if (memberEmails.includes(team.lead_email)) {
      return new Response(
        JSON.stringify({ error: "Team leader email cannot be used as a member email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate emails within members
    const emailSet = new Set(memberEmails);
    if (emailSet.size !== memberEmails.length) {
      return new Response(
        JSON.stringify({ error: "Duplicate emails detected in team members" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check each member email against existing records
    for (const member of members) {
      if (!member.email) continue;

      // Check in teams table (leader emails)
      const { data: existingInTeams } = await supabase
        .from("teams")
        .select("id")
        .eq("lead_email", member.email)
        .maybeSingle();

      if (existingInTeams) {
        return new Response(
          JSON.stringify({ error: `Email ${member.email} is already registered as a team leader` }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check in team_members table
      const { data: existingInMembers } = await supabase
        .from("team_members")
        .select("id")
        .eq("member_email", member.email)
        .maybeSingle();

      if (existingInMembers) {
        return new Response(
          JSON.stringify({ error: `Email ${member.email} is already registered as a team member` }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 1. Update team with name and size
    const { error: updateError } = await supabase
      .from("teams")
      .update({
        team_name: teamName,
        team_size: teamSize,
      })
      .eq("id", teamId);

    if (updateError) {
      console.error("Team update error:", updateError);
      throw new Error(`Failed to update team: ${updateError.message}`);
    }

    console.log("Team updated successfully");

    // 2. Insert team members
    const memberRecords = members.map((m: any) => ({
      team_id: teamId,
      member_name: m.name,
      member_email: m.email,
      member_reg_no: m.isVitChennai && m.regNo ? m.regNo : null,
      institution: m.isVitChennai ? "VIT Chennai" : (m.eventHubId || null),
    }));

    const { error: membersError } = await supabase
      .from("team_members")
      .insert(memberRecords);

    if (membersError) {
      console.error("Members insert error:", membersError);
      throw new Error(`Failed to add members: ${membersError.message}`);
    }

    console.log("Team members inserted successfully");

    // 3. Create scorecard for the team if it doesn't exist
    const { data: existingScorecard } = await supabase
      .from("scorecards")
      .select("id")
      .eq("team_id", teamId)
      .maybeSingle();

    if (!existingScorecard) {
      const { error: scorecardError } = await supabase
        .from("scorecards")
        .insert({
          team_id: teamId,
          total_score: 0,
          innovation_score: 0,
          technical_score: 0,
          presentation_score: 0,
        });

      if (scorecardError) {
        console.error("Scorecard creation error:", scorecardError);
        // Don't fail the whole operation if scorecard creation fails
      }
    }

    // 4. Optional: Send to Google Sheets
    const GOOGLE_SHEETS_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
    
    if (GOOGLE_SHEETS_URL) {
      const sheetData = {
        teamId,
        teamName,
        teamSize,
        leaderEmail: team.lead_email,
        members: members.map((m: any) => ({
          name: m.name,
          email: m.email,
          isVitChennai: m.isVitChennai,
          regNo: m.regNo || null,
          eventHubId: m.eventHubId || null,
        })),
        status: "Team Fully Built",
        timestamp: new Date().toISOString(),
      };

      try {
        await fetch(GOOGLE_SHEETS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sheetData),
        });
      } catch (sheetError) {
        console.error("Google Sheets error:", sheetError);
        // Don't fail if sheets fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Team built successfully" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Build team error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
