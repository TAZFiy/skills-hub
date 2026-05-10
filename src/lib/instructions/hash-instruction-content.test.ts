import { describe, expect, it } from "vitest";

import { hashInstructionContent } from "@/src/lib/instructions/hash-instruction-content";

describe("hashInstructionContent", () => {
  it("returns a stable hash for identical content", () => {
    expect(hashInstructionContent("abc")).toBe(hashInstructionContent("abc"));
  });

  it("returns a different hash for different content", () => {
    expect(hashInstructionContent("abc")).not.toBe(hashInstructionContent("abcd"));
  });
});
