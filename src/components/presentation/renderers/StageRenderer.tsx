"use client";

import React, { useState, useEffect } from "react";
import type { PresentationSlide } from "@/types/presentation.types";

interface StageRendererProps {
  liveSlide: PresentationSlide | null;
  nextSlide: PresentationSlide | null;
  status: "live" | "black" | "clear" | "frozen";
}

/**
 * Stage / Confidence Monitor Renderer — WS4
 *
 * High-contrast display for speakers and worship leaders.
 * Layout:
 *   - 65% height: Current slide (large, bold, high-contrast white on dark)
 *   - 35% height: Next slide preview (dimmed, with "NEXT:" badge)
 *   - Bottom bar: Real-time digital clock + elapsed service timer
 */
export function StageRenderer({ liveSlide, nextSlide, status }: StageRendererProps) {
  const [clock, setClock] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const formatElapsed = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (status === "black") {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center" style={{ zIndex: 30 }}>
        <p className="text-2xl font-bold uppercase tracking-widest" style={{ color: "var(--color-fg-subtle)" }}>
          Output Black
        </p>
      </div>
    );
  }

  if (status === "clear" || !liveSlide) {
    return (
      <div className="absolute inset-0 flex flex-col" style={{ zIndex: 30, background: "#0d1117" }}>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl font-mono uppercase tracking-widest" style={{ color: "var(--color-fg-subtle)" }}>
            Output Clear
          </p>
        </div>
        <StageClockBar clock={clock} elapsed={formatElapsed(elapsed)} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ zIndex: 30, background: "#0d1117" }}>
      {/* Current Slide — 65% */}
      <div className="flex flex-col justify-center px-10" style={{ flex: "0 0 65%", borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
        {liveSlide.title && (
          <p className="font-bold uppercase tracking-widest text-xl mb-2" style={{ color: "var(--color-primary)" }}>
            {liveSlide.title}
          </p>
        )}
        <p className="font-bold text-white leading-tight whitespace-pre-line text-5xl lg:text-6xl">
          {liveSlide.text}
        </p>
        {liveSlide.subtext && (
          <p className="mt-4 text-2xl font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
            {liveSlide.subtext}
          </p>
        )}
        {status === "frozen" && (
          <span
            className="mt-4 self-start text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ background: "var(--color-warning)", color: "#000" }}
          >
            FROZEN
          </span>
        )}
      </div>

      {/* Next Slide Preview — remaining */}
      <div className="flex flex-col justify-center px-10 py-4" style={{ flex: 1, opacity: 0.45 }}>
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
            style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
          >
            NEXT
          </span>
        </div>
        {nextSlide ? (
          <>
            {nextSlide.title && (
              <p className="font-semibold text-base mb-1 uppercase tracking-wide" style={{ color: "var(--color-primary)" }}>
                {nextSlide.title}
              </p>
            )}
            <p className="text-white text-2xl font-medium leading-snug whitespace-pre-line">
              {nextSlide.text}
            </p>
            {nextSlide.subtext && (
              <p className="text-base mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                {nextSlide.subtext}
              </p>
            )}
          </>
        ) : (
          <p className="text-white/40 text-lg italic">End of sequence</p>
        )}
      </div>

      {/* Clock Bar */}
      <StageClockBar clock={clock} elapsed={formatElapsed(elapsed)} />
    </div>
  );
}

function StageClockBar({ clock, elapsed }: { clock: string; elapsed: string }) {
  return (
    <div
      className="flex items-center justify-between px-8 py-3 shrink-0"
      style={{ background: "rgba(0,0,0,0.6)", borderTop: "1px solid rgba(255,255,255,0.08)" }}
    >
      <span className="font-mono text-base font-bold" style={{ color: "rgba(255,255,255,0.5)" }}>
        ⏱ {elapsed}
      </span>
      <span className="font-mono text-lg font-bold" style={{ color: "rgba(255,255,255,0.7)" }}>
        {clock}
      </span>
    </div>
  );
}
