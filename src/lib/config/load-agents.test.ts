import { describe, expect, it } from "vitest";

import { loadAgents } from "@/src/lib/config/load-agents";

describe("loadAgents", () => {
  it("loads enabled agent definitions", async () => {
    const agents = await loadAgents();

    expect(agents.length).toBeGreaterThan(0);
    expect(agents.some((agent) => agent.id === "claude")).toBe(true);
  });
});
