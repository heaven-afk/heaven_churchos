"use client";

import React from "react";
import { dispatch } from "@/actions/presentation.actions";
import { usePresentationStore } from "@/store/presentation.store";
import type { TransitionType } from "@/types/presentation.types";

/**
 * TransitionPicker — WS3
 *
 * Compact operator control to select the active slide transition style.
 * Cut: instant. Dissolve: opacity crossfade.
 */
export function TransitionPicker() {
  const activeTransition = usePresentationStore((s) => s.activeTransition);

  const setTransition = (type: TransitionType) => {
    dispatch({ type: "SET_TRANSITION", transitionType: type });
  };

  const options: { value: TransitionType; label: string; title: string }[] = [
    { value: "cut", label: "Cut", title: "Instant transition (default for stage)" },
    { value: "dissolve", label: "Dissolve", title: "Opacity crossfade (default for congregation)" },
  ];

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Slide transition">
      <span className="text-[10px] uppercase tracking-wider mr-1 select-none" style={{ color: "var(--color-fg-subtle)" }}>
        Transition
      </span>
      {options.map((opt) => (
        <button
          key={opt.value}
          id={`btn-transition-${opt.value}`}
          onClick={() => setTransition(opt.value)}
          title={opt.title}
          className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wide transition-colors border"
          style={{
            background:
              activeTransition === opt.value
                ? "var(--color-primary-subtle)"
                : "var(--color-surface-2)",
            color:
              activeTransition === opt.value
                ? "var(--color-primary)"
                : "var(--color-fg-muted)",
            borderColor:
              activeTransition === opt.value
                ? "var(--color-primary)"
                : "var(--color-border)",
          }}
          aria-pressed={activeTransition === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
