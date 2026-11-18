import {
  createRelaySession,
  publishRelaySnapshot,
  readRelaySnapshot,
} from "@/lib/presentation/output-relay.server";
import { isSyncedPresentationState } from "@/lib/presentation/validate-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

// This in-memory transport is deliberately limited to a local, single-process server.
function allowed(request: Request): boolean {
  if (process.env.VERCEL === "1") return false;
  try {
    const host = request.headers.get("host") ?? new URL(request.url).host;
    return ["127.0.0.1", "localhost", "[::1]"].includes(
      new URL(`http://${host}`).hostname
    );
  } catch {
    return false;
  }
}
function sameOrigin(request: Request): boolean {
  try {
    const origin = new URL(request.headers.get("origin") ?? "");
    return (
      origin.host === (request.headers.get("host") ?? new URL(request.url).host) &&
      origin.protocol === new URL(request.url).protocol
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!allowed(request) || !sameOrigin(request))
    return new Response(null, { status: 403, headers });
  const session = createRelaySession();
  return Response.json(
    session ?? { error: "Too many output sessions. Restart the local server." },
    { status: session ? 201 : 429, headers }
  );
}

export async function GET(request: Request) {
  if (!allowed(request)) return new Response(null, { status: 403, headers });
  const key = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  const snapshot = readRelaySnapshot(key);
  return Response.json(
    snapshot ?? { error: "Output session expired. Generate a new link in Outputs." },
    { status: snapshot ? 200 : 404, headers }
  );
}

export async function PUT(request: Request) {
  if (!allowed(request) || !sameOrigin(request))
    return new Response(null, { status: 403, headers });
  const reader = request.body?.getReader();
  if (!reader) return new Response(null, { status: 400, headers });
  let bytes = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 262144) {
      await reader.cancel();
      return new Response(null, { status: 413, headers });
    }
    chunks.push(value);
  }
  try {
    const payload: unknown = JSON.parse(new TextDecoder().decode(Buffer.concat(chunks)));
    if (
      !payload ||
      typeof payload !== "object" ||
      !("readKey" in payload) ||
      !("state" in payload) ||
      typeof payload.readKey !== "string" ||
      !isSyncedPresentationState(payload.state)
    )
      return new Response(null, { status: 400, headers });
    const writeKey = request.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
    if (!publishRelaySnapshot(payload.readKey, writeKey, payload.state))
      return new Response(null, { status: 403, headers });
    return new Response(null, { status: 204, headers });
  } catch {
    return new Response(null, { status: 400, headers });
  }
}
