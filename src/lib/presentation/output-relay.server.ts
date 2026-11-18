import { randomBytes } from "node:crypto";
import type { OutputRelaySession, OutputRelaySnapshot } from "@/types/output-relay.types";
import type { SyncedPresentationState } from "./sync";

interface RelayEntry extends OutputRelaySnapshot {
  writeKey: string;
  touched: number;
}
const scope = globalThis as typeof globalThis & {
  outputRelaySessions?: Map<string, RelayEntry>;
};
const sessions = (scope.outputRelaySessions ??= new Map<string, RelayEntry>());
const TTL = 12 * 60 * 60 * 1000;

export function createRelaySession(): OutputRelaySession | null {
  for (const [key, entry] of sessions)
    if (Date.now() - entry.touched > TTL) sessions.delete(key);
  if (sessions.size >= 32) return null;
  const readKey = randomBytes(24).toString("hex");
  const writeKey = randomBytes(24).toString("hex");
  sessions.set(readKey, { writeKey, revision: 0, state: null, touched: Date.now() });
  return { readKey, writeKey };
}

export function readRelaySnapshot(readKey: string): OutputRelaySnapshot | null {
  const entry = sessions.get(readKey);
  if (!entry || Date.now() - entry.touched > TTL) {
    sessions.delete(readKey);
    return null;
  }
  return { revision: entry.revision, state: entry.state };
}

export function publishRelaySnapshot(
  readKey: string,
  writeKey: string,
  state: SyncedPresentationState
): boolean {
  const entry = sessions.get(readKey);
  if (!entry || entry.writeKey !== writeKey || Date.now() - entry.touched > TTL)
    return false;
  entry.state = state;
  entry.revision++;
  entry.touched = Date.now();
  return true;
}
