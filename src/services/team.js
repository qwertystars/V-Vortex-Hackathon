// Mock delay helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const teamService = {
  async getTeamDetails(teamId) {
    await delay(500);
    return {
      id: teamId || "mock-team-id",
      team_name: "CyberNinjas",
      lead_name: "Neo",
      lead_email: "neo@matrix.com",
    };
  },

  async getScorecard(teamId) {
    await delay(500);
    return {
      team_id: teamId,
      total_score: 1500,
      breakdown: {
        innovation: 80,
        tech: 90,
        ui: 75
      }
    };
  },

  async getLeaderboard() {
    await delay(500);
    return [
       { team_name: "CyberNinjas", score: 1500, position: 1, delta: 100 },
       { team_name: "CodeWarriors", score: 1200, position: 2, delta: 50 },
       { team_name: "ByteBusters", score: 900, position: 3, delta: -20 },
       { team_name: "NullPointers", score: 850, position: 4, delta: 10 },
       { team_name: "RecursionRebels", score: 800, position: 5, delta: 0 },
    ];
  },

  async registerTeam(registrationData) {
    await delay(1500);
    console.log("Mock Registration Data:", registrationData);
    // Simulate random failure
    // if (Math.random() < 0.1) throw new Error("Random simulation error");
    return { success: true, teamId: "new-mock-team-id" };
  }
};
