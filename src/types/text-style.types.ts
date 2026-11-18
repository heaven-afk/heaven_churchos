import type { Background, LayoutId } from "./presentation.types";

export type PresentationFont = "geist" | "inter" | "outfit" | "lora";
export type PresentationColor =
  | "white"
  | "ivory"
  | "gold"
  | "sky"
  | "mint"
  | "rose"
  | "lavender"
  | "slate"
  | "navy"
  | "black";
export type TextRole = "title" | "body" | "footer";
export type TextAlignment = "left" | "center" | "right";

export interface TextStyle {
  font: PresentationFont;
  size: number;
  color: PresentationColor;
  weight: 400 | 500 | 600 | 700 | 800;
  italic: boolean;
  lineHeight: number;
}

export interface SlideTypography {
  title: TextStyle;
  body: TextStyle;
  footer: TextStyle;
}

export interface SlideAppearance {
  typography?: SlideTypography;
  textAlign?: TextAlignment;
  layout?: LayoutId;
  background?: Background;
}

export interface CreateTextOptions extends SlideAppearance {
  title?: string;
  body: string;
  subtext?: string;
}

export interface TextServiceContent extends CreateTextOptions {
  slides?: import("./presentation.types").PresentationSlide[];
}

export interface TextTemplate extends CreateTextOptions {
  id: string;
  label: string;
  description: string;
}

export interface TypographyControlsProps {
  value: SlideTypography;
  onChange: (value: SlideTypography) => void;
}
