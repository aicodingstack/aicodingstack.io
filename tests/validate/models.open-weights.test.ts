import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type ModelManifest = {
  id: string
  description: string
  size: string | null
  tokenPricing: { reason?: string }
  platformUrls: { huggingface: string | null }
}

const OPEN_WEIGHTS_DESCRIPTION = /\bopen[- ](?:weight|weights|source)\b/i

function loadModelManifests(): ModelManifest[] {
  const modelsDir = path.join(process.cwd(), 'manifests', 'models')

  return fs
    .readdirSync(modelsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(path.join(modelsDir, file), 'utf8')) as ModelManifest)
}

function hasOpenWeightsEvidence(model: ModelManifest): boolean {
  return (
    model.platformUrls.huggingface !== null ||
    model.tokenPricing.reason === 'open-weights-only' ||
    OPEN_WEIGHTS_DESCRIPTION.test(model.description)
  )
}

describe('validate: open-weight model metadata', () => {
  it('requires a disclosed parameter size for every open-weight model', () => {
    const missingSizeIds = loadModelManifests()
      .filter(hasOpenWeightsEvidence)
      .filter(model => model.size === null)
      .map(model => model.id)
      .sort()

    expect(missingSizeIds).toEqual([])
  })
})
