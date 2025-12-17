import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface LeaderboardEntry {
  position: number;
  team_name: string;
  total_score: number;
  innovation_score: number;
  implementation_score: number;
  presentation_score: number;
  impact_score: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const leaderboardStream = new ReadableStream({
      start(controller) {
        let lastLeaderboardHash = "";
        let lastScorecardTimestamp = null;

        // Optimized change detection: Check for scorecard updates instead of full table scan
        const checkForUpdates = async () => {
          try {
            // First check if any scorecards were updated recently
            const { data: recentUpdates, error: updateError } = await supabase
              .from("scorecards")
              .select("updated_at")
              .gt("updated_at", lastScorecardTimestamp || new Date(0).toISOString())
              .limit(1);

            if (updateError) {
              console.error("Update check error:", updateError);
              return;
            }

            // Only fetch full leaderboard if there are updates or it's the first run
            if (!lastScorecardTimestamp || (recentUpdates && recentUpdates.length > 0)) {
              const { data, error } = await supabase
                .from("leaderboard_view")
                .select("*")
                .order("position", { ascending: true });

              if (error) {
                console.error("Leaderboard fetch error:", error);
                controller.close();
                return;
              }

              const leaderboardData = data || [];
              const currentHash = JSON.stringify(leaderboardData);

              // Only send if data has changed
              if (currentHash !== lastLeaderboardHash) {
                const eventData = {
                  type: "leaderboard_update",
                  timestamp: new Date().toISOString(),
                  data: leaderboardData,
                  count: leaderboardData.length,
                  hasChanges: currentHash !== lastLeaderboardHash
                };

                controller.enqueue(`data: ${JSON.stringify(eventData)}\n\n`);
                lastLeaderboardHash = currentHash;
              }

              // Update timestamp to most recent update
              if (recentUpdates && recentUpdates.length > 0) {
                lastScorecardTimestamp = recentUpdates[0].updated_at;
              } else if (!lastScorecardTimestamp) {
                // Set initial timestamp
                lastScorecardTimestamp = new Date().toISOString();
              }
            } else {
              // Send heartbeat to keep connection alive
              const heartbeat = {
                type: "heartbeat",
                timestamp: new Date().toISOString(),
                message: "No changes detected"
              };
              controller.enqueue(`data: ${JSON.stringify(heartbeat)}\n\n`);
            }
          } catch (err) {
            console.error("Error checking for leaderboard updates:", err);
          }
        };

        // Initial data send
        checkForUpdates();

        // Set up efficient polling for changes (every 3 seconds for better responsiveness)
        const interval = setInterval(checkForUpdates, 3000);

        // Handle client disconnect
        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });

        // Handle connection close
        return () => {
          clearInterval(interval);
        };
      },
    });

    return new Response(leaderboardStream, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});