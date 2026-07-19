import { describe, expect, it } from 'vitest'

import {
  analyzeDataHealth,
  type ManifestRecord,
  renderDataHealthMarkdown,
} from '../scripts/validate/data-health'

function record(
  category: ManifestRecord['category'],
  id: string,
  data: Record<string, unknown> = {}
): ManifestRecord {
  return {
    category,
    filePath: `/repo/manifests/${category}/${id}.json`,
    data: { id, name: id, description: `${id} description`, ...data },
  }
}

describe('data health reporting', () => {
  it('recognizes complete provenance and fresh verification', () => {
    const report = analyzeDataHealth(
      [
        record('models', 'trusted-model', {
          verified: true,
          sources: [{ url: 'https://example.com/model', title: 'Model card' }],
          lastVerifiedAt: '2026-07-10',
          verifiedBy: 'maintainers',
          confidence: 'high',
        }),
      ],
      '2026-07-18'
    )

    expect(report.summary).toMatchObject({
      totalRecords: 1,
      recordsWithSources: 1,
      verifiedRecords: 1,
      provenanceComplete: 1,
      staleVerifiedRecords: 0,
      errors: 0,
      warnings: 0,
    })
  })

  it('treats missing relationships as errors alongside provenance and freshness warnings', () => {
    const report = analyzeDataHealth(
      [
        record('ides', 'editor', {
          verified: true,
          lastVerifiedAt: '2026-01-01',
          relatedProducts: [{ type: 'cli', productId: 'missing-cli' }],
        }),
      ],
      '2026-07-18'
    )

    expect(report.issues.map(issue => issue.code)).toEqual([
      'dangling-related-product',
      'stale-verification',
      'verified-without-provenance',
      'missing-sources',
    ])
    expect(report.summary).toMatchObject({
      recordsWithSources: 0,
      staleVerifiedRecords: 1,
      danglingRelationships: 1,
      errors: 1,
      warnings: 2,
      info: 1,
    })
  })

  it('treats impossible and future verification dates as errors', () => {
    const report = analyzeDataHealth(
      [
        record('providers', 'invalid-date', { lastVerifiedAt: '2026-02-30' }),
        record('providers', 'future-date', { lastVerifiedAt: '2026-07-19' }),
      ],
      '2026-07-18'
    )

    expect(
      report.issues.filter(issue => issue.severity === 'error').map(issue => issue.code)
    ).toEqual(['future-verification-date', 'invalid-verification-date'])
  })

  it('captures translation placeholders and renders a durable summary', () => {
    const report = analyzeDataHealth([record('vendors', 'example')], '2026-07-18', [
      { locale: 'en', values: { greeting: 'Hello', product: 'Codex' } },
      { locale: 'zh-Hans', values: { greeting: '你好', product: 'Codex' } },
    ])
    const markdown = renderDataHealthMarkdown(report)

    expect(report.summary.translationPlaceholderValues).toBe(1)
    expect(markdown).toContain('| Records with structured sources | 0 |')
    expect(markdown).toContain('| zh-Hans | 2 | 1 | 50% |')
  })

  it('rejects a malformed report date', () => {
    expect(() => analyzeDataHealth([], '2026-02-30')).toThrow('Invalid --as-of date')
  })
})
