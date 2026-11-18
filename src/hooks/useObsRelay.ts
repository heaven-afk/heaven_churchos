"use client";

import { useCallback, useEffect, useState } from "react";
import { usePresentationStore } from "@/store/presentation.store";
import { dispatch } from "@/actions/presentation.actions";
import { isSyncedPresentationState } from "@/lib/presentation/validate-sync";
import type { SyncedPresentationState } from "@/lib/presentation/sync";
import type { OutputRelaySession } from "@/types/output-relay.types";
import { supportsLocalOutputRelay } from "@/lib/presentation/output-environment";

const STORAGE_KEY = "presentation_output_relay";
function snapshot(): SyncedPresentationState {
  const {
    status,
    liveSlide,
    nextSlide,
    layoutOverride,
    backgroundOverride,
    activeAlert,
    activeTransition,
    transitionDurationMs,
  } = usePresentationStore.getState();
  return {
    status,
    liveSlide,
    nextSlide,
    layoutOverride,
    backgroundOverride,
    activeAlert,
    activeTransition,
    transitionDurationMs,
    updatedAt: Date.now(),
  };
}

export function useObsRelay() {
  const [available, setAvailable] = useState(false);
  const [session, setSession] = useState<OutputRelaySession | null>(null);
  const [status, setStatus] = useState("Not connected");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      const local = supportsLocalOutputRelay(window.location.hostname);
      setAvailable(local);
      if (!local) return;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const saved: unknown = raw ? JSON.parse(raw) : null;
        if (
          saved &&
          typeof saved === "object" &&
          "readKey" in saved &&
          "writeKey" in saved &&
          typeof saved.readKey === "string" &&
          typeof saved.writeKey === "string"
        )
          setSession({ readKey: saved.readKey, writeKey: saved.writeKey });
      } catch {
        /* A fresh session can always be created. */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const start = useCallback(async () => {
    if (!supportsLocalOutputRelay(window.location.hostname)) return;
    setBusy(true);
    try {
      const response = await fetch("/api/output-relay", { method: "POST" });
      if (!response.ok)
        throw new Error(
          response.status === 403
            ? "OBS links need the local server (npm run start:local)."
            : "Could not create output link. Try again."
        );
      const next = (await response.json()) as OutputRelaySession;
      setStatus("Connecting…");
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* Session still works in this tab. */
      }
      setSession(next);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Connection failed.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;
    let stopped = false;
    let sending = false;
    let pending: SyncedPresentationState | null = null;
    const controller = new AbortController();
    const publish = async () => {
      pending = snapshot();
      if (sending) return;
      sending = true;
      try {
        while (pending && !stopped) {
          const state = pending;
          pending = null;
          const response = await fetch("/api/output-relay", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.writeKey}`,
            },
            body: JSON.stringify({ readKey: session.readKey, state }),
            signal: AbortSignal.any([controller.signal, AbortSignal.timeout(4000)]),
          });
          if (!response.ok)
            throw new Error(
              response.status === 403
                ? "Session expired. Generate a new OBS link."
                : "Relay unavailable. Reconnecting…"
            );
          if (!stopped) setStatus("Relay ready");
        }
      } catch (error) {
        if (!stopped) setStatus(error instanceof Error ? error.message : "Reconnecting…");
      } finally {
        sending = false;
      }
    };
    void publish();
    const unsubscribe = usePresentationStore.subscribe((state, previous) => {
      if (
        state.status !== previous.status ||
        state.liveSlide !== previous.liveSlide ||
        state.nextSlide !== previous.nextSlide ||
        state.layoutOverride !== previous.layoutOverride ||
        state.backgroundOverride !== previous.backgroundOverride ||
        state.activeAlert !== previous.activeAlert ||
        state.activeTransition !== previous.activeTransition ||
        state.transitionDurationMs !== previous.transitionDurationMs
      )
        void publish();
    });
    const timer = setInterval(() => {
      void publish();
    }, 2000);
    return () => {
      stopped = true;
      controller.abort();
      unsubscribe();
      clearInterval(timer);
    };
  }, [session]);
  return { session, status, busy, start, available };
}

/** OBS receives only the capability-scoped HTTP feed; it has separate browser storage. */
export function useRelayReceiver(readKey: string | null) {
  const [status, setStatus] = useState("Connecting to operator…");
  useEffect(() => {
    if (!readKey) return;
    let stopped = false;
    let revision = -1;
    let timer: ReturnType<typeof setTimeout>;
    const controller = new AbortController();
    const poll = async () => {
      try {
        const response = await fetch("/api/output-relay", {
          headers: { Authorization: `Bearer ${readKey}` },
          cache: "no-store",
          signal: AbortSignal.any([controller.signal, AbortSignal.timeout(4000)]),
        });
        if (!response.ok)
          throw new Error(
            response.status === 404
              ? "Output link expired. Generate a new link in Outputs."
              : "Output disconnected. Reconnecting…"
          );
        const data: unknown = await response.json();
        if (
          !stopped &&
          data &&
          typeof data === "object" &&
          "state" in data &&
          "revision" in data &&
          typeof data.revision === "number"
        ) {
          if (data.state && isSyncedPresentationState(data.state)) {
            if (data.revision !== revision) {
              dispatch({ type: "RECEIVE_OUTPUT", state: data.state });
              revision = data.revision;
            }
            setStatus(
              Date.now() - data.state.updatedAt > 7000
                ? "Operator disconnected. Holding last output."
                : ""
            );
          } else setStatus("Waiting for operator…");
        }
      } catch (error) {
        if (!stopped)
          setStatus(
            error instanceof Error ? error.message : "Output disconnected. Reconnecting…"
          );
      } finally {
        if (!stopped)
          timer = setTimeout(() => {
            void poll();
          }, 250);
      }
    };
    void poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [readKey]);
  return status;
}
