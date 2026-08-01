import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const cliDirectory = path.join(process.cwd(), 'manifests', 'clis')
const placeholderVersion = /^(?:latest|unknown|n\/?a|tbd|-|—)$/i

function readCliManifests(): Array<{ file: string; manifest: Record<string, unknown> }> {
  return fs
    .readdirSync(cliDirectory)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      file,
      manifest: JSON.parse(fs.readFileSync(path.join(cliDirectory, file), 'utf8')) as Record<
        string,
        unknown
      >,
    }))
}

describe('validate: CLI catalog guardrails', () => {
  it('uses concrete latest versions instead of placeholders', () => {
    const failures = readCliManifests()
      .filter(({ manifest }) => {
        const version = manifest.latestVersion
        return typeof version !== 'string' || placeholderVersion.test(version.trim())
      })
      .map(({ file }) => file)

    expect(failures).toEqual([])
  })

  it('provides an official HTTPS download or installation page', () => {
    const failures = readCliManifests()
      .filter(({ manifest }) => {
        const resourceUrls = manifest.resourceUrls as Record<string, unknown> | undefined
        return (
          typeof resourceUrls?.download !== 'string' ||
          !resourceUrls.download.startsWith('https://')
        )
      })
      .map(({ file }) => file)

    expect(failures).toEqual([])
  })
})
