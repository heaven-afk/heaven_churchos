import type { CSSProperties } from "react";
import type { PresentationSlide } from "@/types/presentation.types";
import type {
  SlideAppearance,
  SlideTypography,
  TextStyle,
} from "@/types/text-style.types";
import {
  DEFAULT_TYPOGRAPHY,
  getPresentationColor,
  getPresentationFont,
  PRESENTATION_COLORS,
  PRESENTATION_FONTS,
} from "@/config/typography";
import type { ServiceItem } from "@/types/service.types";

export function isTextStyle(value: unknown): value is TextStyle {
  if (!value || typeof value !== "object") return false;
  const style = value as Record<string, unknown>;
  return (
    PRESENTATION_FONTS.some((f) => f.id === style.font) &&
    PRESENTATION_COLORS.some((c) => c.id === style.color) &&
    typeof style.size === "number" &&
    Number.isFinite(style.size) &&
    style.size >= 16 &&
    style.size <= 144 &&
    [400, 500, 600, 700, 800].includes(Number(style.weight)) &&
    typeof style.weight === "number" &&
    typeof style.italic === "boolean" &&
    typeof style.lineHeight === "number" &&
    Number.isFinite(style.lineHeight) &&
    style.lineHeight >= 1 &&
    style.lineHeight <= 2
  );
}

export function isSlideTypography(value: unknown): value is SlideTypography {
  if (!value || typeof value !== "object") return false;
  const styles = value as Record<string, unknown>;
  return (
    isTextStyle(styles.title) && isTextStyle(styles.body) && isTextStyle(styles.footer)
  );
}

export function resolveTypography(value?: SlideTypography): SlideTypography {
  return isSlideTypography(value) ? value : DEFAULT_TYPOGRAPHY;
}

/** Font size uses the canvas width, so previews and 1920px output scale identically. */
export function presentationTextStyle(style: TextStyle): CSSProperties {
  return {
    fontFamily: getPresentationFont(style.font),
    fontSize: `${style.size / 19.2}cqw`,
    color: getPresentationColor(style.color),
    fontWeight: style.weight,
    fontStyle: style.italic ? "italic" : "normal",
    lineHeight: style.lineHeight,
    whiteSpace: "pre-line",
    overflowWrap: "anywhere",
  };
}

export function applySlideAppearance(
  slides: PresentationSlide[],
  appearance?: SlideAppearance
): PresentationSlide[] {
  if (!appearance) return slides;
  return slides.map((slide) => ({ ...slide, ...appearance }));
}

/** The JSON content copy also survives the existing cloud service_items schema. */
export function getItemAppearance(item: ServiceItem): SlideAppearance | undefined {
  if (item.appearance) return item.appearance;
  if (
    item.content &&
    typeof item.content === "object" &&
    "presentationAppearance" in item.content &&
    item.content.presentationAppearance &&
    typeof item.content.presentationAppearance === "object"
  ) {
    const value = item.content.presentationAppearance as SlideAppearance;
    if (value.typography === undefined || isSlideTypography(value.typography))
      return value;
  }
  return undefined;
}
