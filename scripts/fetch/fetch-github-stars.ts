import fs from 'node:fs'
import https from 'node:https'
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// GitHub API token (optional but recommended to avoid rate limits)
// Set via environment variable: GITHUB_TOKEN=your_token_here node fetch-github-stars.ts
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

// Path to the centralized GitHub stars data file
const GITHUB_STARS_FILE = path.join(__dirname, '..', '..', 'data', 'github-stars.json')

interface DirConfig {
  directory: string
  category: string
}

// Directories configuration - mapping manifest directories to categories
const dirsConfig: DirConfig[] = [
  {
    directory: 'manifests/extensions',
    category: 'extensions',
  },
  {
    directory: 'manifests/ides',
    category: 'ides',
  },
  {
    directory: 'manifests/clis',
    category: 'clis',
  },
]

interface GithubRepo {
  owner: string
  repo: string
}

interface ProcessResult {
  fileId: string
  stars: number | null
  updated: boolean
  skipped: boolean
  error: boolean
}

interface DirectoryResult {
  categoryData: Record<string, number | null>
  stats: {
    updated: number
    skipped: number
    errors: number
  }
}

interface StarsData {
  extensions: Record<string, number | null>
  clis: Record<string, number | null>
  ides: Record<string, number | null>
  [key: string]: Record<string, number | null>
}

// Extract owner and repo from GitHub URL
function parseGithubUrl(url: string): GithubRepo | null {
  if (!url) return null
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/)
  if (!match || match.length < 3) return null
  return {
    owner: match[1] ?? '',
    repo: match[2] ?? '',
  }
}

// Fetch stars from GitHub API
function fetchStars(owner: string, repo: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}`,
      method: 'GET',
      headers: {
        'User-Agent': 'acs-stars-fetcher',
        Accept: 'application/vnd.github.v3+json',
      },
    }

    if (GITHUB_TOKEN) {
      options.headers = {
        ...options.headers,
        Authorization: `token ${GITHUB_TOKEN}`,
      }
    }

    const req = https.request(options, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const json = JSON.parse(data)
            const stars = json.stargazers_count
            // Convert to k format (1 decimal place)
            const starsInK = parseFloat((stars / 1000).toFixed(1))
            resolve(starsInK)
          } catch (e) {
            reject(new Error(`Failed to parse response: ${(e as Error).message}`))
          }
        } else if (res.statusCode === 403) {
          reject(new Error('Rate limit exceeded. Please set GITHUB_TOKEN environment variable.'))
        } else if (res.statusCode === 404) {
          reject(new Error('Repository not found'))
        } else {
          reject(new Error(`GitHub API returned status ${res.statusCode}`))
        }
      })
    })

    req.on('error', e => {
      reject(e)
    })

    req.end()
  })
}

// Extract file ID from filename (remove .json extension)
function getFileId(fileName: string): string {
  return fileName.replace(/\.json$/, '')
}

// Sleep function to avoid rate limiting
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Process a single JSON file
// Returns the file ID (from filename) and stars count (or null if no githubUrl or error)
async function processFile(filePath: string, fileName: string): Promise<ProcessResult> {
  const fileId = getFileId(fileName)
  const content = fs.readFileSync(filePath, 'utf8')
  const item = JSON.parse(content)

  // Get githubUrl field from the item
  const githubUrl = item.githubUrl

  // If githubUrl is null, set stars to null in the output
  if (!githubUrl || githubUrl === null) {
    console.log(`  ⏭️  ${fileId}: githubUrl is null, setting stars to null`)
    return { fileId, stars: null, updated: false, skipped: true, error: false }
  }

  const parsed = parseGithubUrl(githubUrl)
  if (!parsed) {
    console.log(`  ❌ ${fileId}: Failed to parse GitHub URL: ${githubUrl}`)
    return { fileId, stars: null, updated: false, skipped: false, error: true }
  }

  try {
    console.log(`  🔍 ${fileId}: Fetching stars for ${parsed.owner}/${parsed.repo}...`)
    const stars = await fetchStars(parsed.owner, parsed.repo)
    console.log(`  ✅ ${fileId}: ${stars}k stars`)

    // Sleep for 1 second to avoid rate limiting
    await sleep(1000)
    return { fileId, stars, updated: true, skipped: false, error: false }
  } catch (error) {
    console.log(`  ❌ ${fileId}: Error fetching stars:`, (error as Error).message)
    return { fileId, stars: null, updated: false, skipped: false, error: true }
  }
}

// Process all files in a directory
// Maps file names (without .json) to stars data based on githubUrl field
async function processDirectory(
  dirConfig: DirConfig,
  existingCategoryData: Record<string, number | null>
): Promise<DirectoryResult> {
  const dirPath = path.join(__dirname, '..', '..', dirConfig.directory)
  console.log(`\n📁 Processing ${dirConfig.directory}...`)

  if (!fs.existsSync(dirPath)) {
    console.log(`  ⚠️  Directory not found: ${dirPath}`)
    return { categoryData: {}, stats: { updated: 0, skipped: 0, errors: 0 } }
  }

  // Get all JSON files in the directory
  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.json'))

  if (files.length === 0) {
    console.log(`  ⚠️  No JSON files found in ${dirConfig.directory}`)
    return { categoryData: {}, stats: { updated: 0, skipped: 0, errors: 0 } }
  }

  let updated = 0
  let skipped = 0
  let errors = 0
  const categoryData: Record<string, number | null> = {}

  // Process each file and map by filename (without .json extension)
  for (const file of files) {
    const filePath = path.join(dirPath, file)
    const result = await processFile(filePath, file)

    if (result.updated) updated++
    if (result.skipped) skipped++
    if (result.error) errors++

    // Map file ID (filename without .json) to stars value (can be null)
    categoryData[result.fileId] = result.error
      ? (existingCategoryData[result.fileId] ?? null)
      : result.stars
  }

  console.log(
    `\n✨ ${dirConfig.directory} completed: ${updated} updated, ${skipped} skipped, ${errors} errors`
  )
  return { categoryData, stats: { updated, skipped, errors } }
}

// Main function
async function main(): Promise<void> {
  console.log('🚀 Starting GitHub stars fetcher...\n')
  console.log('📝 Note: Updating centralized github-stars.json file\n')

  if (!GITHUB_TOKEN) {
    console.log('⚠️  Warning: No GITHUB_TOKEN set. You may hit rate limits (60 requests/hour).')
    console.log('   Set it with: GITHUB_TOKEN=your_token node fetch-github-stars.ts\n')
  } else {
    console.log('✅ Using GitHub token for authentication\n')
  }

  // Load existing stars data or create new structure
  let starsData: StarsData = { extensions: {}, clis: {}, ides: {} }
  if (fs.existsSync(GITHUB_STARS_FILE)) {
    try {
      const content = fs.readFileSync(GITHUB_STARS_FILE, 'utf8')
      starsData = JSON.parse(content) as StarsData
      console.log('📂 Loaded existing github-stars.json\n')
    } catch {
      console.log('⚠️  Failed to parse existing github-stars.json, creating new one\n')
    }
  }

  let totalUpdated = 0
  let totalSkipped = 0
  let totalErrors = 0

  // Process each directory and collect stars data
  // Maps file names to stars based on githubUrl field in each manifest file
  for (const dirConfig of dirsConfig) {
    try {
      const { categoryData, stats } = await processDirectory(
        dirConfig,
        starsData[dirConfig.category] ?? {}
      )

      // Sort the category data by key (alphabetically)
      const sortedCategoryData = Object.keys(categoryData)
        .sort()
        .reduce<Record<string, number | null>>((acc, key) => {
          acc[key] = categoryData[key] ?? null
          return acc
        }, {})

      // Update the stars data for this category
      // This will include all files, with null values for items without githubUrl
      starsData[dirConfig.category] = sortedCategoryData

      totalUpdated += stats.updated
      totalSkipped += stats.skipped
      totalErrors += stats.errors
    } catch (error) {
      console.error(`❌ Failed to process ${dirConfig.directory}:`, (error as Error).message)
      totalErrors++
    }
  }

  // Write the updated stars data to file
  try {
    fs.writeFileSync(GITHUB_STARS_FILE, `${JSON.stringify(starsData, null, 2)}\n`, 'utf8')
    console.log('\n📝 Successfully updated data/github-stars.json')
  } catch (error) {
    console.error('\n❌ Failed to write github-stars.json:', (error as Error).message)
    process.exit(1)
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log('🎉 All directories processed!')
  console.log(`📊 Total: ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`)
  console.log('='.repeat(50))
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
