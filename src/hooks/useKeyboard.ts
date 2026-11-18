/**
 * Global Keyboard Handler — spec §28
 *
 * Listens for keyboard events and dispatches the appropriate
 * presentation action based on the current shortcut context.
 *
 * Rules:
 *  - This hook is registered once at the root operator layout.
 *  - Individual UI components do NOT implement their own keydown handlers
 *    for shared presentation operations.
 *  - The active context is read from the keyboard store, which UI panels
 *    update when they gain/lose focus relevance.
 */

"use client";

import { useEffect } from "react";
import { useKeyboardStore } from "@/store/keyboard.store";
import { dispatch } from "@/actions/presentation.actions";
import {
  findShortcut,
  normaliseShortcutKey,
  shouldIgnoreShortcutTarget,
} from "@/config/shortcuts";

/**
 * Normalises a KeyboardEvent into the string format used by shortcuts.ts.
 * e.g. { key: 'ArrowRight', shiftKey: false } → 'arrowright'
 *      { key: 'B', shiftKey: true }            → 'shift+b'
 */
export function useKeyboard() {
  const context = useKeyboardStore((s) => s.activeContext);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const key = normaliseShortcutKey(event);
      const insideControl = Boolean(
        target.closest?.('button, a, summary, [role="button"], [role="tab"]')
      );
      if (
        shouldIgnoreShortcutTarget(
          key,
          target.tagName,
          target.isContentEditable,
          insideControl
        )
      )
        return;
      const binding = findShortcut(key, context);

      if (!binding) return;

      if (binding.preventDefault) {
        event.preventDefault();
      }

      dispatch(binding.action);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [context]);
}
