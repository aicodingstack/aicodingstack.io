import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { runManifestDataHarness } from '../../scripts/validate/lib/manifest-data-harness'

describe('validate: manifest data harness', () => {
  it('schema-validates every manifest and data JSON document', () => {
    const report = runManifestDataHarness(process.cwd())

    expect(report.documentsChecked).toBeGreaterThan(0)
    expect(report.documentsByRoot.manifests).toBeGreaterThan(0)
    expect(report.documentsByRoot.data).toBeGreaterThan(0)
    expect(report.failures, report.failures.join('\n')).toEqual([])
  })

  it('rejects a newly added data document without a schema', () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-data-harness-'))
    try {
      fs.mkdirSync(path.join(fixtureRoot, 'manifests'), { recursive: true })
      fs.mkdirSync(path.join(fixtureRoot, 'data'), { recursive: true })
      fs.writeFileSync(path.join(fixtureRoot, 'data', 'uncovered.json'), '{}\n')

      const report = runManifestDataHarness(fixtureRoot)

      expect(report.failures).toContain('data/uncovered.json: no schema discovered')
    } finally {
      fs.rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })
})
