/**
 * Presentation domain types.
 *
 * Phase 2 additions:
 * - DisplayTarget: generalized output target identifier
 * - OutputTargetConfig: per-target rendering configuration (decoupled from shared state)
 * - TransitionType: visual transition style
 * - StageAlert: non-destructive temporary overlay message
 * - OutputState extended with nextSlide, activeAlert, activeTransition
 */

// ─── Layouts ─────────────────────────────────────────────────────────────────

export type LayoutId =
  | 'full-screen'
  | 'lower-third'
  | 'caption'
  | 'corner'
  | 'overlay'
  | 'custom';

export interface Layout {
  id: LayoutId | string;
  name: string;
  description?: string;
  canvasClass: string;
}

// ─── Backgrounds ─────────────────────────────────────────────────────────────

export type BackgroundType = 'color' | 'gradient' | 'image' | 'video' | 'none';

export interface Background {
  id: string;
  type: BackgroundType;
  name: string;
  value?: string;
  mediaId?: string;
}

// ─── Slides ──────────────────────────────────────────────────────────────────

export interface PresentationSlide {
  id: string;
  title?: string;
  text: string;
  subtext?: string;
  layout: LayoutId | string;
  background: Background;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  textAlign?: "left" | "center" | "right";
}

// ─── Output Status ────────────────────────────────────────────────────────────

export type OutputStatus = 'live' | 'black' | 'clear' | 'frozen';

// ─── Phase 2: Output Targets ──────────────────────────────────────────────────

/**
 * A DisplayTarget identifies an output rendering pipeline.
 * Phase 2 defines: congregation, stage, livestream.
 * Future targets can be added to the registry without modifying PresentationState.
 */
export type DisplayTarget = 'congregation' | 'stage' | 'livestream' | (string & Record<never, never>);

// ─── Phase 2: Transitions ─────────────────────────────────────────────────────

export type TransitionType = 'cut' | 'dissolve';

// ─── Phase 2: Output Target Configuration ─────────────────────────────────────

/**
 * Per-output rendering configuration.
 * SEPARATE from PresentationState. Stored in src/config/outputs.ts.
 */
export interface OutputTargetConfig {
  id: DisplayTarget;
  name: string;
  description: string;
  routePath: string;
  windowName: string;
  capabilities: {
    supportsBackground: boolean;
    supportsMedia: boolean;
    supportsNextPreview: boolean;
    isAlphaTransparent: boolean;
  };
  defaultTransition: {
    type: TransitionType;
    durationMs: number;
  };
}

// ─── Phase 2: Stage Alert ─────────────────────────────────────────────────────

/**
 * A non-destructive temporary overlay message.
 * Rendered on Layer 4 (Overlay) above the active slide.
 * Dismissal restores the underlying presentation without operator re-send.
 */
export interface StageAlert {
  id: string;
  message: string;
  target: 'stage' | 'congregation' | 'all';
  createdAt: number;
  durationMs?: number;
}

// ─── Output State ─────────────────────────────────────────────────────────────

export interface OutputState {
  status: OutputStatus;
  liveSlide: PresentationSlide | null;
  previewSlide: PresentationSlide | null;
  nextSlide: PresentationSlide | null;
  layoutOverride: LayoutId | null;
  backgroundOverride: Background | null;
  activeAlert: StageAlert | null;
  activeTransition: TransitionType;
  transitionDurationMs: number;
}

// ─── Presentation Scene ──────────────────────────────────────────────────────

export interface PresentationScene {
  slide: PresentationSlide;
  layout: Layout;
  background: Background;
}
