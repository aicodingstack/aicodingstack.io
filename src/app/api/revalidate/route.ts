import { revalidatePath, revalidateTag } from 'next/cache'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * All revalidation paths for the site
 * Includes both base paths and locale-prefixed paths
 */
const ALL_REVALIDATION_PATHS = [
  // Root
  '/',
  // Product categories
  'ides',
  'clis',
  'extensions',
  'models',
  'model-providers',
  'vendors',
  // Content
  'articles',
  'ai-coding-stack',
  'docs',
  'curated-collections',
  'manifesto',
  'ai-coding-landscape',
  'open-source-rank',
  'search',
]

/**
 * Category-specific paths
 */
const CATEGORY_PATHS: Record<string, string[]> = {
  ides: ['ides'],
  clis: ['clis'],
  extensions: ['extensions'],
  models: ['models'],
  providers: ['model-providers'],
  vendors: ['vendors'],
  tools: ['ides', 'clis', 'extensions'],
  content: ['articles', 'ai-coding-stack', 'docs'],
}

/**
 * Extract secret from headers or query params
 */
function extractSecret(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Check query param
  const querySecret = request.nextUrl.searchParams.get('secret')
  if (querySecret) {
    return querySecret
  }

  // Check x-secret header
  const xSecret = request.headers.get('x-secret')
  if (xSecret) {
    return xSecret
  }

  return null
}

/**
 * Check for secret to confirm this is a valid request
 */
function isValidSecret(secret: string | null): boolean {
  const envSecret = process.env.REVALIDATION_SECRET
  if (!envSecret) {
    return false
  }
  return secret === envSecret
}

/**
 * GET /api/revalidate - Show usage information
 */
export async function GET() {
  return NextResponse.json({
    message: 'On-Demand Revalidation API',
    usage: {
      method: 'POST',
      url: '/api/revalidate',
      authentication:
        'Bearer token in Authorization header, OR x-secret header, OR secret query param',
      queryParams: {
        path: 'Specific path to revalidate (e.g., /ides)',
        tag: 'Tag to revalidate (if pages use tags)',
        category: 'Category to revalidate (e.g., ide, tools)',
      },
      examples: [
        'POST /api/revalidate?secret=YOUR_SECRET&path=/ides',
        'POST /api/revalidate?secret=YOUR_SECRET&tag=manifests',
        'POST /api/revalidate?secret=YOUR_SECRET&category=tools',
        'curl: curl -X POST "/api/revalidate?secret=xxx&path=/ides"',
      ],
      categories: Object.keys(CATEGORY_PATHS),
    },
  })
}

export async function POST(request: NextRequest) {
  const secret = extractSecret(request)

  // Check for secret to confirm this is a valid request
  if (!isValidSecret(secret)) {
    return NextResponse.json(
      { message: 'Unauthorized - Invalid or missing secret' },
      { status: 401 }
    )
  }

  const path = request.nextUrl.searchParams.get('path')
  const tag = request.nextUrl.searchParams.get('tag')
  const category = request.nextUrl.searchParams.get('category')

  try {
    if (path) {
      // Revalidate specific path
      revalidatePath(path)
      return NextResponse.json({
        revalidated: true,
        type: 'path',
        target: path,
        now: Date.now(),
      })
    } else if (tag) {
      // Revalidate by tag
      revalidateTag(tag)
      return NextResponse.json({
        revalidated: true,
        type: 'tag',
        target: tag,
        now: Date.now(),
      })
    } else if (category) {
      // Revalidate category or group
      const paths = CATEGORY_PATHS[category]
      if (paths) {
        paths.forEach(p => revalidatePath(p))
        return NextResponse.json({
          revalidated: true,
          type: 'category',
          target: category,
          paths,
          count: paths.length,
          now: Date.now(),
        })
      } else {
        return NextResponse.json(
          {
            message: 'Invalid category',
            validCategories: Object.keys(CATEGORY_PATHS),
          },
          { status: 400 }
        )
      }
    } else {
      // Revalidate all pages
      ALL_REVALIDATION_PATHS.forEach(p => revalidatePath(p))
      return NextResponse.json({
        revalidated: true,
        type: 'all',
        count: ALL_REVALIDATION_PATHS.length,
        now: Date.now(),
      })
    }
  } catch (err) {
    return NextResponse.json(
      {
        message: 'Error revalidating',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
