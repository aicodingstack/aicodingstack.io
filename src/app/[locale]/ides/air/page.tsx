import { permanentRedirect } from 'next/navigation'
import { defaultLocale } from '@/i18n/config'

type Props = {
  params: Promise<{ locale: string }>
}

export default async function AirIdeRedirectPage({ params }: Props) {
  const { locale } = await params
  permanentRedirect(locale === defaultLocale ? '/desktops/air' : `/${locale}/desktops/air`)
}
