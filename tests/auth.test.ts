import { describe, expect, it } from "vitest";
import { createSessionToken, verifySessionToken } from "../lib/auth";

describe("auth session tokens", () => {
  it("round-trips a valid session token", () => {
    const token = createSessionToken("manager");
    const session = verifySessionToken(token);

    expect(session?.username).toBe("manager");
    expect(session?.expiresAt).toBeGreaterThan(Date.now());
  });

  it("rejects a tampered token", () => {
    const token = createSessionToken("manager");
    const tampered = `${token.slice(0, -1)}x`;

    expect(verifySessionToken(tampered)).toBeNull();
  });
});
