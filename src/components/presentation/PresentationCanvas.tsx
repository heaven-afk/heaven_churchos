"use client";

import React from "react";
import { useShallow } from "zustand/react/shallow";
import { usePresentationStore } from "@/store/presentation.store";
import { usePresentationReceiver } from "@/hooks/usePresentationSync";
import { getOutputTargetConfig } from "@/config/outputs";
import type {
  PresentationSlide,
  LayoutId,
  Background,
  OutputStatus,
  DisplayTarget,
} from "@/types/presentation.types";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { MediaLayer } from "./layers/MediaLayer";
import { OverlayLayer } from "./layers/OverlayLayer";
import { CongregationRenderer } from "./renderers/CongregationRenderer";
import { StageRenderer } from "./renderers/StageRenderer";
import { LivestreamRenderer } from "./renderers/LivestreamRenderer";

interface PresentationCanvasProps {
  /** Which output target this canvas renders for */
  target?: DisplayTarget;
  /** Explicit slide override (useful when used as a preview canvas) */
  slide?: PresentationSlide | null;
  /** Explicit layout override */
  layoutOverride?: LayoutId | null;
  /** Explicit background override */
  backgroundOverride?: Background | null;
  /** Explicit output status override */
  status?: OutputStatus;
  /** Enable cross-window sync receiver (only true on real output window) */
  isReceiver?: boolean;
  /** Optional custom CSS classes */
  className?: string;
  /** Is this being rendered inside a compact thumbnail/card */
  isThumbnail?: boolean;
}

/**
 * PresentationCanvas — Phase 2 Layered Output Renderer
 *
 * Implements the approved 4-layer rendering pipeline:
 *   Layer 1 (z-10): BackgroundLayer — color, image, or video loop
 *   Layer 2 (z-20): MediaLayer — full-frame dedicated media slides
 *   Layer 3 (z-30): Content Layer — target-specific renderer (Congregation, Stage, Livestream)
 *   Layer 4 (z-40): OverlayLayer — blackout, frozen badge, alert banners
 *
 * Each layer operates independently. Advancing slides transitions Layer 3
 * without disrupting a looping Layer 1 video background.
 *
 * The 'target' prop selects the output renderer via the OutputTargetConfig registry.
 * Default target: 'congregation'.
 */
export function PresentationCanvas({
  target = "congregation",
  slide: propSlide,
  layoutOverride: propLayoutOverride,
  backgroundOverride: propBackgroundOverride,
  status: propStatus,
  isReceiver = false,
  className = "",
  isThumbnail = false,
}: PresentationCanvasProps) {
  usePresentationReceiver(isReceiver);

  const store = usePresentationStore(
    useShallow((s) => ({
      status: s.status,
      liveSlide: s.liveSlide,
      nextSlide: s.nextSlide,
      layoutOverride: s.layoutOverride,
      backgroundOverride: s.backgroundOverride,
      activeAlert: s.activeAlert,
      activeTransition: s.activeTransition,
      transitionDurationMs: s.transitionDurationMs,
    }))
  );
  const targetConfig = getOutputTargetConfig(target);

  const status = propStatus ?? store.status;
  const liveSlide = propSlide !== undefined ? propSlide : store.liveSlide;
  const nextSlide = store.nextSlide;
  const layoutOverride =
    propLayoutOverride !== undefined ? propLayoutOverride : store.layoutOverride;
  const backgroundOverride =
    propBackgroundOverride !== undefined
      ? propBackgroundOverride
      : store.backgroundOverride;
  const activeAlert = store.activeAlert;
  const activeTransition = store.activeTransition;
  const transitionDurationMs = store.transitionDurationMs;

  const resolvedLayout = layoutOverride ?? liveSlide?.layout ?? "full-screen";
  const resolvedBackground = backgroundOverride ??
    liveSlide?.background ?? {
      id: "default-black",
      type: "color",
      name: "Black",
      value: "var(--color-output-black)",
    };

  const isAlphaTransparent = targetConfig.capabilities.isAlphaTransparent;
  const supportsMedia = targetConfig.capabilities.supportsMedia;
  const supportsBackground = targetConfig.capabilities.supportsBackground;
  const supportsNextPreview = targetConfig.capabilities.supportsNextPreview;

  // Root container background (for color/gradient types, handled via CSS)
  const getRootBackground = (): React.CSSProperties => {
    if (isAlphaTransparent) return { background: "transparent" };
    if (status === "black") return { background: "var(--color-output-black)" };
    if (!supportsBackground) return { background: "var(--color-bg-base)" };
    if (resolvedBackground.type === "none") return { background: "transparent" };
    if (resolvedBackground.type === "color")
      return { background: resolvedBackground.value || "var(--color-output-black)" };
    if (resolvedBackground.type === "gradient")
      return { background: resolvedBackground.value || "var(--color-output-black)" };
    return { background: "var(--color-output-black)" };
  };

  const hasTextBackground =
    !isAlphaTransparent &&
    supportsBackground &&
    (resolvedBackground.type === "image" || resolvedBackground.type === "video");

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden select-none ${className}`}
      style={{ ...getRootBackground(), containerType: "inline-size" }}
      role="region"
      aria-label={`${targetConfig.name} presentation output`}
      aria-live="polite"
    >
      {/* Layer 1: Background */}
      {supportsBackground && (
        <BackgroundLayer
          background={resolvedBackground}
          status={status}
          isAlphaTransparent={isAlphaTransparent}
        />
      )}

      {/* Layer 2: Media */}
      {status !== "black" && status !== "clear" && (
        <MediaLayer
          slide={liveSlide}
          supportsMedia={supportsMedia}
          paused={status === "frozen"}
        />
      )}

      {/* Layer 3: Content (target-specific renderer) */}
      {status !== "black" && status !== "clear" && (
        <>
          {target === "stage" ? (
            <StageRenderer
              liveSlide={liveSlide}
              nextSlide={supportsNextPreview ? nextSlide : null}
              status={status}
            />
          ) : target === "livestream" ? (
            <LivestreamRenderer
              key={`${liveSlide?.id}:${liveSlide?.text}:${liveSlide?.subtext}:${liveSlide?.title}`}
              slide={liveSlide}
              activeTransition={activeTransition}
              transitionDurationMs={transitionDurationMs}
            />
          ) : (
            // Default: Congregation renderer
            <CongregationRenderer
              key={`${liveSlide?.id}:${liveSlide?.text}:${liveSlide?.subtext}:${liveSlide?.title}`}
              slide={liveSlide}
              layout={resolvedLayout}
              activeTransition={activeTransition}
              transitionDurationMs={transitionDurationMs}
              isThumbnail={isThumbnail}
              hasTextBackground={hasTextBackground}
            />
          )}
        </>
      )}

      {/* Clear indicator (congregation + stage show this; livestream renders nothing) */}
      {status === "clear" && isThumbnail && target !== "livestream" && (
        <div
          className="z-30 text-center opacity-30 select-none"
          style={{ color: "var(--color-output-white)" }}
        >
          <p
            className={`font-mono tracking-widest uppercase ${isThumbnail ? "text-[10px]" : "text-sm"}`}
          >
            OUTPUT CLEAR
          </p>
        </div>
      )}

      {/* Layer 4: Overlay (alerts, blackout, frozen badge) */}
      <OverlayLayer
        status={status}
        activeAlert={activeAlert}
        target={target}
        isThumbnail={isThumbnail}
      />
    </div>
  );
}
