/**
 * Shared model enums for both UI and TypeScript types.
 *
 * Keep this file aligned with:
 * - /manifests/$schemas/model.schema.json
 */
export const MODEL_INPUT_MODALITIES = ['text', 'image', 'pdf'] as const
export type ModelInputModality = (typeof MODEL_INPUT_MODALITIES)[number]

export const MODEL_OUTPUT_MODALITIES = ['text', 'image', 'audio', 'video'] as const
export type ModelOutputModality = (typeof MODEL_OUTPUT_MODALITIES)[number]

export const MODEL_CAPABILITIES = [
  'function-calling',
  'tool-choice',
  'structured-outputs',
  'reasoning',
] as const
export type ModelCapability = (typeof MODEL_CAPABILITIES)[number]
