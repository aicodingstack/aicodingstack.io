import { permanentRedirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/config'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function ModelComparisonPage({ params }: Props) {
  const { locale } = await params
  permanentRedirect(locale === defaultLocale ? '/models/compare' : `/${locale}/models/compare`)
}
