import { describe, expect, it } from "vitest";
import { routeForContext, ROUTES } from "./authRouting";

describe("routeForContext", () => {
  it("routes to login when context missing", () => {
    expect(routeForContext(null)).toBe(ROUTES.login);
  });

  it("routes leader without team to register", () => {
    expect(routeForContext({ role: "team_leader", teamId: null })).toBe(
      ROUTES.register
    );
  });

  it("routes leader with team to dashboard", () => {
    expect(routeForContext({ role: "team_leader", teamId: "team-1" })).toBe(
      ROUTES.leaderDashboard
    );
  });

  it("routes member without team to register", () => {
    expect(routeForContext({ role: "team_member", teamId: null })).toBe(
      ROUTES.register
    );
  });

  it("routes member with team to dashboard", () => {
    expect(
      routeForContext({
        role: "team_member",
        teamId: "team-1",
      })
    ).toBe(ROUTES.memberDashboard);
  });

  it("routes unknown role to register", () => {
    expect(routeForContext({ role: "admin" })).toBe(ROUTES.register);
  });
});
