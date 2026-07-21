import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.desktops' })
  return new ImageResponse(
    <OGImageTemplate
      category="DESKTOP CODING AGENTS"
      title={tPage('title')}
      description={tPage('subtitle')}
    />,
    { ...size }
  )
}
