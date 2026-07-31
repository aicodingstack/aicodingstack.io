import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  findExactEnglishCandidates,
  findNewExactEnglishCandidates,
  findStaleExactEnglishBaselineEntries,
  formatExactEnglishBaselineEntries,
  formatExactEnglishCandidates,
  isPotentialUntranslatedText,
  writeExactEnglishBaseline,
} from '../../scripts/validate/lib/i18n-placeholders.js'

describe('translation placeholder guardrail', () => {
  it('recognizes English values of any length while ignoring non-content invariants', () => {
    expect(isPotentialUntranslatedText('Explore the stack')).toBe(true)
    expect(isPotentialUntranslatedText('AI-powered integrated development environments')).toBe(true)
    expect(isPotentialUntranslatedText('Search')).toBe(true)
    expect(isPotentialUntranslatedText('GitHub')).toBe(true)
    expect(isPotentialUntranslatedText('https://example.com/docs')).toBe(false)
    expect(isPotentialUntranslatedText('@:shared.terms.aiCodingStack')).toBe(false)
  })

  it('covers UI messages, localized MDX content, and manifest translations', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-placeholder-'))

    try {
      fs.mkdirSync(path.join(projectRoot, 'translations/en/pages'), { recursive: true })
      fs.mkdirSync(path.join(projectRoot, 'translations/zh-Hans/pages'), { recursive: true })
      fs.writeFileSync(
        path.join(projectRoot, 'translations/en/pages/example.json'),
        `${JSON.stringify({ description: 'English placeholder copied here' })}\n`
      )
      fs.writeFileSync(
        path.join(projectRoot, 'translations/zh-Hans/pages/example.json'),
        `${JSON.stringify({ description: 'English placeholder copied here' })}\n`
      )

      const mdx = [
        '---',
        'title: "English placeholder title"',
        '---',
        '',
        'English placeholder paragraph copied here.',
        '',
      ].join('\n')
      fs.mkdirSync(path.join(projectRoot, 'content/articles/en'), { recursive: true })
      fs.mkdirSync(path.join(projectRoot, 'content/articles/zh-Hans'), { recursive: true })
      fs.writeFileSync(path.join(projectRoot, 'content/articles/en/example.mdx'), mdx)
      fs.writeFileSync(path.join(projectRoot, 'content/articles/zh-Hans/example.mdx'), mdx)

      fs.mkdirSync(path.join(projectRoot, 'manifests/examples'), { recursive: true })
      fs.writeFileSync(
        path.join(projectRoot, 'manifests/examples/example.json'),
        `${JSON.stringify({
          description: 'English manifest placeholder copied here',
          translations: {
            'zh-Hans': {
              description: 'English manifest placeholder copied here',
            },
          },
        })}\n`
      )

      const resourceKinds = new Set(
        findExactEnglishCandidates(projectRoot).map(candidate => candidate.resource)
      )
      expect(resourceKinds).toEqual(new Set(['messages', 'content', 'manifest']))
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true })
    }
  })

  it('expires reviewed allowances before the same English placeholder can be reintroduced', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-placeholder-'))
    const englishFile = path.join(projectRoot, 'translations/en/pages/example.json')
    const localizedFile = path.join(projectRoot, 'translations/zh-Hans/pages/example.json')

    try {
      fs.mkdirSync(path.dirname(englishFile), { recursive: true })
      fs.mkdirSync(path.dirname(localizedFile), { recursive: true })
      fs.mkdirSync(path.join(projectRoot, 'scripts/validate'), { recursive: true })
      fs.writeFileSync(englishFile, `${JSON.stringify({ label: 'Search' })}\n`)
      fs.writeFileSync(localizedFile, `${JSON.stringify({ label: 'Search' })}\n`)

      writeExactEnglishBaseline(projectRoot)
      fs.writeFileSync(localizedFile, `${JSON.stringify({ label: '搜索' })}\n`)

      expect(findStaleExactEnglishBaselineEntries(projectRoot)).toEqual([
        {
          id: 'messages:zh-Hans:translations/zh-Hans/pages/example.json#label',
          value: 'Search',
        },
      ])

      writeExactEnglishBaseline(projectRoot)
      fs.writeFileSync(localizedFile, `${JSON.stringify({ label: 'Search' })}\n`)

      expect(findNewExactEnglishCandidates(projectRoot)).toEqual([
        expect.objectContaining({
          id: 'messages:zh-Hans:translations/zh-Hans/pages/example.json#label',
          value: 'Search',
        }),
      ])
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true })
    }
  })

  it('does not introduce exact-English prose in non-English locales', () => {
    const candidates = findNewExactEnglishCandidates(process.cwd())
    const staleEntries = findStaleExactEnglishBaselineEntries(process.cwd())

    if (candidates.length > 0 || staleEntries.length > 0) {
      const sections: string[] = []

      if (candidates.length > 0) {
        sections.push(
          'Found new non-English translation values copied from English:',
          formatExactEnglishCandidates(candidates)
        )
      }

      if (staleEntries.length > 0) {
        sections.push(
          'Found stale exact-English baseline entries:',
          formatExactEnglishBaselineEntries(staleEntries)
        )
      }

      throw new Error(
        [
          ...sections,
          '',
          'Translate new values and remove stale allowances, then refresh the reviewed baseline.',
        ].join('\n')
      )
    }
  })
})
