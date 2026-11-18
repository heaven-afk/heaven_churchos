/**
 * usePresentationSync Hook — Phase 2
 *
 * Synchronizes presentation output windows with the operator window in real time.
 * Phase 2: Broadcasts nextSlide, activeAlert, activeTransition, transitionDurationMs.
 */

"use client";

import { useEffect } from "react";
import { usePresentationStore } from "@/store/presentation.store";
import { dispatch } from "@/actions/presentation.actions";
import {
  getStoredPresentationState,
  listenToPresentationSync,
  requestPresentationSync,
  broadcastPresentationState,
  type SyncedPresentationState,
} from "@/lib/presentation/sync";

export function usePresentationReceiver(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled) return;
    const cached = getStoredPresentationState();
    if (cached) dispatch({ type: "RECEIVE_OUTPUT", state: cached });
    const unsubscribe = listenToPresentationSync({
      onStateUpdate: (state: SyncedPresentationState) => {
        dispatch({ type: "RECEIVE_OUTPUT", state });
      },
    });
    requestPresentationSync();
    return () => {
      unsubscribe();
    };
  }, [enabled]);
}

export function useOperatorBroadcaster(): void {
  const activeAlert = usePresentationStore((s) => s.activeAlert);
  useEffect(() => {
    if (!activeAlert?.durationMs) return;
    const timer = setTimeout(
      () => dispatch({ type: "DISMISS_STAGE_ALERT" }),
      Math.max(0, activeAlert.createdAt + activeAlert.durationMs - Date.now())
    );
    return () => clearTimeout(timer);
  }, [activeAlert]);
  useEffect(() => {
    const unsubscribe = listenToPresentationSync({
      onRequestSync: () => {
        const store = usePresentationStore.getState();
        broadcastPresentationState({
          status: store.status,
          liveSlide: store.liveSlide,
          nextSlide: store.nextSlide,
          layoutOverride: store.layoutOverride,
          backgroundOverride: store.backgroundOverride,
          activeAlert: store.activeAlert,
          activeTransition: store.activeTransition,
          transitionDurationMs: store.transitionDurationMs,
        });
      },
    });
    return () => {
      unsubscribe();
    };
  }, []);
}
