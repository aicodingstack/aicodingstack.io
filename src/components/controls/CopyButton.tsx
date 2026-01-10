'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const tComponents = useTranslations('components')
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative flex-1">
      <pre className="bg-[var(--color-hover)] border border-[var(--color-border)] px-[var(--spacing-md)] py-[var(--spacing-sm)] text-sm pr-[calc(var(--spacing-md)*3)]">
        <code className="text-[var(--color-text)]">{text}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        className={`absolute right-[var(--spacing-xs)] top-1/2 -translate-y-1/2 p-[var(--spacing-xs)] transition-all ${
          copied
            ? 'text-green-600'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
        }`}
        title={
          copied ? tComponents('copyButton.copied') : tComponents('copyButton.copyToClipboard')
        }
        aria-label={
          copied ? tComponents('copyButton.copied') : tComponents('copyButton.copyToClipboard')
        }
      >
        {copied ? (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
          >
            <title>{tComponents('copyButton.copied')}</title>
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            role="img"
          >
            <title>{tComponents('copyButton.copyToClipboard')}</title>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
          </svg>
        )}
      </button>
    </div>
  )
}
