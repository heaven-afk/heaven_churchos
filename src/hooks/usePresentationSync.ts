/**
 * usePresentationSync Hook — Phase 2
 *
 * Synchronizes presentation output windows with the operator window in real time.
 * Phase 2: Broadcasts nextSlide, activeAlert, activeTransition, transitionDurationMs.
 */

'use client';

import { useEffect } from 'react';
import { usePresentationStore } from '@/store/presentation.store';
import {
  getStoredPresentationState,
  listenToPresentationSync,
  requestPresentationSync,
  broadcastPresentationState,
  type SyncedPresentationState,
} from '@/lib/presentation/sync';

export function usePresentationReceiver(enabled: boolean = true): void {
  const hydrateFromSync = usePresentationStore((s) => s.hydrateFromSync);

  useEffect(() => {
    if (!enabled) return;
    const cached = getStoredPresentationState();
    if (cached) hydrateFromSync(cached);
    requestPresentationSync();
    const unsubscribe = listenToPresentationSync({
      onStateUpdate: (state: SyncedPresentationState) => {
        hydrateFromSync(state);
      },
    });
    return () => { unsubscribe(); };
  }, [enabled, hydrateFromSync]);
}

export function useOperatorBroadcaster(): void {
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
    return () => { unsubscribe(); };
  }, []);
}
