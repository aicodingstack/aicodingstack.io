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
  const t = await getTranslations({ locale, namespace: 'pages.stacks.modelProviders' })

  return new ImageResponse(
    <OGImageTemplate
      category="AI MODEL PROVIDERS"
      title={t('title')}
      description={t('subtitle')}
    />,
    { ...size }
  )
}
