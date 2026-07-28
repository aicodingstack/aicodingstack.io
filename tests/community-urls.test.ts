import { describe, expect, it } from 'vitest'
import { mergeCommunityUrls, withVendorCommunityUrls } from '@/lib/community-urls'
import type { ManifestCommunityUrls, ManifestVendor } from '@/types/manifests'

const emptyCommunityUrls: ManifestCommunityUrls = {
  linkedin: null,
  twitter: null,
  github: null,
  youtube: null,
  discord: null,
  reddit: null,
  blog: null,
}

describe('community URL inheritance', () => {
  it('uses product-specific links before organization links', () => {
    expect(
      mergeCommunityUrls(
        {
          ...emptyCommunityUrls,
          github: 'https://github.com/example-org',
          twitter: 'https://x.com/example_org',
        },
        {
          ...emptyCommunityUrls,
          github: 'https://github.com/example-org/example-product',
        }
      )
    ).toMatchObject({
      github: 'https://github.com/example-org/example-product',
      twitter: 'https://x.com/example_org',
    })
  })

  it('resolves vendor aliases before applying organization links', () => {
    const vendor = {
      id: 'example',
      name: 'Example Inc.',
      aliases: ['Example'],
      communityUrls: {
        ...emptyCommunityUrls,
        github: 'https://github.com/example-org',
      },
    } as ManifestVendor
    const product = {
      id: 'example-product',
      vendor: 'Example',
      communityUrls: emptyCommunityUrls,
    }

    expect(withVendorCommunityUrls(product, [vendor]).communityUrls.github).toBe(
      'https://github.com/example-org'
    )
  })

  it('leaves a product unchanged when its vendor cannot be resolved', () => {
    const product = {
      id: 'orphan',
      vendor: 'Unknown',
      communityUrls: emptyCommunityUrls,
    }

    expect(withVendorCommunityUrls(product, [])).toBe(product)
  })
})
