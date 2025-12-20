export const ROUTES = {
  login: "/login",
  otp: "/otp",
  leaderRegister: "/register",
  leaderDashboard: "/dashboard",
  memberDashboard: "/member",
  memberOnboarding: "/onboarding",
  waiting: "/waiting",
  invite: "/invite",
};

export function routeForContext(context) {
  if (!context || !context.role) {
    return ROUTES.login;
  }

  if (context.role === "team_leader") {
    return context.teamId ? ROUTES.leaderDashboard : ROUTES.leaderRegister;
  }

  if (context.role === "team_member") {
    if (!context.teamId) {
      return ROUTES.waiting;
    }
    return context.onboardingComplete
      ? ROUTES.memberDashboard
      : ROUTES.memberOnboarding;
  }

  return ROUTES.waiting;
}
