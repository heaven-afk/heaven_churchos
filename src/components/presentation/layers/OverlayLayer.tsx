"use client";

import React, { useEffect } from "react";
import type { OutputStatus, StageAlert, DisplayTarget } from "@/types/presentation.types";
import { dispatch } from "@/actions/presentation.actions";

interface OverlayLayerProps {
  status: OutputStatus;
  activeAlert: StageAlert | null;
  target: DisplayTarget;
  isThumbnail?: boolean;
}

/**
 * Layer 4 — Overlay & Alert Layer (z-index: 40)
 *
 * Renders:
 * - BLACK mask (status === 'black')
 * - FROZEN badge
 * - Stage alerts (non-destructive, independent of liveSlide)
 *
 * Alerts are filtered by target: 'congregation', 'stage', or 'all'.
 * Alert auto-dismiss is managed here via useEffect timer.
 */
export function OverlayLayer({ status, activeAlert, target, isThumbnail = false }: OverlayLayerProps) {
  // Auto-dismiss timer for timed alerts
  useEffect(() => {
    if (!activeAlert?.durationMs) return;
    const timer = setTimeout(() => {
      dispatch({ type: "DISMISS_STAGE_ALERT" });
    }, activeAlert.durationMs);
    return () => clearTimeout(timer);
  }, [activeAlert]);

  const shouldShowAlert =
    activeAlert &&
    (activeAlert.target === "all" || activeAlert.target === target);

  return (
    <>
      {/* BLACK output mask */}
      {status === "black" && (
        <div
          className="absolute inset-0 bg-black"
          style={{ zIndex: 40 }}
          aria-label="Black screen"
        />
      )}

      {/* FROZEN badge */}
      {status === "frozen" && !isThumbnail && (
        <div
          className="absolute top-3 right-3 font-bold uppercase rounded tracking-wider shadow text-xs px-2.5 py-1"
          style={{
            background: "var(--color-warning, #f59e0b)",
            color: "#000000",
            zIndex: 41,
          }}
          aria-label="Output is frozen"
        >
          FROZEN
        </div>
      )}

      {/* Stage / Congregation Alert Banner */}
      {shouldShowAlert && !isThumbnail && (
        <div
          className="absolute left-0 right-0 flex items-center justify-between gap-4"
          style={{
            bottom: "12%",
            zIndex: 45,
            padding: "0 3rem",
          }}
          role="alert"
          aria-live="assertive"
        >
          <div
            className="flex-1 flex items-center gap-3 rounded-xl px-6 py-4 shadow-xl"
            style={{
              background: "rgba(245, 158, 11, 0.95)",
              color: "#000000",
              border: "2px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span className="text-2xl select-none" aria-hidden="true">📢</span>
            <p className="font-bold text-xl leading-tight flex-1">
              {activeAlert!.message}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
