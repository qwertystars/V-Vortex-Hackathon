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

    const { teamName, teamSize, leaderName, leaderReg, leaderEmail, members } = await req.json();

    // Validate input
    if (!teamName || !leaderName || !leaderReg || !leaderEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Insert team into database
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        team_name: teamName,
        team_size: teamSize,
        lead_name: leaderName,
        lead_reg_no: leaderReg,
        lead_email: leaderEmail,
      })
      .select()
      .single();

    if (teamError) {
      throw new Error(`Database error: ${teamError.message}`);
    }

    // 2. Insert team members if any
    if (members && members.length > 0) {
      const memberRecords = members.map((m: any) => ({
        team_id: team.id,
        member_name: m.name,
        member_reg_no: m.reg,
      }));

      const { error: membersError } = await supabase
        .from("team_members")
        .insert(memberRecords);

      if (membersError) {
        throw new Error(`Members insert error: ${membersError.message}`);
      }
    }

    // 3. Send to Google Sheets
    const GOOGLE_SHEETS_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
    
    if (GOOGLE_SHEETS_URL) {
      const sheetData = {
        teamName,
        teamSize,
        leaderName,
        leaderReg,
        leaderEmail,
        members: members || [],
        timestamp: new Date().toISOString(),
      };

      await fetch(GOOGLE_SHEETS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sheetData),
      });
    }

    return new Response(
      JSON.stringify({ success: true, teamId: team.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
