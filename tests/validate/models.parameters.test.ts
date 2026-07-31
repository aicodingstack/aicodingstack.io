import fs from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

type ModelManifest = {
  id: string
  size: string | null
  activeParameters: string | null
  sources?: Array<{ fields?: string[] }>
}

const canonicalParameterCountPattern =
  /^(?:[1-9][0-9]{0,2}(?:\.[0-9]*[1-9])?[MB]|[1-9][0-9]*(?:\.[0-9]*[1-9])?T)$/

function loadModelManifests(): ModelManifest[] {
  const modelsDir = path.join(process.cwd(), 'manifests', 'models')

  return fs
    .readdirSync(modelsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(path.join(modelsDir, file), 'utf8')) as ModelManifest)
}

describe('validate: model parameter metadata', () => {
  it('rejects redundant parameter units and separators', () => {
    expect(
      ['1T', '1.02T', '999B', '6.5B'].every(value => canonicalParameterCountPattern.test(value))
    ).toBe(true)
    expect(
      ['1,000B', '1000B', '01T', '1.0T'].every(value => !canonicalParameterCountPattern.test(value))
    ).toBe(true)
  })

  it('uses canonical parameter units without redundant thousands or separators', () => {
    const invalidParameterIds = loadModelManifests()
      .filter(
        model =>
          (model.size !== null && !canonicalParameterCountPattern.test(model.size)) ||
          (model.activeParameters !== null &&
            !canonicalParameterCountPattern.test(model.activeParameters))
      )
      .map(model => model.id)
      .sort()

    expect(invalidParameterIds).toEqual([])
  })

  it('keeps activated parameter counts out of the total size field', () => {
    const mixedSizeIds = loadModelManifests()
      .filter(model => model.size && /\b(?:active|activated)\b|\btotal\s*\//i.test(model.size))
      .map(model => model.id)
      .sort()

    expect(mixedSizeIds).toEqual([])
  })

  it('requires provenance for every disclosed activated parameter count', () => {
    const missingSourceIds = loadModelManifests()
      .filter(model => model.activeParameters !== null)
      .filter(model => !model.sources?.some(source => source.fields?.includes('activeParameters')))
      .map(model => model.id)
      .sort()

    expect(missingSourceIds).toEqual([])
  })

  it('requires total parameters whenever activated parameters are disclosed', () => {
    const missingTotalIds = loadModelManifests()
      .filter(model => model.activeParameters !== null && model.size === null)
      .map(model => model.id)
      .sort()

    expect(missingTotalIds).toEqual([])
  })
})
