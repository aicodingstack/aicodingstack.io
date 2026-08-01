import { describe, expect, it } from 'vitest'
import { generateWebSiteSchema, validateSchema } from '@/lib/metadata/schemas'

describe('website structured data', () => {
  it('provides the lowercase domain as a fallback site name for search engines', async () => {
    const schema = await generateWebSiteSchema()

    expect(schema).toMatchObject({
      '@type': 'WebSite',
      name: 'AI Coding Stack',
      alternateName: 'aicodingstack.io',
      url: 'https://aicodingstack.io',
    })
    expect(validateSchema(schema)).toMatchObject({ valid: true, errors: [] })
  })
})
