/**
 * Resolves reference syntax (@:path and @.modifier:path) in i18n messages
 * Supports nested references and detects circular references
 *
 * This module wraps the core logic from lib-core.ts with TypeScript types
 */

import { resolveReference } from './lib-core'

type Messages = Record<string, unknown>

/**
 * Recursively process messages object to resolve all references
 */
function processValue(value: unknown, messages: Messages, currentPath: string): unknown {
  if (typeof value === 'string') {
    // Start with empty reference chain for each string value
    return resolveReference(value, messages as Record<string, unknown>, [])
  }

  if (Array.isArray(value)) {
    return value.map((item, index) => processValue(item, messages, `${currentPath}[${index}]`))
  }

  if (value !== null && typeof value === 'object') {
    const result: Messages = {}
    for (const [key, val] of Object.entries(value)) {
      const newPath = currentPath ? `${currentPath}.${key}` : key
      result[key] = processValue(val, messages, newPath)
    }
    return result
  }

  return value
}

/**
 * Resolves all @:path and @.modifier:path references in messages
 *
 * @param messages - The messages object to process
 * @returns The messages object with all references resolved
 *
 * @example
 * ```typescript
 * const messages = {
 *   message: {
 *     the_world: 'the world',
 *     dio: 'DIO:',
 *     linked: '@:message.dio @:message.the_world !!!!'
 *   }
 * }
 * const resolved = resolveReferences(messages)
 * // resolved.message.linked will be "DIO: the world !!!!"
 * ```
 */
export function resolveReferences(messages: Messages): Messages {
  return processValue(messages, messages, '') as Messages
}
