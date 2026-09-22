"use client";

import React, { useState, useEffect, useRef } from "react";
import { OUTPUT_TARGET_REGISTRY } from "@/config/outputs";
import { StageAlertModal } from "./StageAlertModal";

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
  const [open, setOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [windowTracker, setWindowTracker] = useState<OutputWindowTracker>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Track window active status
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

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
        onClick={() => { setOpen(!open); setAlertOpen(false); }}
        className="text-xs px-2.5 py-1 rounded transition-colors font-medium flex items-center gap-1.5 border"
        style={{
          background: activeCount > 0 ? "var(--color-primary-subtle)" : "var(--color-surface-2)",
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
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
            style={{ background: "var(--color-primary)", color: "var(--color-primary-fg)" }}
          >
            {activeCount}
          </span>
        )}
        <span className="text-[10px] opacity-60">{open ? "▲" : "▼"}</span>
      </button>

      {/* Outputs Popover */}
      {open && (
        <div
          className="absolute top-full right-0 mt-2 rounded-xl border shadow-2xl overflow-hidden"
          style={{
            width: 280,
            zIndex: 200,
            background: "var(--color-bg-overlay)",
            borderColor: "var(--color-border-strong)",
          }}
          role="menu"
          aria-label="Output displays"
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-fg-muted)" }}>
              Output Displays
            </p>
          </div>

          <div className="p-2 flex flex-col gap-1">
            {OUTPUT_TARGET_REGISTRY.map((target) => {
              const active = isWindowOpen(target.id);
              return (
                <div
                  key={target.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: active ? "var(--color-primary-subtle)" : "transparent" }}
                >
                  <div className="flex flex-col min-w-0 mr-3">
                    <span
                      className="text-xs font-semibold truncate"
                      style={{ color: active ? "var(--color-primary)" : "var(--color-fg-default)" }}
                    >
                      {target.name}
                    </span>
                    <span className="text-[10px]" style={{ color: "var(--color-fg-subtle)" }}>
                      {active ? "● Online" : "○ Offline"}
                    </span>
                  </div>
                  <button
                    id={`btn-output-${target.id}`}
                    onClick={() => handleLaunch(target.routePath, target.windowName, target.id)}
                    className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded border transition-colors"
                    style={{
                      background: active ? "var(--color-surface-3)" : "var(--color-primary-subtle)",
                      color: active ? "var(--color-fg-muted)" : "var(--color-primary)",
                      borderColor: active ? "var(--color-border)" : "var(--color-primary)",
                    }}
                    aria-label={`${active ? "Focus" : "Launch"} ${target.name}`}
                  >
                    {active ? "Focus ↗" : "Launch ↗"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="px-3 pb-3">
            <button
              id="btn-stage-alert-open"
              onClick={() => { setOpen(false); setAlertOpen(true); }}
              className="w-full rounded-lg py-2 text-xs font-semibold border transition-colors"
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
