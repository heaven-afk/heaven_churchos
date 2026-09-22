/**
 * Phase 2 Output Targets, Alert System, and Transitions Test Suite
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  OUTPUT_TARGET_REGISTRY,
  getOutputTargetConfig,
  DEFAULT_DISPLAY_TARGET,
} from "@/config/outputs";
import { dispatch } from "@/actions/presentation.actions";
import { usePresentationStore } from "@/store/presentation.store";
import type { PresentationSlide } from "@/types/presentation.types";

const SLIDE_1: PresentationSlide = {
  id: "s1",
  text: "Amazing Grace how sweet the sound",
  subtext: "Verse 1",
  layout: "full-screen",
  background: { id: "bg-1", type: "color", name: "Black", value: "#000" },
};

const SLIDE_2: PresentationSlide = {
  id: "s2",
  text: "That saved a wretch like me",
  subtext: "Verse 2",
  layout: "full-screen",
  background: { id: "bg-1", type: "color", name: "Black", value: "#000" },
};

const SLIDE_3: PresentationSlide = {
  id: "s3",
  text: "I once was lost, but now am found",
  subtext: "Verse 3",
  layout: "full-screen",
  background: { id: "bg-1", type: "color", name: "Black", value: "#000" },
};

describe("Phase 2 — Output Target Architecture & Registry", () => {
  it("registers congregation, stage, and livestream outputs", () => {
    const ids = OUTPUT_TARGET_REGISTRY.map((t) => t.id);
    expect(ids).toContain("congregation");
    expect(ids).toContain("stage");
    expect(ids).toContain("livestream");
    expect(OUTPUT_TARGET_REGISTRY.length).toBeGreaterThanOrEqual(3);
  });

  it("provides correct capabilities for congregation target", () => {
    const config = getOutputTargetConfig("congregation");
    expect(config.id).toBe("congregation");
    expect(config.capabilities.supportsBackground).toBe(true);
    expect(config.capabilities.supportsMedia).toBe(true);
    expect(config.capabilities.isAlphaTransparent).toBe(false);
    expect(config.capabilities.supportsNextPreview).toBe(false);
    expect(config.defaultTransition.type).toBe("dissolve");
  });

  it("provides correct capabilities for stage / confidence target", () => {
    const config = getOutputTargetConfig("stage");
    expect(config.id).toBe("stage");
    expect(config.capabilities.supportsNextPreview).toBe(true);
    expect(config.capabilities.supportsBackground).toBe(false);
    expect(config.capabilities.supportsMedia).toBe(false);
    expect(config.capabilities.isAlphaTransparent).toBe(false);
    expect(config.defaultTransition.type).toBe("cut");
  });

  it("provides correct capabilities for livestream lower-third target", () => {
    const config = getOutputTargetConfig("livestream");
    expect(config.id).toBe("livestream");
    expect(config.capabilities.isAlphaTransparent).toBe(true);
    expect(config.capabilities.supportsBackground).toBe(false);
    expect(config.capabilities.supportsMedia).toBe(false);
    expect(config.capabilities.defaultLayout).toBe("lower-third");
  });

  it("falls back to default target (congregation) when target id is invalid", () => {
    const config = getOutputTargetConfig("non_existent_target");
    expect(config.id).toBe(DEFAULT_DISPLAY_TARGET);
    expect(config.id).toBe("congregation");
  });
});

describe("Phase 2 — Alert System & Non-Destructive Invariant", () => {
  beforeEach(() => {
    usePresentationStore.setState({
      status: "live",
      liveSlide: SLIDE_1,
      previewSlide: SLIDE_2,
      nextSlide: SLIDE_2,
      activeAlert: null,
      activeTransition: "dissolve",
      transitionDurationMs: 250,
      slides: [SLIDE_1, SLIDE_2, SLIDE_3],
      liveSlideIndex: 0,
      previewSlideIndex: 1,
    });
  });

  it("SHOW_ALERT sets activeAlert with message, timestamp, and id", () => {
    dispatch({
      type: "SHOW_ALERT",
      message: "Pastor John: 5 minutes remaining",
      target: "stage",
      severity: "warning",
    });

    const state = usePresentationStore.getState();
    expect(state.activeAlert).not.toBeNull();
    expect(state.activeAlert?.message).toBe("Pastor John: 5 minutes remaining");
    expect(state.activeAlert?.target).toBe("stage");
    expect(state.activeAlert?.severity).toBe("warning");
    expect(typeof state.activeAlert?.id).toBe("string");
    expect(typeof state.activeAlert?.createdAt).toBe("number");
  });

  it("CLEAR_ALERT removes the activeAlert", () => {
    dispatch({
      type: "SHOW_ALERT",
      message: "Child care alert: Child #402",
    });
    expect(usePresentationStore.getState().activeAlert).not.toBeNull();

    dispatch({ type: "CLEAR_ALERT" });
    expect(usePresentationStore.getState().activeAlert).toBeNull();
  });

  it("CRITICAL: Alerts are completely non-destructive to underlying presentation state", () => {
    const beforeState = usePresentationStore.getState();

    // Dispatch stage alert
    dispatch({
      type: "SHOW_ALERT",
      message: "Car lights on: ABC-1234",
      target: "all",
      severity: "info",
    });

    let state = usePresentationStore.getState();
    expect(state.liveSlide).toEqual(beforeState.liveSlide);
    expect(state.previewSlide).toEqual(beforeState.previewSlide);
    expect(state.nextSlide).toEqual(beforeState.nextSlide);
    expect(state.status).toBe(beforeState.status);
    expect(state.liveSlideIndex).toBe(beforeState.liveSlideIndex);

    // Dismiss alert
    dispatch({ type: "CLEAR_ALERT" });

    state = usePresentationStore.getState();
    expect(state.liveSlide).toEqual(beforeState.liveSlide);
    expect(state.previewSlide).toEqual(beforeState.previewSlide);
    expect(state.nextSlide).toEqual(beforeState.nextSlide);
    expect(state.status).toBe(beforeState.status);
    expect(state.liveSlideIndex).toBe(beforeState.liveSlideIndex);
  });
});

describe("Phase 2 — Transitions & Next Slide Tracking", () => {
  beforeEach(() => {
    usePresentationStore.setState({
      status: "clear",
      liveSlide: null,
      previewSlide: null,
      nextSlide: null,
      activeAlert: null,
      activeTransition: "dissolve",
      transitionDurationMs: 250,
      slides: [SLIDE_1, SLIDE_2, SLIDE_3],
      liveSlideIndex: -1,
      previewSlideIndex: -1,
    });
  });

  it("SET_TRANSITION updates activeTransition and duration", () => {
    dispatch({ type: "SET_TRANSITION", transitionType: "cut" });
    expect(usePresentationStore.getState().activeTransition).toBe("cut");
    expect(usePresentationStore.getState().transitionDurationMs).toBe(0);

    dispatch({ type: "SET_TRANSITION", transitionType: "dissolve", durationMs: 400 });
    expect(usePresentationStore.getState().activeTransition).toBe("dissolve");
    expect(usePresentationStore.getState().transitionDurationMs).toBe(400);
  });

  it("correctly calculates nextSlide when advancing through slides", () => {
    dispatch({ type: "SEND_LIVE", slide: SLIDE_1 });
    let state = usePresentationStore.getState();
    expect(state.liveSlide?.id).toBe("s1");
    expect(state.nextSlide?.id).toBe("s2");

    dispatch({ type: "NEXT_SLIDE" });
    state = usePresentationStore.getState();
    expect(state.liveSlide?.id).toBe("s2");
    expect(state.nextSlide?.id).toBe("s3");

    dispatch({ type: "NEXT_SLIDE" });
    state = usePresentationStore.getState();
    expect(state.liveSlide?.id).toBe("s3");
    // On last slide, nextSlide must be null
    expect(state.nextSlide).toBeNull();
  });
});
