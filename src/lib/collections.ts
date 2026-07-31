import collectionsData from '@/../manifests/collections.json'
import type { Locale } from '@/i18n/config'
import { localizeManifestItem } from './manifest-i18n'

export interface CollectionItem {
  id: string
  name: string
  url: string
  description: string
  publishedAt?: string
  lastVerifiedAt?: string
  status?: 'public-preview'
  i18n?: {
    [locale: string]: {
      name?: string
      description?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: unknown
}

export interface CollectionSubSection {
  id: string
  title: string
  items: CollectionItem[]
  i18n?: {
    [locale: string]: {
      title?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: unknown
}

export interface CollectionSection {
  title: string
  description: string
  sections: CollectionSubSection[]
  i18n?: {
    [locale: string]: {
      title?: string
      description?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: unknown
}

export interface Collections {
  [key: string]: CollectionSection
}

export interface CollectionSearchEntry {
  id: string
  name: string
  description: string
  href: string
  data: CollectionItem
}

export function getCollectionItemAnchor(
  sectionId: string,
  subSectionId: string,
  itemId: string
): string {
  return `${sectionId}-${subSectionId}-${itemId}`
}

// Localize a single collection item
function localizeCollectionItem(item: CollectionItem, locale: Locale): CollectionItem {
  return localizeManifestItem(item, locale, ['name', 'description'])
}

// Localize a collection subsection
function localizeCollectionSubSection(
  subSection: CollectionSubSection,
  locale: Locale
): CollectionSubSection {
  return {
    ...localizeManifestItem(subSection, locale, ['title']),
    items: subSection.items.map(item => localizeCollectionItem(item, locale)),
  }
}

// Localize a collection section
function localizeCollectionSection(section: CollectionSection, locale: Locale): CollectionSection {
  return {
    ...localizeManifestItem(section, locale, ['title', 'description']),
    sections: section.sections.map(subSection => localizeCollectionSubSection(subSection, locale)),
  }
}

// Get collections for a specific locale with fallback to English
export function getCollections(locale: string): Collections {
  const typedLocale = locale as Locale
  const collections: Collections = {}

  // Dynamically process all collection sections from the manifest
  for (const [key, section] of Object.entries(collectionsData)) {
    // Skip $schema property
    if (key === '$schema') continue
    collections[key] = localizeCollectionSection(section as CollectionSection, typedLocale)
  }

  return collections
}

// Get collection section IDs in order
export function getCollectionSectionIds(): string[] {
  return Object.keys(collectionsData).filter(key => key !== '$schema')
}

export function getCollectionSearchEntries(locale: string): CollectionSearchEntry[] {
  const collections = getCollections(locale)
  const entries: CollectionSearchEntry[] = []

  for (const sectionId of getCollectionSectionIds()) {
    const section = collections[sectionId]
    if (!section) continue

    for (const subSection of section.sections) {
      for (const item of subSection.items) {
        entries.push({
          id: getCollectionItemAnchor(sectionId, subSection.id, item.id),
          name: item.name,
          description: item.description,
          href: `/curated-collections#${getCollectionItemAnchor(sectionId, subSection.id, item.id)}`,
          data: item,
        })
      }
    }
  }

  return entries
}
