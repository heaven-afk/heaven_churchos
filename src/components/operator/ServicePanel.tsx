"use client";

import React, { useState } from "react";
import { useServiceStore, selectActiveItems } from "@/store/service.store";
import { useUIStore } from "@/store/ui.store";
import { dispatch } from "@/actions/presentation.actions";
import type { ServiceItem } from "@/types/service.types";
import type { Scripture, Song } from "@/types/content.types";
import type { MediaItem } from "@/types/media.types";
import type { PresentationSlide } from "@/types/presentation.types";
import { songToPresentationSlides } from "@/lib/lyrics/lyric.service";
import { createTextPresentationSlides, getTextOptions } from "@/lib/content/text.service";
import type { TextServiceContent } from '@/types/text-style.types';
import { createMediaPresentationSlide } from "@/lib/content/media.service";
import { applySlideAppearance, getItemAppearance } from "@/lib/presentation/typography";
import { ServiceModal } from "./ServiceModal";

const ITEM_TYPE_ICONS: Record<string, string> = {
  song: "🎵",
  scripture: "📖",
  text: "✏️",
  image: "🖼️",
  video: "🎬",
  announcement: "📢",
  custom: "⭐",
};

/**
 * ServicePanel — left panel showing the service item list.
 *
 * Implements Phase 1 §7 (Service Persistence, Item Reordering, and Sync State).
 */
export function ServicePanel() {
  const currentService = useServiceStore((s) => s.currentService);
  const items = useServiceStore(selectActiveItems);
  const isLoading = useServiceStore((s) => s.isLoading);
  const syncStatus = useServiceStore((s) => s.syncStatus);
  const error = useServiceStore((s) => s.error);
  const setError = useServiceStore((s) => s.setError);

  const isOpen = useUIStore((s) => s.isServicePanelOpen);
  const isControlPanelOpen = useUIStore((s) => s.isControlPanelOpen);
  const toggleControlPanel = useUIStore((s) => s.toggleControlPanel);
  const setControlPanelTab = useUIStore((s) => s.setControlPanelTab);

  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const handleAddClick = () => {
    setControlPanelTab("songs");
    if (!isControlPanelOpen) {
      toggleControlPanel();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <aside
        className="flex shrink-0 flex-col overflow-hidden border-r"
        style={{
          width: "var(--panel-service-width)",
          background: "var(--color-bg-elevated)",
          borderColor: "var(--color-border)",
        }}
        aria-label="Service items"
        role="complementary"
      >
        {/* Panel header */}
        <div
          className="flex items-center justify-between gap-2 border-b px-3 py-2.5"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={() => setIsServiceModalOpen(true)}
            className="group flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 rounded p-1 text-left transition-colors hover:bg-white/5"
            title="Switch or create service"
            aria-label="Switch or create service"
          >
            <span
              className="block truncate text-xs font-semibold tracking-wider uppercase"
              style={{ color: "var(--color-fg-default)" }}
            >
              {currentService ? currentService.title : "Service"}
            </span>
            <span
              className="shrink-0 text-[10px] opacity-60 transition-opacity group-hover:opacity-100"
              style={{ color: "var(--color-primary)" }}
            >
              ▾
            </span>
          </button>

          <div className="flex shrink-0 items-center gap-1.5">
            {/* Sync status indicator */}
            <span
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] select-none"
              style={{
                color:
                  syncStatus === "synced"
                    ? "var(--color-success)"
                    : syncStatus === "error"
                      ? "var(--color-warning)"
                      : "var(--color-fg-subtle)",
                background: "var(--color-surface-1)",
              }}
              title={
                syncStatus === "synced"
                  ? "Changes synced to cloud"
                  : syncStatus === "syncing"
                    ? "Saving changes..."
                    : syncStatus === "error"
                      ? "Saved locally (cloud offline)"
                      : "Saved locally"
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background:
                    syncStatus === "synced"
                      ? "var(--color-success)"
                      : syncStatus === "syncing"
                        ? "var(--color-primary)"
                        : syncStatus === "error"
                          ? "var(--color-warning)"
                          : "var(--color-fg-muted)",
                }}
              />
              <span className="text-[10px] font-medium tracking-wider uppercase">
                {syncStatus === "synced"
                  ? "Cloud"
                  : syncStatus === "syncing"
                    ? "Saving"
                    : "Local"}
              </span>
            </span>

            <button
              id="btn-add-item"
              onClick={handleAddClick}
              className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors"
              style={{
                color: "var(--color-primary)",
                background: "var(--color-primary-subtle)",
              }}
              aria-label="Add service item"
              title="Add songs or scripture"
            >
              + Add
            </button>
          </div>
        </div>

        {/* User-friendly Error Banner (§7.7) */}
        {error && (
          <div
            className="flex items-center justify-between gap-2 border-b px-3 py-1.5 text-xs"
            style={{
              background: "var(--color-warning-subtle)",
              borderColor: "var(--color-border)",
              color: "var(--color-warning)",
            }}
          >
            <span className="truncate">{error}</span>
            <button
              onClick={() => setError(null)}
              className="cursor-pointer p-0.5 font-bold hover:opacity-80"
              aria-label="Dismiss error notice"
            >
              ✕
            </button>
          </div>
        )}

        {/* Item list */}
        <div className="flex-1 overflow-y-auto" role="list" aria-label="Service items">
          {isLoading ? (
            <ServicePanelSkeleton />
          ) : items.length === 0 ? (
            <ServicePanelEmptyState hasService={!!currentService} />
          ) : (
            <div role="listbox" aria-label="Service items" className="py-1">
              {items.map((item, index) => (
                <ServiceItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Service Switch / Create Modal */}
      <ServiceModal
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />
    </>
  );
}

// ─── Skeleton Loading (§7.6) ──────────────────────────────────────────────────

function ServicePanelSkeleton() {
  return (
    <div className="animate-pulse space-y-2.5 p-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="flex h-10 items-center gap-3 rounded-lg px-3"
          style={{ background: "var(--color-surface-1)" }}
        >
          <div
            className="h-4 w-4 rounded"
            style={{ background: "var(--color-surface-2)" }}
          />
          <div
            className="h-3 flex-1 rounded"
            style={{ background: "var(--color-surface-2)" }}
          />
          <div
            className="h-3 w-6 rounded"
            style={{ background: "var(--color-surface-2)" }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function ServicePanelEmptyState({ hasService }: { hasService: boolean }) {
  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-3 px-4 py-12 text-center"
      style={{ color: "var(--color-fg-muted)" }}
    >
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
        style={{ background: "var(--color-surface-1)" }}
        aria-hidden="true"
      >
        {hasService ? "📭" : "📋"}
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--color-fg-default)" }}>
          {hasService ? "No items in rundown" : "No service open"}
        </p>
        <p className="mt-1 text-xs" style={{ color: "var(--color-fg-subtle)" }}>
          {hasService
            ? "Add songs or Scripture from the control panel."
            : "Create or open a service to begin."}
        </p>
      </div>
    </div>
  );
}

// ─── Item Row with Deterministic Reordering (§7.4) ────────────────────────────

function ServiceItemRow({
  item,
  index,
  isFirst,
  isLast,
}: {
  item: ServiceItem;
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  const selectedId = useServiceStore((s) => s.selectedItemId);
  const selectItem = useServiceStore((s) => s.selectItem);
  const moveItem = useServiceStore((s) => s.moveItem);
  const removeItem = useServiceStore((s) => s.removeItem);
  const isSelected = item.id === selectedId;

  const handleSelect = () => {
    selectItem(item.id);
    const stage = (slides: PresentationSlide[]) => {
      dispatch({
        type: "SET_SLIDES",
        slides: applySlideAppearance(slides, getItemAppearance(item)),
        sourceItemId: item.id,
      });
    };
    if (item.type === "scripture" && item.content) {
      const scripture = item.content as Scripture;
      if (Array.isArray(scripture.slides) && scripture.slides.length > 0) {
        const presentationSlides: PresentationSlide[] = scripture.slides.map(
          (s, idx) => ({
            id: `scr-${item.id}-${idx}`,
            text: s.text,
            subtext: `${s.ref.book} ${s.ref.chapter}:${s.ref.verse} (${s.ref.translation})`,
            layout: "full-screen",
            background: {
              id: "black",
              type: "color",
              name: "Black",
              value: "#000000",
            },
          })
        );
        stage(presentationSlides);
      }
    } else if (item.type === "song" && item.content) {
      const song = item.content as Song;
      const presentationSlides = songToPresentationSlides(song);
      if (presentationSlides.length > 0) {
        stage(presentationSlides);
      }
    } else if (item.type === "text" && item.content) {
      const textContent = item.content as TextServiceContent;
      const slides =
        textContent.slides && textContent.slides.length > 0
          ? textContent.slides
          : createTextPresentationSlides(getTextOptions(item.content) ?? {body: item.title});
      if (slides.length > 0) {
        stage(slides);
      }
    } else if ((item.type === "image" || item.type === "video") && item.content) {
      const mediaContent = item.content as {
        slides?: PresentationSlide[];
        media?: MediaItem;
      };
      const slides =
        mediaContent.slides && mediaContent.slides.length > 0
          ? mediaContent.slides
          : mediaContent.media
            ? [createMediaPresentationSlide(mediaContent.media)]
            : [];
      if (slides.length > 0) {
        stage(slides);
      }
    }
  };

  const handleMoveUp = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveItem(item.id, "up");
  };

  const handleMoveDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    moveItem(item.id, "down");
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeItem(item.id);
  };

  return (
    <div
      role="option"
      className="group relative flex cursor-pointer items-center gap-2.5 px-3 py-2 transition-colors"
      style={{
        background: isSelected ? "var(--color-primary-subtle)" : "transparent",
        borderLeft: isSelected
          ? "2px solid var(--color-primary)"
          : "2px solid transparent",
      }}
      onClick={handleSelect}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.stopPropagation();
          handleSelect();
        }
      }}
      aria-selected={isSelected}
      aria-label={`${item.title}, item ${index + 1}`}
    >
      <span className="shrink-0 text-sm select-none" aria-hidden="true">
        {ITEM_TYPE_ICONS[item.type] ?? "⭐"}
      </span>

      <div className="min-w-0 flex-1">
        <p
          className="truncate text-xs font-medium"
          style={{
            color: isSelected ? "var(--color-primary)" : "var(--color-fg-default)",
          }}
        >
          {item.title}
        </p>
        <p
          className="mt-0.5 text-[10px] leading-none capitalize"
          style={{ color: "var(--color-fg-subtle)" }}
        >
          {item.type}
        </p>
      </div>

      {item.type === "text" && isSelected && (
        <button
          className="operator-chip"
          aria-label={`Edit ${item.title}`}
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
            useUIStore.getState().setControlPanelTab("text");
            if (!useUIStore.getState().isControlPanelOpen)
              useUIStore.getState().toggleControlPanel();
          }}
        >
          Edit
        </button>
      )}
      {/* Reorder & Remove Actions — visible on hover/focus */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <button
          type="button"
          onClick={handleMoveUp}
          disabled={isFirst}
          className="cursor-pointer rounded p-1 text-[10px] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20"
          style={{ color: "var(--color-fg-muted)" }}
          title="Move item up"
          aria-label={`Move ${item.title} up`}
        >
          ▲
        </button>
        <button
          type="button"
          onClick={handleMoveDown}
          disabled={isLast}
          className="cursor-pointer rounded p-1 text-[10px] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-20"
          style={{ color: "var(--color-fg-muted)" }}
          title="Move item down"
          aria-label={`Move ${item.title} down`}
        >
          ▼
        </button>
        <button
          type="button"
          onClick={handleRemove}
          className="cursor-pointer rounded p-1 text-[10px] hover:bg-red-500/20"
          style={{ color: "var(--color-error)" }}
          title="Remove item"
          aria-label={`Remove ${item.title}`}
        >
          ✕
        </button>
      </div>

      {/* Deterministic Order Number */}
      <span
        className="shrink-0 font-mono text-[10px] tabular-nums"
        style={{ color: "var(--color-fg-subtle)" }}
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}
