"use client";

import { useSearchParams } from "next/navigation";
import { PresentationCanvas } from "@/components/presentation/PresentationCanvas";
import { getOutputTargetConfig } from "@/config/outputs";
import { useRelayReceiver } from "@/hooks/useObsRelay";

/**
 * Client component that reads the ?target= query param and renders
 * the appropriate output canvas. Separated from the page so that
 * useSearchParams() can be wrapped in a Suspense boundary.
 */
export function PresentationPageClient() {
  const searchParams = useSearchParams();
  const rawTarget = searchParams.get("target") ?? "congregation";
  const targetConfig = getOutputTargetConfig(rawTarget);
  const relayKey = searchParams.get("relay");
  const relayStatus = useRelayReceiver(relayKey);

  return (
    <div
      className={`output-page h-full w-full ${targetConfig.id === "livestream" ? "alpha-output" : ""}`}
    >
      <PresentationCanvas
        target={targetConfig.id}
        isReceiver={!relayKey}
        className="h-full w-full"
      />
      {relayKey && relayStatus && (
        <div className="output-connection" role="status">
          {relayStatus}
        </div>
      )}
    </div>
  );
}
