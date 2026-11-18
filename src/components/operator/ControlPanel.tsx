"use client";

import { useUIStore } from "@/store/ui.store";
import { useServiceStore } from "@/store/service.store";
import { ScripturePanel } from "./ScripturePanel";
import { SongLibraryPanel } from "./SongLibraryPanel";
import { TextPanel } from "./TextPanel";
import { MediaPanel } from "./MediaPanel";
import { AppearancePanel } from "./AppearancePanel";

const TABS = [
  { id: "songs", label: "Songs", icon: "♪" },
  { id: "scripture", label: "Bible", icon: "≡" },
  { id: "text", label: "Text", icon: "T" },
  { id: "media", label: "Media", icon: "▧" },
  { id: "layout", label: "Design", icon: "Aa" },
  { id: "background", label: "Backdrops", icon: "◒" },
] as const;

export function ControlPanel() {
  const isOpen = useUIStore((s) => s.isControlPanelOpen);
  const activeTab = useUIStore((s) => s.controlPanelTab);
  const setTab = useUIStore((s) => s.setControlPanelTab);
  const selectedId = useServiceStore((s) => s.selectedItemId);
  if (!isOpen) return null;
  const panels = {
    songs: <SongLibraryPanel />,
    scripture: <ScripturePanel />,
    text: null,
    media: <MediaPanel />,
    layout: <AppearancePanel />,
    background: <MediaPanel />,
  };

  return (
    <aside className="studio-resources" aria-label="Presentation controls">
      <div className="resource-panel-heading">
        <span className="eyebrow">Your creative toolkit</span>
        <span>Resources</span>
      </div>
      <div
        className="studio-resource-tabs"
        role="tablist"
        aria-label="Control panel tabs"
      >
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setTab(tab.id)}
          >
            <span className="resource-tab-icon" aria-hidden="true">
              {tab.icon}
            </span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
      <div
        className="resource-panel-scroll"
        id={`tabpanel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
      >
        <div hidden={activeTab !== "text"}>
          <TextPanel key={selectedId ?? "new-text"} />
        </div>
        {panels[activeTab]}
      </div>
    </aside>
  );
}
