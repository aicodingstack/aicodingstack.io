import { useTranslations } from 'next-intl'

export interface ProductCommandsProps {
  install?: string | null
  launch?: string | null
  command?: string | null
}

interface CommandSection {
  value: string | null | undefined
  labelKey: 'install' | 'launch' | 'command'
  label: string
}

/**
 * Render a command section with title and code block
 */
function CommandSectionItem({ value, label }: Omit<CommandSection, 'labelKey'>) {
  if (!value) return null

  return (
    <section className="py-[var(--spacing-lg)] border-b border-[var(--color-border)]">
      <div className="max-w-8xl mx-auto px-[var(--spacing-md)]">
        <h2 className="text-2xl font-semibold tracking-[-0.02em] mb-[var(--spacing-sm)]">
          {label}
        </h2>

        <div className="border border-[var(--color-border)] overflow-hidden mt-[var(--spacing-md)]">
          <pre className="p-[var(--spacing-md)] text-sm leading-relaxed overflow-x-auto bg-[var(--color-bg)]">
            $ {value}
          </pre>
        </div>
      </div>
    </section>
  )
}

export function ProductCommands({ install, launch, command }: ProductCommandsProps) {
  const tComponent = useTranslations('components.product')

  const commands: CommandSection[] = [
    { value: install, labelKey: 'install', label: tComponent('productCommands.install') },
    { value: launch, labelKey: 'launch', label: tComponent('productCommands.launch') },
    { value: command, labelKey: 'command', label: tComponent('productCommands.command') },
  ]

  const hasAnyCommand = commands.some(cmd => cmd.value)

  if (!hasAnyCommand) {
    return null
  }

  return (
    <>
      {commands.map(cmd => (
        <CommandSectionItem key={cmd.labelKey} value={cmd.value} label={cmd.label} />
      ))}
    </>
  )
}
