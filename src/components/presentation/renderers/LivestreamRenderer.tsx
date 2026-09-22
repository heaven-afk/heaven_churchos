"use client";

import React from "react";
import type { PresentationSlide, TransitionType } from "@/types/presentation.types";
import { CongregationRenderer } from "./CongregationRenderer";

interface LivestreamRendererProps {
  slide: PresentationSlide | null;
  activeTransition: TransitionType;
  transitionDurationMs: number;
}

/**
 * Livestream / Lower-Third Output Renderer — WS5
 *
 * Designed for OBS/vMix browser source capture.
 * The root has background: transparent so the host application can composite
 * this over a live camera feed without chroma keying.
 *
 * All slide content is rendered exclusively in the lower-third zone.
 * The upper portion of the screen is fully transparent.
 *
 * This renderer re-uses CongregationRenderer with a forced 'lower-third' layout
 * so the architectural layer model is respected.
 */
export function LivestreamRenderer({ slide, activeTransition, transitionDurationMs }: LivestreamRendererProps) {
  if (!slide || (!slide.text && !slide.title)) return null;

  // Force all content to lower-third layout for broadcast compositing
  const lowerThirdSlide: PresentationSlide = {
    ...slide,
    layout: "lower-third",
  };

  return (
    <CongregationRenderer
      slide={lowerThirdSlide}
      layout="lower-third"
      activeTransition={activeTransition}
      transitionDurationMs={transitionDurationMs}
    />
  );
}
