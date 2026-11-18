import { describe, expect, it, vi } from "vitest";
import { GET, POST, PUT } from "@/app/api/output-relay/route";
import {
  createRelaySession,
  publishRelaySnapshot,
  readRelaySnapshot,
} from "@/lib/presentation/output-relay.server";
import type { SyncedPresentationState } from "@/lib/presentation/sync";

const state: SyncedPresentationState = {
  status: "live",
  liveSlide: {
    id: "test",
    text: "Ready for worship",
    layout: "full-screen",
    background: { id: "black", type: "color", name: "Black" },
  },
  nextSlide: null,
  layoutOverride: null,
  backgroundOverride: null,
  activeAlert: null,
  activeTransition: "cut",
  transitionDurationMs: 0,
  updatedAt: 1,
};

describe("Local OBS transport", () => {
  it("disables the process-local relay on Vercel even if a loopback Host is supplied", async () => {
    vi.stubEnv("VERCEL", "1");
    try {
      const request = () =>
        new Request("http://localhost/api/output-relay", {
          method: "POST",
          headers: { origin: "http://localhost" },
        });
      expect((await POST(request())).status).toBe(403);
      expect((await GET(new Request("http://localhost/api/output-relay"))).status).toBe(
        403
      );
      expect(
        (
          await PUT(
            new Request("http://localhost/api/output-relay", {
              method: "PUT",
              headers: { origin: "http://localhost" },
              body: "{}",
            })
          )
        ).status
      ).toBe(403);
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it("handles Next.js normalizing the internal URL hostname to localhost", async () => {
    const response = await POST(
      new Request("http://localhost:3100/api/output-relay", {
        method: "POST",
        headers: { host: "127.0.0.1:3100", origin: "http://127.0.0.1:3100" },
      })
    );
    expect(response.status).toBe(201);
  });
  it("isolates output sessions and never exposes write credentials to readers", () => {
    const first = createRelaySession()!;
    const second = createRelaySession()!;
    expect(publishRelaySnapshot(first.readKey, first.readKey, state)).toBe(false);
    expect(publishRelaySnapshot(first.readKey, second.writeKey, state)).toBe(false);
    expect(publishRelaySnapshot(first.readKey, first.writeKey, state)).toBe(true);
    expect(readRelaySnapshot(first.readKey)).toEqual({ revision: 1, state });
    expect(readRelaySnapshot(second.readKey)).toEqual({ revision: 0, state: null });
    expect(readRelaySnapshot("missing")).toBeNull();
    expect(JSON.stringify(readRelaySnapshot(first.readKey))).not.toContain(
      first.writeKey
    );
  });

  it("accepts local same-origin publication and requires the write key", async () => {
    const created = await POST(
      new Request("http://127.0.0.1:3000/api/output-relay", {
        method: "POST",
        headers: { origin: "http://127.0.0.1:3000" },
      })
    );
    expect(created.status).toBe(201);
    const session = (await created.json()) as { readKey: string; writeKey: string };
    const publish = (key: string) =>
      PUT(
        new Request("http://127.0.0.1:3000/api/output-relay", {
          method: "PUT",
          headers: { origin: "http://127.0.0.1:3000", authorization: `Bearer ${key}` },
          body: JSON.stringify({ readKey: session.readKey, state }),
        })
      );
    expect((await publish(session.readKey)).status).toBe(403);
    expect((await publish(session.writeKey)).status).toBe(204);
    const response = await GET(
      new Request("http://127.0.0.1:3000/api/output-relay", {
        headers: { authorization: `Bearer ${session.readKey}` },
      })
    );
    expect(await response.json()).toEqual({ revision: 1, state });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects remote, cross-origin, malformed and oversized publications", async () => {
    expect(
      (
        await POST(
          new Request("https://example.com/api/output-relay", {
            method: "POST",
            headers: { origin: "https://example.com" },
          })
        )
      ).status
    ).toBe(403);
    expect(
      (
        await POST(
          new Request("http://localhost/api/output-relay", {
            method: "POST",
            headers: { origin: "https://example.com" },
          })
        )
      ).status
    ).toBe(403);
    for (const body of [
      "{}",
      JSON.stringify({ readKey: "x", state: { status: "live" } }),
    ]) {
      expect(
        (
          await PUT(
            new Request("http://localhost/api/output-relay", {
              method: "PUT",
              headers: { origin: "http://localhost" },
              body,
            })
          )
        ).status
      ).toBe(400);
    }
    expect(
      (
        await PUT(
          new Request("http://localhost/api/output-relay", {
            method: "PUT",
            headers: { origin: "http://localhost" },
            body: "x".repeat(262145),
          })
        )
      ).status
    ).toBe(413);
  });
});
