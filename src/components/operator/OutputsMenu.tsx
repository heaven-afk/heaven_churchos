"use client";

import React, { useState, useEffect, useRef } from "react";
import { OUTPUT_TARGET_REGISTRY } from "@/config/outputs";
import { StageAlertModal } from "./StageAlertModal";
import { useObsRelay } from "@/hooks/useObsRelay";

/**
 * OutputsMenu — WS7
 *
 * Replaces the single "Output Window" button in TopBar with a per-target
 * output status popover.
 *
 * Features:
 * - Per-target launch buttons (congregation, stage, livestream)
 * - Visual online/offline window status tracking
 * - Stage Alert dispatcher button
 *
 * "Open All" is not implemented as a required Phase 2 feature per the
 * approved architectural constraint (§6 of the revised proposal).
 */

interface OutputWindowTracker {
  [targetId: string]: Window | null;
}

export function OutputsMenu() {
  const relay = useObsRelay();
  const [copyStatus, setCopyStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [windowTracker, setWindowTracker] = useState<OutputWindowTracker>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Track window active status
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open && !alertOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAlertOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, alertOpen]);

  const isWindowOpen = (targetId: string): boolean => {
    const win = windowTracker[targetId];
    return win !== null && win !== undefined && !win.closed;
  };

  const handleLaunch = (routePath: string, windowName: string, targetId: string) => {
    const existingWin = windowTracker[targetId];
    if (existingWin && !existingWin.closed) {
      existingWin.focus();
      return;
    }
    const features = [
      "width=1280",
      "height=720",
      "menubar=no",
      "toolbar=no",
      "location=no",
      "status=no",
      "resizable=yes",
      "scrollbars=no",
    ].join(",");
    const win = window.open(routePath, windowName, features);
    setWindowTracker((prev) => ({ ...prev, [targetId]: win }));
  };

  const activeCount = OUTPUT_TARGET_REGISTRY.filter((t) => isWindowOpen(t.id)).length;

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger button */}
      <button
        id="btn-outputs-menu"
        onClick={() => {
          setOpen(!open);
          setAlertOpen(false);
        }}
        className="flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-colors"
        style={{
          background:
            activeCount > 0 ? "var(--color-primary-subtle)" : "var(--color-surface-2)",
          color: activeCount > 0 ? "var(--color-primary)" : "var(--color-fg-default)",
          borderColor: activeCount > 0 ? "var(--color-primary)" : "var(--color-border)",
        }}
        title="Manage output displays"
        aria-label="Open output windows menu"
        aria-expanded={open}
      >
        <span>Outputs</span>
        {activeCount > 0 && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[9px] leading-none font-bold"
            style={{
              background: "var(--color-primary)",
              color: "var(--color-primary-fg)",
            }}
          >
            {activeCount}
          </span>
        )}
        <span className="text-[10px] opacity-60">{open ? "▲" : "▼"}</span>
      </button>

      {/* Outputs Popover */}
      {open && (
        <div
          className="absolute top-full right-0 mt-2 overflow-hidden rounded-xl border shadow-2xl"
          style={{
            width: 340,
            zIndex: 200,
            background: "var(--color-bg-overlay)",
            borderColor: "var(--color-border-strong)",
          }}
          role="region"
          aria-label="Output displays"
        >
          <div
            className="border-b px-4 py-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <p
              className="text-xs font-semibold tracking-wider uppercase"
              style={{ color: "var(--color-fg-muted)" }}
            >
              Output Displays
            </p>
          </div>

          <div className="flex flex-col gap-1 p-2">
            {OUTPUT_TARGET_REGISTRY.map((target) => {
              const active = isWindowOpen(target.id);
              return (
                <div
                  key={target.id}
                  className="flex items-center justify-between rounded-lg px-3 py-2"
                  style={{
                    background: active ? "var(--color-primary-subtle)" : "transparent",
                  }}
                >
                  <div className="mr-3 flex min-w-0 flex-col">
                    <span
                      className="truncate text-xs font-semibold"
                      style={{
                        color: active
                          ? "var(--color-primary)"
                          : "var(--color-fg-default)",
                      }}
                    >
                      {target.name}
                    </span>
                    <span
                      className="text-[10px]"
                      style={{ color: "var(--color-fg-subtle)" }}
                    >
                      {active ? "● Window open" : "○ Not opened here"}
                    </span>
                  </div>
                  <button
                    id={`btn-output-${target.id}`}
                    onClick={() =>
                      handleLaunch(target.routePath, target.windowName, target.id)
                    }
                    className="shrink-0 rounded border px-2 py-1 text-[10px] font-semibold transition-colors"
                    style={{
                      background: active
                        ? "var(--color-surface-3)"
                        : "var(--color-primary-subtle)",
                      color: active ? "var(--color-fg-muted)" : "var(--color-primary)",
                      borderColor: active
                        ? "var(--color-border)"
                        : "var(--color-primary)",
                    }}
                    aria-label={`${active ? "Focus" : "Launch"} ${target.name}`}
                  >
                    {active ? "Focus ↗" : "Launch ↗"}
                  </button>
                </div>
              );
            })}
          </div>

          <div
            className="resource-panel border-t px-4 py-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h3 className="resource-title">OBS Browser Source</h3>
            {!relay.available && (
              <p className="resource-description">
                For OBS on this hosted site, launch the Livestream / Lower-Third window
                above and capture it with OBS Window Capture. A synchronized Browser
                Source URL requires the local app.
              </p>
            )}
            {relay.available && (
              <>
                <p className="resource-description">
                  Run locally. Add a Browser source in OBS at 1920 × 1080. Keep the
                  operator tab open.
                </p>
                <button
                  className="operator-button"
                  disabled={relay.busy}
                  onClick={() => {
                    void relay.start();
                  }}
                >
                  {relay.busy
                    ? "Connecting…"
                    : relay.session
                      ? "Generate new OBS link"
                      : "Enable OBS output"}
                </button>
                <p className="resource-description" role="status">
                  {relay.status}
                </p>
                {relay.session && (
                  <>
                    <label className="field-label" htmlFor="obs-output-link">
                      Read-only lower-third URL
                    </label>
                    <input
                      id="obs-output-link"
                      className="operator-input"
                      readOnly
                      value={`${window.location.origin}/presentation?target=livestream&relay=${relay.session.readKey}`}
                      onFocus={(e) => e.target.select()}
                    />
                    <button
                      className="operator-button primary"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(
                            `${window.location.origin}/presentation?target=livestream&relay=${relay.session!.readKey}`
                          );
                          setCopyStatus("Copied. Paste into the OBS Browser source URL.");
                        } catch {
                          setCopyStatus("Select the URL above and copy it manually.");
                        }
                      }}
                    >
                      Copy OBS URL
                    </button>
                    <p className="resource-description" role="status">
                      {copyStatus}
                    </p>
                  </>
                )}
              </>
            )}
          </div>
          <div className="px-3 pb-3">
            <button
              id="btn-stage-alert-open"
              onClick={() => {
                setOpen(false);
                setAlertOpen(true);
              }}
              className="w-full rounded-lg border py-2 text-xs font-semibold transition-colors"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-fg-muted)",
                borderColor: "var(--color-border)",
              }}
              aria-label="Open stage alert dispatcher"
            >
              📢 Stage Alert
            </button>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertOpen && <StageAlertModal onClose={() => setAlertOpen(false)} />}
    </div>
  );
}
