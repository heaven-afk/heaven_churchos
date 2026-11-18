"use client";

import React, { useEffect, useRef } from "react";
import type { Background, OutputStatus } from "@/types/presentation.types";

interface BackgroundLayerProps {
  background: Background | null;
  status: OutputStatus;
  isAlphaTransparent?: boolean;
}

/**
 * Layer 1 — Background Layer (z-index: 10)
 *
 * Renders the slide background: solid color, gradient, image, or motion video loop.
 * Operates independently from the Content layer — advancing slides does not
 * interrupt a looping video background.
 *
 * For alpha-transparent outputs (livestream), renders nothing (background: transparent).
 */
export function BackgroundLayer({ background, status, isAlphaTransparent = false }: BackgroundLayerProps) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (status === 'frozen') video.current?.pause();
    else if (video.current) void video.current.play().catch(() => {});
  }, [status, background?.value]);
  if (isAlphaTransparent) return null;
  if (status === "black") return null;

  const bg = background;

  if (!bg || bg.type === "none" || bg.type === "color" || bg.type === "gradient") {
    return null; // CSS background applied to root container handles color/gradient
  }

  if (bg.type === "image" && bg.value) {
    return (
      <div
        className="absolute inset-0"
        style={{
          zIndex: 10,
          backgroundImage: `url(${bg.value})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />
    );
  }

  if (bg.type === "video" && bg.value) {
    return (
      <video
        ref={video}
        src={bg.value}
        autoPlay={status !== 'frozen'}
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 10 }}
        aria-hidden="true"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return null;
}
