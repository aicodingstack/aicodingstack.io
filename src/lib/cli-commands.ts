import type { ManifestPlatformElement } from '@/types/manifests'

export interface CLICommandOption {
  os: ManifestPlatformElement['os'] | null
  installCommand: string | null
  launchCommand: string | null
}

interface BuildCLICommandOptionsParams {
  platforms: ManifestPlatformElement[]
  installCommand?: string | null
  launchCommand?: string | null
}

export function buildCLICommandOptions({
  platforms,
  installCommand = null,
  launchCommand = null,
}: BuildCLICommandOptionsParams): CLICommandOption[] {
  if (platforms.length === 0) {
    return installCommand || launchCommand ? [{ os: null, installCommand, launchCommand }] : []
  }

  const options = platforms
    .map<CLICommandOption>(platform => ({
      os: platform.os,
      installCommand: platform.installCommand ?? installCommand,
      launchCommand: platform.launchCommand ?? launchCommand,
    }))
    .filter(option => option.installCommand || option.launchCommand)

  const signatures = new Set(
    options.map(option => `${option.installCommand ?? ''}\u0000${option.launchCommand ?? ''}`)
  )

  const [option] = options
  if (option && options.length === platforms.length && signatures.size === 1) {
    return [{ ...option, os: null }]
  }

  return options
}
