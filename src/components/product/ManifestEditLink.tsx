import { Github } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { getManifestEditUrl, type ManifestCategory } from '@/lib/manifest-source'

export interface ManifestEditLinkProps {
  category: ManifestCategory
  manifestId: string
}

export function ManifestEditLink({ category, manifestId }: ManifestEditLinkProps) {
  const tComponent = useTranslations('components.product')
  const label = tComponent('productHero.editManifest')

  return (
    <a
      href={getManifestEditUrl(category, manifestId)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="inline-flex size-8 shrink-0 items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)]"
    >
      <Github size={19} strokeWidth={1.6} aria-hidden="true" />
    </a>
  )
}
