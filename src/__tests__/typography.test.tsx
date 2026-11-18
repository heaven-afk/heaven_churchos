import { beforeEach, describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_TYPOGRAPHY } from "@/config/typography";
import {
  presentationTextStyle,
  isSlideTypography,
  getItemAppearance,
} from "@/lib/presentation/typography";
import { CongregationRenderer } from "@/components/presentation/renderers/CongregationRenderer";
import { LivestreamRenderer } from "@/components/presentation/renderers/LivestreamRenderer";
import {
  createTextPresentationSlides,
  createTextServiceItem,
  getTextOptions,
} from "@/lib/content/text.service";
import { dispatch } from "@/actions/presentation.actions";
import { usePresentationStore } from "@/store/presentation.store";
import { isSyncedPresentationState } from "@/lib/presentation/validate-sync";
import type { SlideTypography } from "@/types/text-style.types";

const typography: SlideTypography = {
  ...DEFAULT_TYPOGRAPHY,
  body: {
    ...DEFAULT_TYPOGRAPHY.body,
    font: "lora",
    color: "gold",
    size: 72,
    italic: true,
    weight: 700,
    lineHeight: 1.5,
  },
};
const slides = createTextPresentationSlides({
  title: "Welcome",
  body: "First message\n\nSecond message",
  subtext: "Sunday gathering",
  typography,
});

describe("Editable presentation typography", () => {
  beforeEach(() =>
    usePresentationStore.setState({
      slides: [],
      liveSlides: [],
      liveSlide: null,
      previewSlide: null,
      nextSlide: null,
      status: "clear",
      sourceItemId: null,
      layoutOverride: null,
      backgroundOverride: null,
      liveSlideIndex: -1,
      previewSlideIndex: -1,
    })
  );

  it("preserves heading/body/footer styles when text is split, saved and reopened", () => {
    expect(slides).toHaveLength(2);
    expect(slides.every((slide) => slide.typography === typography)).toBe(true);
    const item = createTextServiceItem({ body: "Saved message", typography }, 0);
    const reopened = getTextOptions(JSON.parse(JSON.stringify(item.content)));
    expect(reopened?.typography).toEqual(typography);
    expect(createTextPresentationSlides(reopened!)[0].typography).toEqual(typography);
  });

  it("applies appearance to prepared slides without altering program, even while frozen", () => {
    dispatch({ type: "SET_SLIDES", slides, sourceItemId: "service-item" });
    dispatch({ type: "SEND_LIVE" });
    const before = usePresentationStore.getState();
    dispatch({ type: "FREEZE_OUTPUT" });
    dispatch({
      type: "STYLE_PREVIEW",
      appearance: { typography: DEFAULT_TYPOGRAPHY, textAlign: "left" },
    });
    const after = usePresentationStore.getState();
    expect(after.liveSlide).toBe(before.liveSlide);
    expect(after.liveSlides).toBe(before.liveSlides);
    expect(after.nextSlide).toBe(before.nextSlide);
    expect(after.status).toBe("frozen");
    expect(after.sourceItemId).toBe("service-item");
    expect(
      after.slides.every(
        (slide) => slide.typography === DEFAULT_TYPOGRAPHY && slide.textAlign === "left"
      )
    ).toBe(true);
    expect(after.previewSlide).toBe(after.slides[0]);
    dispatch({ type: "UNFREEZE_OUTPUT" });
    dispatch({ type: "SEND_LIVE" });
    expect(usePresentationStore.getState().liveSlide?.typography).toEqual(
      DEFAULT_TYPOGRAPHY
    );
    dispatch({ type: "NEXT_SLIDE" });
    expect(usePresentationStore.getState().liveSlide?.typography).toEqual(
      DEFAULT_TYPOGRAPHY
    );
  });

  it("retains saved item appearance through the cloud JSON content shape", () => {
    const item = createTextServiceItem({ body: "Message" }, 0);
    const appearance = { typography, textAlign: "left" as const };
    const cloudCopy = {
      ...item,
      content: JSON.parse(
        JSON.stringify({
          ...(item.content as object),
          presentationAppearance: appearance,
        })
      ),
    };
    expect(getItemAppearance(cloudCopy)).toEqual(appearance);
    const options = getTextOptions(cloudCopy.content)!;
    expect("presentationAppearance" in options).toBe(false);
    expect("slides" in options).toBe(false);
  });

  it("renders styled text in every audience layout and in the livestream lower third", () => {
    for (const layout of ["full-screen", "lower-third", "caption", "overlay", "corner"]) {
      const html = renderToStaticMarkup(
        <CongregationRenderer
          slide={slides[0]}
          layout={layout}
          activeTransition="cut"
          transitionDurationMs={0}
        />
      );
      expect(html).toContain("font-family:var(--font-presentation-lora)");
      expect(html).toContain("color:var(--color-type-gold)");
      expect(html).toContain("font-size:3.75cqw");
      expect(html).toContain("font-style:italic");
      expect(html).toContain(`data-layout="${layout}"`);
    }
    const output = renderToStaticMarkup(
      <LivestreamRenderer
        slide={slides[0]}
        activeTransition="cut"
        transitionDurationMs={0}
      />
    );
    expect(output).toContain('data-layout="lower-third"');
    expect(output).toContain("color:var(--color-type-gold)");
  });

  it("rejects invalid font/color IDs and numeric sizes from synchronized output", () => {
    expect(isSlideTypography(typography)).toBe(true);
    for (const patch of [
      { font: "untrusted" },
      { color: "untrusted" },
      { size: -1 },
      { size: Infinity },
      { size: 500 },
      { lineHeight: 0 },
    ]) {
      const invalid = { ...typography, body: { ...typography.body, ...patch } };
      expect(isSlideTypography(invalid)).toBe(false);
      expect(
        isSyncedPresentationState({
          status: "live",
          liveSlide: { ...slides[0], typography: invalid },
          nextSlide: null,
          layoutOverride: null,
          backgroundOverride: null,
          activeAlert: null,
          activeTransition: "cut",
          transitionDurationMs: 0,
          updatedAt: Date.now(),
        })
      ).toBe(false);
    }
  });

  it("uses canvas-relative sizes and still accepts existing slides without styles", () => {
    expect(presentationTextStyle(typography.body).fontSize).toBe("3.75cqw");
    const old = { ...slides[0], typography: undefined };
    expect(
      renderToStaticMarkup(
        <CongregationRenderer
          slide={old}
          layout="full-screen"
          activeTransition="cut"
          transitionDurationMs={0}
        />
      )
    ).toContain("First message");
  });
});
