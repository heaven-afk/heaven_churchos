/**
 * Output Target Registry — Phase 2
 *
 * Central configuration for all display output targets.
 *
 * To add a new output target in a future phase:
 *   1. Add an entry to OUTPUT_TARGET_REGISTRY
 *   2. Create a renderer component in src/components/presentation/
 *   3. The presentation store and action system require NO changes.
 *
 * Per the approved Phase 2 architecture, this config is intentionally
 * SEPARATE from PresentationState.
 */

import type { OutputTargetConfig } from '@/types/presentation.types';

export const OUTPUT_TARGET_REGISTRY: OutputTargetConfig[] = [
  {
    id: 'congregation',
    name: 'Audience Display',
    description: 'Main projection for the congregation. Full visual fidelity with motion backgrounds.',
    routePath: '/presentation?target=congregation',
    windowName: 'veyrin-output-congregation',
    capabilities: {
      supportsBackground: true,
      supportsMedia: true,
      supportsNextPreview: false,
      isAlphaTransparent: false,
    },
    defaultTransition: { type: 'dissolve', durationMs: 300 },
  },
  {
    id: 'stage',
    name: 'Stage / Confidence Monitor',
    description: 'High-contrast display for speakers and worship leaders. Shows current and NEXT slide.',
    routePath: '/presentation?target=stage',
    windowName: 'veyrin-output-stage',
    capabilities: {
      supportsBackground: false,
      supportsMedia: false,
      supportsNextPreview: true,
      isAlphaTransparent: false,
    },
    defaultTransition: { type: 'cut', durationMs: 0 },
  },
  {
    id: 'livestream',
    name: 'Livestream / Lower-Third',
    description: 'Alpha-transparent output for OBS/vMix browser source. Lower-third text overlay only.',
    routePath: '/presentation?target=livestream',
    windowName: 'veyrin-output-livestream',
    capabilities: {
      supportsBackground: false,
      supportsMedia: false,
      supportsNextPreview: false,
      isAlphaTransparent: true,
    },
    defaultTransition: { type: 'dissolve', durationMs: 200 },
  },
];

export const OUTPUT_TARGET_MAP: Record<string, OutputTargetConfig> = Object.fromEntries(
  OUTPUT_TARGET_REGISTRY.map((t) => [t.id, t])
);

export function getOutputTargetConfig(targetId: string): OutputTargetConfig {
  return OUTPUT_TARGET_MAP[targetId] ?? OUTPUT_TARGET_MAP['congregation'];
}
