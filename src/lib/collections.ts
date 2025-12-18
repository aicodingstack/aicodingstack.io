import collectionsData from '@/../manifests/collections.json'
import type { Locale } from '@/i18n/config'
import { localizeManifestItem } from './manifest-i18n'

export interface CollectionItem {
  name: string
  url: string
  description: string
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
