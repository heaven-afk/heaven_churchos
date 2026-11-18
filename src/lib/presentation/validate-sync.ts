import type { SyncedPresentationState } from "./sync";
import { isSlideTypography } from "./typography";

const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const nullable = (value: unknown, check: (value: unknown) => boolean) =>
  value === null || check(value);
const background = (value: unknown): boolean =>
  object(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  ["color", "gradient", "image", "video", "none"].includes(String(value.type)) &&
  (value.value === undefined || typeof value.value === "string");
const slide = (value: unknown): boolean =>
  object(value) &&
  typeof value.id === "string" &&
  typeof value.text === "string" &&
  typeof value.layout === "string" &&
  background(value.background) &&
  (value.typography === undefined || isSlideTypography(value.typography)) &&
  ["title", "subtext", "mediaUrl"].every(
    (key) => value[key] === undefined || typeof value[key] === "string"
  );

export function isSyncedPresentationState(
  value: unknown
): value is SyncedPresentationState {
  return (
    object(value) &&
    ["live", "black", "clear", "frozen"].includes(String(value.status)) &&
    nullable(value.liveSlide, slide) &&
    nullable(value.nextSlide, slide) &&
    nullable(value.backgroundOverride, background) &&
    nullable(value.layoutOverride, (v) => typeof v === "string") &&
    nullable(
      value.activeAlert,
      (v) =>
        object(v) &&
        typeof v.id === "string" &&
        typeof v.message === "string" &&
        ["stage", "congregation", "all"].includes(String(v.target)) &&
        typeof v.createdAt === "number" &&
        Number.isFinite(v.createdAt)
    ) &&
    ["cut", "dissolve"].includes(String(value.activeTransition)) &&
    typeof value.transitionDurationMs === "number" &&
    value.transitionDurationMs >= 0 &&
    value.transitionDurationMs <= 10000 &&
    typeof value.updatedAt === "number" &&
    Number.isFinite(value.updatedAt)
  );
}
