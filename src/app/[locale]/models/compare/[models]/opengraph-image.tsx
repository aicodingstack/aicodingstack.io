import { ImageResponse } from 'next/og'
import { OGImageTemplate } from '@/components/og/OGImageTemplate'
import { getModel } from '@/lib/data/fetchers'

export const runtime = 'edge'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string; models: string }>
}) {
  const { models } = await params
  const modelIds = parseModelsParam(models)

  if (modelIds.length !== 2) {
    return new Response('Not Found', { status: 404 })
  }

  const [model1, model2] = await Promise.all([getModel(modelIds[0]!), getModel(modelIds[1]!)])

  if (!model1 || !model2) {
    return new Response('Not Found', { status: 404 })
  }

  return new ImageResponse(
    <OGImageTemplate
      category="Model Comparison"
      title={`${model1.name} vs ${model2.name}`}
      description={`Compare ${model1.name} and ${model2.name} features, performance, and pricing side by side.`}
      vendor={`${model1.vendor} vs ${model2.vendor}`}
    />,
    {
      ...size,
    }
  )
}

function parseModelsParam(models: string): string[] {
  return models.split('-vs-')
}
