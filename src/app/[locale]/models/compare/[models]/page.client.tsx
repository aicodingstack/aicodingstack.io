'use client'

import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Fragment, useEffect, useState } from 'react'
import type { Locale } from '@/i18n/config'
import { Link, useRouter } from '@/i18n/navigation'
import { providersData } from '@/lib/generated'
import type {
  ManifestBenchmarks,
  ManifestModel,
  ManifestPlatformUrls,
  ManifestTokenPricing,
} from '@/types/manifests'
import type { ModelCapability, ModelInputModality, ModelOutputModality } from '@/types/model-enums'

const EMPTY_BENCHMARKS: ManifestBenchmarks = {
  sweBench: null,
  terminalBench: null,
  mmmu: null,
  mmmuPro: null,
  webDevArena: null,
  sciCode: null,
  liveCodeBench: null,
}

const EMPTY_PLATFORM_URLS: ManifestPlatformUrls = {
  huggingface: null,
  artificialAnalysis: null,
  openrouter: null,
}

const EMPTY_TOKEN_PRICING: ManifestTokenPricing = {
  input: 0,
  output: 0,
  cache: null,
}

const EMPTY_INPUT_MODALITIES: ModelInputModality[] = []
const EMPTY_OUTPUT_MODALITIES: ModelOutputModality[] = []
const EMPTY_CAPABILITIES: ModelCapability[] = []

const FALLBACK_MODEL: ManifestModel = {
  id: '',
  name: '',
  vendor: '',
  description: '',
  translations: {},
  verified: false,
  websiteUrl: '',
  docsUrl: null,
  size: '',
  contextWindow: 0,
  maxOutput: 0,
  tokenPricing: EMPTY_TOKEN_PRICING,
  releaseDate: null,
  lifecycle: 'latest',
  knowledgeCutoff: null,
  inputModalities: EMPTY_INPUT_MODALITIES,
  outputModalities: EMPTY_OUTPUT_MODALITIES,
  capabilities: EMPTY_CAPABILITIES,
  benchmarks: EMPTY_BENCHMARKS,
  platformUrls: EMPTY_PLATFORM_URLS,
}

// Helper functions for formatting
const formatNumberToK = (value: number | null | undefined): string => {
  return value ? `${(value / 1000).toFixed(0)}K` : '-'
}

const formatPrice = (value: number | null | undefined, locale: string): string => {
  if (value === null || value === undefined) return '-'
  const price = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 3,
  }).format(value)
  return `${price} / 1M tokens`
}

const formatPercentage = (value: number | null | undefined): string => {
  return value ? `${value}%` : '-'
}

const formatSimpleValue = (value: string | null | undefined): string => {
  return value ?? '-'
}

// Renderer factory functions
const createSimpleRenderer = (getValue: (model: ManifestModel) => string | null | undefined) => {
  return (model: ManifestModel) => formatSimpleValue(getValue(model))
}

const createNumberToKRenderer = (getValue: (model: ManifestModel) => number | null | undefined) => {
  return (model: ManifestModel) => formatNumberToK(getValue(model))
}

const createPriceRenderer = (
  getValue: (model: ManifestModel) => number | null | undefined,
  locale: string
) => {
  return (model: ManifestModel) => formatPrice(getValue(model), locale)
}

const createBenchmarkRenderer = (getValue: (model: ManifestModel) => number | null | undefined) => {
  return (model: ManifestModel) => formatPercentage(getValue(model))
}

const createTagsRenderer = (getValue: (model: ManifestModel) => string[] | null | undefined) => {
  return (model: ManifestModel) => {
    const tags = getValue(model)
    if (!tags || tags.length === 0) return '-'
    return (
      <div className="flex flex-wrap gap-1 justify-center">
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-block px-2 py-0.5 text-xs border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
          >
            {tag}
          </span>
        ))}
      </div>
    )
  }
}

const createCapabilityCheckRenderer = (capabilityName: ModelCapability) => {
  return (model: ManifestModel) => {
    const hasCapability = model.capabilities?.includes(capabilityName)
    return hasCapability ? '✓' : '-'
  }
}

const createPlatformLinkRenderer = (
  getUrl: (model: ManifestModel) => string | null | undefined
) => {
  return (model: ManifestModel) => {
    const url = getUrl(model)
    if (!url) return '-'
    return (
      <div className="flex justify-center">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4 text-[var(--color-text)] hover:text-[var(--color-text-secondary)]" />
        </a>
      </div>
    )
  }
}

interface ModelOption {
  id: string
  name: string
  vendor: string | null
}

interface Row {
  group: string
  groupLabel: string
  key: string
  label: string
  render: (model: ManifestModel) => React.ReactNode
}

interface ComparePageClientProps {
  initialModels: ManifestModel[]
  allModels: ModelOption[]
  modelsMap: Record<string, ManifestModel>
  groups: string[]
  locale: Locale
}

export default function ComparePageClient({
  initialModels,
  allModels,
  modelsMap,
  groups,
  locale,
}: ComparePageClientProps) {
  const router = useRouter()
  const tPage = useTranslations('pages.modelCompare')
  const tShared = useTranslations('shared')
  const [selectedModel1, setSelectedModel1] = useState<string>(initialModels[0]?.id ?? '')
  const [selectedModel2, setSelectedModel2] = useState<string>(initialModels[1]?.id ?? '')
  const [prevModel1, setPrevModel1] = useState<string>(initialModels[0]?.id ?? '')
  const [prevModel2, setPrevModel2] = useState<string>(initialModels[1]?.id ?? '')

  const findProviderId = (vendor: string): string | null => {
    const normalizedVendor = vendor.toLocaleLowerCase()
    return (
      providersData.find(
        provider =>
          provider.name.toLocaleLowerCase() === normalizedVendor ||
          provider.vendor.toLocaleLowerCase() === normalizedVendor
      )?.id ?? null
    )
  }

  const getRows = (): Row[] => {
    // Basic info rows
    const basicInfoRows: Row[] = [
      {
        group: 'basicInfo',
        groupLabel: tPage('basicInfo'),
        key: 'name',
        label: tShared('categories.singular.model'),
        render: model => (
          <div className="flex items-center justify-center gap-2">
            <span className="font-semibold">{model.name}</span>
          </div>
        ),
      },
      {
        group: 'basicInfo',
        groupLabel: tPage('basicInfo'),
        key: 'vendor',
        label: tShared('categories.singular.vendor'),
        render: model => {
          const providerId = findProviderId(model.vendor)
          return providerId ? (
            <Link
              href={`/model-providers/${providerId}`}
              className="text-[var(--color-text)] hover:text-[var(--color-text-secondary)] underline"
            >
              {model.vendor}
            </Link>
          ) : (
            model.vendor
          )
        },
      },
      {
        group: 'basicInfo',
        groupLabel: tPage('basicInfo'),
        key: 'lifecycle',
        label: tPage('lifecycle'),
        render: model => tShared(`lifecycle.${model.lifecycle}`),
      },
      {
        group: 'basicInfo',
        groupLabel: tPage('basicInfo'),
        key: 'releaseDate',
        label: tPage('releaseDate'),
        render: createSimpleRenderer(m => m.releaseDate),
      },
      {
        group: 'basicInfo',
        groupLabel: tPage('basicInfo'),
        key: 'knowledgeCutoff',
        label: tPage('knowledgeCutoff'),
        render: createSimpleRenderer(m => m.knowledgeCutoff),
      },
    ]

    // Capabilities rows
    const capabilitiesRows: Row[] = [
      {
        group: 'capabilities',
        groupLabel: tShared('capabilities.capabilities'),
        key: 'size',
        label: tShared('terms.modelSize'),
        render: createSimpleRenderer(m => m.size),
      },
      {
        group: 'capabilities',
        groupLabel: tShared('capabilities.capabilities'),
        key: 'contextWindow',
        label: tShared('terms.contextWindow'),
        render: createNumberToKRenderer(m => m.contextWindow),
      },
      {
        group: 'capabilities',
        groupLabel: tShared('capabilities.capabilities'),
        key: 'maxOutput',
        label: tShared('terms.maxOutput'),
        render: createNumberToKRenderer(m => m.maxOutput),
      },
      {
        group: 'capabilities',
        groupLabel: tShared('capabilities.capabilities'),
        key: 'inputModalities',
        label: tShared('capabilities.inputModalities'),
        render: createTagsRenderer(m => m.inputModalities),
      },
      {
        group: 'capabilities',
        groupLabel: tShared('capabilities.capabilities'),
        key: 'outputModalities',
        label: tShared('capabilities.outputModalities'),
        render: createTagsRenderer(m => m.outputModalities),
      },
      {
        group: 'capabilities',
        groupLabel: tShared('capabilities.capabilities'),
        key: 'function-calling',
        label: tShared('capabilities.functionCalling'),
        render: createCapabilityCheckRenderer('function-calling'),
      },
      {
        group: 'capabilities',
        groupLabel: tShared('capabilities.capabilities'),
        key: 'tool-choice',
        label: tShared('capabilities.toolChoice'),
        render: createCapabilityCheckRenderer('tool-choice'),
      },
      {
        group: 'capabilities',
        groupLabel: tShared('capabilities.capabilities'),
        key: 'structured-outputs',
        label: tShared('capabilities.structuredOutputs'),
        render: createCapabilityCheckRenderer('structured-outputs'),
      },
      {
        group: 'capabilities',
        groupLabel: tShared('capabilities.capabilities'),
        key: 'reasoning',
        label: tShared('capabilities.reasoning'),
        render: createCapabilityCheckRenderer('reasoning'),
      },
    ]

    // Pricing rows
    const pricingRows: Row[] = [
      {
        group: 'pricing',
        groupLabel: tShared('terms.pricing'),
        key: 'inputPrice',
        label: tPage('inputPrice'),
        render: createPriceRenderer(m => m.tokenPricing?.input, locale),
      },
      {
        group: 'pricing',
        groupLabel: tShared('terms.pricing'),
        key: 'outputPrice',
        label: tPage('outputPrice'),
        render: createPriceRenderer(m => m.tokenPricing?.output, locale),
      },
      {
        group: 'pricing',
        groupLabel: tShared('terms.pricing'),
        key: 'cachePrice',
        label: tPage('cachePrice'),
        render: createPriceRenderer(m => m.tokenPricing?.cache, locale),
      },
    ]

    // Benchmark rows
    const benchmarkKeys: Array<keyof ManifestBenchmarks> = [
      'sweBench',
      'terminalBench',
      'sciCode',
      'liveCodeBench',
      'mmmu',
      'mmmuPro',
      'webDevArena',
    ]
    const benchmarkRows: Row[] = benchmarkKeys.map(key => ({
      group: 'benchmark',
      groupLabel: tShared('terms.benchmarks'),
      key,
      label: tShared(`benchmarks.${key}`),
      render: createBenchmarkRenderer(m => m.benchmarks?.[key] ?? null),
    }))

    // Platform rows
    const platformKeys: Array<keyof ManifestPlatformUrls> = [
      'huggingface',
      'artificialAnalysis',
      'openrouter',
    ]
    const platformRows: Row[] = platformKeys.map(key => ({
      group: 'platforms',
      groupLabel: tShared('labels.findOnAiPlatforms'),
      key,
      label: tShared(`platforms.${key}`),
      render: createPlatformLinkRenderer(m => m.platformUrls?.[key] ?? null),
    }))

    return [
      ...basicInfoRows,
      ...capabilitiesRows,
      ...pricingRows,
      ...benchmarkRows,
      ...platformRows,
    ]
  }

  const rowsByGroup = getRows().reduce(
    (acc, row) => {
      if (!acc[row.group]) {
        acc[row.group] = []
      }
      acc[row.group]!.push(row)
      return acc
    },
    {} as Record<string, Row[]>
  )

  // Sort models: first by vendor, then by lifecycle (latest > maintained > deprecated)
  const sortModelsByLifecycle = (models: ModelOption[]): ModelOption[] => {
    const lifecycleOrder: Record<string, number> = {
      latest: 0,
      maintained: 1,
      deprecated: 2,
    }

    return [...models].sort((a, b) => {
      // First sort by vendor
      const vendorA = a.vendor || ''
      const vendorB = b.vendor || ''
      if (vendorA !== vendorB) {
        return vendorA.localeCompare(vendorB)
      }

      // If same vendor, sort by lifecycle
      const lifecycleA = modelsMap[a.id]?.lifecycle || 'maintained'
      const lifecycleB = modelsMap[b.id]?.lifecycle || 'maintained'
      const orderA = lifecycleOrder[lifecycleA] ?? 999
      const orderB = lifecycleOrder[lifecycleB] ?? 999

      if (orderA !== orderB) {
        return orderA - orderB
      }

      // If same lifecycle, sort by name
      return a.name.localeCompare(b.name)
    })
  }

  const getAvailableModelsForSlot = (slotIndex: number): ModelOption[] => {
    let filtered: ModelOption[]
    if (slotIndex === 0) {
      filtered = allModels.filter(m => m.id !== selectedModel2)
    } else {
      filtered = allModels.filter(m => m.id !== selectedModel1)
    }
    return sortModelsByLifecycle(filtered)
  }

  // Select dropdown component
  const ModelSelect = ({
    value,
    onChange,
    availableModels,
  }: {
    value: string
    onChange: (value: string) => void
    availableModels: ModelOption[]
  }) => {
    const selectStyle = {
      // cspell:disable-next-line
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 8px center',
    }

    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none px-4 py-0 pr-8 bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] min-w-[200px] min-h-[46px] text-center w-full cursor-pointer"
        style={selectStyle}
      >
        <option value="">{tPage('selectModel')}</option>
        {availableModels.map(m => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    )
  }

  // Update URL when both models are selected and at least one has changed
  useEffect(() => {
    if (selectedModel1 && selectedModel2 && selectedModel1 !== selectedModel2) {
      if (selectedModel1 !== prevModel1 || selectedModel2 !== prevModel2) {
        const url = `/models/compare/${selectedModel1}-vs-${selectedModel2}`
        router.push(url)
        setPrevModel1(selectedModel1)
        setPrevModel2(selectedModel2)
      }
    }
  }, [selectedModel1, selectedModel2, prevModel1, prevModel2, router])

  const model1 = allModels.find(m => m.id === selectedModel1)
  const model2 = allModels.find(m => m.id === selectedModel2)

  return (
    <div className="space-y-8">
      {/* Model selection header */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <tbody>
            <tr>
              <td className="w-[18%]"></td>
              <td className="w-[32%] p-4">
                <div className="flex flex-col gap-2 items-center">
                  <ModelSelect
                    value={selectedModel1}
                    onChange={setSelectedModel1}
                    availableModels={getAvailableModelsForSlot(0)}
                  />
                </div>
              </td>
              <td className="w-[32%] p-4">
                <div className="flex flex-col gap-2 items-center">
                  <ModelSelect
                    value={selectedModel2}
                    onChange={setSelectedModel2}
                    availableModels={getAvailableModelsForSlot(1)}
                  />
                </div>
              </td>
              <td className="w-[18%]"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Comparison table */}
      {model1 && model2 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px] border-t border-[var(--color-border)]">
            <tbody>
              {groups.map(group => {
                const groupRows = rowsByGroup[group]
                if (!groupRows) return null

                return (
                  <Fragment key={group}>
                    <tr className="border-b border-[var(--color-border)]">
                      <td
                        colSpan={4}
                        className="px-4 py-2 bg-[var(--color-hover)] text-center text-sm font-semibold uppercase tracking-wider"
                      >
                        {groupRows[0]?.groupLabel}
                      </td>
                    </tr>
                    {groupRows.map(row => (
                      <tr
                        key={row.key}
                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-hover)] transition-colors"
                      >
                        <td className="px-4 py-3 border-r border-[var(--color-border)] whitespace-nowrap text-center w-[18%]">
                          {row.label}
                        </td>
                        <td className="px-4 py-3 text-center w-[32%]">
                          {row.render(modelsMap[selectedModel1] ?? FALLBACK_MODEL)}
                        </td>
                        <td className="px-4 py-3 text-center border-x border-[var(--color-border)] w-[32%]">
                          {row.render(modelsMap[selectedModel2] ?? FALLBACK_MODEL)}
                        </td>
                        <td className="px-4 py-3 border-l border-[var(--color-border)] whitespace-nowrap text-center w-[18%]">
                          {row.label}
                        </td>
                      </tr>
                    ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {(!model1 || !model2) && (
        <div className="text-center py-12 text-[var(--color-text-muted)]">
          <p>{tPage('selectTwoModels')}</p>
        </div>
      )}
    </div>
  )
}
