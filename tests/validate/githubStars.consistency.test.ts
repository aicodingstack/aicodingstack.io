import fs from 'node:fs'
import path from 'node:path'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { describe, expect, it } from 'vitest'

type SurfaceType = 'ide' | 'cli' | 'desktop' | 'extension'

type StarsData = {
  observedAt: string
  repositories: Record<string, number | null>
}

const directories: Record<SurfaceType, string> = {
  ide: 'ides',
  cli: 'clis',
  desktop: 'desktops',
  extension: 'extensions',
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown
}

function normalizeRepositoryUrl(url: string): string {
  return url.replace(/\/$/, '').replace(/\.git$/, '')
}

function validateGithubStarsConsistency(rootDir: string): string[] {
  const failures: string[] = []
  const data = readJsonFile(path.join(rootDir, 'data', 'github-stars.json')) as StarsData
  const associatedRepositories = new Set<string>()

  for (const [surfaceType, directory] of Object.entries(directories) as Array<
    [SurfaceType, string]
  >) {
    const directoryPath = path.join(rootDir, 'manifests', directory)
    for (const file of fs.readdirSync(directoryPath).filter(name => name.endsWith('.json'))) {
      const manifest = readJsonFile(path.join(directoryPath, file)) as {
        id: string
        githubUrl?: string | null
        sourceCode?: unknown
      }
      const key = `${surfaceType}:${manifest.id}`
      if (typeof manifest.githubUrl !== 'string') {
        if (manifest.sourceCode !== undefined) {
          failures.push(`${key} defines sourceCode without a githubUrl`)
        }
        continue
      }

      const normalizedUrl = normalizeRepositoryUrl(manifest.githubUrl)
      const repositoryId = normalizedUrl.replace('https://github.com/', '')
      if (!(repositoryId in data.repositories)) {
        failures.push(`${key} references ${repositoryId}, which is missing from github-stars.json`)
      }
      associatedRepositories.add(repositoryId)
    }
  }

  for (const repositoryId of Object.keys(data.repositories)) {
    if (!associatedRepositories.has(repositoryId)) {
      failures.push(`${repositoryId} has a star snapshot but no product manifest association`)
    }
  }

  return failures
}

describe('validate: github-stars consistency', () => {
  it('matches the GitHub Stars JSON schema', () => {
    const rootDir = process.cwd()
    const schema = readJsonFile(
      path.join(rootDir, 'manifests', '$schemas', 'github-stars.schema.json')
    )
    const githubStars = readJsonFile(path.join(rootDir, 'data', 'github-stars.json'))
    const ajv = new Ajv2020({ allErrors: true })
    addFormats(ajv)
    const validate = ajv.compile(schema as object)

    expect(validate(githubStars), JSON.stringify(validate.errors, null, 2)).toBe(true)
  })

  it('derives every repository association from product manifests', () => {
    const failures = validateGithubStarsConsistency(process.cwd())
    if (failures.length > 0) {
      throw new Error(`github-stars consistency validation failed:\n\n${failures.join('\n')}`)
    }
  })

  it('associates Goose CLI and desktop surfaces through their manifests', () => {
    const data = readJsonFile(path.join(process.cwd(), 'data', 'github-stars.json')) as StarsData
    const cli = readJsonFile(path.join(process.cwd(), 'manifests', 'clis', 'goose.json')) as {
      githubUrl: string
    }
    const desktop = readJsonFile(
      path.join(process.cwd(), 'manifests', 'desktops', 'goose.json')
    ) as { githubUrl: string }

    expect(data.repositories['aaif-goose/goose']).toBeTypeOf('number')
    expect(cli.githubUrl).toBe('https://github.com/aaif-goose/goose')
    expect(desktop.githubUrl).toBe(cli.githubUrl)
  })

  it('records source-code coverage on the affected product manifests', () => {
    const readManifest = (directory: string, id: string) =>
      readJsonFile(path.join(process.cwd(), 'manifests', directory, `${id}.json`)) as {
        sourceCode?: {
          status: 'open' | 'partial' | 'closed'
          repositoryRole: 'source' | 'feedback' | 'documentation'
          license?: string
        }
      }

    expect(readManifest('clis', 'codex-cli').sourceCode).toEqual({
      status: 'open',
      repositoryRole: 'source',
    })
    expect(readManifest('desktops', 'codex-app').sourceCode).toEqual({
      status: 'closed',
      repositoryRole: 'feedback',
    })
    expect(readManifest('extensions', 'codex').sourceCode).toEqual({
      status: 'closed',
      repositoryRole: 'feedback',
    })
    expect(readManifest('ides', 'intellij-idea').sourceCode).toEqual({
      status: 'partial',
      repositoryRole: 'source',
      license: 'Apache-2.0',
    })
  })
})
