'use client'

import { useEffect, useMemo, useState } from 'react'
import { CommandCopyButton } from '@/components/controls/CommandCopyButton'
import { buildCLICommandOptions } from '@/lib/cli-commands'
import type { ManifestPlatformElement } from '@/types/manifests'

interface CLICommandPanelProps {
  platforms: ManifestPlatformElement[]
  installCommand?: string | null
  launchCommand?: string | null
  installLabel: string
  launchLabel: string
}

function detectPlatform(): ManifestPlatformElement['os'] | null {
  const userAgent = navigator.userAgent.toLocaleLowerCase()
  if (userAgent.includes('win')) return 'Windows'
  if (userAgent.includes('mac')) return 'macOS'
  if (userAgent.includes('linux')) return 'Linux'
  return null
}

export function CLICommandPanel({
  platforms,
  installCommand,
  launchCommand,
  installLabel,
  launchLabel,
}: CLICommandPanelProps) {
  const options = useMemo(
    () => buildCLICommandOptions({ platforms, installCommand, launchCommand }),
    [platforms, installCommand, launchCommand]
  )
  const [selectedOS, setSelectedOS] = useState(options[0]?.os ?? null)

  useEffect(() => {
    const detectedPlatform = detectPlatform()
    if (detectedPlatform && options.some(option => option.os === detectedPlatform)) {
      setSelectedOS(detectedPlatform)
    }
  }, [options])

  const selectedOption = options.find(option => option.os === selectedOS) ?? options[0]
  if (!selectedOption) return null

  return (
    <div className="min-w-0 flex flex-1 flex-col justify-center gap-[var(--spacing-md)] p-[var(--spacing-md)] text-sm overflow-hidden">
      {options.length > 1 && (
        <fieldset
          className="m-0 flex items-center gap-[var(--spacing-md)] border-x-0 border-t-0 border-b border-white/15 p-0 text-xs text-white/45"
          aria-label={installLabel}
        >
          {options.map(option => (
            <button
              key={option.os}
              type="button"
              onClick={() => setSelectedOS(option.os)}
              aria-pressed={option.os === selectedOption.os}
              className={`border-b py-[var(--spacing-xs)] transition-colors ${
                option.os === selectedOption.os
                  ? 'border-white text-white'
                  : 'border-transparent hover:text-white/80'
              }`}
            >
              {option.os}
            </button>
          ))}
        </fieldset>
      )}

      {selectedOption.installCommand && (
        <div>
          <div className="mb-[var(--spacing-xs)] flex items-center justify-between gap-[var(--spacing-xs)]">
            <p className="text-xs text-white/50">{installLabel}</p>
            <CommandCopyButton
              key={selectedOption.installCommand}
              command={selectedOption.installCommand}
            />
          </div>
          <pre className="max-w-full whitespace-pre-wrap break-words overflow-x-hidden">
            <span className="text-white/45">$ </span>
            {selectedOption.installCommand}
          </pre>
        </div>
      )}

      {selectedOption.launchCommand && (
        <div>
          <p className="text-xs text-white/50 mb-[var(--spacing-xs)]">{launchLabel}</p>
          <pre className="max-w-full whitespace-pre-wrap break-words overflow-x-hidden">
            <span className="text-white/45">$ </span>
            {selectedOption.launchCommand}
          </pre>
        </div>
      )}
    </div>
  )
}
