import { getTranslations } from 'next-intl/server'
import { BackToNavigation } from '@/components/navigation/BackToNavigation'
import PageHeader from '@/components/PageHeader'
import type { Locale } from '@/i18n/config'
import { PageLayout } from '@/layouts/PageLayout'
import { getModel } from '@/lib/data/fetchers'
import { modelsData as allModels } from '@/lib/generated'
import type { ManifestModel } from '@/types/manifests'
import ComparisonPageClient from './page.client'

export const revalidate = 3600

export async function generateStaticParams() {
  const allModelIds = allModels.map(m => m.id)
  const params: { models: string }[] = []

  // Generate all two-model comparisons
  for (let i = 0; i < allModelIds.length; i++) {
    for (let j = i + 1; j < allModelIds.length; j++) {
      params.push({
        models: `${allModelIds[i]}-vs-${allModelIds[j]}`,
      })
    }
  }

  // Add empty path for dynamic selection
  params.push({ models: '' })

  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; models: string }>
}) {
  const { locale, models } = await params
  const t = await getTranslations({ locale, namespace: 'pages.comparison' })

  // Handle empty models parameter
  if (!models) {
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

  const modelIds = parseModelsParam(models)

  if (modelIds.length !== 2) {
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

  const model1 = await getModel(modelIds[0]!)
  const model2 = await getModel(modelIds[1]!)

  if (!model1 || !model2) {
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

  return {
    title: t('modelCompareTitle', {
      model1: model1.name,
      model2: model2.name,
    }),
    description: t('modelCompareDescription', {
      model1: model1.name,
      model2: model2.name,
    }),
    openGraph: {
      title: t('modelCompareTitle', {
        model1: model1.name,
        model2: model2.name,
      }),
      description: t('modelCompareDescription', {
        model1: model1.name,
        model2: model2.name,
      }),
      type: 'website',
    },
  }
}

function parseModelsParam(models: string | undefined): string[] {
  if (!models) return []
  return models.split('-vs-')
}

async function getModelsForComparison(modelIds: string[]): Promise<ManifestModel[]> {
  const models = await Promise.all(modelIds.map(id => getModel(id)))
  return models.filter((m): m is ManifestModel => m !== null)
}

function getComparisonGroups(): string[] {
  return ['basicInfo', 'capabilities', 'pricing', 'benchmark', 'platforms']
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string; models: string }>
}) {
  const { locale, models } = await params
  const modelIds = parseModelsParam(models)

  const tPage = await getTranslations({ locale, namespace: 'pages.modelCompare' })
  const tComparison = await getTranslations({ locale, namespace: 'pages.comparison' })

  const comparisonModels: ManifestModel[] = []
  let pageTitle = tComparison('models.title')
  let pageDescription = tComparison('models.subtitle')

  // Only fetch models if we have exactly 2 model IDs
  if (modelIds.length === 2) {
    const fetchedModels = await getModelsForComparison(modelIds)

    if (fetchedModels.length === 2) {
      comparisonModels.push(...fetchedModels)
      // Use dynamic title and description when two models are selected
      pageTitle = tComparison('modelCompareTitle', {
        model1: fetchedModels[0]!.name,
        model2: fetchedModels[1]!.name,
      })
      pageDescription = tComparison('modelCompareDescription', {
        model1: fetchedModels[0]!.name,
        model2: fetchedModels[1]!.name,
      })
    }
  }

  const groups = getComparisonGroups()
  const allModelsList = allModels.map(m => ({ id: m.id, name: m.name, vendor: m.vendor }))
  const modelsMap = Object.fromEntries(allModels.map(m => [m.id, m])) as Record<
    string,
    ManifestModel
  >

  return (
    <PageLayout>
      <main className="max-w-8xl mx-auto px-[var(--spacing-md)] pt-[var(--spacing-lg)]">
        <PageHeader title={pageTitle} subtitle={pageDescription} />

        <ComparisonPageClient
          initialModels={comparisonModels}
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
