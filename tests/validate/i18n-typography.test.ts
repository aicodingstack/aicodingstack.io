import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const GLOBAL_STYLES_PATH = path.join(process.cwd(), 'src/app/[locale]/globals.css')

describe('localized typography', () => {
  const globalStyles = fs.readFileSync(GLOBAL_STYLES_PATH, 'utf8')

  it('automatically spaces half-width text next to Han characters', () => {
    expect(globalStyles).toMatch(/html:lang\(zh\)\s*{[^}]*\btext-autospace:\s*normal\s*;[^}]*}/s)
  })

  it('preserves exact spacing in literal text elements', () => {
    expect(globalStyles).toMatch(
      /code,\s*pre,\s*kbd,\s*samp\s*{[^}]*\btext-autospace:\s*no-autospace\s*;[^}]*}/s
    )
  })
})
