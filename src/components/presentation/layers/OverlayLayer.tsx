"use client";

import React, { useEffect, useState } from "react";
import type { OutputStatus, StageAlert, DisplayTarget } from "@/types/presentation.types";

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
  const [expiredId, setExpiredId] = useState<string | null>(null);
  // Auto-dismiss timer for timed alerts
  useEffect(() => {
    if (!activeAlert?.durationMs) return;
    const timer = setTimeout(() => {
      setExpiredId(activeAlert.id);
    }, Math.max(0, activeAlert.createdAt + activeAlert.durationMs - Date.now()));
    return () => clearTimeout(timer);
  }, [activeAlert]);

  const shouldShowAlert =
    activeAlert &&
    activeAlert.id !== expiredId &&
    status !== 'black' &&
    (activeAlert.target === "all" || activeAlert.target === target);

  return (
    <>
      {/* BLACK output mask */}
      {status === "black" && target !== 'livestream' && (
        <div
          className="absolute inset-0"
          style={{ zIndex: 40, background: 'var(--color-output-black)' }}
          aria-label="Black screen"
        />
      )}

      {/* FROZEN badge */}
      {status === "frozen" && !isThumbnail && target === 'stage' && (
        <div
          className="absolute top-3 right-3 font-bold uppercase rounded tracking-wider shadow text-xs px-2.5 py-1"
          style={{
            background: "var(--color-warning)",
            color: "var(--color-warning-fg)",
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
              background: "var(--color-warning)",
              color: "var(--color-warning-fg)",
              border: "2px solid var(--color-border-strong)",
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
