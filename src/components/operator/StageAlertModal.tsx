"use client";

import React, { useState } from "react";
import { dispatch } from "@/actions/presentation.actions";
import type { StageAlert } from "@/types/presentation.types";

/**
 * StageAlertModal — WS6
 *
 * Operator UI for dispatching non-destructive stage / congregation alerts.
 * Rendered as an inline popover anchored to the TopBar alert button.
 *
 * Alerts are composited on Layer 4 (OverlayLayer) and do NOT affect liveSlide.
 * Dismissal restores the underlying presentation without operator re-send.
 */
export function StageAlertModal({ onClose }: { onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<StageAlert["target"]>("all");
  const [duration, setDuration] = useState<number | undefined>(15000);

  const handleSend = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const alert: StageAlert = {
      id: `alert-${Date.now()}`,
      message: trimmed,
      target,
      createdAt: Date.now(),
      durationMs: duration,
    };
    dispatch({ type: "SET_STAGE_ALERT", alert });
    setMessage("");
    onClose();
  };

  const handleDismiss = () => {
    dispatch({ type: "DISMISS_STAGE_ALERT" });
    onClose();
  };

  return (
    <div
      className="absolute top-full right-0 mt-2 rounded-xl border shadow-2xl overflow-hidden"
      style={{
        width: 340,
        zIndex: 200,
        background: "var(--color-bg-overlay)",
        borderColor: "var(--color-border-strong)",
      }}
      role="dialog"
      aria-label="Stage alert dispatcher"
    >
      <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--color-border)" }}>
        <span className="text-sm font-semibold" style={{ color: "var(--color-fg-default)" }}>
          📢 Stage Alert
        </span>
        <button
          onClick={onClose}
          className="text-xs opacity-50 hover:opacity-100 transition-opacity"
          style={{ color: "var(--color-fg-muted)" }}
          aria-label="Close alert panel"
        >
          ✕
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <textarea
          id="alert-message-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Alert message…"
          rows={3}
          className="w-full rounded-lg px-3 py-2 text-sm resize-none border outline-none focus:ring-1"
          style={{
            background: "var(--color-surface-1)",
            color: "var(--color-fg-default)",
            borderColor: "var(--color-border)",
          }}
          aria-label="Alert message"
        />

        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-fg-muted)" }}>
              Target
            </label>
            <select
              id="alert-target-select"
              value={target}
              onChange={(e) => setTarget(e.target.value as StageAlert["target"])}
              className="w-full rounded px-2 py-1.5 text-sm border outline-none"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-fg-default)",
                borderColor: "var(--color-border)",
              }}
            >
              <option value="all">All Displays</option>
              <option value="congregation">Congregation</option>
              <option value="stage">Stage Only</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="text-xs font-medium mb-1 block" style={{ color: "var(--color-fg-muted)" }}>
              Auto-dismiss
            </label>
            <select
              id="alert-duration-select"
              value={duration ?? ""}
              onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full rounded px-2 py-1.5 text-sm border outline-none"
              style={{
                background: "var(--color-surface-2)",
                color: "var(--color-fg-default)",
                borderColor: "var(--color-border)",
              }}
            >
              <option value="10000">10 seconds</option>
              <option value="15000">15 seconds</option>
              <option value="30000">30 seconds</option>
              <option value="60000">1 minute</option>
              <option value="">Manual dismiss</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            id="btn-send-alert"
            onClick={handleSend}
            disabled={!message.trim()}
            className="flex-1 rounded-lg py-2 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: "var(--color-warning)", color: "#000000" }}
          >
            Send Alert
          </button>
          <button
            id="btn-dismiss-alert"
            onClick={handleDismiss}
            className="px-4 rounded-lg py-2 text-sm font-medium border transition-colors"
            style={{
              background: "var(--color-surface-2)",
              color: "var(--color-fg-muted)",
              borderColor: "var(--color-border)",
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
