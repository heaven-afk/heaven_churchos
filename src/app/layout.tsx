import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Outfit, Lora } from "next/font/google";
import "./globals.css";
import { PRODUCT } from "@/config/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-presentation-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
});
const outfit = Outfit({
  variable: "--font-presentation-outfit",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
});
const lora = Lora({
  variable: "--font-presentation-lora",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: PRODUCT.name,
    template: `%s — ${PRODUCT.name}`,
  },
  description: `${PRODUCT.name} — Church presentation and live production platform.`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${outfit.variable} ${lora.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
