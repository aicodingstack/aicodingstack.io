/**
 * Core reference resolution logic (shared between TypeScript and validation scripts)
 * This file contains the TypeScript implementation that can be used in both contexts.
 */

/**
 * Apply modifier to a string value.
 *
 * @param value - The string value to modify
 * @param modifier - The modifier to apply (upper, lower, capitalize)
 * @returns The modified string
 */
export function applyModifier(value: string, modifier?: string): string {
  if (!modifier) {
    return value
  }

  switch (modifier) {
    case 'upper':
      return value.toUpperCase()
    case 'lower':
      return value.toLowerCase()
    case 'capitalize':
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    default:
      throw new Error(
        `Unsupported modifier: ${modifier}. Supported modifiers are: upper, lower, capitalize`
      )
  }
}

/**
 * Get value from messages object by path (e.g., "message.dio").
 *
 * @param messages - The messages object
 * @param path - The dot-separated path
 * @returns The value at the path
 */
export function getValueByPath(messages: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = messages

  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      throw new Error(`Path "${path}" is invalid: cannot access "${part}" on non-object`)
    }

    if (!(part in current)) {
      throw new Error(`Path "${path}" not found in messages`)
    }

    current = (current as Record<string, unknown>)[part]
  }

  return current
}

export type ExtractedReference = { match: string; modifier?: string; path: string }

/**
 * Extract all references from a string without resolving them.
 * Useful for validation to check if references exist.
 *
 * @param str - The string to analyze
 * @returns Array of found references
 */
export function extractReferences(str: string): ExtractedReference[] {
  const referencePattern = /@(?:\.(\w+))?:(\S+)/g
  const references: ExtractedReference[] = []
  let match = referencePattern.exec(str)

  while (match !== null) {
    if (match[2]) {
      references.push({
        match: match[0],
        modifier: match[1] || undefined,
        path: match[2],
      })
    }
    match = referencePattern.exec(str)
  }

  return references
}

/**
 * Resolve references in a string.
 *
 * @param str - The string containing references
 * @param messages - The messages object
 * @param referenceChain - Chain of paths being resolved (for cycle detection)
 * @returns The string with all references resolved
 */
export function resolveReference(
  str: string,
  messages: Record<string, unknown>,
  referenceChain: string[] = []
): string {
  const referencePattern = /@(?:\.(\w+))?:(\S+)/g

  return str.replace(referencePattern, (match, modifier: string | undefined, path: string) => {
    // Check for circular reference
    if (referenceChain.includes(path)) {
      const cycle = [...referenceChain, path].join(' -> ')
      throw new Error(`Circular reference detected: ${cycle}`)
    }

    // Get the referenced value
    const referencedValue = getValueByPath(messages, path)

    if (typeof referencedValue !== 'string') {
      throw new Error(
        `Reference "${match}" points to a non-string value at path "${path}". Only string values can be referenced.`
      )
    }

    // Resolve nested references in the referenced value
    const newChain = [...referenceChain, path]
    const resolvedValue = resolveReference(referencedValue, messages, newChain)

    // Apply modifier if present
    return applyModifier(resolvedValue, modifier)
  })
}
