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

    const { isVitChennai, eventHubId, leaderName, leaderReg, leaderEmail, receiptLink } = await req.json();
    
    console.log("Received team leader registration:", { leaderEmail, isVitChennai, receiptLink });

    // Validate input - conditional validation based on VIT Chennai status
    if (!leaderName || !leaderEmail || !receiptLink) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate VIT Chennai students have reg numbers
    if (isVitChennai === "yes" && !leaderReg) {
      return new Response(
        JSON.stringify({ error: "VIT Chennai students must provide registration number" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate non-VIT students have eventHubId
    if (isVitChennai === "no" && !eventHubId) {
      return new Response(
        JSON.stringify({ error: "Non-VIT students must provide EventHub Unique ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for duplicate leader email in teams table
    const { data: existingLeadEmail } = await supabase
      .from("teams")
      .select("id")
      .eq("lead_email", leaderEmail)
      .maybeSingle();

    if (existingLeadEmail) {
      return new Response(
        JSON.stringify({ error: "This email is already registered as a team leader. Each email can only be used once." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if leader email exists in team_members table
    const { data: existingMemberEmail } = await supabase
      .from("team_members")
      .select("id")
      .eq("member_email", leaderEmail)
      .maybeSingle();

    if (existingMemberEmail) {
      return new Response(
        JSON.stringify({ error: "This email is already registered as a team member. Each email can only be used once." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Insert team leader into database (team not fully formed yet)
    // Generate random temporary team name
    const randomId = crypto.randomUUID().split('-')[0].toUpperCase();
    const teamData = {
      team_name: `TEMP-${randomId}`, // Temporary random name, will be updated when building team
      team_size: 2, // Set to minimum size (2) to satisfy constraint, will be updated when building team
      lead_name: leaderName,
      lead_reg_no: isVitChennai === "yes" ? leaderReg : null,
      institution: isVitChennai === "yes" ? "VIT Chennai" : eventHubId,
      lead_email: leaderEmail,
      receipt_link: receiptLink,
    };
    
    console.log("Inserting team leader data:", teamData);
    
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert(teamData)
      .select()
      .single();

    if (teamError) {
      console.error("Database error:", teamError);
      throw new Error(`Database error: ${teamError.message}`);
    }
    
    console.log("Team leader registered successfully:", team.id);
    
    // Optional: Send to Google Sheets (for team leader registration only)
    const GOOGLE_SHEETS_URL = Deno.env.get("GOOGLE_SHEETS_WEBHOOK_URL");
    
    if (GOOGLE_SHEETS_URL) {
      const sheetData = {
        teamId: team.id,
        teamName: teamData.team_name,
        leaderName,
        leaderEmail,
        isVitChennai,
        leaderReg: isVitChennai === "yes" ? leaderReg : null,
        eventHubId: isVitChennai === "no" ? eventHubId : null,
        receiptLink,
        registrationStatus: "Leader Registered - Team Pending",
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
        // Don't fail the registration if sheets fails
      }
    }

    return new Response(
      JSON.stringify({ success: true, teamId: team.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
