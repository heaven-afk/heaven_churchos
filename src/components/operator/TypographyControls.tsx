"use client";

import { useId, useState } from "react";
import { PRESENTATION_COLORS, PRESENTATION_FONTS } from "@/config/typography";
import type {
  TextRole,
  TextStyle,
  TypographyControlsProps,
} from "@/types/text-style.types";

export function TypographyControls({ value, onChange }: TypographyControlsProps) {
  const [role, setRole] = useState<TextRole>("body");
  const id = useId();
  const style = value[role];
  const label = role === "title" ? "Heading" : role === "body" ? "Body" : "Footer";
  const update = (patch: Partial<TextStyle>) =>
    onChange({ ...value, [role]: { ...style, ...patch } });

  return (
    <div className="typography-controls">
      <div className="segmented-control" role="group" aria-label="Text element">
        {(["title", "body", "footer"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={role === item}
            onClick={() => setRole(item)}
          >
            {item === "title" ? "Heading" : item === "body" ? "Body" : "Footer"}
          </button>
        ))}
      </div>
      <div className="editor-field">
        <label className="field-label" htmlFor={`${id}-font`}>
          {label} font
        </label>
        <select
          id={`${id}-font`}
          className="operator-input"
          value={style.font}
          onChange={(e) => update({ font: e.target.value as TextStyle["font"] })}
        >
          {PRESENTATION_FONTS.map((font) => (
            <option key={font.id} value={font.id}>
              {font.label} · {font.description}
            </option>
          ))}
        </select>
      </div>
      <div className="type-size-row">
        <label className="field-label" htmlFor={`${id}-size`}>
          {label} size
        </label>
        <output htmlFor={`${id}-size`}>{style.size} px</output>
      </div>
      <input
        id={`${id}-size`}
        className="editor-range"
        type="range"
        min={16}
        max={144}
        step={1}
        value={style.size}
        onChange={(e) => update({ size: Number(e.target.value) })}
      />
      <div className="editor-two-columns">
        <div className="editor-field">
          <label className="field-label" htmlFor={`${id}-weight`}>
            Weight
          </label>
          <select
            id={`${id}-weight`}
            className="operator-input"
            value={style.weight}
            onChange={(e) =>
              update({ weight: Number(e.target.value) as TextStyle["weight"] })
            }
          >
            {([400, 500, 600, 700, 800] as const).map((weight, i) => (
              <option key={weight} value={weight}>
                {["Regular", "Medium", "Semibold", "Bold", "Extra bold"][i]}
              </option>
            ))}
          </select>
        </div>
        <button
          className="operator-button italic-toggle"
          type="button"
          aria-label={`${label} italic`}
          aria-pressed={style.italic}
          onClick={() => update({ italic: !style.italic })}
        >
          <em>I</em> Italic
        </button>
      </div>
      <fieldset>
        <legend className="field-label">{label} colour</legend>
        <div className="colour-swatches">
          {PRESENTATION_COLORS.map((color) => (
            <button
              key={color.id}
              className="colour-swatch"
              type="button"
              style={{ background: color.value }}
              aria-label={`${label} colour: ${color.label}`}
              aria-pressed={style.color === color.id}
              title={color.label}
              onClick={() => update({ color: color.id })}
            >
              <span aria-hidden="true">{style.color === color.id ? "✓" : ""}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="type-size-row">
        <label className="field-label" htmlFor={`${id}-leading`}>
          Line spacing
        </label>
        <output htmlFor={`${id}-leading`}>{style.lineHeight.toFixed(2)}</output>
      </div>
      <input
        id={`${id}-leading`}
        className="editor-range"
        type="range"
        min={1}
        max={2}
        step={0.05}
        value={style.lineHeight}
        onChange={(e) => update({ lineHeight: Number(e.target.value) })}
      />
      <p className="editor-help">
        Size is measured at 1920 × 1080 and scales with the output.
      </p>
    </div>
  );
}
