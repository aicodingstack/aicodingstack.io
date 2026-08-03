'use client'

import { Check, Copy } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

interface CommandCopyButtonProps {
  command: string
}

export function CommandCopyButton({ command }: CommandCopyButtonProps) {
  const tComponent = useTranslations('components.controls')
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (resetTimer.current) {
        clearTimeout(resetTimer.current)
      }
    },
    []
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)

      if (resetTimer.current) {
        clearTimeout(resetTimer.current)
      }
      resetTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const label = copied ? tComponent('copyButton.copied') : tComponent('copyButton.copyToClipboard')

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 p-1 text-white/45 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      title={label}
      aria-label={label}
    >
      {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      <span className="sr-only" aria-live="polite">
        {copied ? label : ''}
      </span>
    </button>
  )
}
