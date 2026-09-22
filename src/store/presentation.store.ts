/**
 * Presentation Store — spec §37 (Presentation State)
 *
 * Manages the live presentation output state.
 * All state changes should come via the presentation action dispatcher.
 *
 * Phase 2 additions:
 * - activeAlert: non-destructive overlay alert (independent of liveSlide)
 * - activeTransition + transitionDurationMs: content layer transition config
 * - setStageAlert / dismissStageAlert: alert lifecycle
 * - setTransition: transition style setter
 */

import { create } from 'zustand';
import type {
  OutputState,
  OutputStatus,
  PresentationSlide,
  LayoutId,
  Background,
  StageAlert,
  TransitionType,
} from '@/types/presentation.types';
import { broadcastPresentationState } from '@/lib/presentation/sync';

export interface PresentationState extends OutputState {
  slides: PresentationSlide[];
  liveSlideIndex: number;
  previewSlideIndex: number;

  sendLive: (slide?: PresentationSlide) => void;
  setPreview: (slide: PresentationSlide | null) => void;
  goToNextSlide: () => void;
  goToPreviousSlide: () => void;
  goToSlide: (slideId: string) => void;
  setOutputStatus: (status: OutputStatus) => void;
  setLayoutOverride: (layoutId: LayoutId | null) => void;
  setBackgroundOverride: (background: Background | null) => void;
  showLowerThird: (text: string, subtext?: string) => void;
  setSlides: (slides: PresentationSlide[]) => void;
  setStageAlert: (alert: StageAlert) => void;
  dismissStageAlert: () => void;
  setTransition: (type: TransitionType, durationMs?: number) => void;
  hydrateFromSync: (syncState: Partial<OutputState>) => void;
}

function broadcast(s: {
  status: OutputStatus;
  liveSlide: PresentationSlide | null;
  nextSlide: PresentationSlide | null;
  layoutOverride: LayoutId | null;
  backgroundOverride: Background | null;
  activeAlert: StageAlert | null;
  activeTransition: TransitionType;
  transitionDurationMs: number;
}) {
  broadcastPresentationState(s);
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  status: 'clear',
  liveSlide: null,
  previewSlide: null,
  nextSlide: null,
  layoutOverride: null,
  backgroundOverride: null,
  activeAlert: null,
  activeTransition: 'dissolve',
  transitionDurationMs: 300,
  slides: [],
  liveSlideIndex: -1,
  previewSlideIndex: -1,

  sendLive: (slide) => {
    const s = get();
    const targetSlide = slide ?? s.previewSlide;
    if (!targetSlide) return;
    const index = s.slides.findIndex((sl) => sl.id === targetSlide.id);
    const resolvedIndex = index >= 0 ? index : s.liveSlideIndex;
    const nextSlide = resolvedIndex >= 0 && resolvedIndex < s.slides.length - 1
      ? s.slides[resolvedIndex + 1] : null;
    set({ status: 'live' as OutputStatus, liveSlide: targetSlide, nextSlide, liveSlideIndex: resolvedIndex });
    broadcast({ status: 'live', liveSlide: targetSlide, nextSlide, layoutOverride: s.layoutOverride, backgroundOverride: s.backgroundOverride, activeAlert: s.activeAlert, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  setPreview: (slide) => {
    const s = get();
    if (!slide) { set({ previewSlide: null, previewSlideIndex: -1 }); return; }
    const index = s.slides.findIndex((sl) => sl.id === slide.id);
    set({ previewSlide: slide, previewSlideIndex: index >= 0 ? index : -1 });
  },

  goToNextSlide: () => {
    const s = get();
    if (s.slides.length === 0) return;
    const nextIndex = Math.min(s.liveSlideIndex + 1, s.slides.length - 1);
    if (nextIndex === s.liveSlideIndex) return;
    const slide = s.slides[nextIndex];
    const nextSlide = nextIndex < s.slides.length - 1 ? s.slides[nextIndex + 1] : null;
    set({ status: 'live', liveSlide: slide, nextSlide, liveSlideIndex: nextIndex });
    broadcast({ status: 'live', liveSlide: slide, nextSlide, layoutOverride: s.layoutOverride, backgroundOverride: s.backgroundOverride, activeAlert: s.activeAlert, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  goToPreviousSlide: () => {
    const s = get();
    if (s.slides.length === 0) return;
    const prevIndex = Math.max(s.liveSlideIndex - 1, 0);
    if (prevIndex === s.liveSlideIndex) return;
    const slide = s.slides[prevIndex];
    const nextSlide = prevIndex < s.slides.length - 1 ? s.slides[prevIndex + 1] : null;
    set({ status: 'live', liveSlide: slide, nextSlide, liveSlideIndex: prevIndex });
    broadcast({ status: 'live', liveSlide: slide, nextSlide, layoutOverride: s.layoutOverride, backgroundOverride: s.backgroundOverride, activeAlert: s.activeAlert, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  goToSlide: (slideId) => {
    const s = get();
    const index = s.slides.findIndex((sl) => sl.id === slideId);
    if (index < 0) return;
    const slide = s.slides[index];
    const nextSlide = index < s.slides.length - 1 ? s.slides[index + 1] : null;
    set({ status: 'live', liveSlide: slide, nextSlide, liveSlideIndex: index });
    broadcast({ status: 'live', liveSlide: slide, nextSlide, layoutOverride: s.layoutOverride, backgroundOverride: s.backgroundOverride, activeAlert: s.activeAlert, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  setOutputStatus: (status) => {
    const s = get();
    set({ status });
    broadcast({ status, liveSlide: s.liveSlide, nextSlide: s.nextSlide, layoutOverride: s.layoutOverride, backgroundOverride: s.backgroundOverride, activeAlert: s.activeAlert, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  setLayoutOverride: (layoutId) => {
    const s = get();
    set({ layoutOverride: layoutId });
    broadcast({ status: s.status, liveSlide: s.liveSlide, nextSlide: s.nextSlide, layoutOverride: layoutId, backgroundOverride: s.backgroundOverride, activeAlert: s.activeAlert, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  setBackgroundOverride: (background) => {
    const s = get();
    set({ backgroundOverride: background });
    broadcast({ status: s.status, liveSlide: s.liveSlide, nextSlide: s.nextSlide, layoutOverride: s.layoutOverride, backgroundOverride: background, activeAlert: s.activeAlert, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  showLowerThird: (text, subtext) => {
    const s = get();
    const lowerThirdSlide: PresentationSlide = {
      id: `lt-${Date.now()}`,
      text,
      subtext,
      layout: 'lower-third',
      background: s.backgroundOverride ?? { id: 'transparent', type: 'none', name: 'Transparent' },
    };
    set({ status: 'live', liveSlide: lowerThirdSlide, layoutOverride: 'lower-third' });
    broadcast({ status: 'live', liveSlide: lowerThirdSlide, nextSlide: s.nextSlide, layoutOverride: 'lower-third', backgroundOverride: s.backgroundOverride, activeAlert: s.activeAlert, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  setSlides: (slides) => {
    set({
      slides,
      liveSlideIndex: -1,
      previewSlideIndex: slides.length > 0 ? 0 : -1,
      liveSlide: null,
      previewSlide: slides.length > 0 ? slides[0] : null,
      nextSlide: slides.length > 1 ? slides[1] : null,
    });
  },

  setStageAlert: (alert) => {
    const s = get();
    set({ activeAlert: alert });
    broadcast({ status: s.status, liveSlide: s.liveSlide, nextSlide: s.nextSlide, layoutOverride: s.layoutOverride, backgroundOverride: s.backgroundOverride, activeAlert: alert, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  dismissStageAlert: () => {
    const s = get();
    set({ activeAlert: null });
    broadcast({ status: s.status, liveSlide: s.liveSlide, nextSlide: s.nextSlide, layoutOverride: s.layoutOverride, backgroundOverride: s.backgroundOverride, activeAlert: null, activeTransition: s.activeTransition, transitionDurationMs: s.transitionDurationMs });
  },

  setTransition: (type, durationMs) => {
    const s = get();
    const resolvedDuration = durationMs ?? (type === 'cut' ? 0 : 300);
    set({ activeTransition: type, transitionDurationMs: resolvedDuration });
    broadcast({ status: s.status, liveSlide: s.liveSlide, nextSlide: s.nextSlide, layoutOverride: s.layoutOverride, backgroundOverride: s.backgroundOverride, activeAlert: s.activeAlert, activeTransition: type, transitionDurationMs: resolvedDuration });
  },

  hydrateFromSync: (syncState) => {
    set((state) => ({
      ...state,
      ...(syncState.status !== undefined && { status: syncState.status }),
      ...(syncState.liveSlide !== undefined && { liveSlide: syncState.liveSlide }),
      ...(syncState.nextSlide !== undefined && { nextSlide: syncState.nextSlide }),
      ...(syncState.layoutOverride !== undefined && { layoutOverride: syncState.layoutOverride }),
      ...(syncState.backgroundOverride !== undefined && { backgroundOverride: syncState.backgroundOverride }),
      ...(syncState.activeAlert !== undefined && { activeAlert: syncState.activeAlert }),
      ...(syncState.activeTransition !== undefined && { activeTransition: syncState.activeTransition }),
      ...(syncState.transitionDurationMs !== undefined && { transitionDurationMs: syncState.transitionDurationMs }),
    }));
  },
}));
