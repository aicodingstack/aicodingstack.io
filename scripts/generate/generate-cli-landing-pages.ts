#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { locales } from '../../src/i18n/config'
import {
  type CLILandingContent,
  parseCLILandingMarkdown,
} from '../../src/lib/content/cli-landing-markdown'

interface CLIManifestSummary {
  id: string
  landingPage?: boolean
}

const rootDir = path.resolve(import.meta.dirname, '../..')
const manifestDir = path.join(rootDir, 'manifests', 'clis')
const contentDir = path.join(rootDir, 'content', 'clis')
const outputFile = path.join(rootDir, 'data', 'generated', 'cli-landing-pages.json')

const landingPageIds = fs
  .readdirSync(manifestDir)
  .filter(file => file.endsWith('.json'))
  .map(
    file => JSON.parse(fs.readFileSync(path.join(manifestDir, file), 'utf8')) as CLIManifestSummary
  )
  .filter(manifest => manifest.landingPage)
  .map(manifest => manifest.id)
  .sort()

if (landingPageIds.length === 0) {
  throw new Error('No CLI manifests have landingPage enabled')
}

const generated = Object.fromEntries(
  locales.map(locale => {
    const localeDirectory = path.join(contentDir, locale)
    const expectedFiles = new Set(landingPageIds.map(id => `${id}.md`))
    const actualFiles = fs.existsSync(localeDirectory)
      ? fs
          .readdirSync(localeDirectory)
          .filter(file => file.endsWith('.md'))
          .sort()
      : []
    const unexpectedFiles = actualFiles.filter(file => !expectedFiles.has(file))

    if (unexpectedFiles.length > 0) {
      throw new Error(`${locale}: landing-page content has no enabled manifest: ${unexpectedFiles}`)
    }

    const localeContent: Record<string, CLILandingContent> = {}
    for (const id of landingPageIds) {
      const filePath = path.join(localeDirectory, `${id}.md`)
      if (!fs.existsSync(filePath)) {
        throw new Error(`${locale}: missing CLI landing-page content for ${id}`)
      }

      localeContent[id] = parseCLILandingMarkdown(
        fs.readFileSync(filePath, 'utf8'),
        path.relative(rootDir, filePath)
      )
    }

    return [locale, localeContent]
  })
)

fs.mkdirSync(path.dirname(outputFile), { recursive: true })
fs.writeFileSync(outputFile, `${JSON.stringify(generated, null, 2)}\n`)
console.log(`✓ Generated CLI landing-page content (${locales.length} locales)`)
