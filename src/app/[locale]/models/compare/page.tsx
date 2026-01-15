import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import PageHeader from '@/components/PageHeader'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { modelsData as allModels } from '@/lib/generated'
import type { ManifestModel } from '@/types/manifests'
import ComparisonPageClient from './[models]/page.client'

export const revalidate = 3600

function getComparisonGroups(): string[] {
  return ['basicInfo', 'capabilities', 'performance', 'pricing', 'platforms']
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'pages.comparison' })

  return {
    title: t('models.title'),
    description: t('models.subtitle'),
    openGraph: {
      title: t('models.title'),
      description: t('models.subtitle'),
      type: 'website',
    },
  }
}

export default async function ComparePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  const tPage = await getTranslations({ locale, namespace: 'pages.modelCompare' })
  const tComparison = await getTranslations({ locale, namespace: 'pages.comparison' })

  const groups = getComparisonGroups()
  const allModelsList = allModels.map(m => ({ id: m.id, name: m.name, vendor: m.vendor }))
  const modelsMap = Object.fromEntries(allModels.map(m => [m.id, m])) as Record<
    string,
    ManifestModel
  >

  return (
    <PageLayout>
      <main className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <PageHeader title={tComparison('models.title')} subtitle={tComparison('models.subtitle')} />

        <ComparisonPageClient
          initialModels={[] as ManifestModel[]}
          allModels={allModelsList}
          modelsMap={modelsMap}
          groups={groups}
          locale={locale as Locale}
        />

        <BackToNavigation href="/models" title={tPage('allModels')} />
      </main>
    </PageLayout>
  )
}
