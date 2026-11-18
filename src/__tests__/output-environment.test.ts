import { describe, expect, it } from "vitest";
import { supportsLocalOutputRelay } from "@/lib/presentation/output-environment";

describe("Output deployment capabilities", () => {
  it("offers the local OBS relay only on loopback hostnames", () => {
    for (const host of ["localhost", "127.0.0.1", "[::1]"])
      expect(supportsLocalOutputRelay(host)).toBe(true);
    for (const host of [
      "heaven-churchos.vercel.app",
      "church.example.com",
      "localhost.example.com",
      "192.168.1.2",
    ])
      expect(supportsLocalOutputRelay(host)).toBe(false);
  });
});
