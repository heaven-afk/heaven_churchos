// Run against `npm run start:local`. This independent HTTP client shares no
// browser cookies, localStorage or BroadcastChannel with the operator.
import assert from "node:assert/strict";

const base = new URL(process.argv[2] ?? "http://127.0.0.1:3000");
assert(
  ["127.0.0.1", "localhost", "[::1]"].includes(base.hostname),
  "Use a local server."
);
const endpoint = new URL("/api/output-relay", base);
const created = await fetch(endpoint, {
  method: "POST",
  headers: { origin: base.origin },
});
assert.equal(created.status, 201, "Local relay session creation failed");
const { readKey, writeKey } = await created.json();
const state = {
  status: "live",
  liveSlide: {
    id: "verification",
    text: "Output verification",
    layout: "full-screen",
    background: { id: "black", type: "color", name: "Black" },
  },
  nextSlide: null,
  layoutOverride: null,
  backgroundOverride: null,
  activeAlert: null,
  activeTransition: "cut",
  transitionDurationMs: 0,
  updatedAt: Date.now(),
};
for (const status of ["live", "frozen", "black", "clear"]) {
  state.status = status;
  const published = await fetch(endpoint, {
    method: "PUT",
    headers: { origin: base.origin, authorization: `Bearer ${writeKey}` },
    body: JSON.stringify({ readKey, state }),
  });
  assert.equal(published.status, 204);
  const received = await fetch(endpoint, {
    headers: { authorization: `Bearer ${readKey}` },
  });
  assert.equal(received.status, 200);
  assert.equal(received.headers.get("cache-control"), "no-store");
  const snapshot = await received.json();
  assert.equal(snapshot.state.status, status);
  assert.equal(snapshot.state.liveSlide.text, "Output verification");
  assert(!JSON.stringify(snapshot).includes(writeKey));
}
const denied = await fetch(endpoint, {
  method: "PUT",
  headers: { origin: base.origin, authorization: `Bearer ${readKey}` },
  body: JSON.stringify({ readKey, state }),
});
assert.equal(denied.status, 403, "Output readers must not be allowed to publish");
for (const version of ["KJV", "WEB", "ASV", "BBE", "YLT", "WBS", "OYCB"]) {
  const response = await fetch(new URL(`/bibles/${version}/JHN.json`, base));
  assert.equal(response.status, 200);
  const book = await response.json();
  const verse = book["3"].find((v) => v.verse === 16);
  assert(verse?.text.length > 20);
  if (version === "KJV") assert(verse.text.includes("only begotten Son"));
  if (version === "OYCB") assert(verse.text.includes("Ọlọ́run"));
}
for (const route of [
  "/",
  "/presentation?target=congregation",
  "/presentation?target=livestream",
]) {
  const response = await fetch(new URL(route, base), { redirect: "manual" });
  assert.equal(response.status, 200, `Failed route: ${route}`);
}
console.log(
  "PASS: independent HTTP output client; live/frozen/black/clear transport; read-only access; seven Bible assets; standalone routes."
);
console.log("Native OBS recording and projector hardware acceptance are still required.");
