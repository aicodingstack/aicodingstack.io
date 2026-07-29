#!/usr/bin/env node

/**
 * Build script to extract MDX metadata at build time
 * This eliminates runtime fs calls, making it compatible with Cloudflare Edge
 */

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '../..')

interface ArticleMetadata {
  slug: string
  title: string
  description: string
  date: string
}

interface DocSection {
  id: string
  slug: string
  title: string
}

interface FaqItem {
  title: string
  content: string
}

interface CollectionSection {
  [key: string]: unknown
}

// Read supported locales from i18n config
function getSupportedLocales(): string[] {
  const configPath = path.join(rootDir, 'src/i18n/config.ts')
  const configContent = fs.readFileSync(configPath, 'utf8')
  // Extract the content between "export const locales = [" and "] as const"
  const arrayMatch = configContent.match(/export const locales = \[([\s\S]*?)\] as const/)
  if (!arrayMatch) {
    throw new Error('Could not find locales export in src/i18n/config.ts')
  }
  // Extract all quoted strings from the array content
  const stringMatches = arrayMatch[1]?.matchAll(/'([^']+)'/g)
  if (!stringMatches) return []
  return Array.from(stringMatches, m => m[1] ?? '').filter(Boolean)
}

const SUPPORTED_LOCALES = getSupportedLocales()

function getMDXFiles(directory: string): string[] {
  return fs.readdirSync(directory).filter(file => file.endsWith('.mdx'))
}

function parseMDXFrontmatter(filePath: string): Record<string, unknown> {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(fileContents)
  return data
}

function getSlugFromFilename(fileName: string): string {
  return fileName.replace(/\.mdx$/, '')
}

// Parse FAQ sections from a unified index.mdx file
// Each H1 heading becomes a FAQ item with its title and content
function parseFaqSections(content: string): FaqItem[] {
  // Remove frontmatter if present
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '')

  // Split content by H1 headings (# Title)
  const sections: FaqItem[] = []
  const h1Regex = /^# (.+)$/gm
  const matches: { title: string; startIndex: number; endIndex: number }[] = []

  // Find all H1 headings and their positions
  let match = h1Regex.exec(withoutFrontmatter)
  while (match !== null) {
    const title = match[1]?.trim() ?? ''
    const index = match.index ?? 0
    const matchLength = match[0]?.length ?? 0
    matches.push({
      title,
      startIndex: index,
      endIndex: index + matchLength,
    })
    match = h1Regex.exec(withoutFrontmatter)
  }

  // Extract content for each section
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i]
    if (!currentMatch) continue
    const nextMatch = matches[i + 1]

    // Content is everything after the H1 until the next H1 (or end of file)
    const contentStart = currentMatch.endIndex
    const contentEnd = nextMatch ? nextMatch.startIndex : withoutFrontmatter.length
    const content = withoutFrontmatter.slice(contentStart, contentEnd).trim()

    sections.push({
      title: currentMatch.title,
      content: content,
    })
  }

  return sections
}

// Generate articles metadata for a specific locale
function generateArticlesMetadataForLocale(locale: string): ArticleMetadata[] {
  const articlesDirectory = path.join(rootDir, `content/articles/${locale}`)

  // Return empty array if locale directory doesn't exist
  if (!fs.existsSync(articlesDirectory)) {
    return []
  }

  const fileNames = getMDXFiles(articlesDirectory)

  const articles = fileNames.map(fileName => {
    const slug = getSlugFromFilename(fileName)
    const fullPath = path.join(articlesDirectory, fileName)
    const frontmatter = parseMDXFrontmatter(fullPath)

    return {
      slug,
      title: frontmatter.title as string,
      description: frontmatter.description as string,
      date: frontmatter.date as string,
    }
  })

  // Sort articles by date (newest first)
  return articles.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

// Generate articles metadata for all locales
function generateArticlesMetadata(): Record<string, ArticleMetadata[]> {
  const articlesMetadata: Record<string, ArticleMetadata[]> = {}

  for (const locale of SUPPORTED_LOCALES) {
    articlesMetadata[locale] = generateArticlesMetadataForLocale(locale)
  }

  return articlesMetadata
}

// Generate docs metadata for a specific locale
function generateDocsMetadataForLocale(locale: string): DocSection[] {
  const docsDirectory = path.join(rootDir, `content/docs/${locale}`)

  // Return empty array if locale directory doesn't exist
  if (!fs.existsSync(docsDirectory)) {
    return []
  }

  const fileNames = getMDXFiles(docsDirectory)

  const docs = fileNames.map(fileName => {
    const slug = getSlugFromFilename(fileName)
    const fullPath = path.join(docsDirectory, fileName)
    const frontmatter = parseMDXFrontmatter(fullPath)

    return {
      id: slug,
      slug,
      title: frontmatter.title as string,
    }
  })

  // Sort docs by slug (alphabetically)
  return docs.sort((a, b) => a.slug.localeCompare(b.slug))
}

// Generate docs metadata for all locales
function generateDocsMetadata(): Record<string, DocSection[]> {
  const docsMetadata: Record<string, DocSection[]> = {}

  for (const locale of SUPPORTED_LOCALES) {
    docsMetadata[locale] = generateDocsMetadataForLocale(locale)
  }

  return docsMetadata
}

// Generate collections metadata from JSON file
function generateCollectionsMetadata(): Record<string, CollectionSection> {
  const collectionsFile = path.join(rootDir, 'manifests/collections.json')

  if (!fs.existsSync(collectionsFile)) {
    console.warn('⚠️  Collections file not found, skipping...')
    return {}
  }

  const fileContents = fs.readFileSync(collectionsFile, 'utf8')
  const collectionsData = JSON.parse(fileContents)

  // Remove $schema property as it's not part of the CollectionSection type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { $schema: _$schema, ...collections } = collectionsData as Record<string, unknown>
  return collections as Record<string, CollectionSection>
}

// Generate FAQ metadata for a specific locale
function generateFaqMetadataForLocale(locale: string): FaqItem[] {
  const faqIndexPath = path.join(rootDir, `content/faq/${locale}/index.mdx`)

  // Return empty array if index file doesn't exist
  if (!fs.existsSync(faqIndexPath)) {
    console.warn(`⚠️  FAQ index file not found: ${faqIndexPath}`)
    return []
  }

  const fileContents = fs.readFileSync(faqIndexPath, 'utf8')
  const faqSections = parseFaqSections(fileContents)

  return faqSections
}

// Generate FAQ metadata for all locales
function generateFaqMetadata(): Record<string, FaqItem[]> {
  const faqMetadata: Record<string, FaqItem[]> = {}

  for (const locale of SUPPORTED_LOCALES) {
    faqMetadata[locale] = generateFaqMetadataForLocale(locale)
  }

  return faqMetadata
}

// Generate stack counts from manifest files
function generateStackCounts(): Record<string, number> {
  // Directories containing individual JSON files (new structure)
  const manifestDirectories: Record<string, string> = {
    ides: 'ides',
    clis: 'clis',
    desktops: 'desktops',
    extensions: 'extensions',
    models: 'models',
    'model-providers': 'providers',
    vendors: 'vendors',
  }

  const stackCounts: Record<string, number> = {}

  // Count files in directories
  for (const [stackId, dirName] of Object.entries(manifestDirectories)) {
    const manifestDir = path.join(rootDir, 'manifests', dirName)

    if (!fs.existsSync(manifestDir)) {
      console.warn(`⚠️  Manifest directory not found: ${manifestDir}`)
      stackCounts[stackId] = 0
      continue
    }

    try {
      const files = fs.readdirSync(manifestDir).filter(file => file.endsWith('.json'))
      stackCounts[stackId] = files.length
    } catch (error) {
      console.error(`❌ Error reading directory ${dirName}:`, (error as Error).message)
      stackCounts[stackId] = 0
    }
  }

  return stackCounts
}

// Generate component imports for articles
function generateArticleComponentsCode(articles: Record<string, ArticleMetadata[]>): string {
  const locales = Object.keys(articles)
  const componentLines: string[] = []

  for (const locale of locales) {
    const localeArticles = articles[locale]
    if (!localeArticles) continue
    const componentEntries = localeArticles
      .map(article => {
        const importLine = `    '${article.slug}': () => import('@content/articles/${locale}/${article.slug}.mdx'),`
        // Only split if line is very long (>100 chars)
        if (importLine.length > 100) {
          return `    '${article.slug}': () =>\n      import('@content/articles/${locale}/${article.slug}.mdx'),`
        }
        return importLine
      })
      .join('\n')

    if (componentEntries) {
      // Quote locale keys that contain hyphens or special characters
      const localeKey = locale.includes('-') ? `'${locale}'` : locale
      componentLines.push(`  ${localeKey}: {\n${componentEntries}\n  },`)
    }
  }

  return `const articleComponents: Record<
  string,
  Record<string, () => Promise<{ default: React.ComponentType }>>
> = {\n${componentLines.join('\n')}\n}`
}

// Generate component imports for docs
function generateDocComponentsCode(docs: Record<string, DocSection[]>): string {
  const locales = Object.keys(docs)
  const componentLines: string[] = []

  for (const locale of locales) {
    const localeDocs = docs[locale]
    if (!localeDocs) continue
    const componentEntries = localeDocs
      .map(doc => {
        // Use unquoted keys for simple identifiers
        const key = /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(doc.slug) ? doc.slug : `'${doc.slug}'`
        return `    ${key}: () => import('@content/docs/${locale}/${doc.slug}.mdx'),`
      })
      .join('\n')

    if (componentEntries) {
      // Quote locale keys that contain hyphens or special characters
      const localeKey = locale.includes('-') ? `'${locale}'` : locale
      componentLines.push(`  ${localeKey}: {\n${componentEntries}\n  },`)
    }
  }

  return `const docComponents: Record<
  string,
  Record<string, () => Promise<{ default: React.ComponentType }>>
> = {\n${componentLines.join('\n')}\n}`
}

// Generate component import for manifesto (single index.mdx per locale)
function generateManifestoComponentsCode(): string {
  const componentLines: string[] = []

  for (const locale of SUPPORTED_LOCALES) {
    const manifestoIndex = path.join(rootDir, `content/manifesto/${locale}/index.mdx`)
    if (fs.existsSync(manifestoIndex)) {
      // Quote locale keys that contain hyphens or special characters
      const localeKey = locale.includes('-') ? `'${locale}'` : locale
      componentLines.push(
        `    ${localeKey}: () => import('@content/manifesto/${locale}/index.mdx'),`
      )
    }
  }

  return `  const components: Record<string, () => Promise<{ default: React.ComponentType }>> = {\n${componentLines.join('\n')}\n  }`
}

// Main execution
function main(): void {
  console.log('Generating MDX metadata...')

  const articles = generateArticlesMetadata()
  const docs = generateDocsMetadata()
  const collections = generateCollectionsMetadata()
  const faqs = generateFaqMetadata()
  const stackCounts = generateStackCounts()

  // Write metadata to TypeScript file
  const outputDir = path.join(rootDir, 'src/lib/generated')
  const outputFile = path.join(outputDir, 'metadata.ts')

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const header = `// This file is auto-generated by scripts/generate-metadata.ts\n// DO NOT EDIT MANUALLY`

  // Custom JSON stringify that uses single quotes and unquoted keys
  function formatObject(obj: unknown, indent = 0): string {
    const spaces = '  '.repeat(indent)
    const innerSpaces = '  '.repeat(indent + 1)

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]'
      const items = obj.map(item => `${innerSpaces}${formatObject(item, indent + 1)}`).join(',\n')
      return `[\n${items},\n${spaces}]`
    }

    if (obj !== null && typeof obj === 'object') {
      const keys = Object.keys(obj)
      if (keys.length === 0) return '{}'
      const items = keys
        .map(key => {
          const quotedKey =
            /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(key) && !key.includes('-') ? key : `'${key}'`
          const value = formatObject((obj as Record<string, unknown>)[key], indent + 1)
          // Check if the line would be too long (>80 chars) and split if needed
          const fullLine = `${innerSpaces}${quotedKey}: ${value}`
          if (fullLine.length > 80 && typeof (obj as Record<string, unknown>)[key] === 'string') {
            return `${innerSpaces}${quotedKey}:\n${innerSpaces}  ${value}`
          }
          return fullLine
        })
        .join(',\n')
      return `{\n${items},\n${spaces}}`
    }

    if (typeof obj === 'string') {
      // Escape backslashes first, then escape single quotes, then escape newlines
      const escaped = obj
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      return `'${escaped}'`
    }

    return JSON.stringify(obj)
  }

  const content = `${header}

import type { CollectionSection } from '../collections'
import type { ArticleMetadata } from './articles'
import type { DocSection } from './docs'

export type FaqItem = {
  title: string
  content: string
}

export const articlesMetadata: Record<string, ArticleMetadata[]> = ${formatObject(articles)}

export const docsMetadata: Record<string, DocSection[]> = ${formatObject(docs)}

export const collectionsMetadata: Record<string, CollectionSection> = ${formatObject(collections)}

export const faqMetadata: Record<string, FaqItem[]> = ${formatObject(faqs)}

export const stackCounts: Record<string, number> = ${formatObject(stackCounts)}
`

  fs.writeFileSync(outputFile, content, 'utf8')

  // Generate articles.ts file in generated directory
  const articlesGeneratedFile = path.join(outputDir, 'articles.ts')
  const articlesComponentsCode = generateArticleComponentsCode(articles)
  const articlesGeneratedContent = `${header}

import { articlesMetadata } from './metadata'

export type ArticleMetadata = {
  title: string
  description: string
  date: string
  slug: string
}

// Get articles for a specific locale with fallback to English
export function getArticles(locale: string = 'en'): ArticleMetadata[] {
  return articlesMetadata[locale] || articlesMetadata.en || []
}

// Get all articles (backward compatibility)
export const articles: ArticleMetadata[] = getArticles('en')

// Get a specific article by slug for a given locale
export function getArticleBySlug(slug: string, locale: string = 'en'): ArticleMetadata | undefined {
  const localeArticles = getArticles(locale)
  return localeArticles.find(article => article.slug === slug)
}

// MDX components mapping for all locales (dynamic imports)
${articlesComponentsCode}

// Get a specific article component for a given locale and slug
export async function getArticleComponent(
  locale: string = 'en',
  slug: string
): Promise<React.ComponentType | null> {
  const loaders = articleComponents[locale] || articleComponents.en
  const loader = loaders?.[slug]
  if (!loader) return null
  const mdxModule = await loader()
  return mdxModule.default
}
`

  fs.writeFileSync(articlesGeneratedFile, articlesGeneratedContent, 'utf8')

  // Generate docs.ts file in generated directory
  const docsGeneratedFile = path.join(outputDir, 'docs.ts')
  const docsComponentsCode = generateDocComponentsCode(docs)
  const docsGeneratedContent = `${header}

import { docsMetadata } from './metadata'

export type DocSection = {
  id: string
  title: string
  slug: string
}

// Get doc sections for a specific locale with fallback to English
export function getDocSections(locale: string): DocSection[] {
  return docsMetadata[locale] || docsMetadata.en || []
}

// Get all doc sections (backward compatibility)
export const docSections: DocSection[] = getDocSections('en')

// Get a specific doc by slug for a given locale
export function getDocBySlug(slug: string, locale: string = 'en'): DocSection | undefined {
  const sections = getDocSections(locale)
  return sections.find(doc => doc.slug === slug)
}

// MDX components mapping for all locales (dynamic imports)
${docsComponentsCode}

// Get a specific doc component for a given locale and slug
export async function getDocComponent(
  locale: string = 'en',
  slug: string
): Promise<React.ComponentType | null> {
  const loaders = docComponents[locale] || docComponents.en
  const loader = loaders?.[slug]
  if (!loader) return null
  const mdxModule = await loader()
  return mdxModule.default
}
`

  fs.writeFileSync(docsGeneratedFile, docsGeneratedContent, 'utf8')

  // Generate manifesto.ts file in generated directory
  const manifestoGeneratedFile = path.join(outputDir, 'manifesto.ts')
  const manifestoComponentsCode = generateManifestoComponentsCode()
  const manifestoGeneratedContent = `${header}

/**
 * Return the Manifesto MDX React component for a given locale.
 * Falls back to the default locale ('en') when the requested locale is missing.
 */
export async function getManifestoComponent(locale: string = 'en'): Promise<React.ComponentType> {
${manifestoComponentsCode}

  const loader = components[locale] || components.en
  if (!loader) {
    throw new Error(\`No manifesto loader found for locale: \${locale}\`)
  }
  const mdxModule = await loader()
  return mdxModule.default
}
`

  fs.writeFileSync(manifestoGeneratedFile, manifestoGeneratedContent, 'utf8')

  // Calculate total docs, articles, and faqs across all locales
  const totalDocs = Object.values(docs).reduce((sum, localeDocs) => sum + localeDocs.length, 0)
  const totalArticles = Object.values(articles).reduce(
    (sum, localeArticles) => sum + localeArticles.length,
    0
  )
  const totalFaqs = Object.values(faqs).reduce((sum, localeFaqs) => sum + localeFaqs.length, 0)
  const docsLocalesCounts = Object.entries(docs)
    .map(([locale, localeDocs]) => `${locale}: ${localeDocs.length}`)
    .join(', ')
  const articlesLocalesCounts = Object.entries(articles)
    .map(([locale, localeArticles]) => `${locale}: ${localeArticles.length}`)
    .join(', ')
  const faqsLocalesCounts = Object.entries(faqs)
    .map(([locale, localeFaqs]) => `${locale}: ${localeFaqs.length}`)
    .join(', ')
  const collectionsLocales = Object.keys(collections).join(', ')
  const stackCountsSummary = Object.entries(stackCounts)
    .map(([stack, count]) => `${stack}: ${count}`)
    .join(', ')

  console.log(
    `✅ Generated metadata for ${totalArticles} articles (${articlesLocalesCounts}), ${totalDocs} docs (${docsLocalesCounts}), ${totalFaqs} faqs (${faqsLocalesCounts}), and collections (${collectionsLocales})`
  )
  console.log(`✅ Generated stack counts: ${stackCountsSummary}`)
  console.log(`📝 Generated files:`)
  console.log(`   - ${path.relative(rootDir, outputFile)}`)
  console.log(`   - ${path.relative(rootDir, articlesGeneratedFile)}`)
  console.log(`   - ${path.relative(rootDir, docsGeneratedFile)}`)
  console.log(`   - ${path.relative(rootDir, manifestoGeneratedFile)}`)

  // Validate that content counts are consistent across all locales
  console.log(`\n🔍 Validating content consistency across locales...`)
  let hasError = false

  // Validate articles count consistency
  const articleCounts = Object.entries(articles).map(([locale, localeArticles]) => ({
    locale,
    count: localeArticles.length,
  }))
  const articleCountSet = new Set(articleCounts.map(item => item.count))
  if (articleCountSet.size > 1) {
    console.error(`❌ Articles count mismatch across locales:`)
    articleCounts.forEach(({ locale, count }) => {
      console.error(`   ${locale}: ${count}`)
    })
    hasError = true
  }

  // Validate docs count consistency
  const docCounts = Object.entries(docs).map(([locale, localeDocs]) => ({
    locale,
    count: localeDocs.length,
  }))
  const docCountSet = new Set(docCounts.map(item => item.count))
  if (docCountSet.size > 1) {
    console.error(`❌ Docs count mismatch across locales:`)
    docCounts.forEach(({ locale, count }) => {
      console.error(`   ${locale}: ${count}`)
    })
    hasError = true
  }

  // Validate FAQs count consistency
  const faqCounts = Object.entries(faqs).map(([locale, localeFaqs]) => ({
    locale,
    count: localeFaqs.length,
  }))
  const faqCountSet = new Set(faqCounts.map(item => item.count))
  if (faqCountSet.size > 1) {
    console.error(`❌ FAQs count mismatch across locales:`)
    faqCounts.forEach(({ locale, count }) => {
      console.error(`   ${locale}: ${count}`)
    })
    hasError = true
  }

  // Validate manifesto existence for all locales
  const manifestoLocales: string[] = []
  for (const locale of SUPPORTED_LOCALES) {
    const manifestoIndex = path.join(rootDir, `content/manifesto/${locale}/index.mdx`)
    if (fs.existsSync(manifestoIndex)) {
      manifestoLocales.push(locale)
    }
  }
  if (manifestoLocales.length !== SUPPORTED_LOCALES.length) {
    const missingLocales = SUPPORTED_LOCALES.filter(locale => !manifestoLocales.includes(locale))
    console.error(`❌ Manifesto missing for locales: ${missingLocales.join(', ')}`)
    hasError = true
  }

  if (hasError) {
    console.error(
      `\n❌ Content consistency validation failed. Please ensure all locales have the same number of articles, docs, and FAQs.`
    )
    process.exit(1)
  }

  console.log(`✅ Content consistency validation passed`)

  // Run biome formatting on generated files
  console.log(`\n🎨 Formatting generated files with Biome...`)
  try {
    execSync(`pnpm exec biome format --write ${outputDir}`, {
      cwd: rootDir,
      stdio: 'inherit',
    })
    console.log(`✅ Formatting complete`)
  } catch (error) {
    console.error(`⚠️  Biome formatting failed:`, (error as Error).message)
  }
}

main()
