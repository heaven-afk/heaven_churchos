import type { SyncedPresentationState } from "@/lib/presentation/sync";

export interface OutputRelaySession {
  readKey: string;
  writeKey: string;
}

export interface OutputRelaySnapshot {
  revision: number;
  state: SyncedPresentationState | null;
}
