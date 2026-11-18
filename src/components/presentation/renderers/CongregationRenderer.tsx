"use client";

import type {
  PresentationSlide,
  LayoutId,
  TransitionType,
} from "@/types/presentation.types";
import { presentationTextStyle, resolveTypography } from "@/lib/presentation/typography";

interface CongregationRendererProps {
  slide: PresentationSlide | null;
  layout: LayoutId | string;
  activeTransition: TransitionType;
  transitionDurationMs: number;
  isThumbnail?: boolean;
  hasTextBackground?: boolean;
}

/** The same canvas-relative typography is used in thumbnails, projectors and OBS. */
export function CongregationRenderer({
  slide,
  layout,
  activeTransition,
  transitionDurationMs,
  hasTextBackground = false,
}: CongregationRendererProps) {
  if (!slide) return null;
  const typography = resolveTypography(slide.typography);
  const compact = ["lower-third", "caption", "overlay", "corner"].includes(layout);
  const body =
    !slide.typography && compact
      ? { ...typography.body, size: layout === "lower-third" ? 48 : 40 }
      : typography.body;
  const alignment = slide.textAlign ?? "center";

  return (
    <>
      {hasTextBackground && <div className="slide-legibility-scrim" aria-hidden="true" />}
      <div
        className="slide-composition"
        data-layout={layout}
        data-align={alignment}
        style={{
          zIndex: 30,
          animation:
            activeTransition === "dissolve" && transitionDurationMs > 0
              ? `content-dissolve ${transitionDurationMs}ms ease-out`
              : "none",
        }}
      >
        <div
          className="slide-content"
          style={{
            textAlign: alignment,
            alignItems:
              alignment === "left"
                ? "flex-start"
                : alignment === "right"
                  ? "flex-end"
                  : "center",
          }}
        >
          {slide.title && (
            <h2 className="slide-title" style={presentationTextStyle(typography.title)}>
              {slide.title}
            </h2>
          )}
          {slide.text && (
            <p className="slide-body" style={presentationTextStyle(body)}>
              {slide.text}
            </p>
          )}
          {slide.subtext && (
            <p className="slide-footer" style={presentationTextStyle(typography.footer)}>
              {slide.subtext}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
