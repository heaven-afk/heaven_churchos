"use client";

import React from "react";
import type { PresentationSlide } from "@/types/presentation.types";

interface MediaLayerProps {
  slide: PresentationSlide | null;
  supportsMedia?: boolean;
}

/**
 * Layer 2 — Media Layer (z-index: 20)
 *
 * Renders full-frame media slides (dedicated image or video slides with no overlay text).
 * Skipped for outputs that do not support media (e.g. Stage, Livestream).
 */
export function MediaLayer({ slide, supportsMedia = true }: MediaLayerProps) {
  if (!supportsMedia || !slide) return null;

  if (slide.mediaType === "image" && slide.mediaUrl && !slide.text && !slide.title) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black" style={{ zIndex: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slide.mediaUrl}
          alt={slide.title || "Presentation media"}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (slide.mediaType === "video" && slide.mediaUrl && !slide.text && !slide.title) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black" style={{ zIndex: 20 }}>
        <video
          src={slide.mediaUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  return null;
}
