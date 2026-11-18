"use client";

import { useState } from "react";
import { dispatch } from "@/actions/presentation.actions";
import { usePresentationStore } from "@/store/presentation.store";
import { useServiceStore } from "@/store/service.store";
import { resolveTypography } from "@/lib/presentation/typography";
import { TypographyControls } from "./TypographyControls";
import type { LayoutId } from "@/types/presentation.types";
import type { SlideAppearance } from "@/types/text-style.types";
import { DEFAULT_TYPOGRAPHY } from "@/config/typography";

export function AppearancePanel() {
  const slide = usePresentationStore((s) => s.previewSlide);
  const sourceItemId = usePresentationStore((s) => s.sourceItemId);
  const updateItem = useServiceStore((s) => s.updateItem);
  const sourceItem = useServiceStore((s) =>
    s.currentService?.items.find((item) => item.id === sourceItemId)
  );
  const [saved, setSaved] = useState(false);
  const update = (appearance: SlideAppearance) => {
    dispatch({ type: "STYLE_PREVIEW", appearance });
    setSaved(false);
  };

  if (!slide)
    return (
      <div className="editor-empty">
        <span aria-hidden="true">Aa</span>
        <h2>Give your words a style</h2>
        <p>
          Preview a song, Scripture passage or text slide first. Your font and colour
          changes will appear here before going live.
        </p>
      </div>
    );

  return (
    <div className="resource-panel">
      <div className="editor-heading">
        <p className="eyebrow">Design</p>
        <h2>Shape the moment.</h2>
        <p className="resource-description">
          Style every slide in this prepared item. Program stays unchanged until you take
          it live.
        </p>
      </div>
      <TypographyControls
        value={resolveTypography(slide.typography)}
        onChange={(typography) => update({ typography })}
      />
      <div className="editor-divider" />
      <div className="editor-field">
        <label className="field-label" htmlFor="prepared-layout">
          Layout
        </label>
        <select
          id="prepared-layout"
          className="operator-input"
          value={slide.layout}
          onChange={(e) => update({ layout: e.target.value as LayoutId })}
        >
          <option value="full-screen">Full screen</option>
          <option value="lower-third">Lower third</option>
          <option value="caption">Caption</option>
          <option value="overlay">Corner overlay</option>
        </select>
      </div>
      <div
        className="segmented-control"
        role="group"
        aria-label="Prepared text alignment"
      >
        {(["left", "center", "right"] as const).map((textAlign) => (
          <button
            key={textAlign}
            type="button"
            aria-pressed={(slide.textAlign ?? "center") === textAlign}
            onClick={() => update({ textAlign })}
          >
            {textAlign}
          </button>
        ))}
      </div>
      {sourceItem && (
        <button
          className="operator-button"
          onClick={() => {
            const appearance: SlideAppearance = {
              typography: slide.typography,
              textAlign: slide.textAlign,
              layout: slide.layout as LayoutId,
              background: slide.background,
            };
            updateItem(sourceItem.id, {
              appearance,
              content: {
                ...(sourceItem.content && typeof sourceItem.content === "object"
                  ? sourceItem.content
                  : {}),
                presentationAppearance: appearance,
              },
            });
            setSaved(true);
          }}
        >
          {saved ? "✓ Saved to service item" : "Save style to service item"}
        </button>
      )}
      <button
        className="operator-button"
        onClick={() => update({ typography: DEFAULT_TYPOGRAPHY })}
      >
        Reset typography
      </button>
      <p className="editor-help">
        Fonts are self-hosted. Stage monitors keep their high-contrast confidence layout.
      </p>
    </div>
  );
}
