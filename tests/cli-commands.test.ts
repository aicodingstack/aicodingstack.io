import { describe, expect, it } from 'vitest'
import { buildCLICommandOptions } from '@/lib/cli-commands'
import type { ManifestPlatformElement } from '@/types/manifests'

const macOSPlatform: ManifestPlatformElement = { os: 'macOS', installPath: null }
const windowsPlatform: ManifestPlatformElement = { os: 'Windows', installPath: null }
const linuxPlatform: ManifestPlatformElement = { os: 'Linux', installPath: null }
const basePlatforms = [macOSPlatform, windowsPlatform, linuxPlatform]

describe('CLI command options', () => {
  it('preserves platform-specific install commands', () => {
    const options = buildCLICommandOptions({
      platforms: [
        { ...macOSPlatform, installCommand: 'curl install.sh | bash', launchCommand: 'agy' },
        { ...windowsPlatform, installCommand: 'irm install.ps1 | iex', launchCommand: 'agy' },
        { ...linuxPlatform, installCommand: 'curl install.sh | bash', launchCommand: 'agy' },
      ],
    })

    expect(options).toHaveLength(3)
    expect(options.find(option => option.os === 'Windows')?.installCommand).toBe(
      'irm install.ps1 | iex'
    )
  })

  it('collapses commands only when every platform uses the same values', () => {
    const options = buildCLICommandOptions({
      platforms: basePlatforms.map(platform => ({
        ...platform,
        installCommand: 'npm install -g example',
        launchCommand: 'example',
      })),
    })

    expect(options).toEqual([
      {
        os: null,
        installCommand: 'npm install -g example',
        launchCommand: 'example',
      },
    ])
  })

  it('keeps platform labels when a supported platform has no recorded command', () => {
    const options = buildCLICommandOptions({
      platforms: [
        { ...macOSPlatform, installCommand: 'curl install.sh | bash' },
        windowsPlatform,
        { ...linuxPlatform, installCommand: 'curl install.sh | bash' },
      ],
    })

    expect(options.map(option => option.os)).toEqual(['macOS', 'Linux'])
  })
})
