/**
 * Presentation Output Cross-Window Synchronization
 *
 * Facilitates communication between the Operator Workstation
 * and Presentation Windows (/presentation?target=...) via BroadcastChannel
 * and localStorage. Supports all registered output targets.
 */

import type {
  OutputStatus,
  PresentationSlide,
  LayoutId,
  Background,
  StageAlert,
  TransitionType,
} from '@/types/presentation.types';

export const PRESENTATION_CHANNEL_NAME = 'veyrin_presentation_channel';
export const PRESENTATION_STORAGE_KEY = 'veyrin_presentation_state';

export interface SyncedPresentationState {
  status: OutputStatus;
  liveSlide: PresentationSlide | null;
  nextSlide: PresentationSlide | null;
  layoutOverride: LayoutId | null;
  backgroundOverride: Background | null;
  activeAlert: StageAlert | null;
  activeTransition: TransitionType;
  transitionDurationMs: number;
  updatedAt: number;
}

export type PresentationSyncMessage =
  | { type: 'STATE_UPDATE'; payload: SyncedPresentationState }
  | { type: 'REQUEST_SYNC' };

export function broadcastPresentationState(
  state: Omit<SyncedPresentationState, 'updatedAt'>
): void {
  if (typeof window === 'undefined') return;

  const payload: SyncedPresentationState = {
    ...state,
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(PRESENTATION_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn('[PresentationSync] Failed to persist state to localStorage:', err);
  }

  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel(PRESENTATION_CHANNEL_NAME);
      const message: PresentationSyncMessage = { type: 'STATE_UPDATE', payload };
      channel.postMessage(message);
      channel.close();
    } catch (err) {
      console.warn('[PresentationSync] BroadcastChannel postMessage failed:', err);
    }
  }
}

export function getStoredPresentationState(): SyncedPresentationState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PRESENTATION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SyncedPresentationState;
  } catch (err) {
    console.warn('[PresentationSync] Failed to read state from localStorage:', err);
    return null;
  }
}

export function listenToPresentationSync({
  onStateUpdate,
  onRequestSync,
}: {
  onStateUpdate?: (state: SyncedPresentationState) => void;
  onRequestSync?: () => void;
}): () => void {
  if (typeof window === 'undefined') return () => {};

  let channel: BroadcastChannel | null = null;

  if ('BroadcastChannel' in window) {
    try {
      channel = new BroadcastChannel(PRESENTATION_CHANNEL_NAME);
      channel.onmessage = (event: MessageEvent<PresentationSyncMessage>) => {
        const msg = event.data;
        if (!msg || typeof msg !== 'object') return;
        if (msg.type === 'STATE_UPDATE' && onStateUpdate) {
          onStateUpdate(msg.payload);
        } else if (msg.type === 'REQUEST_SYNC' && onRequestSync) {
          onRequestSync();
        }
      };
    } catch (err) {
      console.warn('[PresentationSync] BroadcastChannel setup failed:', err);
    }
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === PRESENTATION_STORAGE_KEY && e.newValue && onStateUpdate) {
      try {
        const parsed = JSON.parse(e.newValue) as SyncedPresentationState;
        onStateUpdate(parsed);
      } catch {
        // ignore parse error
      }
    }
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener('storage', handleStorage);
    if (channel) channel.close();
  };
}

export function requestPresentationSync(): void {
  if (typeof window === 'undefined') return;
  if ('BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel(PRESENTATION_CHANNEL_NAME);
      const msg: PresentationSyncMessage = { type: 'REQUEST_SYNC' };
      channel.postMessage(msg);
      channel.close();
    } catch (err) {
      console.warn('[PresentationSync] Failed to send sync request:', err);
    }
  }
}
