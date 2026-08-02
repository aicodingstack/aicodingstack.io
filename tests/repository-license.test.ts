import { describe, expect, it } from 'vitest'

import vscode from '../manifests/ides/vscode.json'
import { getRepositoryLicense } from '../src/lib/repository-license'

describe('repository license classification', () => {
  it('classifies the open-source VS Code repository separately from its product distribution', () => {
    expect(vscode.license).toBe('Proprietary')
    expect(vscode.sourceCode.license).toBe('MIT')
    expect(getRepositoryLicense(vscode)).toBe('MIT')
  })

  it('falls back to the product license when no repository-specific license is recorded', () => {
    expect(getRepositoryLicense({ license: 'Apache-2.0' })).toBe('Apache-2.0')
  })
})
