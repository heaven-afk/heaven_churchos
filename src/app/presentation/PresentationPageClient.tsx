"use client";

import { useSearchParams } from "next/navigation";
import { PresentationCanvas } from "@/components/presentation/PresentationCanvas";
import { getOutputTargetConfig } from "@/config/outputs";

/**
 * Client component that reads the ?target= query param and renders
 * the appropriate output canvas. Separated from the page so that
 * useSearchParams() can be wrapped in a Suspense boundary.
 */
export function PresentationPageClient() {
  const searchParams = useSearchParams();
  const rawTarget = searchParams.get("target") ?? "congregation";
  const targetConfig = getOutputTargetConfig(rawTarget);

  return (
    <PresentationCanvas
      target={targetConfig.id}
      isReceiver={true}
      className="h-full w-full"
    />
  );
}
