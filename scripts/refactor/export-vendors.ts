#!/usr/bin/env node

/**
 * Export vendors from manifest files
 * This script extracts vendor information from ide/cli/extension/model/provider
 * manifest files and creates vendor files if they don't exist.
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT_DIR = path.resolve(__dirname, '../..')
const MANIFESTS_DIR = path.join(ROOT_DIR, 'manifests')
const VENDORS_DIR = path.join(MANIFESTS_DIR, 'vendors')

interface VendorData {
  name: string
  websiteUrl: string | null
  docsUrl: string | null
  verified: boolean
  communityUrls: CommunityUrls | null
  i18n: Record<string, { description?: string }> | null
}

interface CommunityUrls {
  linkedin: string | null
  twitter: string | null
  github: string | null
  youtube: string | null
  discord: string | null
  reddit: string | null
  blog: string | null
}

interface VendorObject {
  id: string
  name: string
  description: string
  i18n: Record<string, { description?: string }>
  websiteUrl: string | null
  docsUrl: string | null
  verified: boolean
  communityUrls: CommunityUrls
}

/**
 * Convert vendor name to vendor id
 * Rules: lowercase, replace spaces and dots with hyphens
 * @param vendorName - The vendor name
 * @returns The vendor id
 */
function vendorNameToId(vendorName: string): string {
  return vendorName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/\./g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Load and parse a JSON file
 * @param filePath - Path to the JSON file
 * @returns Parsed JSON object
 */
async function loadJSON(filePath: string): Promise<Record<string, unknown>> {
  const content = await fs.readFile(filePath, 'utf8')
  return JSON.parse(content) as Record<string, unknown>
}

/**
 * Check if a file exists
 * @param filePath - Path to the file
 * @returns True if file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Get all JSON files in a directory
 * @param dirPath - Directory path
 * @returns Array of JSON file paths
 */
async function getJsonFiles(dirPath: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true })
    const jsonFiles: string[] = []

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.json')) {
        jsonFiles.push(path.join(dirPath, entry.name))
      }
    }

    return jsonFiles.sort()
  } catch {
    return []
  }
}

/**
 * Merge community URLs objects
 * Priority: existing value > new value (if existing is null/undefined, use new)
 * @param existing - Existing communityUrls object
 * @param newUrls - New communityUrls object
 * @returns Merged communityUrls object
 */
function mergeCommunityUrls(
  existing: CommunityUrls | null,
  newUrls: CommunityUrls | null
): CommunityUrls {
  const result: CommunityUrls = {
    linkedin: null,
    twitter: null,
    github: null,
    youtube: null,
    discord: null,
    reddit: null,
    blog: null,
  }

  // Start with existing values
  if (existing) {
    const keys = Object.keys(result) as Array<keyof CommunityUrls>
    for (const key of keys) {
      result[key] = existing[key] || null
    }
  }

  // Override with new values if existing is null
  if (newUrls) {
    const keys = Object.keys(result) as Array<keyof CommunityUrls>
    for (const key of keys) {
      if (!result[key] && newUrls[key]) {
        result[key] = newUrls[key]
      }
    }
  }

  return result
}

/**
 * Merge vendor information from multiple manifests
 * Priority: existing value > new value (if existing is null/undefined, use new)
 * @param existing - Existing vendor data
 * @param newData - New vendor data from manifest
 * @returns Merged vendor data
 */
function mergeVendorData(existing: VendorData, newData: VendorData): VendorData {
  const merged: VendorData = { ...existing }

  // Merge basic fields
  if (!merged.websiteUrl && newData.websiteUrl) {
    merged.websiteUrl = newData.websiteUrl
  }

  if (!merged.docsUrl && newData.docsUrl) {
    merged.docsUrl = newData.docsUrl
  }

  if (merged.verified === undefined && newData.verified !== undefined) {
    merged.verified = newData.verified
  }

  // Merge communityUrls
  merged.communityUrls = mergeCommunityUrls(merged.communityUrls, newData.communityUrls)

  // Merge i18n if both exist
  if (newData.i18n) {
    if (!merged.i18n) {
      merged.i18n = {}
    }
    // Merge i18n descriptions for each locale
    for (const locale of Object.keys(newData.i18n)) {
      if (!merged.i18n[locale]) {
        merged.i18n[locale] = {}
      }
      if (!merged.i18n[locale].description && newData.i18n[locale]?.description) {
        merged.i18n[locale].description = newData.i18n[locale].description
      }
    }
  }

  return merged
}

/**
 * Extract vendor information from a manifest file
 * @param manifest - The manifest object
 * @returns Extracted vendor data or null if no vendor field
 */
function extractVendorData(manifest: Record<string, unknown>): VendorData | null {
  if (!manifest.vendor) {
    return null
  }

  const vendorData: VendorData = {
    name: manifest.vendor as string,
    websiteUrl: (manifest.websiteUrl as string | null) || null,
    docsUrl: (manifest.docsUrl as string | null) || null,
    verified:
      (manifest.verified as boolean | undefined) !== undefined
        ? (manifest.verified as boolean)
        : false,
    communityUrls: (manifest.communityUrls as CommunityUrls | null) || null,
    i18n: (manifest.i18n as Record<string, { description?: string }> | null) || null,
  }

  return vendorData
}

/**
 * Create a vendor file from vendor data
 * @param vendorId - The vendor id
 * @param vendorData - The vendor data
 * @returns Complete vendor object
 */
function createVendorObject(vendorId: string, vendorData: VendorData): VendorObject {
  // Default description if not provided
  const defaultDescription = `${vendorData.name} is a vendor.`

  const vendor: VendorObject = {
    id: vendorId,
    name: vendorData.name,
    description: (vendorData as { description?: string }).description || defaultDescription,
    i18n: vendorData.i18n || {},
    websiteUrl: vendorData.websiteUrl || null,
    docsUrl: vendorData.docsUrl || null,
    verified: vendorData.verified !== undefined ? vendorData.verified : false,
    communityUrls: mergeCommunityUrls(null, vendorData.communityUrls),
  }

  return vendor
}

/**
 * Process a single manifest file and extract vendor information
 * @param manifestPath - Path to the manifest file
 * @param vendorsMap - Map of vendor id to vendor data
 */
async function processManifest(
  manifestPath: string,
  vendorsMap: Map<string, VendorData>
): Promise<void> {
  try {
    const manifest = await loadJSON(manifestPath)
    const vendorData = extractVendorData(manifest)

    if (!vendorData) {
      return
    }

    const vendorId = vendorNameToId(vendorData.name)

    // If vendor already exists in map, merge the data
    if (vendorsMap.has(vendorId)) {
      const existing = vendorsMap.get(vendorId)!
      vendorsMap.set(vendorId, mergeVendorData(existing, vendorData))
    } else {
      vendorsMap.set(vendorId, vendorData)
    }
  } catch (error) {
    console.error(`  ⚠️  Error processing ${manifestPath}:`, (error as Error).message)
  }
}

/**
 * Process all manifest files in a directory
 * @param categoryDir - Directory path
 * @param vendorsMap - Map of vendor id to vendor data
 */
async function processCategory(
  categoryDir: string,
  vendorsMap: Map<string, VendorData>
): Promise<void> {
  const jsonFiles = await getJsonFiles(categoryDir)

  if (jsonFiles.length === 0) {
    return
  }

  for (const jsonFile of jsonFiles) {
    await processManifest(jsonFile, vendorsMap)
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  console.log('🔄 Exporting vendors from manifest files...\n')

  // Categories to process
  const categories = ['ides', 'clis', 'extensions', 'models', 'providers']

  // Map to store vendor data (vendorId -> vendorData)
  const vendorsMap = new Map<string, VendorData>()

  // Process all categories
  for (const category of categories) {
    const categoryDir = path.join(MANIFESTS_DIR, category)
    console.log(`📁 Processing ${category}/...`)

    await processCategory(categoryDir, vendorsMap)
  }

  console.log(`\n📊 Found ${vendorsMap.size} unique vendors\n`)

  // Create vendor files
  let createdCount = 0
  let skippedCount = 0

  for (const [vendorId, vendorData] of vendorsMap) {
    const vendorFilePath = path.join(VENDORS_DIR, `${vendorId}.json`)

    // Check if vendor file already exists
    if (await fileExists(vendorFilePath)) {
      console.log(`⏭️  Skipping ${vendorId} (already exists)`)
      skippedCount++
      continue
    }

    // Create vendor object
    const vendor = createVendorObject(vendorId, vendorData)

    // Write vendor file
    const jsonContent = `${JSON.stringify(vendor, null, 2)}\n`
    await fs.writeFile(vendorFilePath, jsonContent, 'utf-8')

    console.log(`✅ Created ${vendorId}.json`)
    createdCount++
  }

  console.log(`\n✨ Done!`)
  console.log(`   Created: ${createdCount} vendors`)
  console.log(`   Skipped: ${skippedCount} vendors`)
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
