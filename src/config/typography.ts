import type {
  PresentationColor,
  PresentationFont,
  SlideTypography,
} from "@/types/text-style.types";

export const PRESENTATION_FONTS: {
  id: PresentationFont;
  label: string;
  family: string;
  description: string;
}[] = [
  {
    id: "geist",
    label: "Geist",
    family: "var(--font-geist-sans), sans-serif",
    description: "Clean & familiar",
  },
  {
    id: "inter",
    label: "Inter",
    family: "var(--font-presentation-inter), sans-serif",
    description: "Clear at a distance",
  },
  {
    id: "outfit",
    label: "Outfit",
    family: "var(--font-presentation-outfit), sans-serif",
    description: "Modern & expressive",
  },
  {
    id: "lora",
    label: "Lora",
    family: "var(--font-presentation-lora), Georgia, serif",
    description: "Warm & editorial",
  },
];

export const PRESENTATION_COLORS: {
  id: PresentationColor;
  label: string;
  value: string;
}[] = [
  { id: "white", label: "White", value: "var(--color-type-white)" },
  { id: "ivory", label: "Ivory", value: "var(--color-type-ivory)" },
  { id: "gold", label: "Gold", value: "var(--color-type-gold)" },
  { id: "sky", label: "Sky", value: "var(--color-type-sky)" },
  { id: "mint", label: "Mint", value: "var(--color-type-mint)" },
  { id: "rose", label: "Rose", value: "var(--color-type-rose)" },
  { id: "lavender", label: "Lavender", value: "var(--color-type-lavender)" },
  { id: "slate", label: "Slate", value: "var(--color-type-slate)" },
  { id: "navy", label: "Navy", value: "var(--color-type-navy)" },
  { id: "black", label: "Black", value: "var(--color-type-black)" },
];

export const DEFAULT_TYPOGRAPHY: SlideTypography = {
  title: {
    font: "outfit",
    size: 38,
    color: "sky",
    weight: 700,
    italic: false,
    lineHeight: 1.2,
  },
  body: {
    font: "inter",
    size: 64,
    color: "white",
    weight: 600,
    italic: false,
    lineHeight: 1.25,
  },
  footer: {
    font: "inter",
    size: 28,
    color: "ivory",
    weight: 400,
    italic: false,
    lineHeight: 1.4,
  },
};

export const getPresentationColor = (id: PresentationColor) =>
  PRESENTATION_COLORS.find((c) => c.id === id)?.value ?? PRESENTATION_COLORS[0].value;
export const getPresentationFont = (id: PresentationFont) =>
  PRESENTATION_FONTS.find((f) => f.id === id)?.family ?? PRESENTATION_FONTS[0].family;
