"use client";

import { useKeyboard } from "@/hooks/useKeyboard";
import { useEffect } from "react";
import { useSongStore } from "@/store/song.store";
import { useAuthStore } from "@/store/auth.store";
import { useServiceStore } from "@/store/service.store";
import { ServicePanel } from "./ServicePanel";
import { ControlPanel } from "./ControlPanel";
import { OutputMonitor } from "./OutputMonitor";
import { TopBar } from "./TopBar";

/**
 * OperatorShell — the root layout for the operator workstation.
 *
 * Layout:
 * ┌─────────────────────────────────────────────┐
 * │ TopBar                                      │
 * ├─────────────┬────────────────┬──────────────┤
 * │ ServicePanel│   children     │ ControlPanel │
 * │  (left)     │   (centre)     │  (right)     │
 * ├─────────────┴────────────────┴──────────────┤
 * │ OutputMonitor (bottom strip)                │
 * └─────────────────────────────────────────────┘
 *
 * EmergencyControls are embedded in the TopBar so they're always visible.
 */
export function OperatorShell({ children }: { children: React.ReactNode }) {
  // Register global keyboard handler once at the shell level
  useKeyboard();
  useEffect(() => {
    void useSongStore.persist.rehydrate();
  }, []);
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      await useAuthStore.getState().initAuth();
      const organization = useAuthStore.getState().organization;
      if (!cancelled && organization)
        await useServiceStore.getState().loadServices(organization.id);
    };
    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className="operator-shell flex h-dvh flex-col overflow-hidden"
      style={{ background: "var(--color-bg-base)" }}
    >
      <TopBar />

      <div className="operator-workspace flex flex-1 overflow-hidden">
        <ServicePanel />
        <main
          className="min-w-0 flex-1 overflow-hidden"
          role="main"
          aria-label="Presentation preview"
        >
          {children}
        </main>
        <ControlPanel />
      </div>

      <OutputMonitor />
    </div>
  );
}
