"use client";

import React, { useRef, useEffect, useState } from "react";
import type { PresentationSlide, LayoutId, TransitionType } from "@/types/presentation.types";

interface CongregationRendererProps {
  slide: PresentationSlide | null;
  layout: LayoutId | string;
  activeTransition: TransitionType;
  transitionDurationMs: number;
  isThumbnail?: boolean;
  hasTextBackground?: boolean;
}

/**
 * Congregation Output Renderer — Layer 3 (Content Layer, z-index: 30)
 *
 * Full visual slide renderer for the main audience display.
 * Supports all layout types (full-screen, lower-third, caption, overlay).
 * Implements WS3 transition engine: 'cut' (instant) and 'dissolve' (opacity crossfade).
 */
export function CongregationRenderer({
  slide,
  layout,
  activeTransition,
  transitionDurationMs,
  isThumbnail = false,
  hasTextBackground = false,
}: CongregationRendererProps) {
  const [displayedSlide, setDisplayedSlide] = useState<PresentationSlide | null>(slide);
  const [opacity, setOpacity] = useState(1);
  const slideIdRef = useRef<string | null>(slide?.id ?? null);

  // Dissolve transition: fade out → swap content → fade in
  useEffect(() => {
    if (!slide) {
      setDisplayedSlide(null);
      return;
    }
    if (slide.id === slideIdRef.current) return;

    if (activeTransition === "cut" || transitionDurationMs <= 0) {
      // Instant cut
      setDisplayedSlide(slide);
      slideIdRef.current = slide.id;
    } else {
      // Dissolve: fade out
      setOpacity(0);
      const halfDuration = transitionDurationMs / 2;
      const fadeOutTimer = setTimeout(() => {
        setDisplayedSlide(slide);
        slideIdRef.current = slide.id;
        setOpacity(1);
      }, halfDuration);
      return () => clearTimeout(fadeOutTimer);
    }
  }, [slide, activeTransition, transitionDurationMs]);

  if (!displayedSlide) return null;

  const textAlign = displayedSlide.textAlign ?? "center";
  const alignClass =
    textAlign === "left"
      ? "text-left items-start"
      : textAlign === "right"
      ? "text-right items-end"
      : "text-center items-center";

  const transitionStyle: React.CSSProperties = {
    zIndex: 30,
    opacity,
    transition: activeTransition === "dissolve" && transitionDurationMs > 0
      ? `opacity ${transitionDurationMs / 2}ms ease-in-out`
      : "none",
  };

  switch (layout) {
    case "lower-third":
      return (
        <div
          className={`absolute bottom-0 left-0 right-0 flex flex-col ${alignClass} ${
            isThumbnail ? "px-3 py-2" : "px-12 py-8"
          }`}
          style={{
            ...transitionStyle,
            background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)",
          }}
        >
          {displayedSlide.title && (
            <p className={`font-bold tracking-wide uppercase leading-tight ${
              isThumbnail ? "text-[9px]" : "text-lg md:text-xl mb-1"
            }`} style={{ color: "var(--color-primary)" }}>
              {displayedSlide.title}
            </p>
          )}
          {displayedSlide.text && (
            <p className={`font-semibold text-white leading-tight drop-shadow ${
              isThumbnail ? "text-xs" : "text-3xl md:text-4xl"
            }`}>
              {displayedSlide.text}
            </p>
          )}
          {displayedSlide.subtext && (
            <p className={`font-medium text-white/80 ${isThumbnail ? "text-[9px] mt-0.5" : "text-lg md:text-xl mt-2"}`}>
              {displayedSlide.subtext}
            </p>
          )}
        </div>
      );

    case "caption":
      return (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4" style={transitionStyle}>
          <div
            className={`rounded-lg backdrop-blur-sm shadow-lg flex flex-col ${alignClass} ${
              isThumbnail ? "px-2 py-1 max-w-[90%]" : "px-8 py-4 max-w-3xl"
            }`}
            style={{ background: "rgba(0,0,0,0.78)" }}
          >
            {displayedSlide.title && (
              <p className={`font-bold ${isThumbnail ? "text-[9px]" : "text-sm uppercase tracking-wider mb-1"}`} style={{ color: "var(--color-primary)" }}>
                {displayedSlide.title}
              </p>
            )}
            {displayedSlide.text && (
              <p className={`font-medium text-white leading-snug ${isThumbnail ? "text-[10px]" : "text-xl md:text-2xl"}`}>
                {displayedSlide.text}
              </p>
            )}
            {displayedSlide.subtext && (
              <p className={`text-white/70 ${isThumbnail ? "text-[8px] mt-0.5" : "text-sm mt-1"}`}>
                {displayedSlide.subtext}
              </p>
            )}
          </div>
        </div>
      );

    case "overlay":
      return (
        <div className="absolute bottom-4 right-4 flex justify-end px-2" style={transitionStyle}>
          <div
            className={`rounded-lg backdrop-blur-sm text-left shadow-lg border border-white/10 flex flex-col ${
              isThumbnail ? "p-2 max-w-[70%]" : "p-6 max-w-md"
            }`}
            style={{ background: "rgba(10,11,13,0.85)" }}
          >
            {displayedSlide.title && (
              <p className={`font-bold mb-1 ${isThumbnail ? "text-[9px]" : "text-sm uppercase tracking-wider"}`} style={{ color: "var(--color-primary)" }}>
                {displayedSlide.title}
              </p>
            )}
            {displayedSlide.text && (
              <p className={`font-semibold text-white leading-tight ${isThumbnail ? "text-[10px]" : "text-xl"}`}>
                {displayedSlide.text}
              </p>
            )}
            {displayedSlide.subtext && (
              <p className={`text-white/75 ${isThumbnail ? "text-[8px] mt-1" : "text-sm mt-2"}`}>
                {displayedSlide.subtext}
              </p>
            )}
          </div>
        </div>
      );

    case "full-screen":
    default:
      return (
        <div
          className={`max-w-5xl mx-auto flex flex-col justify-center ${alignClass} ${
            isThumbnail ? "px-4" : "px-16"
          }`}
          style={transitionStyle}
        >
          {/* Scrim for image/video backgrounds */}
          {hasTextBackground && !isThumbnail && (
            <div className="absolute inset-0 bg-black/40 pointer-events-none" style={{ zIndex: 29 }} aria-hidden="true" />
          )}
          {displayedSlide.title && (
            <h2
              className={`font-bold tracking-wide uppercase drop-shadow-sm ${
                isThumbnail ? "text-[9px] mb-1" : "text-2xl md:text-3xl lg:text-4xl mb-4"
              }`}
              style={{ color: "var(--color-primary)" }}
            >
              {displayedSlide.title}
            </h2>
          )}
          {displayedSlide.text && (
            <p className={`font-semibold text-white leading-tight drop-shadow-md whitespace-pre-line ${
              isThumbnail ? "text-xs" : "text-4xl md:text-5xl lg:text-6xl"
            }`}>
              {displayedSlide.text}
            </p>
          )}
          {displayedSlide.subtext && (
            <p className={`font-normal text-white/70 drop-shadow ${
              isThumbnail ? "text-[9px] mt-1" : "text-xl md:text-2xl lg:text-3xl mt-6"
            }`}>
              {displayedSlide.subtext}
            </p>
          )}
        </div>
      );
  }
}
