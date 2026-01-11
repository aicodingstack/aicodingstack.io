import { ImageResponse } from 'next/og'
import { getTranslations } from 'next-intl/server'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function Image({ params }: Props) {
  const { locale } = await params
  const tPage = await getTranslations({ locale, namespace: 'pages.ides' })

  return new ImageResponse(
    <OGImageTemplate
      category="AI-POWERED IDEs"
      title={tPage('title')}
      description={tPage('subtitle')}
    />,
    { ...size }
  )
}
