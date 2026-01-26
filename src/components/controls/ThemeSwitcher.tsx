'use client'

import { Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from '../ThemeProvider'

/**
 * ThemeSwitcher component for toggling between light and dark themes
 * Displays a button with theme icon that allows users to switch themes
 */
export default function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme()
  const tComponent = useTranslations('components.common')

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="footer-control-button"
      title={tComponent('footer.toggleTheme')}
      aria-label={tComponent('footer.toggleTheme')}
    >
      {theme === 'light' ? (
        <Moon className="footer-control-icon" />
      ) : (
        <Sun className="footer-control-icon" />
      )}
    </button>
  )
}
