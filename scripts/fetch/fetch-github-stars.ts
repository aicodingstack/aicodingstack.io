import fs from 'node:fs'
import https from 'node:https'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_STARS_FILE = path.join(__dirname, '..', '..', 'data', 'github-stars.json')

type StarsData = {
  observedAt: string
  repositories: Record<string, number | null>
}

function fetchStars(repositoryId: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'api.github.com',
      path: `/repos/${repositoryId}`,
      method: 'GET',
      headers: {
        'User-Agent': 'aicodingstack-stars-fetcher',
        Accept: 'application/vnd.github+json',
        ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
      },
    }

    const request = https.request(options, response => {
      let body = ''
      response.on('data', chunk => {
        body += chunk
      })
      response.on('end', () => {
        if (response.statusCode !== 200) {
          reject(new Error(`GitHub API returned status ${String(response.statusCode)}`))
          return
        }
        try {
          const payload = JSON.parse(body) as { stargazers_count?: unknown }
          if (!Number.isInteger(payload.stargazers_count)) {
            reject(new Error('GitHub response did not include an integer stargazer count'))
            return
          }
          resolve(payload.stargazers_count as number)
        } catch (error) {
          reject(new Error(`Failed to parse GitHub response: ${(error as Error).message}`))
        }
      })
    })

    request.on('error', reject)
    request.end()
  })
}

async function main(): Promise<void> {
  const current = JSON.parse(fs.readFileSync(GITHUB_STARS_FILE, 'utf8')) as StarsData
  let updated = 0
  let failed = 0

  for (const repositoryId of Object.keys(current.repositories).sort()) {
    try {
      const stars = await fetchStars(repositoryId)
      current.repositories[repositoryId] = stars
      updated += 1
      console.log(`✓ ${repositoryId}: ${stars.toLocaleString('en-US')}`)
    } catch (error) {
      failed += 1
      console.error(`✗ ${repositoryId}: ${(error as Error).message}`)
    }
  }

  current.observedAt = new Date().toISOString().slice(0, 10)
  fs.writeFileSync(GITHUB_STARS_FILE, `${JSON.stringify(current, null, 2)}\n`, 'utf8')
  console.log(`Updated ${updated} repositories; ${failed} retained their previous values.`)

  if (failed > 0) process.exitCode = 1
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
