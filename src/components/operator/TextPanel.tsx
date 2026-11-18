"use client";

import { useEffect, useMemo, useState } from "react";
import { dispatch } from "@/actions/presentation.actions";
import { useServiceStore } from "@/store/service.store";
import { usePresentationStore } from "@/store/presentation.store";
import {
  createTextPresentationSlides,
  createTextServiceItem,
  getTextOptions,
} from "@/lib/content/text.service";
import { TEXT_TEMPLATES } from "@/config/text-templates";
import { DEFAULT_TYPOGRAPHY, PRESENTATION_COLORS } from "@/config/typography";
import { resolveTypography, getItemAppearance } from "@/lib/presentation/typography";
import { PresentationCanvas } from "@/components/presentation/PresentationCanvas";
import { TypographyControls } from "./TypographyControls";
import type { CreateTextOptions, TextTemplate } from "@/types/text-style.types";
import type { LayoutId } from "@/types/presentation.types";

export function TextPanel() {
  const selected = useServiceStore((s) =>
    s.currentService?.items.find((item) => item.id === s.selectedItemId)
  );
  const initial = selected?.type === "text" ? getTextOptions(selected.content) : null;
  const appearance = selected ? getItemAppearance(selected) : undefined;
  const [draft, setDraft] = useState<CreateTextOptions>(() => ({
    ...(initial ?? TEXT_TEMPLATES[0]),
    ...(initial ? appearance : {}),
    typography: initial
      ? resolveTypography(appearance?.typography ?? initial.typography)
      : (TEXT_TEMPLATES[0].typography ?? DEFAULT_TYPOGRAPHY),
  }));
  const [editingId, setEditingId] = useState<string | null>(
    initial ? (selected?.id ?? null) : null
  );
  const [feedback, setFeedback] = useState("");
  const [section, setSection] = useState<"content" | "design">("content");
  useEffect(
    () =>
      useServiceStore.subscribe((next, previous) => {
        if (!editingId) return;
        const item = next.currentService?.items.find((row) => row.id === editingId);
        const oldItem = previous.currentService?.items.find(
          (row) => row.id === editingId
        );
        if (!item || !oldItem) return;
        const latest = getItemAppearance(item);
        if (latest && latest !== getItemAppearance(oldItem))
          setDraft((current) => ({ ...current, ...latest }));
      }),
    [editingId]
  );
  const status = usePresentationStore((s) => s.status);
  const addItem = useServiceStore((s) => s.addItem);
  const updateItem = useServiceStore((s) => s.updateItem);
  const selectItem = useServiceStore((s) => s.selectItem);
  const itemCount = useServiceStore(
    (s) => s.currentService?.items.filter((item) => !item.isRemoved).length ?? 0
  );
  const slides = useMemo(() => createTextPresentationSlides(draft), [draft]);
  const update = (patch: Partial<CreateTextOptions>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setFeedback("");
  };
  const applyTemplate = (template: TextTemplate) => {
    setDraft({ ...template, typography: template.typography ?? DEFAULT_TYPOGRAPHY });
    setFeedback("");
  };
  const prepare = (
    live = false,
    sourceItemId: string | undefined = editingId ?? undefined
  ) => {
    if (!slides.length) return;
    dispatch({ type: "SET_SLIDES", slides, sourceItemId });
    dispatch({ type: live ? "SEND_LIVE" : "SET_PREVIEW", slide: slides[0] });
    setFeedback(live ? "Sent to program." : "Preview updated. Program is unchanged.");
  };
  const save = () => {
    if (!slides.length) return;
    const item = createTextServiceItem(draft, itemCount);
    const id = editingId ?? item.id;
    if (editingId)
      updateItem(editingId, {
        title: item.title,
        content: item.content,
        notes: item.notes,
        appearance: undefined,
      });
    else {
      addItem(item);
      setEditingId(id);
      selectItem(id);
    }
    prepare(false, id);
    setFeedback(
      editingId ? "Changes saved to this service item." : "Added to your service."
    );
  };

  return (
    <div className="text-studio">
      <div className="editor-heading">
        <p className="eyebrow">Text studio</p>
        <div className="flex items-center justify-between gap-2">
          <h2>{editingId ? "Refine your message." : "Make every word count."}</h2>
          {editingId && (
            <button
              className="operator-chip"
              onClick={() => {
                setEditingId(null);
                setDraft({
                  ...TEXT_TEMPLATES[0],
                  typography: TEXT_TEMPLATES[0].typography,
                });
                setFeedback("");
              }}
            >
              + New
            </button>
          )}
        </div>
        <p className="resource-description">
          Announcements, sermon notes and moments worth sharing.
        </p>
      </div>
      <div className="draft-preview">
        <div className="draft-preview-label">
          <span>Draft preview</span>
          <span>
            {slides.length} {slides.length === 1 ? "slide" : "slides"} · not live
          </span>
        </div>
        <div className="draft-preview-canvas">
          {slides[0] ? (
            <PresentationCanvas
              slide={slides[0]}
              status="live"
              layoutOverride={null}
              backgroundOverride={null}
              isThumbnail
            />
          ) : (
            <p>Add a heading or message to begin.</p>
          )}
        </div>
      </div>
      <div
        className="segmented-control editor-section-tabs"
        role="group"
        aria-label="Text editor section"
      >
        <button
          aria-pressed={section === "content"}
          onClick={() => setSection("content")}
        >
          Write
        </button>
        <button aria-pressed={section === "design"} onClick={() => setSection("design")}>
          Type & colour
        </button>
      </div>
      {section === "content" ? (
        <div className="resource-panel">
          <div className="template-grid">
            {TEXT_TEMPLATES.map((template) => (
              <button
                type="button"
                key={template.id}
                onClick={() => applyTemplate(template)}
              >
                <span>{template.label}</span>
                <small>{template.description}</small>
              </button>
            ))}
          </div>
          <div className="editor-field">
            <label className="field-label" htmlFor="text-heading">
              Heading
            </label>
            <input
              id="text-heading"
              className="operator-input"
              value={draft.title ?? ""}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Your headline"
            />
          </div>
          <div className="editor-field">
            <div className="type-size-row">
              <label className="field-label" htmlFor="text-body">
                Message
              </label>
              <span className="editor-help">{draft.body.length} characters</span>
            </div>
            <textarea
              id="text-body"
              className="operator-input editor-textarea"
              rows={5}
              value={draft.body}
              onChange={(e) => update({ body: e.target.value })}
              placeholder="Write your message…"
            />
            <p className="editor-help">Leave a blank line to create the next slide.</p>
          </div>
          <div className="editor-field">
            <label className="field-label" htmlFor="text-footer">
              Footer / speaker title
            </label>
            <input
              id="text-footer"
              className="operator-input"
              value={draft.subtext ?? ""}
              onChange={(e) => update({ subtext: e.target.value })}
              placeholder="Add a reference, name or subtitle"
            />
          </div>
        </div>
      ) : (
        <div className="resource-panel">
          <TypographyControls
            value={resolveTypography(draft.typography)}
            onChange={(typography) => update({ typography })}
          />
          <div className="editor-divider" />
          <div className="editor-field">
            <label className="field-label" htmlFor="text-layout">
              Layout
            </label>
            <select
              id="text-layout"
              className="operator-input"
              value={draft.layout ?? "full-screen"}
              onChange={(e) => update({ layout: e.target.value as LayoutId })}
            >
              <option value="full-screen">Full screen</option>
              <option value="lower-third">Lower third</option>
              <option value="caption">Caption</option>
              <option value="overlay">Corner overlay</option>
            </select>
          </div>
          <div className="segmented-control" role="group" aria-label="Text alignment">
            {(["left", "center", "right"] as const).map((textAlign) => (
              <button
                type="button"
                key={textAlign}
                aria-pressed={(draft.textAlign ?? "center") === textAlign}
                onClick={() => update({ textAlign })}
              >
                {textAlign}
              </button>
            ))}
          </div>
          <fieldset>
            <legend className="field-label">Slide background</legend>
            <div className="colour-swatches">
              {PRESENTATION_COLORS.map((color) => (
                <button
                  type="button"
                  key={color.id}
                  className="colour-swatch"
                  style={{ background: color.value }}
                  aria-label={`Background colour: ${color.label}`}
                  aria-pressed={
                    draft.background?.value === color.value ||
                    (!draft.background && color.id === "black")
                  }
                  title={color.label}
                  onClick={() =>
                    update({
                      background: {
                        id: `solid-${color.id}`,
                        type: "color",
                        name: color.label,
                        value: color.value,
                      },
                    })
                  }
                >
                  <span aria-hidden="true">
                    {draft.background?.value === color.value ||
                    (!draft.background && color.id === "black")
                      ? "✓"
                      : ""}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      )}
      <div className="editor-actions">
        <div className="editor-two-columns">
          <button
            id="btn-preview-text"
            className="operator-button"
            disabled={!slides.length}
            onClick={() => prepare()}
          >
            Preview
          </button>
          <button
            id="btn-save-text"
            className="operator-button"
            disabled={!slides.length}
            onClick={save}
          >
            {editingId ? "Save changes" : "+ Add to service"}
          </button>
        </div>
        <button
          id="btn-live-text"
          className="operator-button primary"
          disabled={!slides.length || status === "frozen"}
          onClick={() => prepare(true)}
        >
          Take live ↗
        </button>
        <p className="editor-help" role="status">
          {status === "frozen"
            ? "Unfreeze program before taking this draft live."
            : feedback || "Your draft stays private until you take it live."}
        </p>
      </div>
    </div>
  );
}
