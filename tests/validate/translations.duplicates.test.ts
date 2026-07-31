import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  findDuplicateValueGroups,
  findNewDuplicateValueGroups,
  findStaleDuplicateValueBaselineEntries,
  formatDuplicateValueBaselineEntries,
  formatDuplicateValueGroups,
  writeDuplicateValueBaseline,
} from '../../scripts/validate/lib/i18n-duplicates.js'

describe('translation duplicate-value guardrail', () => {
  it('treats matching leaf names in separate namespace files as distinct keys', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-duplicates-'))

    try {
      const pagesDirectory = path.join(projectRoot, 'translations/en/pages')
      fs.mkdirSync(pagesDirectory, { recursive: true })
      fs.writeFileSync(
        path.join(pagesDirectory, 'first.json'),
        `${JSON.stringify({ title: 'First namespace title' })}\n`
      )
      fs.writeFileSync(
        path.join(pagesDirectory, 'second.json'),
        `${JSON.stringify({ title: 'Second namespace title' })}\n`
      )

      expect(findDuplicateValueGroups(projectRoot)).toEqual([])
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true })
    }
  })

  it('detects a value newly duplicated across namespace-qualified keys', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-duplicates-'))

    try {
      const pagesDirectory = path.join(projectRoot, 'translations/en/pages')
      fs.mkdirSync(pagesDirectory, { recursive: true })
      fs.writeFileSync(
        path.join(pagesDirectory, 'first.json'),
        `${JSON.stringify({ title: 'Shared duplicate title' })}\n`
      )
      fs.writeFileSync(
        path.join(pagesDirectory, 'second.json'),
        `${JSON.stringify({ heading: 'Shared duplicate title' })}\n`
      )

      expect(findDuplicateValueGroups(projectRoot)).toEqual([
        {
          value: 'Shared duplicate title',
          locations: ['pages/first.json#title', 'pages/second.json#heading'],
        },
      ])
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true })
    }
  })

  it('expires reviewed groups before the same duplication can be reintroduced', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-duplicates-'))
    const pagesDirectory = path.join(projectRoot, 'translations/en/pages')
    const firstFile = path.join(pagesDirectory, 'first.json')
    const secondFile = path.join(pagesDirectory, 'second.json')

    try {
      fs.mkdirSync(pagesDirectory, { recursive: true })
      fs.mkdirSync(path.join(projectRoot, 'scripts/validate'), { recursive: true })
      fs.writeFileSync(firstFile, `${JSON.stringify({ title: 'Shared duplicate title' })}\n`)
      fs.writeFileSync(secondFile, `${JSON.stringify({ heading: 'Shared duplicate title' })}\n`)

      writeDuplicateValueBaseline(projectRoot)
      fs.writeFileSync(secondFile, `${JSON.stringify({ heading: 'Unique title' })}\n`)

      expect(findStaleDuplicateValueBaselineEntries(projectRoot)).toEqual([
        expect.objectContaining({ value: 'Shared duplicate title' }),
      ])

      writeDuplicateValueBaseline(projectRoot)
      fs.writeFileSync(secondFile, `${JSON.stringify({ heading: 'Shared duplicate title' })}\n`)

      expect(findNewDuplicateValueGroups(projectRoot)).toEqual([
        {
          value: 'Shared duplicate title',
          locations: ['pages/first.json#title', 'pages/second.json#heading'],
        },
      ])
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true })
    }
  })

  it('does not introduce duplicate translation values without review', () => {
    const groups = findNewDuplicateValueGroups(process.cwd())
    const staleEntries = findStaleDuplicateValueBaselineEntries(process.cwd())

    if (groups.length > 0 || staleEntries.length > 0) {
      const sections: string[] = []

      if (groups.length > 0) {
        sections.push(
          'Found new or changed duplicate translation values:',
          formatDuplicateValueGroups(groups)
        )
      }

      if (staleEntries.length > 0) {
        sections.push(
          'Found stale duplicate-value baseline entries:',
          formatDuplicateValueBaselineEntries(staleEntries)
        )
      }

      throw new Error(
        [
          ...sections,
          '',
          'Reuse existing keys and remove stale allowances, then refresh the reviewed baseline.',
        ].join('\n')
      )
    }
  })
})
