import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import { describe, expect, it } from 'vitest'
import { type Locale, locales } from '@/i18n/config'
import { type CLILandingContent, parseCLILandingMarkdown } from '@/lib/content/cli-landing-markdown'
import generatedContent from '../../data/generated/cli-landing-pages.json'

// cspell:ignore запис kayd

interface CLIManifestSummary {
  id: string
  name: string
  deprecated?: boolean
  installCommand?: string
  platforms?: Array<{ installCommand?: string }>
}

const internalImplementationTermsByLocale: Record<Locale, RegExp[]> = {
  en: [/\b(?:manifest|catalog(?:ue)? (?:entry|record))\b/i],
  de: [/\b(?:manifest(?:e|en|s)?|katalogeintrag)\b/i],
  es: [/manifiestos?|registro (?:del )?catálogo/iu],
  fr: [/manifestes?|entrée (?:du )?catalogue/iu],
  id: [/\b(?:manifest|entri katalog)\b/i],
  ja: [/マニフェスト|カタログ(?:の)?(?:記録|項目)/u],
  ko: [/매니페스트|카탈로그 (?:레코드|항목)/u],
  pt: [/manifestos?|registro (?:do )?catálogo/iu],
  ru: [/манифест[а-яё]*|запис[ьи] каталог[а-яё]*/iu],
  tr: [/\bmanifest\b|katalog kayd[ıi]/iu],
  'zh-Hans': [/\bmanifest\b|清单文件|目录记录/iu],
  'zh-Hant': [/\bmanifest\b|資訊清單|清單檔案|目錄記錄/iu],
}

function normalizeEditorialText(text: string): string {
  return text
    .normalize('NFKC')
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function editorialProseBlocks(content: CLILandingContent): string[] {
  return [
    content.answer,
    content.introduction,
    ...content.capabilities.items.map(item => item.description),
    ...content.faq.items.map(item => item.answer),
  ]
}

function landingContentText(content: CLILandingContent): string {
  return [
    content.answer,
    content.introduction,
    ...content.capabilities.items.flatMap(item => [item.title, item.description]),
    ...content.faq.items.flatMap(item => [item.question, item.answer]),
  ].join('\n')
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T
}

describe('CLI landing-page content', () => {
  const rootDir = process.cwd()
  const manifestDir = path.join(rootDir, 'manifests', 'clis')
  const cliManifests = fs
    .readdirSync(manifestDir)
    .filter(file => file.endsWith('.json'))
    .map(file => readJson<CLIManifestSummary>(path.join(manifestDir, file)))
  const cliIds = cliManifests.map(manifest => manifest.id).sort()
  const cliManifestById = new Map(cliManifests.map(manifest => [manifest.id, manifest]))

  it('matches the generated-data schema', () => {
    const schema = readJson<Record<string, unknown>>(
      path.join(rootDir, 'data', '$schemas', 'cli-landing-pages.schema.json')
    )
    const validate = new Ajv2020({ allErrors: true }).compile(schema)

    expect(validate(generatedContent), JSON.stringify(validate.errors, null, 2)).toBe(true)
  })

  it('provides valid keyed Markdown for every enabled CLI and locale', () => {
    expect(cliIds.length).toBeGreaterThan(0)
    const generatedByLocale = generatedContent as Record<
      (typeof locales)[number],
      Record<string, CLILandingContent>
    >

    for (const locale of locales) {
      expect(Object.keys(generatedByLocale[locale]).sort()).toEqual(cliIds)

      for (const id of cliIds) {
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
        expect(content.introduction.trim().length).toBeGreaterThan(45)
        expect(content.capabilities.items).toHaveLength(3)
        for (const item of content.capabilities.items) {
          expect(item.description.trim().length).toBeGreaterThan(10)
        }
        const capabilityExplanations = content.capabilities.items.map(item =>
          item.description.replace(item.title, '').replace(/\s+/g, ' ').trim()
        )
        expect(new Set(capabilityExplanations).size).toBe(content.capabilities.items.length)
        expect(content.faq.items).toHaveLength(5)
        for (const item of content.faq.items) {
          expect(item.answer.trim().length).toBeGreaterThan(10)
        }
        expect(generatedByLocale[locale][id]).toEqual(content)

        const publicText = landingContentText(content)
        expect(publicText).not.toMatch(/`/)
        for (const internalTerm of internalImplementationTermsByLocale[locale]) {
          expect(publicText, `${locale}/${id} exposes an internal implementation term`).not.toMatch(
            internalTerm
          )
        }
        expect(publicText).not.toMatch(/(?:[$€£¥]\s?\d|\b(?:USD|EUR|GBP)\s?\d)/i)

        const normalizedProseBlocks = editorialProseBlocks(content).map(normalizeEditorialText)
        expect(
          new Set(normalizedProseBlocks).size,
          `${locale}/${id} repeats the same prose across landing-page sections`
        ).toBe(normalizedProseBlocks.length)

        const manifest = cliManifestById.get(id)
        if (!manifest) throw new Error(`Missing manifest for ${id}`)
        const installCommands = new Set(
          [manifest.installCommand, ...(manifest.platforms ?? []).map(item => item.installCommand)]
            .filter((command): command is string => Boolean(command))
            .filter(command => command.length > 8)
        )
        for (const command of installCommands) {
          expect(publicText).not.toContain(command)
        }

        if (locale === 'en') {
          expect(content.answer.toLocaleLowerCase()).toContain(manifest.name.toLocaleLowerCase())
          expect(content.introduction.trim().length).toBeGreaterThan(80)
          for (const item of content.capabilities.items) {
            expect(item.description.trim().length).toBeGreaterThan(30)
          }
          for (const item of content.faq.items) {
            expect(item.answer.trim().length).toBeGreaterThan(40)
          }

          if (manifest.deprecated) {
            expect(
              `${content.answer}\n${content.introduction}\n${content.faq.items
                .map(item => `${item.question}\n${item.answer}`)
                .join('\n')}`
            ).toMatch(/deprecated|discontinued|no longer maintained/i)
          }
        }
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
      expect(componentTranslations).toHaveProperty('cliLanding.meta.title')
      const metadataTitle = (componentTranslations.cliLanding as { meta: { title: string } }).meta
        .title
      expect(metadataTitle).not.toContain('{type}')
      expect(componentTranslations).toHaveProperty('cliLanding.capabilitiesTitle')
      expect(componentTranslations).toHaveProperty('cliLanding.comparisonAction')
      expect(componentTranslations).toHaveProperty('cliLanding.verification.title')
      expect(componentTranslations).toHaveProperty('cliLanding.verification.description')
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
