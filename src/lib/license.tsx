// License utility functions
import type { ReactElement } from 'react'

/**
 * Translate license value if it's a special case (like "Proprietary")
 * @param license - The license value to translate
 * @param t - Translation function for license keys
 * @returns Translated license value or original value
 */
export function translateLicense(license: string, t: (key: string) => string): string {
  if (license.toLowerCase() === 'proprietary') {
    return t('shared.terms.proprietary')
  }
  return license
}

/**
 * Translate license text for display purposes
 * @param license - The license value to translate
 * @param t - Translation function for license keys
 * @returns Translated license text or original text
 */
export function translateLicenseText(
  license: string | undefined,
  t: (key: string) => string
): string {
  if (!license) return ''
  return translateLicense(license, t)
}

/**
 * Render license value with optional link to choosealicense.com
 * - Open source licenses (MIT, Apache, etc.) are linked to choosealicense.com
 * - Proprietary licenses are displayed as plain text (with translation support)
 * - Missing licenses display as "-"
 * - Comma-separated licenses are split and rendered separately with links
 *
 * @param value - The license value to render (can be comma-separated)
 * @param classNameOrItem - Optional custom className for the link (string) or item object (when used as ComparisonTable render function)
 * @param t - Optional translation function for license keys
 */
export function renderLicense(
  value: unknown,
  classNameOrItem?: string | Record<string, unknown>,
  t?: (key: string) => string
): ReactElement | string {
  const license = value as string | undefined

  if (!license) return '-'

  const defaultClassName =
    'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:underline hover:decoration-dotted transition-colors underline-offset-2'

  // If second parameter is a string, use it as className; otherwise use default
  const className = typeof classNameOrItem === 'string' ? classNameOrItem : defaultClassName

  // Check if license contains a comma (comma-separated licenses)
  if (license.includes(',')) {
    const licenses = license
      .split(',')
      .map(l => l.trim())
      .filter(l => l.length > 0)

    return (
      <span className="inline-flex gap-1 items-center whitespace-nowrap">
        {licenses.map(lic => (
          <span key={lic} className="inline-flex items-center gap-1">
            {renderSingleLicense(lic, className, t)}
            {licenses.indexOf(lic) < licenses.length - 1 && (
              <span className="text-[var(--color-text-muted)]">,</span>
            )}
          </span>
        ))}
      </span>
    )
  }

  // Single license
  return renderSingleLicense(license, className, t)
}

/**
 * Helper function to render a single license with appropriate link or text
 */
function renderSingleLicense(
  license: string,
  className: string,
  t?: (key: string) => string
): ReactElement {
  // Only link to choosealicense.com for open source licenses
  // Proprietary licenses don't have a page there
  if (license.toLowerCase() === 'proprietary') {
    const displayText = t ? translateLicense(license, t) : license
    return <span>{displayText}</span>
  }

  const licenseLower = license.toLowerCase()

  return (
    <a
      href={`https://choosealicense.com/licenses/${licenseLower}`}
      target="_blank"
      rel="noopener"
      className={className}
    >
      {license}
    </a>
  )
}
