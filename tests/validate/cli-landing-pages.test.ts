import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'
import { locales } from '@/i18n/config'
import { type CLILandingContent, parseCLILandingMarkdown } from '@/lib/content/cli-landing-markdown'
import generatedContent from '../../data/generated/cli-landing-pages.json'

interface CLIManifestSummary {
  id: string
  landingPage?: boolean
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

describe('CLI landing-page content', () => {
  const rootDir = process.cwd()
  const manifestDir = path.join(rootDir, 'manifests', 'clis')
  const landingPageIds = fs
    .readdirSync(manifestDir)
    .filter(file => file.endsWith('.json'))
    .map(file => readJson<CLIManifestSummary>(path.join(manifestDir, file)))
    .filter(manifest => manifest.landingPage)
    .map(manifest => manifest.id)

  it('matches the generated-data schema', () => {
    const schema = readJson<Record<string, unknown>>(
      path.join(rootDir, 'data', '$schemas', 'cli-landing-pages.schema.json')
    )
    const validate = new Ajv2020({ allErrors: true }).compile(schema)

    expect(validate(generatedContent), JSON.stringify(validate.errors, null, 2)).toBe(true)
  })

  it('provides valid keyed Markdown for every enabled CLI and locale', () => {
    expect(landingPageIds.length).toBeGreaterThan(0)
    const generatedByLocale = generatedContent as Record<
      (typeof locales)[number],
      Record<string, CLILandingContent>
    >

    for (const locale of locales) {
      for (const id of landingPageIds) {
        const filePath = path.join(rootDir, 'content', 'clis', locale, `${id}.md`)
        expect(
          fs.existsSync(filePath),
          `${locale} is missing content/clis/${locale}/${id}.md`
        ).toBe(true)

        const content = parseCLILandingMarkdown(
          fs.readFileSync(filePath, 'utf8'),
          path.relative(rootDir, filePath)
        )
        expect(content.answer.trim().length).toBeGreaterThan(40)
        expect(content.capabilities.items).toHaveLength(3)
        expect(content.faq.items.length).toBeGreaterThanOrEqual(4)
        expect(generatedByLocale[locale][id]).toEqual(content)
      }
    }
  })

  it('keeps UI copy in translations and product editorial content in Markdown', () => {
    for (const locale of locales) {
      const pageTranslations = readJson<Record<string, unknown>>(
        path.join(rootDir, 'translations', locale, 'pages', 'clis.json')
      )
      const componentTranslations = readJson<Record<string, unknown>>(
        path.join(rootDir, 'translations', locale, 'components', 'product.json')
      )
      expect(componentTranslations).toHaveProperty('cliLanding.labels.publisher')
      expect(componentTranslations).toHaveProperty('cliLanding.capabilitiesTitle')
      expect(componentTranslations).toHaveProperty('cliLanding.comparisonAction')
      expect(componentTranslations).toHaveProperty('cliLanding.verification.title')
      expect(componentTranslations).toHaveProperty('cliLanding.faqTitle')
      expect(pageTranslations).not.toHaveProperty('landingPage')
      expect(pageTranslations).not.toHaveProperty('landingPages')
    }
  })

  it('rejects duplicate and unknown Markdown keys', () => {
    const englishFile = path.join(rootDir, 'content', 'clis', 'en', 'codex-cli.md')
    const markdown = fs.readFileSync(englishFile, 'utf8')

    expect(() =>
      parseCLILandingMarkdown(`${markdown}\n## answer\n\nDuplicate`, englishFile)
    ).toThrow('duplicate section answer')
    expect(() =>
      parseCLILandingMarkdown(`${markdown}\n## capabilities.typo\n\nUnknown`, englishFile)
    ).toThrow('unknown sections: capabilities.typo')
  })
})
