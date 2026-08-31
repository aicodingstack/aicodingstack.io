import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import { type GithubStarsFetch, syncGithubStars } from '../scripts/fetch/lib/github-stars-sync'

const temporaryDirectories: string[] = []

async function createStarsRoot(repositories: Record<string, number | null>): Promise<string> {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'github-stars-sync-'))
  temporaryDirectories.push(rootDir)
  await fs.mkdir(path.join(rootDir, 'data'), { recursive: true })
  await fs.writeFile(
    path.join(rootDir, 'data', 'github-stars.json'),
    `${JSON.stringify({ observedAt: '2026-08-01', repositories }, null, 2)}\n`
  )
  return rootDir
}

function starsFetch(counts: Record<string, number>): GithubStarsFetch {
  return async input => {
    const repositoryId = String(input).replace('https://api.github.com/repos/', '')
    const count = counts[repositoryId]
    if (count === undefined) {
      return {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        async json() {
          return {}
        },
      }
    }
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      async json() {
        return { stargazers_count: count }
      },
    }
  }
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map(directory => fs.rm(directory, { force: true, recursive: true }))
  )
})

describe('GitHub stars synchronization', () => {
  it('reports source drift without writing in check mode', async () => {
    const rootDir = await createStarsRoot({ 'example/one': 10 })
    const filePath = path.join(rootDir, 'data', 'github-stars.json')
    const before = await fs.readFile(filePath, 'utf8')

    const result = await syncGithubStars({
      rootDir,
      write: false,
      observedAt: '2026-08-31',
      fetchImpl: starsFetch({ 'example/one': 12 }),
    })

    expect(result.changes).toEqual([
      { repositoryId: 'example/one', previousStars: 10, nextStars: 12 },
    ])
    expect(await fs.readFile(filePath, 'utf8')).toBe(before)
  })

  it('writes counts and the observation date after all sources succeed', async () => {
    const rootDir = await createStarsRoot({ 'example/one': 10, 'example/two': null })

    const result = await syncGithubStars({
      rootDir,
      write: true,
      observedAt: '2026-08-31',
      fetchImpl: starsFetch({ 'example/one': 12, 'example/two': 3 }),
    })
    const snapshot = JSON.parse(
      await fs.readFile(path.join(rootDir, 'data', 'github-stars.json'), 'utf8')
    ) as Record<string, unknown>

    expect(result.checked).toBe(2)
    expect(snapshot).toEqual({
      observedAt: '2026-08-31',
      repositories: { 'example/one': 12, 'example/two': 3 },
    })
  })

  it('does not write a partial snapshot when one source fails', async () => {
    const rootDir = await createStarsRoot({ 'example/one': 10, 'example/two': 20 })
    const filePath = path.join(rootDir, 'data', 'github-stars.json')
    const before = await fs.readFile(filePath, 'utf8')

    await expect(
      syncGithubStars({
        rootDir,
        write: true,
        observedAt: '2026-08-31',
        fetchImpl: starsFetch({ 'example/one': 12 }),
      })
    ).rejects.toThrow('failed without writing changes')
    expect(await fs.readFile(filePath, 'utf8')).toBe(before)
  })
})
