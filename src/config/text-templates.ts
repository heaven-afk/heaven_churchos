import type { TextTemplate } from "@/types/text-style.types";
import { DEFAULT_TYPOGRAPHY } from "./typography";

export const TEXT_TEMPLATES: TextTemplate[] = [
  {
    id: "welcome",
    label: "Welcome",
    description: "A warm opening",
    title: "You belong here.",
    body: "A place to worship.\nA community to call home.",
    subtext: "WELCOME TO OUR SUNDAY GATHERING",
    layout: "full-screen",
    textAlign: "center",
    typography: {
      ...DEFAULT_TYPOGRAPHY,
      title: { ...DEFAULT_TYPOGRAPHY.title, size: 88, color: "ivory" },
      body: { ...DEFAULT_TYPOGRAPHY.body, size: 42, weight: 400 },
      footer: { ...DEFAULT_TYPOGRAPHY.footer, size: 22, color: "gold" },
    },
  },
  {
    id: "sermon",
    label: "Sermon",
    description: "Room for your message",
    title: "A faith that moves.",
    body: "Trust the promise.\nTake the next step.",
    subtext: "MESSAGE NOTES · SUNDAY GATHERING",
    layout: "full-screen",
    textAlign: "left",
  },
  {
    id: "speaker",
    label: "Speaker",
    description: "A simple lower third",
    title: "Guest speaker",
    body: "Welcome to the stage",
    subtext: "SUNDAY GATHERING",
    layout: "lower-third",
    textAlign: "left",
    typography: { ...DEFAULT_TYPOGRAPHY, body: { ...DEFAULT_TYPOGRAPHY.body, size: 48 } },
  },
  {
    id: "quote",
    label: "Quote",
    description: "Let the words breathe",
    title: "",
    body: "Together, we can make room for hope.",
    subtext: "A MOMENT TO REFLECT",
    layout: "caption",
    textAlign: "center",
    typography: {
      ...DEFAULT_TYPOGRAPHY,
      body: {
        ...DEFAULT_TYPOGRAPHY.body,
        font: "lora",
        size: 52,
        italic: true,
        weight: 400,
      },
    },
  },
];
