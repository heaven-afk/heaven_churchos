/**
 * Centralized Presentation Action System — spec §8 & §28, Phase 1 §4.4
 *
 * All presentation state changes flow through this module.
 * UI components, keyboard shortcuts, remote controls, and future APIs
 * all call these actions — never duplicate this logic elsewhere.
 *
 * Phase 2 additions:
 * - SET_STAGE_ALERT: dispatch a non-destructive overlay alert
 * - DISMISS_STAGE_ALERT: clear active alert
 * - SET_TRANSITION: change content layer transition style
 */

import { usePresentationStore } from '@/store/presentation.store';
import type {
  LayoutId,
  Background,
  PresentationSlide,
  StageAlert,
  TransitionType,
} from '@/types/presentation.types';

// ─── Action Discriminated Union ───────────────────────────────────────────────

export type PresentationActionType =
  | 'NEXT_SLIDE'
  | 'PREVIOUS_SLIDE'
  | 'GO_TO_SLIDE'
  | 'SEND_LIVE'
  | 'SET_PREVIEW'
  | 'BLACK_SCREEN'
  | 'CLEAR_OUTPUT'
  | 'FREEZE_OUTPUT'
  | 'UNFREEZE_OUTPUT'
  | 'SET_LAYOUT'
  | 'CHANGE_LAYOUT'
  | 'SET_BACKGROUND'
  | 'CHANGE_BACKGROUND'
  | 'SHOW_SCRIPTURE'
  | 'SHOW_LOWER_THIRD'
  | 'SET_SLIDES'
  | 'SET_STAGE_ALERT'
  | 'DISMISS_STAGE_ALERT'
  | 'SET_TRANSITION';

export type PresentationAction =
  | { type: 'NEXT_SLIDE' }
  | { type: 'PREVIOUS_SLIDE' }
  | { type: 'GO_TO_SLIDE'; slideId: string }
  | { type: 'SEND_LIVE'; slide?: PresentationSlide }
  | { type: 'SET_PREVIEW'; slide: PresentationSlide | null }
  | { type: 'BLACK_SCREEN' }
  | { type: 'CLEAR_OUTPUT' }
  | { type: 'FREEZE_OUTPUT' }
  | { type: 'UNFREEZE_OUTPUT' }
  | { type: 'SET_LAYOUT'; layoutId: LayoutId | null }
  | { type: 'CHANGE_LAYOUT'; layoutId: LayoutId | null }
  | { type: 'SET_BACKGROUND'; background: Background | null }
  | { type: 'CHANGE_BACKGROUND'; background: Background | null }
  | { type: 'SHOW_SCRIPTURE'; slideId: string }
  | { type: 'SHOW_LOWER_THIRD'; text: string; subtext?: string }
  | { type: 'SET_SLIDES'; slides: PresentationSlide[] }
  | { type: 'SET_STAGE_ALERT'; alert: StageAlert }
  | { type: 'DISMISS_STAGE_ALERT' }
  | { type: 'SET_TRANSITION'; transitionType: TransitionType; durationMs?: number };

// ─── Action Dispatcher ────────────────────────────────────────────────────────

export function dispatch(action: PresentationAction): void {
  const store = usePresentationStore.getState();

  switch (action.type) {
    case 'NEXT_SLIDE':
      store.goToNextSlide();
      break;

    case 'PREVIOUS_SLIDE':
      store.goToPreviousSlide();
      break;

    case 'GO_TO_SLIDE':
      store.goToSlide(action.slideId);
      break;

    case 'SEND_LIVE':
      store.sendLive(action.slide);
      break;

    case 'SET_PREVIEW':
      store.setPreview(action.slide);
      break;

    case 'BLACK_SCREEN':
      store.setOutputStatus('black');
      break;

    case 'CLEAR_OUTPUT':
      store.setOutputStatus('clear');
      break;

    case 'FREEZE_OUTPUT':
      store.setOutputStatus('frozen');
      break;

    case 'UNFREEZE_OUTPUT':
      store.setOutputStatus('live');
      break;

    case 'SET_LAYOUT':
    case 'CHANGE_LAYOUT':
      store.setLayoutOverride(action.layoutId);
      break;

    case 'SET_BACKGROUND':
    case 'CHANGE_BACKGROUND':
      store.setBackgroundOverride(action.background);
      break;

    case 'SHOW_SCRIPTURE':
      store.goToSlide(action.slideId);
      break;

    case 'SHOW_LOWER_THIRD':
      store.showLowerThird(action.text, action.subtext);
      break;

    case 'SET_SLIDES':
      store.setSlides(action.slides);
      break;

    case 'SET_STAGE_ALERT':
      store.setStageAlert(action.alert);
      break;

    case 'DISMISS_STAGE_ALERT':
      store.dismissStageAlert();
      break;

    case 'SET_TRANSITION':
      store.setTransition(action.transitionType, action.durationMs);
      break;

    default: {
      const _exhaustive: never = action;
      console.error('[PresentationActions] Unhandled action:', _exhaustive);
    }
  }
}
