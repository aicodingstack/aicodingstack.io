export interface CLILandingItem {
  title: string
  description: string
}

export interface CLILandingFAQItem {
  question: string
  answer: string
}

export interface CLILandingContent {
  answer: string
  introduction: string
  capabilities: {
    items: CLILandingItem[]
  }
  verification: {
    description: string
  }
  faq: {
    items: CLILandingFAQItem[]
  }
}

const KEY_HEADING_PATTERN = /^##\s+([a-z][a-zA-Z0-9]*(?:\.(?:[a-zA-Z][a-zA-Z0-9]*|\d+))*)\s*$/

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseSections(markdown: string, source: string): Map<string, string> {
  const sections = new Map<string, string>()
  let currentKey: string | null = null
  let currentLines: string[] = []

  const finishSection = (): void => {
    if (!currentKey) return

    const value = currentLines.join('\n').trim()
    if (!value) {
      throw new Error(`${source}: section ${currentKey} is empty`)
    }
    if (sections.has(currentKey)) {
      throw new Error(`${source}: duplicate section ${currentKey}`)
    }

    sections.set(currentKey, value)
  }

  for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
    if (line.startsWith('## ')) {
      finishSection()
      const match = line.match(KEY_HEADING_PATTERN)
      if (!match?.[1]) {
        throw new Error(`${source}: invalid keyed heading ${JSON.stringify(line)}`)
      }
      currentKey = match[1]
      currentLines = []
      continue
    }

    if (/^#{2,6}\s/.test(line)) {
      throw new Error(`${source}: only level-two keyed headings are allowed`)
    }

    if (!currentKey && line.trim()) {
      throw new Error(`${source}: content must start with a level-two keyed heading`)
    }

    if (currentKey) {
      currentLines.push(line)
    }
  }

  finishSection()
  return sections
}

function requiredSection(
  sections: Map<string, string>,
  consumed: Set<string>,
  key: string,
  source: string
): string {
  const value = sections.get(key)
  if (!value) {
    throw new Error(`${source}: missing section ${key}`)
  }
  consumed.add(key)
  return value
}

function indexedItems<T>(
  sections: Map<string, string>,
  consumed: Set<string>,
  prefix: string,
  fields: readonly [keyof T & string, keyof T & string],
  source: string
): T[] {
  const indexes = new Set<number>()
  const pattern = new RegExp(`^${escapeRegExp(prefix)}\\.(\\d+)\\.(?:${fields.join('|')})$`)

  for (const key of sections.keys()) {
    const match = key.match(pattern)
    if (match?.[1]) indexes.add(Number(match[1]))
  }

  const orderedIndexes = [...indexes].sort((left, right) => left - right)
  if (orderedIndexes.length === 0 || orderedIndexes.some((index, position) => index !== position)) {
    throw new Error(`${source}: ${prefix} indexes must be contiguous and start at 0`)
  }

  return orderedIndexes.map(
    index =>
      Object.fromEntries(
        fields.map(field => {
          const key = `${prefix}.${index}.${field}`
          return [field, requiredSection(sections, consumed, key, source)]
        })
      ) as T
  )
}

export function parseCLILandingMarkdown(
  markdown: string,
  source = 'CLI landing-page Markdown'
): CLILandingContent {
  const sections = parseSections(markdown, source)
  const consumed = new Set<string>()
  const get = (key: string): string => requiredSection(sections, consumed, key, source)

  const content: CLILandingContent = {
    answer: get('answer'),
    introduction: get('introduction'),
    capabilities: {
      items: indexedItems<CLILandingItem>(
        sections,
        consumed,
        'capabilities.items',
        ['title', 'description'],
        source
      ),
    },
    verification: {
      description: get('verification.description'),
    },
    faq: {
      items: indexedItems<CLILandingFAQItem>(
        sections,
        consumed,
        'faq.items',
        ['question', 'answer'],
        source
      ),
    },
  }

  const unexpectedKeys = [...sections.keys()].filter(key => !consumed.has(key))
  if (unexpectedKeys.length > 0) {
    throw new Error(`${source}: unknown sections: ${unexpectedKeys.join(', ')}`)
  }

  return content
}
