import type { Metadata } from "next";
import { Suspense } from "react";
import { PresentationPageClient } from "./PresentationPageClient";

export const metadata: Metadata = {
  title: "Presentation Output",
  referrer: "no-referrer",
};

/**
 * Presentation output window — Phase 2
 *
 * This route is opened as a separate browser window targeting one of:
 *   /presentation?target=congregation  (default - full visual output)
 *   /presentation?target=stage         (confidence monitor)
 *   /presentation?target=livestream    (alpha-transparent lower-third)
 *
 * The target parameter selects the OutputTargetConfig from the registry.
 * useSearchParams() requires a Suspense boundary in Next.js.
 */
export default function PresentationPage() {
  return (
    <main className="h-screen w-screen overflow-hidden">
      <Suspense fallback={null}>
        <PresentationPageClient />
      </Suspense>
    </main>
  );
}
