import fs from 'node:fs/promises'
import path from 'node:path'

interface JsonResponse {
  ok: boolean
  status: number
  statusText: string
  json(): Promise<unknown>
}

export type GithubStarsFetch = (
  input: string | URL,
  init?: { headers?: Record<string, string> }
) => Promise<JsonResponse>

interface StarsData {
  observedAt: string
  repositories: Record<string, number | null>
}

export interface GithubStarsChange {
  repositoryId: string
  previousStars: number | null
  nextStars: number
}

export interface GithubStarsSyncResult {
  checked: number
  changes: GithubStarsChange[]
  observedAt: string
  previousObservedAt: string
  wroteSnapshot: boolean
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'aicodingstack-stars-fetcher',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  return headers
}

async function fetchStars(repositoryId: string, fetchImpl: GithubStarsFetch): Promise<number> {
  const url = `https://api.github.com/repos/${repositoryId}`
  const response = await fetchImpl(url, { headers: githubHeaders() })
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status} ${response.statusText}`)
  }
  const payload = await response.json()
  const stars = isRecord(payload) ? payload.stargazers_count : undefined
  if (!Number.isInteger(stars) || (stars as number) < 0) {
    throw new Error(`${url} returned no usable stargazers_count`)
  }
  return stars as number
}

function parseStarsData(value: unknown): StarsData {
  if (!isRecord(value) || typeof value.observedAt !== 'string' || !isRecord(value.repositories)) {
    throw new Error('data/github-stars.json has an invalid shape')
  }
  const repositories: Record<string, number | null> = {}
  for (const [repositoryId, stars] of Object.entries(value.repositories)) {
    if (stars !== null && (!Number.isInteger(stars) || (stars as number) < 0)) {
      throw new Error(`data/github-stars.json has an invalid count for ${repositoryId}`)
    }
    repositories[repositoryId] = stars as number | null
  }
  return { observedAt: value.observedAt, repositories }
}

export async function syncGithubStars(options: {
  rootDir: string
  write: boolean
  observedAt: string
  fetchImpl?: GithubStarsFetch
}): Promise<GithubStarsSyncResult> {
  const filePath = path.join(options.rootDir, 'data', 'github-stars.json')
  const current = parseStarsData(JSON.parse(await fs.readFile(filePath, 'utf8')) as unknown)
  const repositoryIds = Object.keys(current.repositories).sort()
  const fetchImpl = options.fetchImpl ?? (fetch as GithubStarsFetch)
  const observations: Array<{ repositoryId: string; stars: number }> = []
  const failures: string[] = []
  for (const repositoryId of repositoryIds) {
    try {
      observations.push({ repositoryId, stars: await fetchStars(repositoryId, fetchImpl) })
    } catch (error) {
      failures.push(`${repositoryId}: ${String(error)}`)
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `GitHub stars synchronization failed without writing changes:\n${failures.join('\n')}`
    )
  }

  const changes: GithubStarsChange[] = []
  const repositories = { ...current.repositories }
  for (const { repositoryId, stars } of observations) {
    const previousStars = current.repositories[repositoryId] ?? null
    repositories[repositoryId] = stars
    if (previousStars !== stars) {
      changes.push({ repositoryId, previousStars, nextStars: stars })
    }
  }

  if (options.write) {
    const next: StarsData = { observedAt: options.observedAt, repositories }
    await fs.writeFile(filePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
  }

  return {
    checked: repositoryIds.length,
    changes,
    observedAt: options.observedAt,
    previousObservedAt: current.observedAt,
    wroteSnapshot: options.write,
  }
}
