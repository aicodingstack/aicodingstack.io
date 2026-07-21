import { ImageResponse } from 'next/og'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'
import type { Locale } from '@/i18n/config'
import { getDesktop } from '@/lib/data/fetchers'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const desktop = await getDesktop(slug, locale as Locale)
  if (!desktop) {
    return new ImageResponse(
      <OGImageTemplate
        category="DESKTOP CODING AGENT"
        title="AI Coding Stack"
        description="Discover standalone desktop coding agents"
      />,
      { ...size }
    )
  }
  return new ImageResponse(
    <OGImageTemplate
      category="DESKTOP CODING AGENT"
      title={desktop.name}
      description={desktop.description}
      vendor={desktop.vendor}
    />,
    { ...size }
  )
}
