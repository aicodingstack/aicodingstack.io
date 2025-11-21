#!/usr/bin/env node

/**
 * Build script to extract MDX metadata at build time
 * This eliminates runtime fs calls, making it compatible with Cloudflare Edge
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')

// Read supported locales from i18n config
function getSupportedLocales() {
  const configPath = path.join(rootDir, 'src/i18n/config.ts')
  const configContent = fs.readFileSync(configPath, 'utf8')
  // Extract locales array from: export const locales = ['en', 'zh-Hans', 'de'] as const;
  const match = configContent.match(/export const locales = \[([^\]]+)\]/)
  if (!match) {
    throw new Error('Could not find locales export in src/i18n/config.ts')
  }
  // Parse the array: "'en', 'zh-Hans', 'de'" -> ['en', 'zh-Hans', 'de']
  return match[1].split(',').map(s => s.trim().replace(/['"]/g, ''))
}

const SUPPORTED_LOCALES = getSupportedLocales()

function getMDXFiles(directory) {
  return fs.readdirSync(directory).filter(file => file.endsWith('.mdx'))
}

function parseMDXFrontmatter(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8')
  const { data } = matter(fileContents)
  return data
}

function getSlugFromFilename(fileName) {
  return fileName.replace(/\.mdx$/, '')
}

// Parse FAQ sections from a unified index.mdx file
// Each H1 heading becomes a FAQ item with its title and content
function parseFaqSections(content) {
  // Remove frontmatter if present
  const withoutFrontmatter = content.replace(/^---[\s\S]*?---\n/, '')

  // Split content by H1 headings (# Title)
  const sections = []
  const h1Regex = /^# (.+)$/gm
  const matches = []

  // Find all H1 headings and their positions
  let match = h1Regex.exec(withoutFrontmatter)
  while (match !== null) {
    matches.push({
      title: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    })
    match = h1Regex.exec(withoutFrontmatter)
  }

  // Extract content for each section
  for (let i = 0; i < matches.length; i++) {
    const currentMatch = matches[i]
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
function generateArticlesMetadataForLocale(locale) {
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
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
    }
  })

  // Sort articles by date (newest first)
  return articles.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

// Generate articles metadata for all locales
function generateArticlesMetadata() {
  const articlesMetadata = {}

  for (const locale of SUPPORTED_LOCALES) {
    articlesMetadata[locale] = generateArticlesMetadataForLocale(locale)
  }

  return articlesMetadata
}

// Generate docs metadata for a specific locale
function generateDocsMetadataForLocale(locale) {
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
      title: frontmatter.title,
    }
  })

  // Sort docs by slug (alphabetically)
  return docs.sort((a, b) => a.slug.localeCompare(b.slug))
}

// Generate docs metadata for all locales
function generateDocsMetadata() {
  const docsMetadata = {}

  for (const locale of SUPPORTED_LOCALES) {
    docsMetadata[locale] = generateDocsMetadataForLocale(locale)
  }

  return docsMetadata
}

// Generate collections metadata from JSON file
function generateCollectionsMetadata() {
  const collectionsFile = path.join(rootDir, 'manifests/collections.json')

  if (!fs.existsSync(collectionsFile)) {
    console.warn('⚠️  Collections file not found, skipping...')
    return {}
  }

  const fileContents = fs.readFileSync(collectionsFile, 'utf8')
  return JSON.parse(fileContents)
}

// Generate FAQ metadata for a specific locale
function generateFaqMetadataForLocale(locale) {
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
function generateFaqMetadata() {
  const faqMetadata = {}

  for (const locale of SUPPORTED_LOCALES) {
    faqMetadata[locale] = generateFaqMetadataForLocale(locale)
  }

  return faqMetadata
}

// Generate stack counts from manifest files
function generateStackCounts() {
  // Directories containing individual JSON files (new structure)
  const manifestDirectories = {
    ides: 'ides',
    clis: 'clis',
    extensions: 'extensions',
    models: 'models',
    'model-providers': 'providers',
    vendors: 'vendors',
  }

  const stackCounts = {}

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
      console.error(`❌ Error reading directory ${dirName}:`, error.message)
      stackCounts[stackId] = 0
    }
  }

  return stackCounts
}

// Generate component imports for articles
function generateArticleComponentsCode(articles) {
  const locales = Object.keys(articles)
  const componentLines = []

  for (const locale of locales) {
    const localeArticles = articles[locale]
    const componentEntries = localeArticles
      .map(
        article =>
          `    '${article.slug}': () => import('@content/articles/${locale}/${article.slug}.mdx'),`
      )
      .join('\n')

    if (componentEntries) {
      // Quote locale keys that contain hyphens or special characters
      const localeKey = locale.includes('-') ? `'${locale}'` : locale
      componentLines.push(`  ${localeKey}: {\n${componentEntries}\n  },`)
    }
  }

  return `const articleComponents: Record<string, Record<string, () => Promise<{ default: React.ComponentType }>>> = {\n${componentLines.join('\n')}\n}`
}

// Generate component imports for docs
function generateDocComponentsCode(docs) {
  const locales = Object.keys(docs)
  const componentLines = []

  for (const locale of locales) {
    const localeDocs = docs[locale]
    const componentEntries = localeDocs
      .map(doc => `    '${doc.slug}': () => import('@content/docs/${locale}/${doc.slug}.mdx'),`)
      .join('\n')

    if (componentEntries) {
      // Quote locale keys that contain hyphens or special characters
      const localeKey = locale.includes('-') ? `'${locale}'` : locale
      componentLines.push(`  ${localeKey}: {\n${componentEntries}\n  },`)
    }
  }

  return `const docComponents: Record<string, Record<string, () => Promise<{ default: React.ComponentType }>>> = {\n${componentLines.join('\n')}\n}`
}

// Generate component import for manifesto (single index.mdx per locale)
function generateManifestoComponentsCode() {
  const componentLines = []

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
function main() {
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

  const header = `// This file is auto-generated by scripts/generate-metadata.mjs\n// DO NOT EDIT MANUALLY`

  const content = `${header}

import type { ArticleMetadata } from './articles';
import type { DocSection } from './docs';
import type { CollectionSection } from '../collections';
import type { FaqItem } from '../faq';

export const articlesMetadata: Record<string, ArticleMetadata[]> = ${JSON.stringify(articles, null, 2)};

export const docsMetadata: Record<string, DocSection[]> = ${JSON.stringify(docs, null, 2)};

export const collectionsMetadata: Record<string, CollectionSection> = ${JSON.stringify(collections, null, 2)};

export const faqMetadata: Record<string, FaqItem[]> = ${JSON.stringify(faqs, null, 2)};

export const stackCounts: Record<string, number> = ${JSON.stringify(stackCounts, null, 2)};
`

  fs.writeFileSync(outputFile, content, 'utf8')

  // Generate articles.ts file in generated directory
  const articlesGeneratedFile = path.join(outputDir, 'articles.ts')
  const articlesComponentsCode = generateArticleComponentsCode(articles)
  const articlesGeneratedContent = `${header}

import { articlesMetadata } from './metadata';

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
export async function getArticleComponent(locale: string = 'en', slug: string): Promise<React.ComponentType | null> {
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

import { docsMetadata } from './metadata';

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
export async function getDocComponent(locale: string = 'en', slug: string): Promise<React.ComponentType | null> {
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
}

main()
