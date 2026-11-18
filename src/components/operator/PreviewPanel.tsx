"use client";

import { useShallow } from "zustand/react/shallow";
import { usePresentationStore } from "@/store/presentation.store";
import { useUIStore } from "@/store/ui.store";
import { dispatch } from "@/actions/presentation.actions";
import { PresentationCanvas } from "@/components/presentation/PresentationCanvas";

export function PreviewPanel() {
  const {
    liveSlide,
    previewSlide,
    nextSlide,
    status,
    slides,
    liveSlides,
    liveSlideIndex,
    layoutOverride,
    backgroundOverride,
  } = usePresentationStore(
    useShallow((s) => ({
      liveSlide: s.liveSlide,
      previewSlide: s.previewSlide,
      nextSlide: s.nextSlide,
      status: s.status,
      slides: s.slides,
      liveSlides: s.liveSlides,
      liveSlideIndex: s.liveSlideIndex,
      layoutOverride: s.layoutOverride,
      backgroundOverride: s.backgroundOverride,
    }))
  );
  const setTab = useUIStore((s) => s.setControlPanelTab);
  const openResources = () => {
    setTab("scripture");
    if (!useUIStore.getState().isControlPanelOpen)
      useUIStore.getState().toggleControlPanel();
  };
  return (
    <div className="presentation-workspace">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Operator workstation</p>
          <h1>Ready for the next moment.</h1>
        </div>
        <span className={`workspace-state ${status === "live" ? "is-live" : ""}`}>
          {status === "live" ? "● Live output" : `Output ${status}`}
        </span>
      </div>
      <div className="monitor-grid">
        <section className="monitor-section" aria-label="Staged preview">
          <div className="monitor-heading">
            <span className="preview-label">Preview</span>
            <span>Only you can see this</span>
          </div>
          <div className="monitor-frame preview-frame">
            {previewSlide ? (
              <PresentationCanvas
                slide={previewSlide}
                status="live"
                layoutOverride={layoutOverride}
                backgroundOverride={backgroundOverride}
                isThumbnail
              />
            ) : (
              <div className="preview-empty">
                <span className="empty-symbol" aria-hidden="true">
                  ＋
                </span>
                <h2>Start with your first slide</h2>
                <p>Choose a song, Scripture, text or media from Resources.</p>
                <button className="operator-button" onClick={openResources}>
                  Find Scripture ↗
                </button>
              </div>
            )}
          </div>
          <div className="monitor-caption">
            <span className="truncate">
              {previewSlide?.subtext ||
                previewSlide?.title ||
                "Prepare content without changing the live output"}
            </span>
          </div>
          <button
            id="btn-send-live"
            className="operator-button primary take-live"
            disabled={!previewSlide || status === "frozen"}
            onClick={() => dispatch({ type: "SEND_LIVE" })}
            title="Send preview live (Enter)"
          >
            Take live <kbd>Enter ↗</kbd>
          </button>
          {status === "frozen" && (
            <p className="resource-description">
              Unfreeze the output before taking a new slide live.
            </p>
          )}
        </section>
        <section className="monitor-section" aria-label="Live output monitor">
          <div className="monitor-heading">
            <span className="live-label">Program</span>
            <span>Congregation output</span>
          </div>
          <div className={`monitor-frame ${status === "live" ? "live-frame" : ""}`}>
            <PresentationCanvas
              slide={liveSlide}
              status={status}
              layoutOverride={layoutOverride}
              backgroundOverride={backgroundOverride}
              isThumbnail
            />
          </div>
          <div className="monitor-caption">
            <span className="truncate">
              {liveSlide?.subtext || liveSlide?.title || "Output is standing by"}
            </span>
            <span className="shrink-0">
              {liveSlides.length ? `${liveSlideIndex + 1} / ${liveSlides.length}` : "—"}
            </span>
          </div>
          <div className="navigation-controls">
            <button
              id="btn-prev-slide"
              className="operator-button"
              disabled={status === "frozen" || liveSlideIndex <= 0}
              onClick={() => dispatch({ type: "PREVIOUS_SLIDE" })}
              aria-keyshortcuts="ArrowLeft ArrowUp"
            >
              ← Previous
            </button>
            <button
              id="btn-next-slide"
              className="operator-button"
              disabled={status === "frozen" || !nextSlide}
              onClick={() => dispatch({ type: "NEXT_SLIDE" })}
              aria-keyshortcuts="ArrowRight ArrowDown Space"
            >
              Next slide →
            </button>
          </div>
        </section>
      </div>
      <section className="slide-tray" aria-label="Prepared slides">
        <div className="monitor-heading">
          <h2>
            Prepared slides <span className="count-label">{slides.length}</span>
          </h2>
          <span>Click to preview · Enter to take live</span>
        </div>
        {slides.length ? (
          <div className="slide-grid">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                className={`slide-tile ${previewSlide?.id === slide.id ? "selected" : ""}`}
                aria-pressed={previewSlide?.id === slide.id}
                onClick={() => dispatch({ type: "SET_PREVIEW", slide })}
              >
                <span className="slide-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="slide-copy">
                  {slide.text || slide.title || "Media slide"}
                </span>
                <span className="slide-reference">{slide.subtext || slide.layout}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="workflow-hint">
            <p>
              <b>01</b> Add content to your service
            </p>
            <p>
              <b>02</b> Check the preview
            </p>
            <p>
              <b>03</b> Take it live when ready
            </p>
          </div>
        )}
      </section>
      {nextSlide && (
        <button
          className="next-up"
          onClick={() => dispatch({ type: "SET_PREVIEW", slide: nextSlide })}
        >
          <span className="eyebrow">Next on program</span>
          <span className="truncate">{nextSlide.text || nextSlide.title}</span>
          <span>Preview ↗</span>
        </button>
      )}
    </div>
  );
}
