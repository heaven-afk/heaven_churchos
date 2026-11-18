"use client";

import React from "react";
import type {
  PresentationSlide,
  LayoutId,
  TransitionType,
} from "@/types/presentation.types";

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
 * Implements 'cut' (instant) and 'dissolve' (content fade without delaying the slide).
 */
export function CongregationRenderer({
  slide,
  layout,
  activeTransition,
  transitionDurationMs,
  isThumbnail = false,
  hasTextBackground = false,
}: CongregationRendererProps) {
  const displayedSlide = slide;
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
    animation:
      activeTransition === "dissolve" && transitionDurationMs > 0
        ? "content-dissolve " + transitionDurationMs + "ms ease-out"
        : "none",
  };

  switch (layout) {
    case "lower-third":
      return (
        <div
          key={displayedSlide.id + displayedSlide.text + displayedSlide.subtext}
          className={`absolute right-0 bottom-0 left-0 flex flex-col ${alignClass} ${
            isThumbnail ? "px-3 py-2" : "px-12 py-8"
          }`}
          style={{
            ...transitionStyle,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)",
          }}
        >
          {displayedSlide.title && (
            <p
              className={`leading-tight font-bold tracking-wide uppercase ${
                isThumbnail ? "text-[9px]" : "mb-1 text-lg md:text-xl"
              }`}
              style={{ color: "var(--color-primary)" }}
            >
              {displayedSlide.title}
            </p>
          )}
          {displayedSlide.text && (
            <p
              className={`leading-tight font-semibold text-white drop-shadow ${
                isThumbnail ? "text-xs" : "text-3xl md:text-4xl"
              }`}
            >
              {displayedSlide.text}
            </p>
          )}
          {displayedSlide.subtext && (
            <p
              className={`font-medium text-white/80 ${isThumbnail ? "mt-0.5 text-[9px]" : "mt-2 text-lg md:text-xl"}`}
            >
              {displayedSlide.subtext}
            </p>
          )}
        </div>
      );

    case "caption":
      return (
        <div
          className="absolute right-0 bottom-4 left-0 flex justify-center px-4"
          style={transitionStyle}
        >
          <div
            key={displayedSlide.id + displayedSlide.text + displayedSlide.subtext}
            className={`flex flex-col rounded-lg shadow-lg backdrop-blur-sm ${alignClass} ${
              isThumbnail ? "max-w-[90%] px-2 py-1" : "max-w-3xl px-8 py-4"
            }`}
            style={{ background: "rgba(0,0,0,0.78)" }}
          >
            {displayedSlide.title && (
              <p
                className={`font-bold ${isThumbnail ? "text-[9px]" : "mb-1 text-sm tracking-wider uppercase"}`}
                style={{ color: "var(--color-primary)" }}
              >
                {displayedSlide.title}
              </p>
            )}
            {displayedSlide.text && (
              <p
                className={`leading-snug font-medium text-white ${isThumbnail ? "text-[10px]" : "text-xl md:text-2xl"}`}
              >
                {displayedSlide.text}
              </p>
            )}
            {displayedSlide.subtext && (
              <p
                className={`text-white/70 ${isThumbnail ? "mt-0.5 text-[8px]" : "mt-1 text-sm"}`}
              >
                {displayedSlide.subtext}
              </p>
            )}
          </div>
        </div>
      );

    case "overlay":
      return (
        <div
          className="absolute right-4 bottom-4 flex justify-end px-2"
          style={transitionStyle}
        >
          <div
            key={displayedSlide.id + displayedSlide.text + displayedSlide.subtext}
            className={`flex flex-col rounded-lg border border-white/10 text-left shadow-lg backdrop-blur-sm ${
              isThumbnail ? "max-w-[70%] p-2" : "max-w-md p-6"
            }`}
            style={{ background: "rgba(10,11,13,0.85)" }}
          >
            {displayedSlide.title && (
              <p
                className={`mb-1 font-bold ${isThumbnail ? "text-[9px]" : "text-sm tracking-wider uppercase"}`}
                style={{ color: "var(--color-primary)" }}
              >
                {displayedSlide.title}
              </p>
            )}
            {displayedSlide.text && (
              <p
                className={`leading-tight font-semibold text-white ${isThumbnail ? "text-[10px]" : "text-xl"}`}
              >
                {displayedSlide.text}
              </p>
            )}
            {displayedSlide.subtext && (
              <p
                className={`text-white/75 ${isThumbnail ? "mt-1 text-[8px]" : "mt-2 text-sm"}`}
              >
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
          key={displayedSlide.id + displayedSlide.text + displayedSlide.subtext}
          className={`mx-auto flex max-w-5xl flex-col justify-center ${alignClass} ${
            isThumbnail ? "px-4" : "px-16"
          }`}
          style={transitionStyle}
        >
          {/* Scrim for image/video backgrounds */}
          {hasTextBackground && !isThumbnail && (
            <div
              className="pointer-events-none absolute inset-0 bg-black/40"
              style={{ zIndex: 29 }}
              aria-hidden="true"
            />
          )}
          {displayedSlide.title && (
            <h2
              className={`font-bold tracking-wide uppercase drop-shadow-sm ${
                isThumbnail ? "mb-1 text-[9px]" : "mb-4 text-2xl md:text-3xl lg:text-4xl"
              }`}
              style={{ color: "var(--color-primary)" }}
            >
              {displayedSlide.title}
            </h2>
          )}
          {displayedSlide.text && (
            <p
              className={`leading-tight font-semibold whitespace-pre-line text-white drop-shadow-md ${
                isThumbnail ? "text-xs" : "text-4xl md:text-5xl lg:text-6xl"
              }`}
            >
              {displayedSlide.text}
            </p>
          )}
          {displayedSlide.subtext && (
            <p
              className={`font-normal text-white/70 drop-shadow ${
                isThumbnail ? "mt-1 text-[9px]" : "mt-6 text-xl md:text-2xl lg:text-3xl"
              }`}
            >
              {displayedSlide.subtext}
            </p>
          )}
        </div>
      );
  }
}
